import { useI18n } from "vue-i18n";

import { loadLocaleNamespaces } from "~/i18n/i18n.config";

export async function useLocaleNamespaces(namespaces: string[]) {
  const { locale } = useI18n();

  if (!Array.isArray(namespaces) || namespaces.length === 0) {
    return;
  }

  await loadLocaleNamespaces(locale.value, namespaces);
}
