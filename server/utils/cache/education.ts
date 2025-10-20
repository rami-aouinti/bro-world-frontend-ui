import Redis from "ioredis";
import { useRuntimeConfig } from "#imports";

import { CACHE_NAMESPACE_PUBLIC, createPrefixedCacheKey } from "~/lib/cache/namespaces";
import type {
  Category,
  Certificate,
  Course,
  ExerciseWithCourse,
  Lesson,
  QuizQuestion,
} from "~/types/education";

interface EducationCacheConfig {
  url: string;
  tls: boolean;
  keyPrefix: string;
  educationTtl: number;
  certificateTtl: number;
}

export interface CachedEducationCourse extends Course {
  exercises: ExerciseWithCourse[];
}

export interface CachedEducationData {
  categories: Category[];
  courses: CachedEducationCourse[];
  exercises: ExerciseWithCourse[];
}

interface MemoryCacheEntry<T> {
  value: T;
  expiresAt: number;
}

const DEFAULT_EDUCATION_TTL_SECONDS = 300;
const DEFAULT_CERTIFICATE_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

const globalScope = globalThis as typeof globalThis & {
  __broEducationRedisClient?: Redis | null;
  __broEducationRedisClientPromise?: Promise<Redis | null> | null;
  __broEducationMemoryBaseCache?: MemoryCacheEntry<CachedEducationData> | null;
  __broEducationMemoryLocaleCache?: Map<string, MemoryCacheEntry<CachedEducationData>>;
  __broEducationKnownLocales?: Set<string>;
  __broEducationMemoryCertificates?: MemoryCacheEntry<Certificate[]> | null;
};

function getLocaleCacheRegistry(): Map<string, MemoryCacheEntry<CachedEducationData>> {
  if (!globalScope.__broEducationMemoryLocaleCache) {
    globalScope.__broEducationMemoryLocaleCache = new Map();
  }

  return globalScope.__broEducationMemoryLocaleCache;
}

function getKnownLocales(): Set<string> {
  if (!globalScope.__broEducationKnownLocales) {
    globalScope.__broEducationKnownLocales = new Set();
  }

  return globalScope.__broEducationKnownLocales;
}

function readMemoryEntry<T>(entry: MemoryCacheEntry<T> | null | undefined): T | null {
  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    return null;
  }

  return structuredClone(entry.value);
}

function writeMemoryEntry<T>(value: T, ttlSeconds: number): MemoryCacheEntry<T> {
  const ttlMs = Math.max(Number(ttlSeconds) || 0, 1) * 1000;

  return {
    value: structuredClone(value),
    expiresAt: Date.now() + ttlMs,
  } satisfies MemoryCacheEntry<T>;
}

function sanitizeEducationDataCandidate(candidate: unknown): CachedEducationData | null {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const record = candidate as Partial<CachedEducationData> & {
    courses?: Array<Partial<CachedEducationCourse & { lessons?: Lesson[]; quiz?: QuizQuestion[] }>>;
  };

  if (
    !Array.isArray(record.categories) ||
    !Array.isArray(record.courses) ||
    !Array.isArray(record.exercises)
  ) {
    return null;
  }

  const categories = record.categories.filter((category): category is Category =>
    Boolean(category),
  );

  const courses = record.courses
    .map((course) => {
      if (!course || typeof course !== "object") {
        return null;
      }

      const base = course as Partial<CachedEducationCourse> & {
        lessons?: Lesson[];
        quiz?: QuizQuestion[];
      };

      if (
        typeof base.id !== "string" ||
        typeof base.slug !== "string" ||
        typeof base.categorySlug !== "string" ||
        typeof base.title !== "string" ||
        typeof base.level !== "string" ||
        typeof base.description !== "string" ||
        typeof base.cover !== "string" ||
        typeof base.durationMin !== "number"
      ) {
        return null;
      }

      const lessons = Array.isArray(base.lessons) ? (base.lessons as Lesson[]) : [];
      const quiz = Array.isArray(base.quiz) ? (base.quiz as QuizQuestion[]) : [];
      const exercises = Array.isArray(base.exercises)
        ? (base.exercises as ExerciseWithCourse[])
        : [];

      return {
        ...(base as Course),
        lessons,
        quiz,
        exercises,
      } satisfies CachedEducationCourse;
    })
    .filter((course): course is CachedEducationCourse => Boolean(course));

  const exercises = record.exercises.filter((exercise): exercise is ExerciseWithCourse =>
    Boolean(exercise),
  );

  return {
    categories,
    courses,
    exercises,
  } satisfies CachedEducationData;
}

function sanitizeCertificateCandidate(candidate: unknown): Certificate | null {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const record = candidate as Partial<Certificate>;

  if (
    typeof record.id !== "string" ||
    typeof record.courseId !== "string" ||
    typeof record.courseTitle !== "string" ||
    typeof record.userName !== "string" ||
    typeof record.score !== "number" ||
    typeof record.dateIso !== "string"
  ) {
    return null;
  }

  return {
    id: record.id,
    courseId: record.courseId,
    courseTitle: record.courseTitle,
    userName: record.userName,
    score: record.score,
    dateIso: record.dateIso,
  } satisfies Certificate;
}

