<template>
  <v-row>
    <v-col cols="6">
      <v-text-field
        v-model="search"
        :placeholder="t('job.search')"
        density="compact"
        prepend-inner-icon="mdi-magnify"
        rounded="xl"
        variant="outlined"
      />
    </v-col>
    <v-col cols="6">
      <v-text-field
        v-model="selectedLocations"
        :label="t('job.location')"
        density="compact"
        prepend-inner-icon="mdi-earth"
        rounded="xl"
        variant="outlined"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref, watch } from "vue"
import { useI18n } from "vue-i18n"

type Emits = {
  (e: "update:search", value: string): void
  (e: "update:location", value: string): void
}

const emit = defineEmits<Emits>()
const { t } = useI18n()

const search = ref("")
const selectedLocations = ref("")

watch(search, (value) => emit("update:search", value))
watch(selectedLocations, (value) => emit("update:location", value))
</script>
