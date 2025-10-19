import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { createError } from "h3";
import { useRuntimeConfig } from "#imports";
import Redis from "ioredis";

import { CACHE_NAMESPACE_PUBLIC, createPrefixedCacheKey } from "~/lib/cache/namespaces";
import type { HelpArticleDetail, HelpArticleSummary, HelpCategory } from "~/types/help";

interface LocalizedContent {
  title: string;
  description?: string;
  excerpt?: string;
  body?: string;
  related?: string[];
}

interface RawHelpCategory {
  id: string;
  slug: string;
  icon?: string;
  order?: number;
  translations: Record<string, LocalizedContent>;
}

interface RawHelpArticle {
  id: string;
  slug: string;
  categorySlug: string;
  keywords?: string[];
  updatedAtIso?: string;
  isPopular?: boolean;
  translations: Record<string, LocalizedContent>;
}

interface HelpData {
  categories: RawHelpCategory[];
  articles: RawHelpArticle[];
}

interface HelpCacheConfig {
  url: string;
  tls: boolean;
  keyPrefix: string;
  ttl: number;
}

interface MemoryCacheEntry {
  value: HelpData;
  expiresAt: number;
}

const DEFAULT_HELP_TTL_SECONDS = 300;
const MEMORY_CACHE_TTL_MS = 60_000;

const globalScope = globalThis as typeof globalThis & {
  __broHelpMemoryCache?: MemoryCacheEntry | null;
  __broHelpRedisClient?: Redis | null;
  __broHelpRedisClientPromise?: Promise<Redis | null> | null;
};

function getHelpCacheConfig(): HelpCacheConfig {
  const runtime = useRuntimeConfig();
  const redis = (runtime.redis ?? {}) as Partial<HelpCacheConfig & { helpTtl?: number }>;
  const ttlCandidate = Number(redis.helpTtl);

  return {
    url: typeof redis.url === "string" ? redis.url : "",
    tls: Boolean(redis.tls),
    keyPrefix:
      typeof redis.keyPrefix === "string" && redis.keyPrefix ? redis.keyPrefix : "bro-world",
    ttl:
      Number.isFinite(ttlCandidate) && ttlCandidate > 0
        ? Number(ttlCandidate)
        : DEFAULT_HELP_TTL_SECONDS,
  } satisfies HelpCacheConfig;
}

function getRedisCacheKey(config: HelpCacheConfig): string {
  return createPrefixedCacheKey(config.keyPrefix, CACHE_NAMESPACE_PUBLIC, "help", "data");
}

async function getRedisClient(): Promise<Redis | null> {
  const config = getHelpCacheConfig();

  if (!config.url) {
    return null;
  }

  if (globalScope.__broHelpRedisClient) {
    return globalScope.__broHelpRedisClient;
  }

  if (!globalScope.__broHelpRedisClientPromise) {
    globalScope.__broHelpRedisClientPromise = (async () => {
      try {
        const client = new Redis(config.url, {
          lazyConnect: true,
          enableAutoPipelining: true,
          maxRetriesPerRequest: 2,
          tls: config.tls ? {} : undefined,
        });

        client.on("error", (error) => {
          console.error("[help-cache] Redis client error", error);
        });

        await client.connect();
        globalScope.__broHelpRedisClient = client;
        return client;
      } catch (error) {
        console.error("[help-cache] Redis connection failed", error);
        return null;
      } finally {
        if (!globalScope.__broHelpRedisClient) {
          globalScope.__broHelpRedisClientPromise = null;
        }
      }
    })();
  }

  const client = await globalScope.__broHelpRedisClientPromise;

  if (!client) {
    globalScope.__broHelpRedisClientPromise = null;
  }

  return client ?? null;
}

function readFromMemory(): HelpData | null {
  const entry = globalScope.__broHelpMemoryCache;

  if (!entry || entry.expiresAt <= Date.now()) {
    if (entry) {
      globalScope.__broHelpMemoryCache = null;
    }

    return null;
  }

  return structuredClone(entry.value);
}

function writeToMemory(data: HelpData): void {
  globalScope.__broHelpMemoryCache = {
    value: structuredClone(data),
    expiresAt: Date.now() + MEMORY_CACHE_TTL_MS,
  } satisfies MemoryCacheEntry;
}

