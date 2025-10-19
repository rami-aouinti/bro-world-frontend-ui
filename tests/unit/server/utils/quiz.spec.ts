import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { __resetMockRuntimeConfig, __setMockRuntimeConfig } from "#imports";

const readFileMock = vi.fn(async (..._args: unknown[]) => "");

vi.mock("node:fs/promises", () => ({
  default: { readFile: readFileMock },
  readFile: readFileMock,
}));

const redisConnectMock = vi.fn(async () => {});
const redisGetMock = vi.fn(async (..._args: unknown[]) => null as string | null);
const redisSetMock = vi.fn(async (..._args: unknown[]) => undefined);
const redisDelMock = vi.fn(async (..._args: unknown[]) => undefined);
const redisOnMock = vi.fn();

const redisConstructor = vi.fn(() => ({
  connect: redisConnectMock,
  get: redisGetMock,
  set: redisSetMock,
  del: redisDelMock,
  on: redisOnMock,
}));

vi.mock("ioredis", () => ({
  default: redisConstructor,
}));

function resetGlobals() {
  const scope = globalThis as typeof globalThis & {
    __broQuizRedisClient?: unknown;
    __broQuizRedisClientPromise?: unknown;
    __broQuizMemoryCache?: unknown;
  };

  scope.__broQuizRedisClient = null;
  scope.__broQuizRedisClientPromise = null;
  scope.__broQuizMemoryCache = null;
}

describe("getQuizLandingData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    readFileMock.mockReset();
    redisConnectMock.mockResolvedValue();
    redisGetMock.mockResolvedValue(null);
    redisSetMock.mockResolvedValue(undefined);
    redisDelMock.mockResolvedValue(undefined);
    redisOnMock.mockReturnValue(undefined);
    __resetMockRuntimeConfig();
    resetGlobals();
  });

  afterEach(async () => {
    const module = await import("~/server/utils/quiz");
    await module.invalidateQuizCache();
    resetGlobals();
  });

  it("returns cached data from Redis when available", async () => {
    __setMockRuntimeConfig({
      redis: {
        url: "redis://cache", 
        quizTtl: 180,
      },
    });

    const cachedData = {
      hero: { title: "Cached", subtitle: "Data" },
      overview: [],
      features: [],
      process: [],
      questionBanks: [],
      leaderboard: [],
      cta: { title: "CTA", description: "", button: "Go", buttonAria: "", link: "/" },
    };

    redisGetMock.mockResolvedValueOnce(JSON.stringify(cachedData));

    const { getQuizLandingData } = await import("~/server/utils/quiz");

    const result = await getQuizLandingData();

    expect(redisConstructor).toHaveBeenCalledWith("redis://cache", expect.any(Object));
    expect(redisConnectMock).toHaveBeenCalled();
    expect(redisGetMock).toHaveBeenCalledTimes(1);
    expect(readFileMock).not.toHaveBeenCalled();
    expect(result).toEqual(cachedData);
  });

  it("loads quiz data from disk and populates Redis when cache is missing", async () => {
    __setMockRuntimeConfig({
      redis: {
        url: "redis://cache", 
        keyPrefix: "test", 
        quizTtl: 90,
      },
    });

    const fileData = {
      hero: { title: "Hero", subtitle: "Sub" },
      overview: [{ title: "Overview", value: "123" }],
      features: [],
      process: [],
      questionBanks: [],
      leaderboard: [],
      cta: { title: "CTA", description: "", button: "Start", buttonAria: "", link: "/start" },
    };

    readFileMock.mockResolvedValueOnce(JSON.stringify(fileData));

    const { getQuizLandingData } = await import("~/server/utils/quiz");

    const result = await getQuizLandingData();

    expect(readFileMock).toHaveBeenCalledTimes(1);
    expect(redisSetMock).toHaveBeenCalledWith(
      "test:cache:public:quiz:landing",
      JSON.stringify(fileData),
      "EX",
      90,
    );
    expect(result).toEqual(fileData);
  });

  it("falls back to in-memory cache when Redis is disabled", async () => {
    const fileData = {
      hero: { title: "Hero", subtitle: "Sub" },
      overview: [],
      features: [],
      process: [],
      questionBanks: [],
      leaderboard: [],
      cta: { title: "CTA", description: "", button: "Play", buttonAria: "", link: "/play" },
    };

    readFileMock.mockResolvedValue(JSON.stringify(fileData));

    const { getQuizLandingData } = await import("~/server/utils/quiz");

    const firstCall = await getQuizLandingData();
    const secondCall = await getQuizLandingData();

    expect(readFileMock).toHaveBeenCalledTimes(1);
    expect(redisConstructor).not.toHaveBeenCalled();
    expect(firstCall).toEqual(fileData);
    expect(secondCall).toEqual(fileData);
  });
});

describe("invalidateQuizCache", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    redisConnectMock.mockResolvedValue();
    redisDelMock.mockResolvedValue(undefined);
    __resetMockRuntimeConfig();
    resetGlobals();
  });

  it("clears Redis entry when available", async () => {
    __setMockRuntimeConfig({
      redis: {
        url: "redis://cache", 
        keyPrefix: "test", 
        quizTtl: 45,
      },
    });

    const { getQuizLandingData, invalidateQuizCache } = await import("~/server/utils/quiz");

    const fileData = {
      hero: { title: "Hero", subtitle: "Sub" },
      overview: [],
      features: [],
      process: [],
      questionBanks: [],
      leaderboard: [],
      cta: { title: "CTA", description: "", button: "Play", buttonAria: "", link: "/play" },
    };

    readFileMock.mockResolvedValueOnce(JSON.stringify(fileData));

    await getQuizLandingData();
    await invalidateQuizCache();

    expect(redisDelMock).toHaveBeenCalledWith("test:cache:public:quiz:landing");
  });
});

