<script setup lang="ts">
/**
 * Props
 * - items: tableau de stories { id, image, name, avatar, state, duration }
 * - showCreate: ajoute une carte "create" en tête
 */
type Story = {
  id?: string | number
  image?: string
  name?: string
  avatar?: string
  state?: 'create' | 'new' | 'seen'
  duration?: string
}

const props = withDefaults(defineProps<{
  items: Story[]
  showCreate?: boolean
}>(), {
  items: () => [],
  showCreate: true
})

const scroller = ref<HTMLElement | null>(null)

function scrollBy(delta = 280) {
  if (!scroller.value) return
  scroller.value.scrollBy({ left: delta, behavior: 'smooth' })
}

const hasOverflow = computed(() => {
  const el = scroller.value
  return el ? el.scrollWidth > el.clientWidth + 8 : false
})

const emit = defineEmits<{
  (e: 'open', story: Story): void
  (e: 'create'): void
}>()
</script>

<template>
  <div class="relative">
    <div
        ref="scroller"
        class="stories-scroll"
        role="listbox"
        aria-label="Stories"
    >
      <StoryCard
          v-if="showCreate"
          state="create"
          image=""
          name=""
          avatar=""
          @create="$emit('create')"
      />

      <StoryCard
          v-for="s in items"
          :key="s.id ?? s.name"
          :image="s.image"
          :name="s.name"
          :avatar="s.avatar"
          :state="s.state ?? 'new'"
          :duration="s.duration"
          @click="$emit('open', s)"
      />
    </div>

    <!-- Flèches -->
    <v-btn
        v-if="hasOverflow"
        class="nav-btn left"
        icon
        size="large"
        variant="elevated"
        @click="scrollBy(-320)"
        aria-label="Scroll stories left"
    >
      <v-icon>mdi-chevron-left</v-icon>
    </v-btn>

    <v-btn
        v-if="hasOverflow"
        class="nav-btn right"
        icon
        size="large"
        variant="elevated"
        @click="scrollBy(320)"
        aria-label="Scroll stories right"
    >
      <v-icon>mdi-chevron-right</v-icon>
    </v-btn>
  </div>
</template>

<style scoped>
.stories-scroll{
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  gap: 12px;
  overflow-x: auto;
  padding: 8px 4px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}
.stories-scroll > * { scroll-snap-align: start; }
.nav-btn{
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  backdrop-filter: blur(6px);
}
.nav-btn.left{ left: -6px; }
.nav-btn.right{ right: -6px; }
</style>
