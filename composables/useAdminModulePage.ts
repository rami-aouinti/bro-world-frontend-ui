import { useHead, useI18n } from "#imports";
import { computed, unref, type MaybeRef } from "vue";

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
