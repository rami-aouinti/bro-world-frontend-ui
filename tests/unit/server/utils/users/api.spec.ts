import { describe, expect, it, vi } from "vitest";
import type { H3Event } from "h3";

import { fetchProfileEventsFromSource } from "~/server/utils/users/api";

describe("fetchProfileEventsFromSource", () => {
  it("uses the users API base when requesting profile events", async () => {
    const originalFetch = (globalThis as Record<string, unknown>).$fetch;
    const originalUseRuntimeConfig = (globalThis as Record<string, unknown>).useRuntimeConfig;
    const fetchMock = vi.fn().mockResolvedValue([]);
    const useRuntimeConfigMock = vi.fn(() => ({
      auth: {},
      users: {},
    }));

    (globalThis as Record<string, unknown>).$fetch = fetchMock;
    (globalThis as Record<string, unknown>).useRuntimeConfig = useRuntimeConfigMock;

    try {
      const event = { node: { req: { headers: {} } } } as unknown as H3Event;
      const query = { limit: "5" };

      await fetchProfileEventsFromSource(event, query);

      expect(fetchMock).toHaveBeenCalledTimes(1);

      const [endpoint, options] = fetchMock.mock.calls[0];

      expect(endpoint).toBe("https://bro-world.org/api/v1/profile/events");
      expect(options?.query).toEqual(query);
      expect(useRuntimeConfigMock).toHaveBeenCalled();
    } finally {
      if (originalFetch) {
        (globalThis as Record<string, unknown>).$fetch = originalFetch;
      } else {
        delete (globalThis as Record<string, unknown>).$fetch;
      }

      if (originalUseRuntimeConfig) {
        (globalThis as Record<string, unknown>).useRuntimeConfig = originalUseRuntimeConfig;
      } else {
        delete (globalThis as Record<string, unknown>).useRuntimeConfig;
      }
    }
  });
});
