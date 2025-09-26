<template>
  <aside
    class="app-card app-sidebar"
    :class="{ 'app-sidebar--sticky': sticky }"
    aria-label="Main navigation"
  >
    <HaloSearch />

    <nav>
      <ul class="flex flex-col gap-2">
        <li v-for="item in items" :key="item.key">
          <NuxtLink
            :to="item.to"
            class="sidebar-item"
            :class="{ 'sidebar-item--active': item.key === activeKey }"
            :aria-label="t(item.label)"
            :aria-current="item.key === activeKey ? 'page' : undefined"
            @click="emit('select', item.key)"
          >
            <div class="flex items-center gap-3">
              <div class="sidebar-icon">
                <v-icon :icon="item.icon" size="20" />
              </div>
              <span class="text-sm font-medium text-foreground">{{ t(item.label) }}</span>
            </div>
            <span class="sr-only">{{ t('layout.sidebar.navigate') }}</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface SidebarItem {
  key: string
  label: string
  icon: string
  to: string
}

const props = withDefaults(
  defineProps<{
    items: SidebarItem[]
    activeKey: string
    sticky?: boolean
  }>(),
  {
    sticky: true,
  },
)

const sticky = computed(() => props.sticky)

const { t } = useI18n()

const emit = defineEmits<{ (e: 'select', key: string): void }>()
</script>

<style scoped>
@reference "../../assets/css/tailwind.css";

.app-card {
  padding: 4px 16px;
}

.app-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.app-sidebar--sticky {
  position: sticky;
}

.sidebar-item {
  @apply flex items-center justify-between text-left transition;
  padding: 0.75rem 1rem;
  border-radius: calc(var(--radius) + 8px);
  @apply bg-white hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2;
  --tw-bg-opacity: 0.7;
}

.sidebar-item--active {
  @apply bg-primary shadow-[0_10px_25px_rgba(243,126,205,0.35)];
  --tw-bg-opacity: 0.1;
}

.sidebar-icon {
  @apply flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary;
  --tw-bg-opacity: 0.1;
}

.sidebar-item:hover {
  --tw-bg-opacity: 0.05;
}

.sidebar-item:focus-visible {
  --tw-ring-opacity: 0.7;
}
</style>
