export type LocaleTarget = string | { path?: string | null }

export function useLocalePath() {
  return (target: LocaleTarget) => {
    if (typeof target === 'string') {
      return target
    }

    if (target && typeof target === 'object' && typeof target.path === 'string') {
      return target.path
    }

    return '/'
  }
}
