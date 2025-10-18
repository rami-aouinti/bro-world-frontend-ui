<template>
  <div class="help-feedback" role="form" :aria-labelledby="labelId">
    <p :id="labelId" class="text-body-1 font-weight-medium mb-3">
      {{ question }}
    </p>
    <div class="d-flex flex-wrap gap-2">
      <v-btn
        color="primary"
        variant="tonal"
        size="small"
        :disabled="hasResponse"
        data-test="help-feedback-yes"
        @click="() => handleResponse('yes')"
      >
        {{ yesLabel }}
      </v-btn>
      <v-btn
        color="primary"
        variant="outlined"
        size="small"
        :disabled="hasResponse"
        data-test="help-feedback-no"
        @click="() => handleResponse('no')"
      >
        {{ noLabel }}
      </v-btn>
    </div>
    <p v-if="hasResponse" class="text-body-2 text-medium-emphasis mt-3" data-test="help-feedback-thanks">
      {{ thanksLabel }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, useId } from "vue";
import { useLocalStorage } from "@vueuse/core";

const props = defineProps<{
  articleId: string;
  question: string;
  yesLabel: string;
  noLabel: string;
  thanksLabel: string;
}>();

const emit = defineEmits<{
  (event: "submitted", payload: { articleId: string; value: "yes" | "no" }): void;
}>();

const storageKey = computed(() => `help-feedback:${props.articleId}`);
const storedValue = useLocalStorage<string | null>(storageKey.value, null);

const hasResponse = computed(() => Boolean(storedValue.value));

function handleResponse(value: "yes" | "no") {
  if (hasResponse.value) {
    return;
  }

  storedValue.value = value;
  emit("submitted", { articleId: props.articleId, value });
}

const labelId = useId();
</script>

<style scoped>
.help-feedback {
  border-top: 1px solid rgba(15, 23, 42, 0.08);
  padding-top: 1.5rem;
  margin-top: 2rem;
}
</style>
