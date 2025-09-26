const PRIVATE_TOPIC_PATTERNS = [
  /^user\/[^/]+\/presence$/i,
  /^chat\/conversation\/[^/]+$/i,
]

function normalizeTopic(raw: string): string {
  const trimmed = raw.trim()

  if (!trimmed) {
    return ''
  }

  try {
    const url = new URL(trimmed)
    return url.pathname.replace(/^\/+/, '')
  } catch {
    return trimmed.replace(/^\/+/, '').split('?')[0] ?? ''
  }
}

export function topicRequiresMercureToken(topic: string): boolean {
  const normalized = normalizeTopic(topic)

  return PRIVATE_TOPIC_PATTERNS.some((pattern) => pattern.test(normalized))
}

function headersToObject(headers: Headers): Record<string, string> {
  return Array.from(headers.entries()).reduce<Record<string, string>>((acc, [key, value]) => {
    acc[key] = value
    return acc
  }, {})
}

export interface MercureRequestOptions {
  hubUrl: string
  topics: string[]
  token?: string | null
  init?: RequestInit
  baseUrl?: string
}

export interface MercureRequestConfig {
  url: string
  init: RequestInit
}

function resolveBaseUrl(options: MercureRequestOptions): string | undefined {
  if (options.baseUrl) {
    return options.baseUrl
  }

  if (import.meta.client && typeof window !== 'undefined') {
    return window.location.origin
  }

  return undefined
}

export function buildMercureRequest(options: MercureRequestOptions): MercureRequestConfig {
  const { hubUrl, topics, token, init } = options

  if (!hubUrl) {
    throw new Error('A Mercure hub URL is required.')
  }

  const baseUrl = resolveBaseUrl(options)
  const url = baseUrl ? new URL(hubUrl, baseUrl) : new URL(hubUrl)
  const requiresToken = topics.some(topicRequiresMercureToken)

  topics.forEach((topic) => {
    if (topic) {
      url.searchParams.append('topic', topic)
    }
  })

  const headers = new Headers(init?.headers ?? {})

  if (requiresToken) {
    if (!token) {
      throw new Error('A Mercure subscribe token is required for private topics.')
    }

    headers.set('Authorization', `Bearer ${token}`)
  }

  const headerEntries = Array.from(headers.entries())
  const resolvedInit: RequestInit = {
    ...init,
  }

  if (headerEntries.length > 0) {
    resolvedInit.headers = headersToObject(headers)
  }

  if (requiresToken && !resolvedInit.credentials) {
    resolvedInit.credentials = 'include'
  }

  return {
    url: url.toString(),
    init: resolvedInit,
  }
}
