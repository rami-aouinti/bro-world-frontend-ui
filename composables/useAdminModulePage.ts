import { useHead } from "#imports";
import { computed, unref, type MaybeRef } from "vue";
import { useI18n } from "vue-i18n";

export function useAdminModulePage(pageKey: MaybeRef<string>) {
  const { t } = useI18n();

  useHead(() => ({
    title: t(`${unref(pageKey)}.metaTitle`),
  }));

  const title = computed(() => t(`${unref(pageKey)}.page.title`));
  const subtitle = computed(() => t(`${unref(pageKey)}.page.subtitle`));

  return {
    t,
    title,
    subtitle,
  };
}
