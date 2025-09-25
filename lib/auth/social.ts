import { useRuntimeConfig } from '#imports'

export type SocialProvider = 'google' | 'github' | 'microsoft'

type SocialRedirects = Record<SocialProvider, string>

const DEFAULT_REDIRECTS: SocialRedirects = {
  google: '/api/auth/google',
  github: '/api/auth/github',
  microsoft: '/api/auth/microsoft',
}

export function resolveSocialRedirect(provider: SocialProvider): string {
  const config = useRuntimeConfig()
  const overrides = (config.public?.auth?.socialRedirects ?? {}) as Partial<SocialRedirects>

  return overrides[provider] ?? DEFAULT_REDIRECTS[provider]
}

export const SOCIAL_PROVIDERS: readonly SocialProvider[] = ['google', 'github', 'microsoft'] as const
