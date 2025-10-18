<template>
  <v-container class="py-4">
    <Header :job="job" />

    <v-expand-transition>
      <div v-if="expanded">
        <Skills :job="job" />
        <Content :job="job" />
      </div>
    </v-expand-transition>

    <v-row justify="center">
      <v-btn
        class="mt-4"
        color="primary"
        prepend-icon="mdi-chevron-down"
        variant="text"
        @click="expanded = !expanded"
      >
        {{ expanded ? t("buttons.less") : t("buttons.more") }}
      </v-btn>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useI18n } from "vue-i18n"
import Skills from "~/components/job/details/Skills.vue"
import Content from "~/components/job/details/Content.vue"
import Header from "~/components/job/details/Header.vue"

type JobDetailsPayload = {
  title?: string
  company?: { name?: string; description?: string }
  workLocation?: string
  salaryRange?: string | number
  workType?: string
  work?: string
  domain?: string
  experience?: string | number
  contractType?: string
  requirements?: unknown[]
  skills?: string[]
  languages?: unknown[]
  description?: string
  requiredSkills?: string
  benefits?: string[] | string
}

const props = defineProps<{
  job: JobDetailsPayload
}>()

const { t } = useI18n()
const expanded = ref(false)
</script>
