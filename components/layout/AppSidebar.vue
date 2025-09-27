<template>
  <aside
    class="app-card app-sidebar"
    :class="{ 'app-sidebar--sticky': sticky }"
    aria-label="Main navigation"
  >
    <nav>
      <ul class="flex flex-col gap-3">
        <li v-for="item in items" :key="item.key" class="sidebar-group">
          <component
            :is="item.to ? NuxtLink : 'button'"
            v-bind="item.to ? { to: item.to } : { type: 'button' }"
            class="sidebar-item"
            :class="{ 'sidebar-item--active': isItemActive(item, activeKey) }"
            :aria-label="item.to ? t(item.label) : undefined"
            :aria-current="isItemActive(item, activeKey) ? 'page' : undefined"
            @click="emit('select', item.key)"
          >
            <div class="flex items-center gap-3">
              <Icon
                v-if="item.icon"
                class="sidebar-icon"
                :name="resolveIconName(item.icon)"
                :size="20"
              />
              <span class="text-sm font-medium text-foreground">{{ t(item.label) }}</span>
            </div>
            <span v-if="item.to" class="sr-only">{{ t('layout.sidebar.navigate') }}</span>
          </component>

          <ul v-if="item.children?.length" class="sidebar-sublist">
            <li v-for="child in item.children" :key="child.key">
              <NuxtLink
                :to="child.to"
                class="sidebar-subitem"
                :class="{ 'sidebar-subitem--active': child.key === activeKey }"
                :aria-label="t(child.label)"
                :aria-current="child.key === activeKey ? 'page' : undefined"
                @click="emit('select', child.key)"
              >
                <Icon
                  v-if="child.icon"
                  class="sidebar-subicon"
                  :name="resolveIconName(child.icon)"
                  :size="18"
                />
                <span class="text-sm text-muted-foreground">{{ t(child.label) }}</span>
              </NuxtLink>
            </li>
          </ul>
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
  icon?: string
  to?: string
  children?: SidebarItem[]
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

function isItemActive(item: SidebarItem, key: string): boolean {
  if (item.key === key)
    return true

  if (item.children)
    return item.children.some(child => isItemActive(child, key))

  return false
}
function resolveIconName(name?: string) {
  if (!name)
    return ''

  if (name.includes(':'))
    return name

  if (name.startsWith('mdi-'))
    return `mdi:${name.slice(4)}`

  return name
}
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

.sidebar-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sidebar-item {
  @apply flex items-center justify-between text-left transition;
  padding: 0.75rem 1rem;
  border-radius: calc(var(--radius) + 8px);
  @apply hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2;
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

.sidebar-sublist {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-left: 3.25rem;
}

.sidebar-subitem {
  @apply flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition;
  color: var(--v-theme-on-surface-variant);
}

.sidebar-subitem:hover,
.sidebar-subitem:focus-visible {
  @apply bg-primary/10 text-foreground;
}

.sidebar-subitem:focus-visible {
  @apply outline-none ring-2 ring-primary ring-offset-2;
  --tw-ring-opacity: 0.7;
}

.sidebar-subitem--active {
  @apply bg-primary/15 text-foreground;
}

.sidebar-subicon {
  @apply text-muted-foreground;
}
</style>
