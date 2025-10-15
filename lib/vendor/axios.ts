export type AxiosMethod =
  | "get"
  | "GET"
  | "delete"
  | "DELETE"
  | "head"
  | "HEAD"
  | "options"
  | "OPTIONS"
  | "post"
  | "POST"
  | "put"
  | "PUT"
  | "patch"
  | "PATCH";

export interface AxiosRequestHeaders {
  [header: string]: string | undefined;
}

export interface AxiosRequestConfig<T = unknown> {
  baseURL?: string;
  url?: string;
  method?: AxiosMethod;
  headers?: AxiosRequestHeaders;
  params?: Record<string, unknown>;
  data?: T;
  withCredentials?: boolean;
  signal?: AbortSignal;
  context?: Record<string, unknown>;
}

export interface AxiosResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: AxiosRequestConfig;
}

export type AxiosFulfilled<T> = (value: T) => T | Promise<T>;
export type AxiosRejected = (error: unknown) => unknown;

class InterceptorManager<T> {
  private handlers: Array<{ fulfilled: AxiosFulfilled<T>; rejected?: AxiosRejected } | null> = [];

  use(fulfilled: AxiosFulfilled<T>, rejected?: AxiosRejected) {
    this.handlers.push({ fulfilled, rejected });
    return this.handlers.length - 1;
  }

  eject(id: number) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  }

  forEach(fn: (handler: { fulfilled: AxiosFulfilled<T>; rejected?: AxiosRejected }) => void) {
    for (const handler of this.handlers) {
      if (handler) {
        fn(handler);
      }
    }
  }
}

export class AxiosError<T = unknown> extends Error {
  code?: string;
  config: AxiosRequestConfig;
  response?: AxiosResponse<T>;

  constructor(message: string, code?: string, config?: AxiosRequestConfig, response?: AxiosResponse<T>) {
    super(message);
    this.name = "AxiosError";
    this.code = code;
    this.config = config ?? {};
    this.response = response;
  }
}

function isAbsoluteURL(url: string) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
}

function combineURLs(baseURL: string, relativeURL: string) {
  if (isAbsoluteURL(relativeURL)) {
    return relativeURL;
  }

  if (!baseURL) {
    return relativeURL;
  }

  const separator = baseURL.endsWith("/") || relativeURL.startsWith("/") ? "" : "/";

  return `${baseURL}${separator}${relativeURL}`;
}

function mergeHeaders(...headersList: Array<AxiosRequestHeaders | undefined>): AxiosRequestHeaders {
  const result: AxiosRequestHeaders = {};

  for (const headers of headersList) {
    if (!headers) {
      continue;
    }

    for (const [key, value] of Object.entries(headers)) {
      if (typeof value !== "undefined") {
        result[key] = value;
      }
    }
  }

  return result;
}

function mergeConfig(defaults: AxiosRequestConfig, config?: AxiosRequestConfig): AxiosRequestConfig {
  if (!config) {
    return { ...defaults };
  }

  return {
    ...defaults,
    ...config,
    headers: mergeHeaders(defaults.headers, config.headers),
  };
}

function buildURL(config: AxiosRequestConfig) {
  const { baseURL = "", url = "", params } = config;
  const fullURL = combineURLs(baseURL, url);

  if (!params || Object.keys(params).length === 0) {
    return fullURL;
  }

  const searchParams = new URLSearchParams();

  function appendParam(key: string, value: unknown) {
    if (value === null || typeof value === "undefined") {
      return;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        appendParam(key, item);
      }
      return;
    }

    if (value instanceof Date) {
      searchParams.append(key, value.toISOString());
      return;
    }

    if (typeof value === "object") {
      searchParams.append(key, JSON.stringify(value));
      return;
    }

    searchParams.append(key, String(value));
  }

  for (const [key, value] of Object.entries(params)) {
    appendParam(key, value);
  }

  const queryString = searchParams.toString();

  if (!queryString) {
    return fullURL;
  }

  const separator = fullURL.includes("?") ? "&" : "?";

  return `${fullURL}${separator}${queryString}`;
}

function resolveRequestBody(data: unknown, headers: Headers) {
  if (data === null || typeof data === "undefined") {
    return undefined;
  }

  if (
    typeof data === "string" ||
    data instanceof ArrayBuffer ||
    ArrayBuffer.isView(data) ||
    data instanceof Blob ||
    data instanceof FormData ||
    data instanceof URLSearchParams
  ) {
    return data as BodyInit;
  }

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return JSON.stringify(data);
}