function clearMemoryCache(): void {
  globalScope.__broHelpMemoryCache = null;
}

function sanitizeHelpDataCandidate(candidate: unknown): HelpData | null {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const record = candidate as Partial<HelpData>;

  if (!Array.isArray(record.categories) || !Array.isArray(record.articles)) {
    return null;
  }

  return {
    categories: record.categories,
    articles: record.articles,
  } satisfies HelpData;
}

async function readFromRedis(): Promise<HelpData | null> {
  const client = await getRedisClient();

  if (!client) {
    return null;
  }

  const config = getHelpCacheConfig();

  try {
    const raw = await client.get(getRedisCacheKey(config));

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as unknown;
    return sanitizeHelpDataCandidate(parsed);
  } catch (error) {
    console.error("[help-cache] Failed to read help data from Redis", error);
    return null;
  }
}

async function writeToRedis(data: HelpData): Promise<void> {
  const client = await getRedisClient();

  if (!client) {
    return;
  }

  const config = getHelpCacheConfig();

  try {
    const serialized = JSON.stringify(data);
    const ttl = Math.max(1, Math.round(config.ttl));
    await client.set(getRedisCacheKey(config), serialized, "EX", ttl);
  } catch (error) {
    console.error("[help-cache] Failed to persist help data to Redis", error);
  }
}

async function deleteRedisCache(): Promise<void> {
  const client = await getRedisClient();

  if (!client) {
    return;
  }

  const config = getHelpCacheConfig();

  try {
    await client.del(getRedisCacheKey(config));
  } catch (error) {
    console.error("[help-cache] Failed to delete help cache from Redis", error);
  }
}

const SUPPORTED_LOCALES = ["en", "fr", "de", "ar"] as const;

type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

function resolveLocale(locale: string | undefined): SupportedLocale {
  const normalized = locale?.split("-")[0]?.toLowerCase();

  if (normalized && SUPPORTED_LOCALES.includes(normalized as SupportedLocale)) {
    return normalized as SupportedLocale;
  }

  return "en";
}

async function readHelpData(): Promise<HelpData> {
  const memoryCached = readFromMemory();

  if (memoryCached) {
    return memoryCached;
  }

  const redisCached = await readFromRedis();

  if (redisCached) {
    writeToMemory(redisCached);
    return structuredClone(redisCached);
  }

  const filePath = join(process.cwd(), "server/mock/help.json");
  const content = await readFile(filePath, "utf8");
  const parsed = JSON.parse(content) as unknown;
  const sanitized =
    sanitizeHelpDataCandidate(parsed) ?? ({ categories: [], articles: [] } satisfies HelpData);

  writeToMemory(sanitized);
  await writeToRedis(sanitized);

  return structuredClone(sanitized);
}

function pickTranslation<T extends LocalizedContent>(
  translations: Record<string, T>,
  locale: SupportedLocale,
): T {
  if (translations[locale]) {
    return translations[locale];
  }

  if (translations.en) {
    return translations.en;
  }

  const [first] = Object.values(translations);
  if (!first) {
    throw createError({
      statusCode: 500,
      statusMessage: "Missing translation",
    });
  }

  return first;
}

function mapCategory(
  raw: RawHelpCategory,
  locale: SupportedLocale,
  articleCount: number,
): HelpCategory {
  const translation = pickTranslation(raw.translations, locale);
  return {
    id: raw.id,
    slug: raw.slug,
    icon: raw.icon,
    order: raw.order,
    title: translation.title,
    description: translation.description,
    articleCount,
  };
}

function mapArticle(raw: RawHelpArticle, locale: SupportedLocale): HelpArticleSummary {
  const translation = pickTranslation(raw.translations, locale);
  return {
    id: raw.id,
    slug: raw.slug,
    categorySlug: raw.categorySlug,
    title: translation.title,
    excerpt: translation.excerpt ?? "",
    keywords: raw.keywords,
    updatedAtIso: raw.updatedAtIso,
    isPopular: raw.isPopular,
    relatedIds: translation.related,
  };
}

