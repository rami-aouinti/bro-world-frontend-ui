import { vi } from "vitest";

type Fetcher = ReturnType<typeof vi.fn>;

const globalFetchSpy = vi.fn() as Fetcher;

export function useRequestFetch() {
  return globalFetchSpy;
}

export function __setRequestFetchMock(mock: Fetcher) {
  globalFetchSpy.mockImplementation(mock);
}

export function __resetRequestFetchMock() {
  globalFetchSpy.mockReset();
}

export { globalFetchSpy as __requestFetchSpy };
