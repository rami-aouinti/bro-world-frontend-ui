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
        class="sticky top-24 flex flex-col gap-6 rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-xl"
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
          <SidebarWidget
            v-for="widget in widgets"
            :key="widget.id"
            :widget="widget"
          />
        </div>
      </div>
    </UiScrollArea>
  </aside>
</template>

<script setup lang="ts">
import SidebarWidget, { type SidebarWidgetData } from "./SidebarWidget.vue";
import Aside from "~/components/layout/Aside.vue";

const { page } = useContent();
const config = useDocsConfig();

defineProps<{
  title: string;
  subtitle: string;
  widgets: SidebarWidgetData[];
}>();
</script>