function mapArticleDetail(raw: RawHelpArticle, locale: SupportedLocale): HelpArticleDetail {
  const translation = pickTranslation(raw.translations, locale);
  return {
    ...mapArticle(raw, locale),
    body: translation.body ?? "",
  };
}

function createSearchField(value: string | undefined): string {
  return value?.toLocaleLowerCase()?.normalize("NFKD") ?? "";
}

function matchesQuery(article: HelpArticleSummary, body: string, query: string): boolean {
  const normalizedQuery = query.trim().toLocaleLowerCase().normalize("NFKD");

  if (!normalizedQuery) {
    return true;
  }

  const title = createSearchField(article.title);
  const excerpt = createSearchField(article.excerpt);
  const keywords = (article.keywords ?? []).map(createSearchField);
  const bodyField = createSearchField(body);

  return (
    title.includes(normalizedQuery) ||
    excerpt.includes(normalizedQuery) ||
    keywords.some((keyword) => keyword.includes(normalizedQuery)) ||
    bodyField.includes(normalizedQuery)
  );
}

export async function listHelpCategories(locale: string): Promise<HelpCategory[]> {
  const data = await readHelpData();
  const resolvedLocale = resolveLocale(locale);
  const counts = data.articles.reduce<Record<string, number>>((accumulator, article) => {
    accumulator[article.categorySlug] = (accumulator[article.categorySlug] ?? 0) + 1;
    return accumulator;
  }, {});

  return data.categories
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((category) => mapCategory(category, resolvedLocale, counts[category.slug] ?? 0));
}

export async function listHelpArticles(options: {
  locale: string;
  categorySlug?: string;
  query?: string;
  popular?: boolean;
}): Promise<HelpArticleSummary[]> {
  const data = await readHelpData();
  const resolvedLocale = resolveLocale(options.locale);

  const filtered = data.articles.filter((article) => {
    if (options.categorySlug && article.categorySlug !== options.categorySlug) {
      return false;
    }

    if (options.popular && !article.isPopular) {
      return false;
    }

    if (options.query && options.query.trim()) {
      const detail = mapArticleDetail(article, resolvedLocale);
      return matchesQuery(detail, detail.body, options.query);
    }

    return true;
  });

  return filtered.map((article) => mapArticle(article, resolvedLocale));
}

export async function getHelpArticle(
  slug: string,
  locale: string,
): Promise<HelpArticleDetail | null> {
  const data = await readHelpData();
  const resolvedLocale = resolveLocale(locale);
  const article = data.articles.find((entry) => entry.slug === slug);

  if (!article) {
    return null;
  }

  return mapArticleDetail(article, resolvedLocale);
}

export async function searchHelpArticles(
  query: string,
  locale: string,
): Promise<HelpArticleSummary[]> {
  if (!query.trim()) {
    return [];
  }

  const data = await readHelpData();
  const resolvedLocale = resolveLocale(locale);

  return data.articles
    .map((article) => mapArticleDetail(article, resolvedLocale))
    .filter((article) => matchesQuery(article, article.body, query))
    .map(({ body, ...summary }) => summary);
}

export async function getHelpRelatedArticles(
  slug: string,
  locale: string,
  limit = 3,
): Promise<HelpArticleSummary[]> {
  const data = await readHelpData();
  const resolvedLocale = resolveLocale(locale);
  const article = data.articles.find((entry) => entry.slug === slug);

  if (!article) {
    return [];
  }

  const relatedIds = pickTranslation(article.translations, resolvedLocale).related ?? [];
  const relatedById = relatedIds
    .map((id) => data.articles.find((entry) => entry.id === id))
    .filter((entry): entry is RawHelpArticle => Boolean(entry));

  const sameCategory = data.articles.filter(
    (entry) => entry.categorySlug === article.categorySlug && entry.slug !== article.slug,
  );

  const combined = [...relatedById, ...sameCategory].filter(
    (value, index, array) => array.findIndex((candidate) => candidate.id === value.id) === index,
  );

  return combined.slice(0, limit).map((item) => mapArticle(item, resolvedLocale));
}

export async function clearHelpCache(): Promise<void> {
  clearMemoryCache();
  await deleteRedisCache();
}
