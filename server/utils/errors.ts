import type { H3Error } from "h3";

function resolveNumeric(value: unknown) {
  return typeof value === "number" ? value : null;
}

export function resolveErrorStatusCode(error: unknown, defaultStatusCode = 500) {
  if (error && typeof error === "object") {
    const statusCode = resolveNumeric((error as { statusCode?: unknown }).statusCode);

    if (statusCode !== null) {
      return statusCode;
    }

    const status = resolveNumeric((error as { status?: unknown }).status);

    if (status !== null) {
      return status;
    }

    const responseStatus = resolveNumeric(
      (error as { response?: { status?: unknown } }).response?.status,
    );

    if (responseStatus !== null) {
      return responseStatus;
    }
  }

  return defaultStatusCode;
}

function resolveString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function resolveErrorMessage(
  error: unknown,
  fallbackMessage = "An unexpected error occurred.",
) {
  if (error && typeof error === "object") {
    const data = (error as { data?: Record<string, unknown> }).data;

    if (data) {
      const dataMessage = resolveString(data.message);

      if (dataMessage) {
        return dataMessage;
      }

      const dataError = resolveString(data.error);

      if (dataError) {
        return dataError;
      }
    }

    const statusMessage = resolveString((error as { statusMessage?: unknown }).statusMessage);

    if (statusMessage) {
      return statusMessage;
    }

    const errorMessage = resolveString((error as { message?: unknown }).message);

    if (errorMessage) {
      return errorMessage;
    }
  }

  const trimmedFallback = resolveString(fallbackMessage);

  return trimmedFallback || "An unexpected error occurred.";
}

export function sanitizeErrorStack(error: H3Error) {
  if (error && typeof error === "object") {
    error.stack = undefined;
  }

  return error;
}
