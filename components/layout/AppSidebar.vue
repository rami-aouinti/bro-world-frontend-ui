<template>
  <aside class="app-card app-sidebar" role="navigation" aria-label="Main navigation">
    <header class="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary">
      <v-icon icon="mdi-link-variant" size="20" />
      <span>{{ t('layout.sidebar.title') }}</span>
    </header>
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
interface SidebarItem {
  key: string
  label: string
  icon: string
  to: string
}

const props = defineProps<{
  items: SidebarItem[]
  activeKey: string
}>()

const { t } = useI18n()

const emit = defineEmits<{ (e: 'select', key: string): void }>()
</script>

<style scoped>
.app-card {
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: var(--pink-shadow);
  padding: 24px 20px;
  border: 1px solid rgba(15, 23, 42, 0.06);
}

.app-sidebar {
  position: sticky;
  top: calc(var(--app-bar-height) + 24px);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar-item {
  @apply flex items-center justify-between px-4 py-3 text-left transition;
  border-radius: calc(var(--radius) + 8px);
  @apply bg-white/70 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2;
}

.sidebar-item--active {
  @apply bg-primary/10 shadow-[0_10px_25px_rgba(243,126,205,0.35)];
}

.sidebar-icon {
  @apply flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary;
}
</style>
