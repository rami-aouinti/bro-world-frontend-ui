<template>
  <aside
    class="app-card app-sidebar"
    :class="{ 'app-sidebar--sticky': sticky }"
    aria-label="Main navigation"
  >
    <nav>
      <ul class="flex flex-col gap-3">
        <AppSidebarNode
          v-for="item in items"
          :key="item.key"
          :item="item"
          :level="0"
          :active-key="activeKey"
          :toggle-group="toggleGroup"
          :expand-group="expandGroup"
          :is-group-expanded="isGroupExpanded"
          :is-item-active="isItemActive"
          :on-select="handleItemSelect"
          :resolve-icon-name="resolveIconName"
        />
      </ul>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import AppSidebarNode from '@/components/layout/AppSidebarNode.vue'
import type { SidebarItem } from '@/types/sidebar'

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

const emit = defineEmits<{ (e: 'select', key: string): void }>()

const expandedGroups = ref(new Set<string>())

watch(
  () => props.activeKey,
  (key) => {
    if (!key)
      return

    const path = findPath(props.items, key)
    if (!path)
      return

    const next = new Set(expandedGroups.value)
    let updated = false

    for (let index = 0; index < path.length - 1; index += 1) {
      const groupKey = path[index]
      if (!next.has(groupKey)) {
        next.add(groupKey)
        updated = true
      }
    }

    const activeItem = findItemByKey(props.items, key)
    if (activeItem?.children?.length && !next.has(activeItem.key)) {
      next.add(activeItem.key)
      updated = true
    }

    if (updated)
      expandedGroups.value = next
  },
  { immediate: true },
)

watch(
  () => props.items,
  (items) => {
    const allowed = new Set<string>()
    collectKeys(items, allowed)

    const filtered = new Set<string>()
    let changed = false

    for (const key of expandedGroups.value) {
      if (allowed.has(key)) {
        filtered.add(key)
      } else {
        changed = true
      }
    }

    if (changed)
      expandedGroups.value = filtered
  },
  { deep: true },
)

function isItemActive(item: SidebarItem, key: string): boolean {
  if (item.key === key)
    return true

  if (item.children)
    return item.children.some(child => isItemActive(child, key))

  return false
}

function findItemByKey(items: SidebarItem[], key: string): SidebarItem | undefined {
  for (const item of items) {
    if (item.key === key)
      return item

    if (item.children?.length) {
      const child = findItemByKey(item.children, key)
      if (child)
        return child
    }
  }

  return undefined
}

function collectKeys(items: SidebarItem[], target: Set<string>) {
  for (const item of items) {
    target.add(item.key)
    if (item.children?.length)
      collectKeys(item.children, target)
  }
}

function findPath(items: SidebarItem[], key: string, path: string[] = []) {
  for (const item of items) {
    const currentPath = [...path, item.key]

    if (item.key === key)
      return currentPath

    if (item.children?.length) {
      const childPath = findPath(item.children, key, currentPath)
      if (childPath)
        return childPath
    }
  }

  return null
}

function toggleGroup(key: string) {
  const next = new Set(expandedGroups.value)

  if (next.has(key)) {
    next.delete(key)

    const item = findItemByKey(props.items, key)
    if (item?.children?.length) {
      const descendants = new Set<string>()
      collectKeys(item.children, descendants)

      for (const childKey of descendants)
        next.delete(childKey)
    }
  } else {
    next.add(key)
  }

  expandedGroups.value = next
}

function expandGroup(key: string) {
  if (expandedGroups.value.has(key))
    return

  const next = new Set(expandedGroups.value)
  next.add(key)
  expandedGroups.value = next
}

function isGroupExpanded(key: string) {
  return expandedGroups.value.has(key)
}

function handleItemSelect(item: SidebarItem) {
  emit('select', item.key)
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

.sidebar-group:focus-within .sidebar-item {
  @apply ring-2 ring-primary ring-offset-2;
  --tw-ring-opacity: 0.7;
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

.sidebar-toggle {
  @apply ml-3 inline-flex h-8 w-8 items-center justify-center rounded-full transition;
  @apply hover:bg-muted focus-visible:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2;
  --tw-ring-opacity: 0.7;
}

.sidebar-toggle-icon {
  @apply text-muted-foreground transition-transform;
}

.sidebar-toggle-icon--open {
  transform: rotate(180deg);
}

.sidebar-sublist {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-left: var(--sidebar-indent, 3.25rem);
}

.sidebar-subitem {
  @apply flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition;
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
