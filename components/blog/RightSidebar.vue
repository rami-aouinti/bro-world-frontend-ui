<template>
  <aside
    class="fixed z-30 -ml-2 hidden w-full shrink-0 overflow-y-auto top-[102px] md:sticky md:block"
  >
    <UiScrollArea
      orientation="vertical"
      class="z-30 hidden overflow-y-auto md:block lg:block"
      type="hover"
    >
      <div
        class="sticky top-24 flex flex-col gap-6 border border-white/5 bg-white/5 p-6 backdrop-blur-xl"
        style="border-radius: var(--ui-card-radius, calc(var(--radius, var(--ui-radius)) + 8px))"
      >
        <header class="space-y-2">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {{ title }}
          </p>
          <h2 class="text-2xl font-semibold text-white">
            {{ subtitle }}
          </h2>
        </header>
        <div class="space-y-4">
          <template v-if="showSkeleton">
            <SidebarWidgetSkeleton
              v-for="index in 3"
              :key="`sidebar-widget-skeleton-${index}`"
            />
          </template>
          <template v-else>
            <SidebarWidget
              v-for="widget in sidebarWidgets"
              :key="widget.id"
              :widget="widget"
            />
          </template>
        </div>
      </div>
    </UiScrollArea>
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";
import SidebarWidget, { type SidebarWidgetData } from "./SidebarWidget.vue";
import SidebarWidgetSkeleton from "./SidebarWidgetSkeleton.vue";

const { page } = useContent();
const config = useConfig();

const props = withDefaults(
  defineProps<{
    title: string;
    subtitle: string;
    widgets: SidebarWidgetData[];
    loading?: boolean;
  }>(),
  {
    loading: undefined,
  },
);

const showSkeleton = computed(() => {
  if (typeof props.loading === "boolean") {
    return props.loading;
  }

  return props.widgets.length === 0;
});
const sidebarWidgets = computed(() => props.widgets);
</script>
