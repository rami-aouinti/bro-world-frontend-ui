<!-- components/CommentSortMenu.vue -->
<template>
  <v-menu
    offset="10"
    :close-on-content-click="true"
    content-class="cs-menu"
  >
    <template #activator="{ props: a }">
      <button
        class="cs-activator"
        v-bind="a"
        aria-haspopup="menu"
        :aria-expanded="undefined"
      >
        {{ currentLabel }}
        <Icon
          name="mdi-chevron-down"
          size="16"
          class="ml-1"
        />
      </button>
    </template>

    <div
      class="cs-bubble"
      role="menu"
      :aria-label="menuAriaLabel"
    >
      <div
        v-for="opt in options"
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

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

export type SortKey = "relevant" | "newest" | "all";

const props = defineProps<{
  modelValue: SortKey;
}>();

const emit = defineEmits<{ (e: "update:modelValue", v: SortKey): void }>();

const { t } = useI18n();

const options = computed<{ key: SortKey; title: string; subtitle: string }[]>(() => [
  {
    key: "relevant",
    title: t("blog.comments.sort.options.relevant.label"),
    subtitle: t("blog.comments.sort.options.relevant.description"),
  },
  {
    key: "newest",
    title: t("blog.comments.sort.options.newest.label"),
    subtitle: t("blog.comments.sort.options.newest.description"),
  },
  {
    key: "all",
    title: t("blog.comments.sort.options.all.label"),
    subtitle: t("blog.comments.sort.options.all.description"),
  },
]);

const currentLabel = computed(
  () => options.value.find((option) => option.key === props.modelValue)?.title ?? "",
);

const menuAriaLabel = computed(() => t("blog.comments.sort.menuAria"));

function pick(v: SortKey) {
  emit("update:modelValue", v);
}
</script>

<style scoped>
.cs-activator {
  background: transparent;
  border: 0;
  cursor: pointer;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.92);
  display: inline-flex;
  align-items: center;
}

/* Le conteneur téléporté du menu (sinon fond transparent) */
:global(.v-overlay__content.cs-menu) {
  background: rgb(var(--v-theme-surface)); /* <-- fix important */
  border-radius: 18px;
  box-shadow:
    0 10px 28px rgba(0, 0, 0, 0.22),
    0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0;
  overflow: visible;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

/* Bulle interne (utile si tu veux padding séparé) */
.cs-bubble {
  background: transparent; /* le fond est porté par .v-overlay__content.cs-menu */
  border-radius: 18px;
  padding: 10px 0;
  min-width: 360px;
}

.cs-item {
  padding: 12px 18px;
  cursor: pointer;
}
.cs-item:hover {
  background: rgba(var(--v-theme-on-surface), 0.05);
}
.cs-item.active .cs-title {
  color: rgb(var(--v-theme-primary));
}
.cs-title {
  font-weight: 800;
}
.cs-sub {
  font-size: 0.92rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
  margin-top: 2px;
}

/* Flèche en haut à droite */
.cs-arrow {
  position: absolute;
  left: 18px;
  top: -9px;
  width: 18px;
  height: 18px;
  rotate: 45deg;
  background: rgb(var(--v-theme-surface));
  box-shadow: -2px -2px 4px rgba(0, 0, 0, 0.04);
  border-top-left-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-bottom: 0;
  border-right: 0;
}
</style>
