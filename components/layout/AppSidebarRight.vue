<template>
  <aside
    class="app-card app-sidebar"
    :class="{ 'app-sidebar--sticky': sticky }"
    aria-label="Secondary navigation"
    data-test="app-sidebar-right"
  >
    <slot />
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface SidebarItem {
  key: string;
  label: string;
  icon?: string;
  to?: string;
  children?: SidebarItem[];
}

const props = withDefaults(
  defineProps<{
    items: SidebarItem[];
    activeKey: string;
    sticky?: boolean;
    isDark?: boolean;
    eager?: boolean;
  }>(),
  {
    sticky: true,
    eager: false,
    isDark: false,
  },
);

const sticky = computed(() => props.sticky);
</script>

<style scoped>
@reference "../../assets/css/tailwind.css";

.app-card {
  padding: 1.5rem 0.25rem;
}

.app-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.app-sidebar--sticky {
  position: sticky;
  top: calc(var(--layout-inset-top, var(--app-bar-height, 50px)) + clamp(16px, 3vw, 32px));
  align-self: flex-start;
}
</style>
