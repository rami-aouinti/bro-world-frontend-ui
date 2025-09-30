<!-- components/ReactionBar.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import ReactionPicker from "~/components/blog/ReactionPicker.vue";
import {useAuthSession} from "~/stores/auth-session";

type Reaction = 'like' | 'sad' | 'angry'
const auth = useAuthSession()
const isAuthenticated = computed(() => auth.isAuthenticated.value)
const props = defineProps<{
  counts: Record<Reaction, number>
  reacts?: number
  comments?: number
  shares?: number
  liked?: boolean
  node?: any
}>()

const emit = defineEmits<{
  (e: 'toggle-like', value: boolean): void
  (e: 'comment'): void
}>()

const isLiked = ref(!!props.liked)


// Choisit les 3 réactions les plus fréquentes (ordre “Facebook-ish”)
const bubbleOrder: Reaction[] = ['like', 'sad', 'angry']
const topReactions = computed(() =>
    bubbleOrder
        .map(type => ({ type, count: props.counts?.[type] ?? 0 }))
        .filter(r => r.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
)

function onToggleLike() {
  isLiked.value = !isLiked.value
  emit('toggle-like', isLiked.value)
}

const likeBtnRef = ref<HTMLElement | null>(null)
const pickerOpen = ref(false)
const anchor = ref<{x:number;y:number;width:number;height:number} | null>(null)
let openTimer: number | null = null
let longPressTimer: number | null = null

function calcAnchor(){
  const el = likeBtnRef.value
  if(!el) return null
  const r = el.getBoundingClientRect()
  return { x:r.left + window.scrollX, y:r.top + window.scrollY, width:r.width, height:r.height }
}

function onMouseEnter(){
  if (pickerOpen.value) return
  openTimer && clearTimeout(openTimer)
  openTimer = window.setTimeout(() => {
    anchor.value = calcAnchor()
    pickerOpen.value = true
  }, 250) // petit délai comme Facebook
}
function onMouseLeave(){
  openTimer && clearTimeout(openTimer)
  // la fermeture se fait dans le picker (click dehors) + petit délai pour permettre d'atteindre le popover
  window.setTimeout(() => {
    // si la souris n'est pas au-dessus du picker, il se fermera via doc listener
  }, 150)
}

// Mobile : appui long
function onPointerDown(){
  longPressTimer = window.setTimeout(() => {
    anchor.value = calcAnchor()
    pickerOpen.value = true
  }, 350)
}
function onPointerUp(){
  if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null }
}

function handleSelect(r: Reaction){
  pickerOpen.value = false
  // TODO: applique la réaction choisie côté métier
  // ex: emit('react', { type: r })
}
</script>

<template>
  <div class="reaction-bar">
    <!-- Gauche : bulles de réactions + total -->
    <div class="left">
      <div class="bubbles" aria-label="Reaktionen">
        <v-avatar
            v-for="(r, i) in topReactions"
            :key="r.type"
            size="22"
            class="bubble"
            :style="{ left: `${i * 14}px`, zIndex: 10 - i }"
            variant="flat"
        >
          <!-- remplace par tes propres images si tu en as -->
          <v-img :src="{
              like:  'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f44d.png',
              sad:   'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f62d.png',
              angry: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f620.png'
            }[r.type]"
                 alt="" cover
          />
        </v-avatar>
      </div>

      <span class="total" v-if="reacts > 0">{{ reacts }}</span>
    </div>

    <div class="right">
      <Icon name="mdi-chat-outline" size="18"></Icon>
      <span v-if="(comments ?? 0) > 0" class="ml-1">{{ comments }}</span>
      <Icon class="ml-2" name="mdi-share-outline" size="18"></Icon>
      <span  v-if="(shares ?? 0) > 0" class="ml-1">{{ shares }}</span>
    </div>
  </div>
  <div v-if="isAuthenticated" class="reaction-bar">
    <!-- Actions -->
    <div class="actions">
      <ReactionPicker
          class="like-size-lg"
          @like="emit('like', node.id)"
          @select="r => emit('react', { id: node.id, type: r })"

      />
      <v-btn
          variant="text"
          density="comfortable"
          class="action-btn"
          @click="$emit('comment')"
      >
        <Icon name="mdi-chat-outline" start></Icon>
        Kommentieren
      </v-btn>
      <v-btn
          variant="text"
          @click="$emit('share')"
      >
        <Icon name="mdi-share-outline" start></Icon>
        Teilen
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
.reaction-bar{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  padding:4px 3px;
}

.left{
  display:flex;
  align-items:center;
  min-width:80px;
}
.bubbles{
  position:relative;
  height:22px;
  width:60px; /* s’adapte à 3 bulles chevauchées */
}
.bubble{
  position:absolute;
  top:0;
  border:2px solid var(--v-theme-surface); /* anneau blanc */
  border-radius:9999px;
  overflow:hidden;
  box-shadow:0 0 0 1px rgba(0,0,0,.04);
}
.total{
  font-weight:600;
  font-size:.95rem;
}

.actions{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:4px;
  flex:1;
}
.action-btn{
  text-transform:none;
  font-weight:600;
}

.right{
  display:flex;
  align-items:center;
  gap:4px;
  min-width:40px;
  justify-content:flex-end;
  color:rgba(var(--v-theme-on-surface), 0.7);
}
.comment-actions{ position:relative; display:flex; gap:10px; align-items:center; }

.meta__btn{
  background:none; border:0; padding:0; cursor:pointer;
  color:rgba(var(--v-theme-on-surface),0.85); font-size:.85rem; font-weight:600;
}
</style>