function getCacheConfig(): EducationCacheConfig {
  const runtime = useRuntimeConfig();
  const redis = (runtime.redis ?? {}) as Partial<
    EducationCacheConfig & {
      educationTtl?: number;
      certificateTtl?: number;
    }
  >;

  const ttlCandidate = Number(redis.educationTtl);
  const certificateTtlCandidate = Number(redis.certificateTtl);

  return {
    url: typeof redis.url === "string" ? redis.url : "",
    tls: Boolean(redis.tls),
    keyPrefix:
      typeof redis.keyPrefix === "string" && redis.keyPrefix ? redis.keyPrefix : "bro-world",
    educationTtl:
      Number.isFinite(ttlCandidate) && ttlCandidate > 0
        ? Number(ttlCandidate)
        : DEFAULT_EDUCATION_TTL_SECONDS,
    certificateTtl:
      Number.isFinite(certificateTtlCandidate) && certificateTtlCandidate > 0
        ? Number(certificateTtlCandidate)
        : DEFAULT_CERTIFICATE_TTL_SECONDS,
  } satisfies EducationCacheConfig;
}

function getBaseCacheKey(config: EducationCacheConfig): string {
  return createPrefixedCacheKey(config.keyPrefix, CACHE_NAMESPACE_PUBLIC, "education", "base");
}

function getLocaleCacheKey(config: EducationCacheConfig, locale: string): string {
  const normalized = locale?.toLowerCase() || "en";
  return createPrefixedCacheKey(
    config.keyPrefix,
    CACHE_NAMESPACE_PUBLIC,
    "education",
    "locale",
    normalized,
  );
}

function getCertificateCacheKey(config: EducationCacheConfig): string {
  return createPrefixedCacheKey(
    config.keyPrefix,
    CACHE_NAMESPACE_PUBLIC,
    "education",
    "certificates",
  );
}

async function getRedisClient(): Promise<Redis | null> {
  const config = getCacheConfig();

  if (!config.url) {
    globalScope.__broEducationRedisClient = null;
    globalScope.__broEducationRedisClientPromise = null;
    return null;
  }

  if (globalScope.__broEducationRedisClient) {
    return globalScope.__broEducationRedisClient;
  }

  if (!globalScope.__broEducationRedisClientPromise) {
    globalScope.__broEducationRedisClientPromise = (async () => {
      try {
        const client = new Redis(config.url, {
          lazyConnect: true,
          enableAutoPipelining: true,
          maxRetriesPerRequest: 2,
          tls: config.tls ? {} : undefined,
        });

        client.on("error", (error) => {
          console.error("[education-cache] Redis client error", error);
        });

        await client.connect();
        globalScope.__broEducationRedisClient = client;
        return client;
      } catch (error) {
        console.error("[education-cache] Redis connection failed", error);
        return null;
      } finally {
        if (!globalScope.__broEducationRedisClient) {
          globalScope.__broEducationRedisClientPromise = null;
        }
      }
    })();
  }

  const client = await globalScope.__broEducationRedisClientPromise;

  if (!client) {
    globalScope.__broEducationRedisClientPromise = null;
  }

  return client ?? null;
}

export async function readCachedBaseEducationData(): Promise<CachedEducationData | null> {
  const memoryEntry = readMemoryEntry(globalScope.__broEducationMemoryBaseCache);

  if (memoryEntry) {
    return memoryEntry;
  }

  const client = await getRedisClient();

  if (!client) {
    return null;
  }

  const config = getCacheConfig();

  try {
    const raw = await client.get(getBaseCacheKey(config));

    if (!raw) {
      return null;
    }

    const parsed = sanitizeEducationDataCandidate(JSON.parse(raw));

    if (!parsed) {
      return null;
    }

    globalScope.__broEducationMemoryBaseCache = writeMemoryEntry(parsed, config.educationTtl);
    return structuredClone(parsed);
  } catch (error) {
    console.error("[education-cache] Failed to read base education cache", error);
    return null;
  }
}

export async function writeCachedBaseEducationData(data: CachedEducationData): Promise<void> {
  const config = getCacheConfig();
  const sanitized = sanitizeEducationDataCandidate(data);

  if (!sanitized) {
    return;
  }

  globalScope.__broEducationMemoryBaseCache = writeMemoryEntry(sanitized, config.educationTtl);

  const client = await getRedisClient();

  if (!client) {
    return;
  }

  try {
    await client.set(getBaseCacheKey(config), JSON.stringify(sanitized), "EX", config.educationTtl);
  } catch (error) {
    console.error("[education-cache] Failed to write base education cache", error);
  }
}

