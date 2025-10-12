<template>
  <div class="stories">
    <!-- Viewport centré qui CLIPPE et SCROLLE -->
    <div
      ref="viewport"
      class="stories-viewport"
      role="listbox"
      :aria-label="t('stories.strip.ariaLabel')"
    >
      <!-- Rail au format shrink-to-fit -->
      <div
        ref="scroller"
        class="stories-scroll"
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
          v-for="(s, index) in items"
          :key="s.id ?? s.name ?? index"
          :image="s.image"
          :name="s.name"
          :avatar="s.avatar"
          :state="s.state ?? 'new'"
          :duration="s.duration"
          @click="$emit('open', s)"
        />
      </div>
    </div>

    <!-- Flèches -->
    <v-btn
      v-if="hasOverflow"
      class="nav-btn left"
      icon
      size="large"
      variant="text"
      :aria-label="t('stories.strip.scrollLeft')"
      @click="scrollBy(-320)"
    >
      <Icon name="mdi-chevron-left" />
    </v-btn>

    <v-btn
      v-if="hasOverflow"
      class="nav-btn right"
      icon
      size="large"
      variant="text"
      :aria-label="t('stories.strip.scrollRight')"
      @click="scrollBy(320)"
    >
      <Icon name="mdi-chevron-right" />
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import type { Story } from "~/types/stories";

const props = withDefaults(defineProps<{ items?: Story[]; showCreate?: boolean }>(), {
  items: () => [],
  showCreate: true,
});

defineEmits<{ (e: "open", story: Story): void; (e: "create"): void }>();

const { t } = useI18n();

const viewport = ref<HTMLElement | null>(null); // -> conteneur qui SCROLLE
const scroller = ref<HTMLElement | null>(null); // -> rail largeur = contenu

function scrollBy(delta = 280) {
  viewport.value?.scrollBy({ left: delta, behavior: "smooth" });
}

const hasOverflow = computed(() => {
  const v = viewport.value;
  const s = scroller.value;
  return v && s ? s.scrollWidth > v.clientWidth + 1 : false;
});
</script>

<style scoped>
/* Conteneur global pour positionner les flèches */
.stories {
  position: relative;
}

/* Viewport centré, largeur limitée, et *c'est lui qui scrolle* */
.stories-viewport {
  max-inline-size: clamp(360px, 80vw, 572px);
  inline-size: 100%;
  margin-inline: auto;
  overflow-x: auto; /* SCROLL ICI */
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory; /* SNAP sur le conteneur qui scrolle */
  scroll-padding-inline: 2px;
  position: relative;
  scrollbar-width: none;
}
.stories-viewport::-webkit-scrollbar {
  display: none;
}

/* Rail : ne s'étire pas, largeur = somme des cartes */
.stories-scroll {
  display: inline-flex; /* shrink-to-fit */
  width: max-content; /* largeur = contenu */
  gap: 12px;
  padding: 4px 2px;
}
.stories-scroll > * {
  flex: 0 0 auto;
  scroll-snap-align: start;
}

/* Flèches */
.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  backdrop-filter: blur(6px);
  z-index: 2;
}
.nav-btn.left {
  left: 0;
  translate: -10px 0;
}
.nav-btn.right {
  right: 0;
  translate: 10px 0;
}

/* (Optionnel) fondu sur les bords */
.stories-viewport::before,
.stories-viewport::after {
  content: "";
  position: absolute;
  inset-block: 0;
  inline-size: 24px;
  pointer-events: none;
}
.stories-viewport::before {
  inset-inline-start: 0;
  background: transparent;
}
.stories-viewport::after {
  inset-inline-end: 0;
  background: transparent;
}
</style>
