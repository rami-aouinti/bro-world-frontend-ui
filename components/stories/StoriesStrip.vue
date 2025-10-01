<template>
  <div class="relative">
    <div
      ref="scroller"
      class="stories-scroll"
      role="listbox"
      :aria-label="t('stories.strip.ariaLabel')"
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
      :aria-label="t('stories.strip.scrollLeft')"
      @click="scrollBy(-320)"
    >
      <Icon name="mdi-chevron-left"></Icon>
    </v-btn>

    <v-btn
      v-if="hasOverflow"
      class="nav-btn right"
      icon
      size="large"
      variant="elevated"
      :aria-label="t('stories.strip.scrollRight')"
      @click="scrollBy(320)"
    >
      <Icon name="mdi-chevron-right"></Icon>
    </v-btn>
  </div>
</template>

<script setup lang="ts">
/**
 * Props
 * - items: tableau de stories { id, image, name, avatar, state, duration }
 * - showCreate: ajoute une carte "create" en tête
 */
type Story = {
  id?: string | number;
  image?: string;
  name?: string;
  avatar?: string;
  state?: "create" | "new" | "seen";
  duration?: string;
};

withDefaults(
  defineProps<{
    items?: Story[];
    showCreate?: boolean;
  }>(),
  {
    items: () => [],
    showCreate: true,
  },
);

const scroller = ref<HTMLElement | null>(null);
const { t } = useI18n();

function scrollBy(delta = 280) {
  if (!scroller.value) return;
  scroller.value.scrollBy({ left: delta, behavior: "smooth" });
}

const hasOverflow = computed(() => {
  const el = scroller.value;
  return el ? el.scrollWidth > el.clientWidth + 8 : false;
});

const emit = defineEmits<{
  (e: "open", story: Story): void;
  (e: "create"): void;
}>();
</script>

<style scoped>
.stories-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 4px 2px;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: 2px;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
}
.stories-scroll > * {
  flex: 0 0 auto;
  scroll-snap-align: start;
}
.stories-scroll::-webkit-scrollbar {
  display: none;
}
.stories-scroll {
  scrollbar-width: none;
}
.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  backdrop-filter: blur(6px);
}
.nav-btn.left {
  left: -6px;
}
.nav-btn.right {
  right: -6px;
}
</style>
