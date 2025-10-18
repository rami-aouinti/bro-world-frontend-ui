<template>
  <div class="mt-6">
    <h4 class="text-subtitle-1 font-weight-semibold mb-3">
      {{ t("job.skills") }}
    </h4>
    <div
      v-if="skillList.length"
      class="d-flex flex-wrap gap-2"
    >
      <v-chip
        v-for="skill in skillList"
        :key="skill"
        color="primary"
        size="small"
        variant="tonal"
      >
        {{ skill }}
      </v-chip>
    </div>
    <p
      v-else
      class="text-body-2 text-medium-emphasis"
    >
      {{ t("job.noSkills") }}
    </p>

    <div
      v-if="languageList.length"
      class="mt-4"
    >
      <h4 class="text-subtitle-1 font-weight-semibold mb-3">
        {{ t("job.languages") }}
      </h4>
      <v-chip-group
        column
        class="d-flex flex-wrap gap-2"
      >
        <v-chip
          v-for="(language, index) in languageList"
          :key="`${language.name}-${index}`"
          color="secondary"
          size="small"
          variant="tonal"
        >
          {{ language.name }}<span v-if="language.level"> • {{ language.level }}</span>
        </v-chip>
      </v-chip-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

type JobSkills = {
  skills?: string[];
  requiredSkills?: string[] | string;
  languages?: Array<{ name?: string; level?: string }>;
};

const props = defineProps<{ job: JobSkills }>();

const { t } = useI18n();

const skillList = computed(() => {
  if (Array.isArray(props.job.skills) && props.job.skills.length) {
    return props.job.skills;
  }
  if (Array.isArray(props.job.requiredSkills) && props.job.requiredSkills.length) {
    return props.job.requiredSkills;
  }
  if (typeof props.job.requiredSkills === "string") {
    return props.job.requiredSkills.split(",").map((skill) => skill.trim());
  }
  return [];
});

const languageList = computed(() => props.job.languages ?? []);
</script>