export async function readCachedEducationData(locale: string): Promise<CachedEducationData | null> {
  const normalized = locale?.toLowerCase() || "en";
  const registry = getLocaleCacheRegistry();
  const memoryEntry = readMemoryEntry(registry.get(normalized) ?? null);

  if (memoryEntry) {
    return memoryEntry;
  }

  const client = await getRedisClient();

  if (!client) {
    return null;
  }

  const config = getCacheConfig();

  try {
    const raw = await client.get(getLocaleCacheKey(config, normalized));

    if (!raw) {
      return null;
    }

    const parsed = sanitizeEducationDataCandidate(JSON.parse(raw));

    if (!parsed) {
      return null;
    }

    registry.set(normalized, writeMemoryEntry(parsed, config.educationTtl));
    getKnownLocales().add(normalized);
    return structuredClone(parsed);
  } catch (error) {
    console.error("[education-cache] Failed to read localized education cache", error);
    return null;
  }
}

export async function writeCachedEducationData(
  locale: string,
  data: CachedEducationData,
): Promise<void> {
  const normalized = locale?.toLowerCase() || "en";
  const config = getCacheConfig();
  const sanitized = sanitizeEducationDataCandidate(data);

  if (!sanitized) {
    return;
  }

  const registry = getLocaleCacheRegistry();
  registry.set(normalized, writeMemoryEntry(sanitized, config.educationTtl));
  getKnownLocales().add(normalized);

  const client = await getRedisClient();

  if (!client) {
    return;
  }

  try {
    await client.set(
      getLocaleCacheKey(config, normalized),
      JSON.stringify(sanitized),
      "EX",
      config.educationTtl,
    );
  } catch (error) {
    console.error("[education-cache] Failed to write localized education cache", error);
  }
}

export async function invalidateCachedEducationData(locale?: string): Promise<void> {
  if (locale) {
    const normalized = locale.toLowerCase();
    getLocaleCacheRegistry().delete(normalized);
    getKnownLocales().delete(normalized);
  } else {
    const locales = Array.from(getKnownLocales());
    globalScope.__broEducationMemoryBaseCache = null;
    getLocaleCacheRegistry().clear();
    getKnownLocales().clear();

    const client = await getRedisClient();

    if (!client) {
      return;
    }

    const config = getCacheConfig();

    try {
      const keys = [
        getBaseCacheKey(config),
        ...locales.map((loc) => getLocaleCacheKey(config, loc)),
      ];

      if (keys.length) {
        await client.del(...keys);
      }
    } catch (error) {
      console.error("[education-cache] Failed to invalidate education cache", error);
    }

    return;
  }

  const client = await getRedisClient();

  if (!client) {
    return;
  }

  const config = getCacheConfig();

  try {
    const normalized = locale?.toLowerCase() || "en";
    await client.del(getLocaleCacheKey(config, normalized));
  } catch (error) {
    console.error("[education-cache] Failed to invalidate education cache", error);
  }
}

export async function readCachedCertificates(): Promise<Certificate[]> {
  const memoryEntry = readMemoryEntry(globalScope.__broEducationMemoryCertificates ?? null);

  if (memoryEntry) {
    return memoryEntry;
  }

  const client = await getRedisClient();

  if (!client) {
    return [];
  }

  const config = getCacheConfig();

  try {
    const entries = await client.lrange(getCertificateCacheKey(config), 0, -1);

    if (!Array.isArray(entries) || !entries.length) {
      return [];
    }

    const certificates = entries
      .map((entry) => {
        try {
          return sanitizeCertificateCandidate(JSON.parse(entry));
        } catch (error) {
          console.error("[education-cache] Failed to parse cached certificate", error);
          return null;
        }
      })
      .filter((certificate): certificate is Certificate => Boolean(certificate));

    if (!certificates.length) {
      return [];
    }

    globalScope.__broEducationMemoryCertificates = writeMemoryEntry(
      certificates,
      config.certificateTtl,
    );
    return structuredClone(certificates);
  } catch (error) {
    console.error("[education-cache] Failed to read certificates cache", error);
    return [];
  }
}

export async function prependCachedCertificate(certificate: Certificate): Promise<void> {
  const config = getCacheConfig();
  const sanitized = sanitizeCertificateCandidate(certificate);

  if (!sanitized) {
    return;
  }

  const existingMemory =
    readMemoryEntry(globalScope.__broEducationMemoryCertificates ?? null) ?? [];
  const updated = [sanitized, ...existingMemory.filter((entry) => entry.id !== sanitized.id)];
  globalScope.__broEducationMemoryCertificates = writeMemoryEntry(updated, config.certificateTtl);

  const client = await getRedisClient();

  if (!client) {
    return;
  }

  const key = getCertificateCacheKey(config);

  try {
    await client.lpush(key, JSON.stringify(sanitized));
    await client.expire(key, config.certificateTtl);
  } catch (error) {
    console.error("[education-cache] Failed to persist certificate", error);
  }
}

export async function clearCachedCertificates(): Promise<void> {
  globalScope.__broEducationMemoryCertificates = null;

  const client = await getRedisClient();

  if (!client) {
    return;
  }

  const config = getCacheConfig();

  try {
    await client.del(getCertificateCacheKey(config));
  } catch (error) {
    console.error("[education-cache] Failed to clear certificates cache", error);
  }
}
