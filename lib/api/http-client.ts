import axios from "axios";
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse,
} from "axios";
import { shouldSendCredentials } from "~/lib/api/credentials";

export interface ApiRequestContext {
  skipAuthHeader?: boolean;
  skipUnauthorizedHandler?: boolean;
  suppressErrorNotification?: boolean;
  isPrivate?: boolean;
}

export interface ApiRequestOptions<Data = unknown>
  extends Omit<AxiosRequestConfig<Data>, "url" | "data" | "params" | "method" | "headers"> {
  method?: AxiosRequestConfig["method"];
  headers?: AxiosRequestHeaders;
  params?: Record<string, unknown>;
  query?: Record<string, unknown>;
  data?: Data;
  body?: Data;
  context?: ApiRequestContext;
  isPrivate?: boolean;
  skipAuthHeader?: boolean;
}

export interface CrudFactoryOptions extends Omit<ApiRequestOptions, "body" | "data" | "query" | "params"> {
  params?: Record<string, unknown>;
}

export interface CrudOperations {
  list<T = unknown>(params?: Record<string, unknown>, options?: ApiRequestOptions): Promise<T>;
  get<T = unknown>(id: string | number, options?: ApiRequestOptions): Promise<T>;
  create<T = unknown, D = unknown>(data: D, options?: ApiRequestOptions<D>): Promise<T>;
  update<T = unknown, D = unknown>(id: string | number, data: D, options?: ApiRequestOptions<D>): Promise<T>;
  patch<T = unknown, D = unknown>(id: string | number, data: D, options?: ApiRequestOptions<D>): Promise<T>;
  remove<T = unknown>(id: string | number, options?: ApiRequestOptions): Promise<T>;
}

export interface ApiFetcher {
  <T = unknown>(url: string, options?: ApiRequestOptions): Promise<T>;
  client: AxiosInstance;
  crud: (basePath: string, options?: CrudFactoryOptions) => CrudOperations;
}

