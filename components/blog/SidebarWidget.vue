<template>
  <div
    class="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors duration-300 hover:border-primary/50 hover:bg-primary/10"
  >
    <div class="flex items-start gap-4">
      <div
        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-2xl"
      >
        <span aria-hidden="true">{{ widget.icon }}</span>
      </div>
      <div class="flex flex-1 flex-col gap-3">
        <div>
          <p class="text-sm font-semibold text-slate-100">
            {{ widget.title }}
          </p>
          <p class="text-sm text-slate-400">
            {{ widget.description }}
          </p>
        </div>
        <NuxtLink
          v-if="widget.action"
          :href="widget.action.href"
          class="inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:text-primary/80"
          :target="widget.action.external ? '_blank' : undefined"
          :rel="widget.action.external ? 'noopener noreferrer' : undefined"
        >
          <span>{{ widget.action.label }}</span>
          <span aria-hidden="true">→</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface SidebarWidgetAction {
  label: string;
  href: string;
  external?: boolean;
}

export interface SidebarWidgetData {
  id: string;
  icon: string;
  title: string;
  description: string;
  action?: SidebarWidgetAction;
}

defineProps<{ widget: SidebarWidgetData }>();
</script>
