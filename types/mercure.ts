import type { EventSourcePolyfillInit } from "event-source-polyfill";

type Primitive = string | number | boolean | null | undefined;

export type MercureQueryValue = Primitive | Primitive[];

export interface MercureConnectionOptions {
  /**
   * Bearer token used to authenticate against the Mercure hub.
   */
  token?: string;
  /**
   * Extra query string parameters appended to the connection URL.
   */
  params?: Record<string, MercureQueryValue>;
  /**
   * Additional EventSource configuration forwarded to the polyfill.
   */
  init?: EventSourcePolyfillInit;
}

export type MercureEventSourceFactory = (url: string, options?: MercureConnectionOptions) => EventSource;
