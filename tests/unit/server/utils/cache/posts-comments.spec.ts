import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { H3Event } from "h3";
import type { BlogCommentWithReplies } from "~/lib/mock/blog";

const redisConnectMock = vi.hoisted(() => vi.fn());
const redisGetMock = vi.hoisted(() => vi.fn());
const redisDelMock = vi.hoisted(() => vi.fn());
const redisSmembersMock = vi.hoisted(() => vi.fn());
const redisOnMock = vi.hoisted(() => vi.fn());
const redisMultiMock = vi.hoisted(() => vi.fn());
const redisConstructorMock = vi.hoisted(() =>
  vi.fn(() => ({
    connect: redisConnectMock,
    get: redisGetMock,
    del: redisDelMock,
    smembers: redisSmembersMock,
    multi: redisMultiMock,
    on: redisOnMock,
  })),
);

const useRuntimeConfigMock = vi.hoisted(() =>
  vi.fn(() => ({
    redis: {
      url: "redis://localhost:6379",
      tls: false,
      keyPrefix: "tests",
      listTtl: 60,
      itemTtl: 180,
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
  __broRedisClient?: unknown;
  __broRedisClientPromise?: unknown;
  __broPostsCache?: unknown;
  __broPostsTags?: unknown;
  __broPostsRevalidate?: unknown;
};

function resetGlobals() {
  delete globalScope.__broRedisClient;
  delete globalScope.__broRedisClientPromise;
  delete globalScope.__broPostsCache;
  delete globalScope.__broPostsTags;
  delete globalScope.__broPostsRevalidate;
}

const sampleUser = {
  id: "user-1",
  firstName: "Test",
  lastName: "User",
  username: "test-user",
  email: "test@example.com",
  enabled: true,
  photo: null,
};

const sampleComments: BlogCommentWithReplies[] = [
  {
    id: "comment-1",
    content: "Hello world",
    user: sampleUser,
    isReacted: null,
    totalComments: 0,
    reactions_count: 0,
    publishedAt: "2024-01-01T00:00:00Z",
    reactions_preview: [],
    likes_count: 0,
  },
];

let pipelineSetMock: ReturnType<typeof vi.fn>;
let pipelineSaddMock: ReturnType<typeof vi.fn>;
let pipelineExpireMock: ReturnType<typeof vi.fn>;
let pipelineExecMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  resetGlobals();

  redisConstructorMock.mockClear();
  redisConnectMock.mockReset();
  redisGetMock.mockReset();
  redisDelMock.mockReset();
  redisSmembersMock.mockReset();
  redisOnMock.mockReset();
  redisMultiMock.mockReset();

  redisConnectMock.mockImplementation(async () => undefined);
  redisGetMock.mockImplementation(async () => null);
  redisDelMock.mockImplementation(async () => 0);
  redisSmembersMock.mockImplementation(async () => []);
  redisOnMock.mockImplementation(() => undefined);

  useRuntimeConfigMock.mockReset();
  useRuntimeConfigMock.mockImplementation(() => ({
    redis: {
      url: "redis://localhost:6379",
      tls: false,
      keyPrefix: "tests",
      listTtl: 60,
      itemTtl: 180,
    },
  }));
  vi.stubGlobal("useRuntimeConfig", useRuntimeConfigMock);

  pipelineSetMock = vi.fn();
  pipelineSaddMock = vi.fn();
  pipelineExpireMock = vi.fn();
  pipelineExecMock = vi.fn().mockResolvedValue([]);

  redisMultiMock.mockImplementation(() => {
    const pipeline = {
      set: (...args: unknown[]) => {
        pipelineSetMock(...args);
        return pipeline;
      },
      sadd: (...args: unknown[]) => {
        pipelineSaddMock(...args);
        return pipeline;
      },
      expire: (...args: unknown[]) => {
        pipelineExpireMock(...args);
        return pipeline;
      },
      exec: pipelineExecMock,
    };

    return pipeline;
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("posts comments cache", () => {
  it("caches comments in Redis and invalidates the tag", async () => {
    vi.useFakeTimers();
    const now = new Date("2024-06-01T12:00:00Z");
    vi.setSystemTime(now);

    vi.resetModules();
    const {
      cachePostComments,
      getCachedPostComments,
      getPostCommentsCacheKey,
      invalidatePostComments,
    } = await import("~/server/utils/cache/posts");

    const event = { context: {} } as H3Event;

    await cachePostComments(event, "post-1", sampleComments);

    expect(redisConstructorMock).toHaveBeenCalledTimes(1);
    expect(redisConnectMock).toHaveBeenCalledTimes(1);

    const cacheKey = getPostCommentsCacheKey(event, "post-1");

    expect(pipelineSetMock).toHaveBeenCalledWith(cacheKey, expect.any(String), "EX", 180);

    const serialized = pipelineSetMock.mock.calls[0][1] as string;
    const parsed = JSON.parse(serialized) as {
      data: BlogCommentWithReplies[];
      cachedAt: number;
    };

    expect(parsed.data).toEqual(sampleComments);
    expect(parsed.cachedAt).toBe(now.getTime());

    const tag = pipelineSaddMock.mock.calls[0][0] as string;

    expect(pipelineSaddMock).toHaveBeenCalledWith(tag, cacheKey);
    expect(pipelineExpireMock).toHaveBeenCalledWith(tag, 180);

    redisGetMock.mockResolvedValueOnce(serialized);

    const cached = await getCachedPostComments(event, "post-1");
    expect(redisGetMock).toHaveBeenCalledWith(cacheKey);
    expect(cached).not.toBeNull();
    expect(cached?.data).toEqual(sampleComments);
    expect(cached?.cachedAt).toBe(now.getTime());

    redisSmembersMock.mockResolvedValueOnce([cacheKey]);
    redisDelMock.mockResolvedValue(1);

    await invalidatePostComments(event, "post-1");
    expect(redisSmembersMock).toHaveBeenCalledWith(tag);
    expect(redisDelMock).toHaveBeenNthCalledWith(1, cacheKey);
    expect(redisDelMock).toHaveBeenNthCalledWith(2, tag);

    redisGetMock.mockResolvedValueOnce(null);

    const afterInvalidation = await getCachedPostComments(event, "post-1");
    expect(afterInvalidation).toBeNull();
  });

  it("falls back to memory when Redis is disabled and honours TTL and invalidation", async () => {
    useRuntimeConfigMock.mockImplementation(() => ({
      redis: {
        url: "",
        tls: false,
        keyPrefix: "tests",
        listTtl: 60,
        itemTtl: 1,
      },
    }));

    vi.useFakeTimers();
    const now = new Date("2024-06-02T08:00:00Z");
    vi.setSystemTime(now);

    vi.resetModules();
    const { cachePostComments, getCachedPostComments, invalidatePostComments } = await import(
      "~/server/utils/cache/posts"
    );

    const event = { context: {} } as H3Event;

    await cachePostComments(event, "post-2", sampleComments);
    expect(redisConstructorMock).not.toHaveBeenCalled();

    const immediate = await getCachedPostComments(event, "post-2");
    expect(immediate).not.toBeNull();
    expect(immediate?.data).toEqual(sampleComments);

    vi.setSystemTime(new Date(now.getTime() + 1500));

    const expired = await getCachedPostComments(event, "post-2");
    expect(expired).toBeNull();

    vi.setSystemTime(now);
    await cachePostComments(event, "post-2", sampleComments);

    const warmed = await getCachedPostComments(event, "post-2");
    expect(warmed).not.toBeNull();

    await invalidatePostComments(event, "post-2");

    const afterInvalidation = await getCachedPostComments(event, "post-2");
    expect(afterInvalidation).toBeNull();
  });
});
