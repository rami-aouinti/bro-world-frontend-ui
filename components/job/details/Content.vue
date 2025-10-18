<template>
  <div class="mt-6">
    <h4 class="text-subtitle-1 font-weight-semibold mb-3">
      {{ t("job.description") }}
    </h4>
    <p class="text-body-2 text-medium-emphasis">
      {{ job.description || t("job.noDescription") }}
    </p>

    <h4 class="text-subtitle-1 font-weight-semibold mb-3 mt-6">
      {{ t("job.work") }}
    </h4>
    <p class="text-body-2 text-medium-emphasis">
      {{ job.work || t("job.noWork") }}
    </p>

    <div
      v-if="requirementList.length"
      class="mt-6"
    >
      <h4 class="text-subtitle-1 font-weight-semibold mb-3">
        {{ t("job.requirements") }}
      </h4>
      <ul class="pl-5 text-body-2 text-medium-emphasis">
        <li
          v-for="requirement in requirementList"
          :key="requirement"
        >
          {{ requirement }}
        </li>
      </ul>
    </div>

    <div
      v-if="benefitList.length"
      class="mt-6"
    >
      <h4 class="text-subtitle-1 font-weight-semibold mb-3">
        {{ t("job.benefits") }}
      </h4>
      <ul class="pl-5 text-body-2 text-medium-emphasis">
        <li
          v-for="benefit in benefitList"
          :key="benefit"
        >
          {{ benefit }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

type JobContent = {
  description?: string;
  work?: string;
  requirements?: string[];
  benefits?: string[] | string;
};

const props = defineProps<{ job: JobContent }>();

const { t } = useI18n();

const requirementList = computed(() => {
  if (Array.isArray(props.job.requirements)) {
    return props.job.requirements;
  }
  return [];
});

const benefitList = computed(() => {
  if (Array.isArray(props.job.benefits)) {
    return props.job.benefits;
  }
  if (typeof props.job.benefits === "string" && props.job.benefits.length) {
    return props.job.benefits.split("\n").filter(Boolean);
  }
  return [];
});
</script>
