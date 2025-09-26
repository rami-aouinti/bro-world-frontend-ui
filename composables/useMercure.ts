import type { MercureConnectionOptions, MercureEventSourceFactory } from "~/types/mercure";

export function useMercure(): MercureEventSourceFactory {
  const { $mercure } = useNuxtApp();

  function connect(url: string, options?: MercureConnectionOptions) {
    return $mercure(url, options);
  }

  return connect;
}
