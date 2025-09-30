<!-- components/CommentSortMenu.vue -->
<script setup lang="ts">
import { computed } from 'vue'

export type SortKey = 'relevant' | 'newest' | 'all'

const props = defineProps<{
  modelValue: SortKey
}>()

const emit = defineEmits<{ (e: 'update:modelValue', v: SortKey): void }>()

const currentLabel = computed(() =>
    ({ relevant: 'Relevanteste', newest: 'Neueste zuerst', all: 'Alle Kommentare' } as const)[props.modelValue]
)

const OPTIONS: { key: SortKey; title: string; subtitle: string }[] = [
  {
    key: 'relevant',
    title: 'Relevanteste',
    subtitle: 'Kommentare von Freunden sowie Kommentare mit den meisten Interaktionen zuerst anzeigen.'
  },
  {
    key: 'newest',
    title: 'Neueste zuerst',
    subtitle: 'Alle Kommentare anzeigen, die neuesten zuerst.'
  },
  {
    key: 'all',
    title: 'Alle Kommentare',
    subtitle: 'Alle Kommentare anzeigen, auch potenziellen Spam.'
  }
]

function pick(v: SortKey) {
  emit('update:modelValue', v)
}
</script>

<template>
  <v-menu
      offset="10"
      :close-on-content-click="true"
      content-class="cs-menu"
  >
    <template #activator="{ props: a }">
      <button class="cs-activator" v-bind="a" aria-haspopup="menu" :aria-expanded="undefined">
        {{ currentLabel }}
        <Icon name="mdi-chevron-down" size="16" class="ml-1" />
      </button>
    </template>

    <div class="cs-bubble" role="menu" aria-label="Kommentar-Sortierung">
      <div
          v-for="opt in OPTIONS"
          :key="opt.key"
          class="cs-item"
          :class="{ active: opt.key === modelValue }"
          role="menuitemradio"
          :aria-checked="opt.key === modelValue"
          @click="pick(opt.key)"
      >
        <div class="cs-title">{{ opt.title }}</div>
        <div class="cs-sub">{{ opt.subtitle }}</div>
      </div>
    </div>
  </v-menu>
</template>

<style scoped>
.cs-activator{
  background: transparent;
  border: 0;
  cursor: pointer;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.92);
  display: inline-flex;
  align-items: center;
}

/* Le conteneur téléporté du menu (sinon fond transparent) */
:global(.v-overlay__content.cs-menu){
  background: rgb(var(--v-theme-surface));       /* <-- fix important */
  border-radius: 18px;
  box-shadow: 0 10px 28px rgba(0,0,0,.22), 0 2px 8px rgba(0,0,0,.10);
  padding: 0;
  overflow: visible;
  border: 1px solid rgba(0,0,0,.06);
}

/* Bulle interne (utile si tu veux padding séparé) */
.cs-bubble{
  background: transparent; /* le fond est porté par .v-overlay__content.cs-menu */
  border-radius: 18px;
  padding: 10px 0;
  min-width: 360px;
}

.cs-item{
  padding: 12px 18px;
  cursor: pointer;
}
.cs-item:hover{
  background: rgba(var(--v-theme-on-surface), .05);
}
.cs-item.active .cs-title{
  color: rgb(var(--v-theme-primary));
}
.cs-title{ font-weight: 800; }
.cs-sub{
  font-size: .92rem;
  color: rgba(var(--v-theme-on-surface), .7);
  margin-top: 2px;
}

/* Flèche en haut à droite */
.cs-arrow{
  position: absolute;
  left: 18px;
  top: -9px;
  width: 18px;
  height: 18px;
  rotate: 45deg;
  background: rgb(var(--v-theme-surface));
  box-shadow: -2px -2px 4px rgba(0,0,0,.04);
  border-top-left-radius: 6px;
  border: 1px solid rgba(0,0,0,.06);
  border-bottom: 0;
  border-right: 0;
}
</style>
