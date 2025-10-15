<!-- eslint-disable check-file/folder-naming-convention -->
<template>
  <NuxtLink
    :to="resolvedLink"
    class="flex items-center gap-2 rounded-xl px-2 py-1 font-semibold text-xl"
  >
    <h1 class="z-2 relative flex items-center gap-1 text-center font-sans font-bold">
      <span
        v-if="brandParts.prefix"
        class="text-inherit"
        >{{ brandParts.prefix }}</span
      >
      <LazyColourfulText
        :colors="colors"
        :text="brandParts.highlight"
      />
    </h1>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { usePrimaryGradient } from "~/composables/usePrimaryGradient";
import { useResolvedLocalePath } from "~/composables/useResolvedLocalePath";
import { useSiteSettingsState } from "~/composables/useSiteSettingsState";
import { getDefaultSiteSettings } from "~/lib/settings/defaults";

const props = defineProps<{ to?: string }>();
const { colors } = usePrimaryGradient({ steps: 5, lightDark: [0.88, 0.3] });

const siteSettings = useSiteSettingsState();
const brandName = computed(
  () => siteSettings.value?.siteName?.trim() || getDefaultSiteSettings().siteName,
);

const localePath = useResolvedLocalePath();
const resolvedLink = computed(() => localePath(props.to ?? "/"));

const brandParts = computed(() => {
  const name = brandName.value;
  const segments = name.split(/\s+/).filter(Boolean);

  if (segments.length <= 1) {
    return { prefix: "", highlight: name };
  }

  return {
    prefix: segments.slice(0, -1).join(" "),
    highlight: segments[segments.length - 1],
  };
});
</script>
