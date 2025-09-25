<template>
  <v-app>
    <Header />
    <div
      v-if="useStructuredLayout"
      class="min-h-screen border-b"
    >
      <div
        class="flex-1 items-start px-4 md:grid md:gap-6 md:px-8 lg:gap-10"
        :class="[config.main.padded && 'container', layoutColumns]"
      >
        <aside
          v-if="showLeftAside"
          class="fixed z-30 -ml-2 hidden w-full shrink-0 overflow-y-auto top-[102px] md:sticky md:block"
          :class="stickyOffsets"
        >
          <Aside :is-mobile="false" />
        </aside>
        <div class="min-w-0">
          <slot />
        </div>
        <aside
          v-if="showRightAside"
          class="hidden w-full md:sticky md:block"
          :class="stickyOffsets"
        >
          <LayoutRightSidebar />
        </aside>
      </div>
    </div>
    <div v-else>
      <slot />
      <LayoutRightSidebar v-if="showRightAside" />
    </div>
    <Toaster />
    <VFooter />
  </v-app>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Toaster from "shadcn-docs-nuxt/components/ui/toast/Toaster.vue";
import Aside from "~/components/layout/Aside.vue";
import LayoutRightSidebar from "~/components/layout/RightSidebar.vue";
import Header from "~/components/layout/Header.vue";

const { page } = useContent();
const config = useConfig();

const hasContentPage = computed(() => Boolean(page.value));
const useStructuredLayout = computed(() => hasContentPage.value && page.value?.fullpage !== true);

const showLeftAside = computed(() => hasContentPage.value && (page.value?.aside ?? true));
const showRightAside = computed(() => hasContentPage.value && (page.value?.rightAside ?? true));

const stickyOffsets = computed(() =>
  config.value.aside.useLevel && config.value.aside.levelStyle === "aside"
    ? "h-[calc(100vh-3.5rem)] md:top-[61px]"
    : "h-[calc(100vh-6rem)] md:top-[101px]",
);

const layoutColumns = computed(() => {
  const left = showLeftAside.value;
  const right = showRightAside.value;

  if (left && right) {
    return "md:grid-cols-[240px_minmax(0,1fr)_280px] lg:grid-cols-[280px_minmax(0,1fr)_320px]";
  }

  if (left) {
    return "md:grid-cols-[240px_minmax(0,1fr)] lg:grid-cols-[280px_minmax(0,1fr)]";
  }

  if (right) {
    return "md:grid-cols-[minmax(0,1fr)_280px] lg:grid-cols-[minmax(0,1fr)_320px]";
  }

  return null;
});
</script>
