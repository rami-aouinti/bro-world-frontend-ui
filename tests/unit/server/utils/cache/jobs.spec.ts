import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { JobData } from "~/server/utils/job";

const redisConnectMock = vi.hoisted(() => vi.fn());
const redisGetMock = vi.hoisted(() => vi.fn());
const redisSetMock = vi.hoisted(() => vi.fn());
const redisDelMock = vi.hoisted(() => vi.fn());
const redisOnMock = vi.hoisted(() => vi.fn());
const redisConstructorMock = vi.hoisted(() =>
  vi.fn(() => ({
    connect: redisConnectMock,
    get: redisGetMock,
    set: redisSetMock,
    del: redisDelMock,
    on: redisOnMock,
  })),
);

const useRuntimeConfigMock = vi.hoisted(() =>
  vi.fn(() => ({
    redis: {
      url: "redis://localhost:6379",
      tls: false,
      keyPrefix: "tests",
      jobTtl: 120,
    },
  })),
);

vi.mock("ioredis", () => ({
  default: redisConstructorMock,
}));

vi.mock("#imports", () => ({
  useRuntimeConfig: useRuntimeConfigMock,
}));

const globalScope = globalThis as Record<string, unknown> & {
  __broJobsRedisClient?: unknown;
  __broJobsRedisClientPromise?: unknown;
  __broJobsCache?: unknown;
  __broJobsTags?: unknown;
};

function resetGlobals() {
  delete globalScope.__broJobsRedisClient;
  delete globalScope.__broJobsRedisClientPromise;
  delete globalScope.__broJobsCache;
  delete globalScope.__broJobsTags;
}

const sampleJobs: JobData = {
  companies: [
    { id: "company-1", name: "Company 1" },
    { id: "company-2", name: "Company 2" },
  ],
  jobs: [
    {
      id: "job-1",
      title: "Engineer",
      companyId: "company-1",
      company: { name: "Company 1" },
      works: [],
      contracts: [],
      skills: [],
      requirements: [],
      languages: [],
      benefits: [],
      locationTags: [],
      keywords: [],
    },
  ],
};

beforeEach(() => {
  resetGlobals();
  redisConstructorMock.mockClear();
  redisConnectMock.mockReset();
  redisGetMock.mockReset();
  redisSetMock.mockReset();
  redisDelMock.mockReset();
  redisOnMock.mockReset();
  redisConnectMock.mockImplementation(async () => undefined);
  redisGetMock.mockImplementation(async () => null);
  redisSetMock.mockImplementation(async () => "OK");
  redisDelMock.mockImplementation(async () => 1);
  redisOnMock.mockImplementation(() => undefined);

  useRuntimeConfigMock.mockReset();
  useRuntimeConfigMock.mockImplementation(() => ({
    redis: {
      url: "redis://localhost:6379",
      tls: false,
      keyPrefix: "tests",
      jobTtl: 120,
    },
  }));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("jobs cache", () => {
  it("reads from Redis and populates the memory cache", async () => {
    redisGetMock.mockImplementationOnce(async () => JSON.stringify(sampleJobs));

    vi.resetModules();
    const { readCachedJobs } = await import("~/server/utils/cache/jobs");

    const firstResult = await readCachedJobs();
    expect(firstResult).toEqual(sampleJobs);
    expect(redisConstructorMock).toHaveBeenCalledTimes(1);
    expect(redisGetMock).toHaveBeenCalledTimes(1);

    redisGetMock.mockClear();
    const secondResult = await readCachedJobs();
    expect(secondResult).toEqual(sampleJobs);
    expect(redisGetMock).not.toHaveBeenCalled();
  });

  it("writes to Redis and keeps a warm memory cache", async () => {
    vi.resetModules();
    const { readCachedJobs, writeCachedJobs } = await import("~/server/utils/cache/jobs");

    await writeCachedJobs(sampleJobs);

    expect(redisConstructorMock).toHaveBeenCalledTimes(1);
    expect(redisSetMock).toHaveBeenCalledWith(
      "tests:cache:public:jobs:all",
      JSON.stringify(sampleJobs),
      "EX",
      120,
    );

    redisGetMock.mockClear();
    const cached = await readCachedJobs();
    expect(cached).toEqual(sampleJobs);
    expect(redisGetMock).not.toHaveBeenCalled();
  });

  it("invalidates both memory and Redis entries", async () => {
    vi.resetModules();
    const { readCachedJobs, writeCachedJobs, invalidateCachedJobs } = await import(
      "~/server/utils/cache/jobs"
    );

    await writeCachedJobs(sampleJobs);
    await invalidateCachedJobs();

    expect(redisDelMock).toHaveBeenCalledWith("tests:cache:public:jobs:all");

    redisGetMock.mockClear();
    redisGetMock.mockImplementation(async () => null);

    const result = await readCachedJobs();
    expect(result).toBeNull();
    expect(redisGetMock).toHaveBeenCalledTimes(1);
  });

  it("falls back to memory when Redis is disabled and honours the TTL", async () => {
    useRuntimeConfigMock.mockImplementation(() => ({
      redis: {
        url: "",
        tls: false,
        keyPrefix: "tests",
        jobTtl: 1,
      },
    }));

    vi.useFakeTimers();
    const baseTime = new Date("2024-01-01T00:00:00Z");
    vi.setSystemTime(baseTime);

    vi.resetModules();
    const { readCachedJobs, writeCachedJobs } = await import("~/server/utils/cache/jobs");

    await writeCachedJobs(sampleJobs);

    const immediate = await readCachedJobs();
    expect(immediate).toEqual(sampleJobs);

    vi.setSystemTime(new Date(baseTime.getTime() + 2000));

    const expired = await readCachedJobs();
    expect(expired).toBeNull();
  });
});
