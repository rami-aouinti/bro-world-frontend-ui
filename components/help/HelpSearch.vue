<template>
  <div
    class="help-search"
    :class="{ 'help-search--has-results': shouldShowResults }"
  >
    <form
      class="help-search__form"
      @submit.prevent="emitSubmit"
    >
      <label
        class="visually-hidden"
        :for="inputId"
        >{{ ariaLabel || placeholder }}</label
      >
      <v-text-field
        :id="inputId"
        :model-value="internalValue"
        variant="outlined"
        density="comfortable"
        color="primary"
        prepend-inner-icon="mdi-magnify"
        :placeholder="placeholder"
        :loading="loading"
        hide-details
        @update:model-value="updateValue"
        @keydown.enter="emitSubmit"
      />
    </form>
    <div
      v-if="shouldShowResults"
      class="help-search__panel"
      role="region"
      :aria-live="ariaLive"
    >
      <p
        v-if="!results.length && !loading"
        class="text-body-2 text-medium-emphasis px-4 py-3"
      >
        {{ emptyMessage }}
      </p>
      <ul
        v-else
        class="help-search__results"
        :aria-label="resultsLabel"
      >
        <li
          v-for="result in results"
          :key="result.slug"
          class="help-search__result"
        >
          <NuxtLink
            :to="resultLink(result)"
            class="help-search__result-link"
            @click="emitSelect(result)"
          >
            <span class="help-search__result-title">{{ result.title }}</span>
            <span class="help-search__result-excerpt">{{ result.excerpt }}</span>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useId } from "vue";

import type { HelpArticleSummary } from "~/types/help";

const props = defineProps<{
  modelValue: string;
  placeholder: string;
  ariaLabel?: string;
  results: HelpArticleSummary[];
  loading?: boolean;
  emptyMessage: string;
  resultsLabel: string;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
  (event: "submit"): void;
  (event: "select", article: HelpArticleSummary): void;
}>();

const inputId = useId();

const internalValue = computed(() => props.modelValue);
const loading = computed(() => props.loading ?? false);
const results = computed(() => props.results ?? []);

const shouldShowResults = computed(() => internalValue.value.trim().length > 1);

const ariaLive = computed(() => (loading.value ? "polite" : "off"));

const localePath = useLocalePath();

function updateValue(value: string) {
  emit("update:modelValue", value);
}

function emitSubmit() {
  emit("submit");
}

function emitSelect(article: HelpArticleSummary) {
  emit("select", article);
}

function resultLink(article: HelpArticleSummary) {
  return localePath({ name: "help-article-slug", params: { slug: article.slug } });
}
</script>

<style scoped>
.help-search {
  position: relative;
}

.help-search__form {
  position: relative;
  z-index: 2;
}

.help-search__panel {
  background-color: rgba(255, 255, 255, 0.96);
  border-radius: 18px;
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(15, 23, 42, 0.08);
  margin-top: 0.75rem;
  overflow: hidden;
}

:global(html[dir="rtl"]) .help-search__panel {
  text-align: right;
}

.help-search__results {
  list-style: none;
  margin: 0;
  padding: 0;
}

.help-search__result + .help-search__result {
  border-top: 1px solid rgba(15, 23, 42, 0.06);
}

.help-search__result-link {
  display: block;
  padding: 0.9rem 1.25rem;
  text-decoration: none;
}

.help-search__result-link:hover,
.help-search__result-link:focus-visible {
  background: rgba(82, 67, 255, 0.08);
}

.help-search__result-title {
  display: block;
  font-weight: 600;
  color: rgb(15, 23, 42);
}

.help-search__result-excerpt {
  display: block;
  color: rgba(15, 23, 42, 0.7);
  font-size: 0.85rem;
  margin-top: 0.2rem;
}

.visually-hidden {
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
}
</style>
