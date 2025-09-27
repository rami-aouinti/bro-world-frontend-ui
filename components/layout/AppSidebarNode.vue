<template>
  <li :class="['sidebar-group', { 'sidebar-group--nested': level > 0 }]">
    <component
      :is="linkTag"
      v-bind="linkAttrs"
      :class="linkClasses"
      :aria-label="ariaLabel"
      :aria-current="ariaCurrent"
      @click="handleClick"
    >
      <div class="flex items-center gap-3">
        <Icon
          v-if="item.icon"
          :class="iconClass"
          :name="resolveIconName(item.icon)"
          :size="iconSize"
        />
        <span :class="labelClass">{{ itemLabel }}</span>
      </div>
      <button
        v-if="hasChildren"
        type="button"
        class="sidebar-toggle"
        :aria-controls="`sidebar-group-${item.key}`"
        :aria-expanded="isExpanded"
        @click.stop="handleToggle"
      >
        <Icon
          class="sidebar-toggle-icon"
          name="mdi:chevron-down"
          :class="{ 'sidebar-toggle-icon--open': isExpanded }"
        />
        <span class="sr-only">{{ navigateLabel }}</span>
      </button>
      <span v-else-if="item.to" class="sr-only">{{ navigateLabel }}</span>
    </component>

    <ul
      v-if="hasChildren"
      :id="`sidebar-group-${item.key}`"
      class="sidebar-sublist"
      :style="indentStyle"
      v-show="isExpanded"
    >
      <AppSidebarNode
        v-for="child in item.children"
        :key="child.key"
        :item="child"
        :level="level + 1"
        :active-key="activeKey"
        :toggle-group="toggleGroup"
        :expand-group="expandGroup"
        :is-group-expanded="isGroupExpanded"
        :is-item-active="isItemActive"
        :on-select="onSelect"
        :resolve-icon-name="resolveIconName"
      />
    </ul>
  </li>
</template>

<script setup lang="ts">
defineOptions({ name: 'AppSidebarNode' })

import { computed } from 'vue'

import type { SidebarItem } from '@/types/sidebar'

const props = defineProps<{
  item: SidebarItem
  level: number
  activeKey: string
  toggleGroup: (key: string) => void
  expandGroup: (key: string) => void
  isGroupExpanded: (key: string) => boolean
  isItemActive: (item: SidebarItem, key: string) => boolean
  onSelect: (item: SidebarItem) => void
  resolveIconName: (name?: string) => string
}>()

const { t } = useI18n()

const hasChildren = computed(() => Boolean(props.item.children?.length))
const isExpanded = computed(() => hasChildren.value && props.isGroupExpanded(props.item.key))
const isActive = computed(() => props.isItemActive(props.item, props.activeKey))
const navigateLabel = computed(() => t('layout.sidebar.navigate'))
const itemLabel = computed(() => t(props.item.label))
const linkTag = computed(() => (props.item.to ? 'NuxtLink' : 'button'))
const linkAttrs = computed(() => (props.item.to ? { to: props.item.to } : { type: 'button' }))
const ariaLabel = computed(() => itemLabel.value)
const ariaCurrent = computed(() => (isActive.value ? 'page' : undefined))
const iconSize = computed(() => (props.level === 0 ? 20 : 18))
const iconClass = computed(() => (props.level === 0 ? 'sidebar-icon' : 'sidebar-subicon'))
const labelClass = computed(() => {
  if (props.level === 0)
    return 'text-sm font-medium text-foreground'

  if (hasChildren.value)
    return 'text-sm font-medium text-foreground'

  return 'text-sm text-muted-foreground'
})
const linkClasses = computed(() => {
  const baseClass = props.level === 0 ? 'sidebar-item' : 'sidebar-subitem'
  const activeClass = props.level === 0 ? 'sidebar-item--active' : 'sidebar-subitem--active'

  return [baseClass, { [activeClass]: isActive.value }]
})
const indentStyle = computed(() => ({
  '--sidebar-indent': `${3.25 + Math.max(props.level, 0) * 1.25}rem`,
}))

function handleClick() {
  if (hasChildren.value) {
    if (props.item.to)
      props.expandGroup(props.item.key)
    else
      props.toggleGroup(props.item.key)
  }

  props.onSelect(props.item)
}

function handleToggle() {
  props.toggleGroup(props.item.key)
}
</script>
