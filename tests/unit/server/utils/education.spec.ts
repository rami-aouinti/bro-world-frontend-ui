import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { __resetMockRuntimeConfig, __setMockRuntimeConfig, useRuntimeConfig } from "#imports";

const readFileMock = vi.fn(async () => "");

vi.mock("node:fs/promises", () => ({
  default: { readFile: readFileMock },
  readFile: readFileMock,
}));

vi.mock("~/server/mock/education-translations", () => ({
  educationTranslationsByLocale: {
    en: {},
    fr: {
      categories: {
        "category-1": { title: "Catégorie FR" },
      },
      courses: {
        "course-1": {
          title: "Cours FR",
          description: "Description FR",
          lessons: {
            "lesson-1": { title: "Leçon FR" },
          },
        },
      },
    },
  },
}));

const redisConnectMock = vi.fn(async () => {});
const redisGetMock = vi.fn(async () => null as string | null);
const redisSetMock = vi.fn(async () => "OK");
const redisDelMock = vi.fn(async () => 0);
const redisLrangeMock = vi.fn(async () => [] as string[]);
const redisLpushMock = vi.fn(async () => 1);
const redisExpireMock = vi.fn(async () => 1);
const redisOnMock = vi.fn();

const redisConstructor = vi.fn(() => ({
  connect: redisConnectMock,
  get: redisGetMock,
  set: redisSetMock,
  del: redisDelMock,
  lrange: redisLrangeMock,
  lpush: redisLpushMock,
  expire: redisExpireMock,
  on: redisOnMock,
}));

vi.mock("ioredis", () => ({
  default: redisConstructor,
}));

function resetEducationGlobals() {
  const scope = globalThis as typeof globalThis & {
    __broEducationRedisClient?: unknown;
    __broEducationRedisClientPromise?: unknown;
    __broEducationMemoryBaseCache?: unknown;
    __broEducationMemoryLocaleCache?: Map<string, unknown>;
    __broEducationKnownLocales?: Set<string>;
    __broEducationMemoryCertificates?: unknown;
  };

  scope.__broEducationRedisClient = null;
  scope.__broEducationRedisClientPromise = null;
  scope.__broEducationMemoryBaseCache = null;
  scope.__broEducationMemoryLocaleCache = new Map();
  scope.__broEducationKnownLocales = new Set();
  scope.__broEducationMemoryCertificates = null;
}

function clearCertificateMemoryCache() {
  const scope = globalThis as typeof globalThis & {
    __broEducationMemoryCertificates?: unknown;
  };

  scope.__broEducationMemoryCertificates = null;
}

const educationFixture = {
  categories: [
    {
      id: "category-1",
      slug: "category-1",
      title: "Category EN",
      description: "Description EN",
      cover: "/category-cover.jpg",
    },
  ],
  courses: [
    {
      id: "course-1",
      slug: "course-1",
      categorySlug: "category-1",
      title: "Course EN",
      level: "beginner" as const,
      durationMin: 45,
      description: "Course description",
      cover: "/course-cover.jpg",
      lessons: [
        {
          id: "lesson-1",
          title: "Lesson EN",
          type: "text" as const,
          content: "Lesson content",
          durationMin: 10,
        },
      ],
      quiz: [
        {
          id: "quiz-1",
          question: "Question EN",
          options: [{ key: "a", label: "Option A" }],
          correct: "a",
        },
      ],
      exercises: [],
    },
  ],
  exercises: [
    {
      id: "exercise-1",
      courseId: "course-1",
      lessonId: "lesson-1",
      question: "Exercise question",
      type: "mcq" as const,
      options: [{ key: "a", label: "Option A" }],
      correct: "a",
    },
  ],
};

describe("education caching", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __resetMockRuntimeConfig();
    resetEducationGlobals();
    readFileMock.mockReset();
    redisConnectMock.mockResolvedValue();
    redisGetMock.mockResolvedValue(null);
    redisSetMock.mockResolvedValue("OK");
    redisDelMock.mockResolvedValue(0);
    redisLrangeMock.mockResolvedValue([]);
    redisLpushMock.mockResolvedValue(1);
    redisExpireMock.mockResolvedValue(1);
    redisOnMock.mockReturnValue(undefined);
  });

  afterEach(async () => {
    const module = await import("~/server/utils/education");
    await module.clearEducationCache();
    resetEducationGlobals();
  });

  it("caches education data per locale and applies translations", async () => {
    __setMockRuntimeConfig({
      redis: {
        url: "redis://cache",
        keyPrefix: "test",
        educationTtl: 120,
      },
    });

    expect(useRuntimeConfig().redis.url).toBe("redis://cache");

    readFileMock.mockResolvedValueOnce(JSON.stringify(educationFixture));

    const { listCategories, getCourse } = await import("~/server/utils/education");

    const categories = await listCategories("en");
    const localizedCourse = await getCourse("course-1", "fr");

    expect(readFileMock).toHaveBeenCalledTimes(1);
    expect(redisConstructor).toHaveBeenCalledWith("redis://cache", expect.any(Object));
    expect(redisSetMock).toHaveBeenCalledWith(
      "test:cache:public:education:base",
      expect.any(String),
      "EX",
      120,
    );
    expect(redisSetMock).toHaveBeenCalledWith(
      "test:cache:public:education:locale:en",
      expect.any(String),
      "EX",
      120,
    );
    expect(redisSetMock).toHaveBeenCalledWith(
      "test:cache:public:education:locale:fr",
      expect.any(String),
      "EX",
      120,
    );

    expect(categories).toHaveLength(1);
    expect(categories[0]?.title).toBe("Category EN");
    expect(localizedCourse).not.toBeNull();
    expect(localizedCourse?.title).toBe("Cours FR");
    expect(localizedCourse?.lessons[0]?.title).toBe("Leçon FR");
  });

  it("persists certificates in Redis and retrieves them", async () => {
    __setMockRuntimeConfig({
      redis: {
        url: "redis://cache",
        keyPrefix: "test",
        educationTtl: 90,
        certificateTtl: 3600,
      },
    });

    expect(useRuntimeConfig().redis.url).toBe("redis://cache");

    readFileMock.mockResolvedValue(JSON.stringify(educationFixture));

    const { createCertificate, listCertificates, findCertificate } = await import(
      "~/server/utils/education"
    );

    const certificate = await createCertificate({
      courseId: "course-1",
      userName: "Ada",
      score: 85,
    });

    expect(redisLpushMock).toHaveBeenCalledWith(
      "test:cache:public:education:certificates",
      expect.any(String),
    );
    expect(redisExpireMock).toHaveBeenCalledWith(
      "test:cache:public:education:certificates",
      3600,
    );

    const storedPayload = JSON.parse(redisLpushMock.mock.calls[0]?.[1] ?? "{}");
    expect(storedPayload).toMatchObject({
      id: certificate.id,
      courseId: "course-1",
      userName: "Ada",
      score: 85,
    });

    clearCertificateMemoryCache();
    redisLrangeMock.mockResolvedValueOnce([JSON.stringify(certificate)]);

    const certificates = await listCertificates();
    expect(redisLrangeMock).toHaveBeenCalledWith(
      "test:cache:public:education:certificates",
      0,
      -1,
    );
    expect(certificates).toEqual([certificate]);

    const found = await findCertificate(certificate.id);
    expect(found).toEqual(certificate);
  });
});
