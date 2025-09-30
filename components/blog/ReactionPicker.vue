<script setup lang="ts">
import { ref } from 'vue'

export type Reaction = 'like'|'love'|'care'|'haha'|'wow'|'sad'|'angry'
const emit = defineEmits<{ (e:'select', r:Reaction):void; (e:'like'):void }>()
const props = withDefaults(defineProps<{
  btnSize?: 'sm'|'md'|'lg'|'xl'
}>(), { btnSize: 'md' })
const open = ref(false)
let longPressTimer: number | null = null

function onPointerDown(){
  longPressTimer = window.setTimeout(() => (open.value = true), 350)
}
function onPointerUp(){
  if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null }
}
const items: { key: Reaction; src: string; label: string }[] = [
  { key:'like',  src:'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f44d.png', label:'Like' },
  { key:'love',  src:'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2764.png',   label:'Love' }, // <- fix
  { key:'care',  src:'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f970.png', label:'Care' }, // ou 1f917 (hugging face)
  { key:'haha',  src:'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f606.png', label:'Haha' },
  { key:'wow',   src:'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f62e.png', label:'Wow' },
  { key:'sad',   src:'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f622.png', label:'Sad' },
  { key:'angry', src:'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f620.png', label:'Angry' },
]
</script>

<template>
  <v-menu
      v-model="open"
      open-on-hover
      close-on-content-click
      location="top"
      offset="8"
      :scrim="false"
      :eager="true"
      content-class="rx-menu-content rx-rounded"
  >
    <template #activator="{ props }">
      <button
          class="meta__btn"
          :class="`meta__btn--${props.btnSize}`"
          v-bind="props"
          @click.stop="() => { if (!open) emit('like') }"
          @pointerdown.passive="onPointerDown"
          @pointerup.passive="onPointerUp"
      >
        <Icon name="mdi-thumb-up-outline" start></Icon>
        Gefällt mir
      </button>
    </template>

    <div class="rx-bubble" role="listbox" aria-label="Reaktionen">
      <button
          v-for="it in items"
          :key="it.key"
          class="rx-item"
          :aria-label="it.label"
          role="option"
          @click.stop="emit('select', it.key)"
      >
        <img :src="it.src" :alt="it.label" />
      </button>
    </div>
  </v-menu>
</template>

<style scoped>
.meta__btn{
  background:none;border:0;padding:0;cursor:pointer;
  color:rgba(var(--v-theme-on-surface),0.85);font-weight:600
}
/* global/scoped */
.like-size-sm :deep(.meta__btn) { font-size: .80rem; padding: 2px 4px; }
.like-size-md :deep(.meta__btn) { font-size: .95rem; padding: 4px 6px; } /* défaut */
.like-size-lg :deep(.meta__btn) { font-size: 1.15rem; padding: 6px 8px; }
.like-size-xl :deep(.meta__btn) { font-size: 1.35rem; padding: 8px 10px; }

/* pour garder une bonne zone cliquable */
:deep(.meta__btn){ line-height: 1; min-height: 36px; }
/* Popover */
:global(.rx-menu-content){border-radius:9999px;box-shadow:0 8px 24px rgba(0,0,0,.18),0 2px 6px rgba(0,0,0,.08);padding:8px 10px}
.rx-bubble{display:flex;gap:8px}
.rx-item{
  width:44px;height:44px;border-radius:9999px;border:0;background:transparent;
  display:grid;place-items:center;cursor:pointer;transition:transform .12s ease
}
.rx-item img{width:38px;height:38px}
.rx-item:hover{transform:translateY(-4px) scale(1.05)}
</style>
