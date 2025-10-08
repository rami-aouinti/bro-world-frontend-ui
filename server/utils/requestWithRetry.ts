import type { FetchError } from "ofetch";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestWithRetryOptions = {
  token?: string | null;
  body?: unknown;
  headers?: Record<string, string>;
  maxRetries?: number;
  retryDelayMs?: number;
};

function isFetchError(error: unknown): error is FetchError<unknown> {
  return Boolean(error && typeof error === "object" && "response" in error);
}

function shouldRetry(error: unknown): boolean {
  if (!isFetchError(error)) {
    return true;
  }

  const status = error.response?.status ?? 0;

  if (status === 408) {
    return true;
  }

  if (status >= 500) {
    return true;
  }

  return false;
}

function buildHeaders(options: RequestWithRetryOptions) {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers ?? {}),
  };

  if (options.body && !("Content-Type" in headers)) {
    headers["Content-Type"] = "application/json";
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  return headers;
}

function sleep(delay: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}

export async function requestWithRetry<T>(
  method: HttpMethod,
  url: string,
  options: RequestWithRetryOptions = {},
): Promise<T> {
  const maxRetries = Math.max(1, options.maxRetries ?? 3);
  const retryDelay = Math.max(0, options.retryDelayMs ?? 300);
  const normalizedMethod = method.toUpperCase() as HttpMethod;

  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt += 1) {
    try {
      const response = await $fetch<T>(url, {
        method: normalizedMethod,
        body: options.body,
        headers: buildHeaders(options),
      });

      return response;
    } catch (error) {
      lastError = error;

      if (!shouldRetry(error) || attempt === maxRetries - 1) {
        throw error;
      }

      await sleep(retryDelay);
    }
  }

  throw lastError ?? new Error("Request failed without response.");
}