function mergeContexts(...contexts: Array<ApiRequestContext | undefined>): ApiRequestContext | undefined {
  const result: ApiRequestContext = {};

  for (const context of contexts) {
    if (!context) {
      continue;
    }

    if (typeof context.skipAuthHeader === "boolean") {
      result.skipAuthHeader = context.skipAuthHeader;
    }

    if (typeof context.skipUnauthorizedHandler === "boolean") {
      result.skipUnauthorizedHandler = context.skipUnauthorizedHandler;
    }

    if (typeof context.suppressErrorNotification === "boolean") {
      result.suppressErrorNotification = context.suppressErrorNotification;
    }

    if (typeof context.isPrivate === "boolean") {
      result.isPrivate = context.isPrivate;
    }
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

function mergeHeaders(
  ...headersList: Array<AxiosRequestHeaders | undefined>
): AxiosRequestHeaders | undefined {
  const merged: AxiosRequestHeaders = {};
  let hasValues = false;

  for (const headers of headersList) {
    if (!headers) {
      continue;
    }

    for (const [key, value] of Object.entries(headers)) {
      if (typeof value !== "undefined") {
        merged[key] = value;
        hasValues = true;
      }
    }
  }

  return hasValues ? merged : undefined;
}

function mergeOptions(base?: ApiRequestOptions, override?: ApiRequestOptions): ApiRequestOptions | undefined {
  if (!base) {
    return override ? { ...override } : undefined;
  }

  if (!override) {
    return { ...base };
  }

  return {
    ...base,
    ...override,
    headers: mergeHeaders(base.headers, override.headers),
    params: { ...(base.params ?? {}), ...(override.params ?? {}) },
    query: { ...(base.query ?? {}), ...(override.query ?? {}) },
    context: mergeContexts(base.context, override.context),
    isPrivate: typeof override.isPrivate === "boolean" ? override.isPrivate : base.isPrivate,
    skipAuthHeader:
      typeof override.skipAuthHeader === "boolean" ? override.skipAuthHeader : base.skipAuthHeader,
  };
}

function normalizeOptions(options?: ApiRequestOptions): AxiosRequestConfig {
  if (!options) {
    return {};
  }

  const {
    body,
    data,
    query,
    params,
    context,
    isPrivate,
    skipAuthHeader,
    ...rest
  } = options;

  const resolvedContext = mergeContexts(context, {
    isPrivate,
    skipAuthHeader,
  });

  return {
    ...rest,
    data: typeof body !== "undefined" ? body : data,
    params: { ...(params ?? {}), ...(query ?? {}) },
    context: resolvedContext,
  } satisfies AxiosRequestConfig;
}

const absoluteUrlPattern = /^[a-z][a-z\d+\-.]*:\/\//i;

function resolveRequestUrl(baseURL: string | undefined, requestURL: string): string | undefined {
  const trimmedRequest = requestURL?.trim();
  const trimmedBase = baseURL?.trim();
  const globalLocation = typeof window !== "undefined" ? window.location : globalThis.location;

  if (trimmedRequest) {
    if (absoluteUrlPattern.test(trimmedRequest)) {
      return trimmedRequest;
    }

    if (trimmedRequest.startsWith("//")) {
      if (globalLocation?.protocol) {
        return `${globalLocation.protocol}${trimmedRequest}`;
      }

      if (trimmedBase && absoluteUrlPattern.test(trimmedBase)) {
        try {
          const base = new URL(trimmedBase);
          return `${base.protocol}${trimmedRequest}`;
        } catch {
          return undefined;
        }
      }

      return undefined;
    }
  }

  if (trimmedBase && absoluteUrlPattern.test(trimmedBase)) {
    try {
      return new URL(trimmedRequest ?? "", trimmedBase).toString();
    } catch {
      return trimmedBase;
    }
  }

  if (globalLocation?.origin) {
    try {
      const resolvedBase = trimmedBase
        ? new URL(trimmedBase, globalLocation.origin).toString()
        : globalLocation.origin;
      return new URL(trimmedRequest ?? "", resolvedBase).toString();
    } catch {
      // Ignore errors and fall through to returning the trimmed values.
    }
  }

  return trimmedRequest || trimmedBase;
}

function createCrudOperations(
  client: ApiFetcher,
  basePath: string,
  defaultOptions?: CrudFactoryOptions,
): CrudOperations {
  const baseOptions: ApiRequestOptions | undefined = defaultOptions ? { ...defaultOptions } : undefined;

  return {
    list<T>(params?: Record<string, unknown>, options?: ApiRequestOptions) {
      const merged = mergeOptions(baseOptions, options);
      if (merged) {
        merged.params = { ...(merged.params ?? {}), ...(params ?? {}) };
      }

      return client<T>(basePath, merged ?? { params });
    },
    get<T>(id: string | number, options?: ApiRequestOptions) {
      const merged = mergeOptions(baseOptions, options);
      return client<T>(`${basePath}/${id}`, merged);
    },
    create<T, D>(data: D, options?: ApiRequestOptions<D>) {
      const merged = mergeOptions(baseOptions, options as ApiRequestOptions);
      return client<T>(basePath, { ...(merged ?? {}), method: "POST", body: data });
    },
    update<T, D>(id: string | number, data: D, options?: ApiRequestOptions<D>) {
      const merged = mergeOptions(baseOptions, options as ApiRequestOptions);
      return client<T>(`${basePath}/${id}`, { ...(merged ?? {}), method: "PUT", body: data });
    },
    patch<T, D>(id: string | number, data: D, options?: ApiRequestOptions<D>) {
      const merged = mergeOptions(baseOptions, options as ApiRequestOptions);
      return client<T>(`${basePath}/${id}`, { ...(merged ?? {}), method: "PATCH", body: data });
    },
    remove<T>(id: string | number, options?: ApiRequestOptions) {
      const merged = mergeOptions(baseOptions, options);
      return client<T>(`${basePath}/${id}`, { ...(merged ?? {}), method: "DELETE" });
    },
  };
}

export function createApiFetcher(client?: AxiosInstance): ApiFetcher {
  const axiosClient = client ?? axios.create();

  const fetcher = (async <T>(url: string, options?: ApiRequestOptions) => {
    const requestConfig = normalizeOptions(options);
    const baseURL =
      typeof axiosClient.defaults.baseURL === "string" ? axiosClient.defaults.baseURL : undefined;
    const resolvedUrl = resolveRequestUrl(baseURL, url);
    const requestTarget = resolvedUrl ?? baseURL ?? url;
    const withCredentials = shouldSendCredentials(requestTarget);

    const response = await axiosClient.request<T>({
      ...requestConfig,
      url,
      withCredentials,
    });
    return response.data;
  }) as ApiFetcher;

  fetcher.client = axiosClient;
  fetcher.crud = (basePath: string, options?: CrudFactoryOptions) =>
    createCrudOperations(fetcher, basePath, options);

  return fetcher;
}

export type ApiClientResponse<T> = AxiosResponse<T>;
