<template>
  <v-sheet
    class="story-card relative overflow-hidden rounded-xl"
    :width="width"
    :height="height"
    elevation="4"
    rounded="xl"
    role="button"
    :aria-label="cardAriaLabel"
    @click="isCreate ? emit('create') : emit('click')"
  >
    <!-- Image de fond -->
    <v-img
      v-if="image"
      :src="image"
      cover
      :alt="name || t('stories.card.imageAlt')"
      class="h-100 w-100"
      :width="width"
      :height="height"
    />

    <!-- Overlay gradient -->
    <div
      class="absolute inset-0 pointer-events-none"
      style="background: linear-gradient(180deg, rgba(0, 0, 0, 0) 30%, rgba(0, 0, 0, 0.65) 100%)"
    ></div>

    <!-- Avatar / bouton create -->
    <div class="absolute top-2 left-2 z-10">
      <div
        v-if="!isCreate"
        class="relative"
      >
        <v-avatar
          size="36"
          class="bg-white"
          :style="ringStyle"
        >
          <v-img
            :src="avatar"
            :alt="name || t('stories.card.avatarAlt')"
            cover
            width="36"
            height="36"
          />
        </v-avatar>
      </div>
      <div
        v-else
        class="relative"
      >
        <v-avatar
          style="height: 230px; width: 120px"
          class="bg-white/90 backdrop-blur-sm"
        >
          <v-btn
            icon
            color="primary"
            size="large"
            variant="text"
            :aria-label="createLabel"
          >
            <Icon name="mdi-plus"></Icon>
          </v-btn>
        </v-avatar>
      </div>
    </div>

    <!-- Durée (optionnel) -->
    <div
      v-if="duration"
      class="absolute bottom-14 right-2 z-10"
    >
      <v-chip
        size="x-small"
        variant="elevated"
        class="bg-black/60 text-white"
        >{{ duration }}</v-chip
      >
    </div>

    <!-- Nom / label create -->
    <div class="absolute bottom-2 left-2 right-2 z-10">
      <div class="text-white font-weight-bold text-subtitle-2 line-clamp-2">
        <template v-if="isCreate">{{ createLabel }}</template>
        <template v-else>{{ name }}</template>
      </div>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
/**
 * Props
 * - image: cover de la story
 * - name: nom affiché en bas
 * - avatar: mini photo en haut
 * - state: "create" | "new" | "seen"
 *   - create => carte "Story erstellen" (avec +)
 *   - new    => anneau bleu autour de l'avatar
 *   - seen   => anneau gris
 * - duration: texte optionnel (ex: "0:22")
 */
const props = withDefaults(
  defineProps<{
    image?: string;
    name?: string;
    avatar?: string;
    state?: "create" | "new" | "seen";
    duration?: string;
    width?: number | string;
    height?: number | string;
    ringColor?: string; // couleur anneau "new"
  }>(),
  {
    state: "new",
    width: 144,
    height: 240,
    ringColor: "#1b74e4", // bleu FB
  },
);

const emit = defineEmits<{
  (e: "click"): void;
  (e: "create"): void;
}>();

const { t } = useI18n();

const isCreate = computed(() => props.state === "create");
const ringStyle = computed(() => {
  if (isCreate.value) return {};
  const color = props.state === "new" ? props.ringColor : "rgba(255,255,255,0.4)";
  return {
    boxShadow: `0 0 0 3px #fff, 0 0 0 6px ${color}`,
  } as Record<string, string>;
});

const createLabel = computed(() => t("stories.card.createLabel"));
const openStoryLabel = computed(() =>
  props.name
    ? t("stories.card.openAria", { name: props.name })
    : t("stories.card.openAriaFallback"),
);
const cardAriaLabel = computed(() => (isCreate.value ? createLabel.value : openStoryLabel.value));
</script>

<style scoped>
.story-card {
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
  will-change: transform;
}
.story-card:hover {
  transform: translateY(-2px);
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