async function dispatchRequest<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
  const requestURL = buildURL(config);
  const method = (config.method ?? "GET").toUpperCase();
  const headers = new Headers();

  for (const [key, value] of Object.entries(config.headers ?? {})) {
    if (typeof value !== "undefined") {
      headers.set(key, value);
    }
  }

  const body = method === "GET" || method === "HEAD" ? undefined : resolveRequestBody(config.data, headers);

  const response = await fetch(requestURL, {
    method,
    headers,
    body,
    credentials: config.withCredentials ? "include" : "same-origin",
    signal: config.signal,
  });

  const responseHeaders: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    responseHeaders[key] = value;
  });

  const contentType = response.headers.get("content-type") ?? "";
  let payload: unknown;

  if (contentType.includes("application/json")) {
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
  } else if (contentType.startsWith("text/")) {
    payload = await response.text();
  } else {
    payload = await response.blob();
  }

  const axiosResponse: AxiosResponse<T> = {
    data: payload as T,
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
    config,
  };

  if (!response.ok) {
    throw new AxiosError(`Request failed with status code ${response.status}`, String(response.status), config, axiosResponse);
  }

  return axiosResponse;
}

class SimpleAxiosInstance {
  defaults: AxiosRequestConfig;
  interceptors: {
    request: InterceptorManager<AxiosRequestConfig>;
    response: InterceptorManager<AxiosResponse>;
  };

  constructor(defaultConfig: AxiosRequestConfig = {}) {
    this.defaults = { ...defaultConfig };
    this.interceptors = {
      request: new InterceptorManager<AxiosRequestConfig>(),
      response: new InterceptorManager<AxiosResponse>(),
    };
  }

  async request<T = unknown>(config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
    const mergedConfig = mergeConfig(this.defaults, config);
    const chain: Array<{ onFulfilled: (value: unknown) => unknown; onRejected?: AxiosRejected }> = [];

    this.interceptors.request.forEach(({ fulfilled, rejected }) => {
      chain.unshift({ onFulfilled: fulfilled, onRejected: rejected });
    });

    chain.push({ onFulfilled: (conf) => dispatchRequest<T>(conf as AxiosRequestConfig) });

    this.interceptors.response.forEach(({ fulfilled, rejected }) => {
      chain.push({ onFulfilled: fulfilled, onRejected: rejected });
    });

    let promise: Promise<unknown> = Promise.resolve(mergedConfig);

    while (chain.length > 0) {
      const { onFulfilled, onRejected } = chain.shift()!;
      promise = promise.then(onFulfilled, onRejected);
    }

    return promise as Promise<AxiosResponse<T>>;
  }

  get<T = unknown>(url: string, config?: AxiosRequestConfig) {
    return this.request<T>({ ...(config ?? {}), method: "GET", url });
  }

  delete<T = unknown>(url: string, config?: AxiosRequestConfig) {
    return this.request<T>({ ...(config ?? {}), method: "DELETE", url });
  }

  head<T = unknown>(url: string, config?: AxiosRequestConfig) {
    return this.request<T>({ ...(config ?? {}), method: "HEAD", url });
  }

  options<T = unknown>(url: string, config?: AxiosRequestConfig) {
    return this.request<T>({ ...(config ?? {}), method: "OPTIONS", url });
  }

  post<T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig<D>) {
    return this.request<T>({ ...(config ?? {}), method: "POST", url, data });
  }

  put<T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig<D>) {
    return this.request<T>({ ...(config ?? {}), method: "PUT", url, data });
  }

  patch<T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig<D>) {
    return this.request<T>({ ...(config ?? {}), method: "PATCH", url, data });
  }
}

export interface AxiosInstance extends SimpleAxiosInstance {
  request<T = unknown>(config: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  head<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  options<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  post<T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<AxiosResponse<T>>;
  put<T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<AxiosResponse<T>>;
  patch<T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<AxiosResponse<T>>;
}

export function createAxios(defaultConfig: AxiosRequestConfig = {}): AxiosInstance {
  return new SimpleAxiosInstance(defaultConfig) as AxiosInstance;
}

const defaultAxios = createAxios();

export const axios = Object.assign(
  (config: AxiosRequestConfig) => defaultAxios.request(config),
  {
    create: createAxios,
    request: defaultAxios.request.bind(defaultAxios),
    get: defaultAxios.get.bind(defaultAxios),
    delete: defaultAxios.delete.bind(defaultAxios),
    head: defaultAxios.head.bind(defaultAxios),
    options: defaultAxios.options.bind(defaultAxios),
    post: defaultAxios.post.bind(defaultAxios),
    put: defaultAxios.put.bind(defaultAxios),
    patch: defaultAxios.patch.bind(defaultAxios),
    defaults: defaultAxios.defaults,
    interceptors: defaultAxios.interceptors,
    isAxiosError: (error: unknown): error is AxiosError => error instanceof AxiosError,
  },
);

export default axios;
