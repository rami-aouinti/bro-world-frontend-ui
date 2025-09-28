<template>
  <main class="py-10" aria-labelledby="admin-user-management-title">
    <v-container>
      <header class="mb-8">
        <h1 id="admin-user-management-title" class="text-h4 font-weight-bold mb-2">
          {{ t('admin.userManagement.page.title') }}
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-0">
          {{ t('admin.userManagement.page.subtitle') }}
        </p>
      </header>
      <v-sheet class="pa-6" rounded="xl" variant="tonal">
        <p class="mb-0 text-body-2 text-medium-emphasis">
          {{ t('admin.userManagement.page.subtitle') }}
        </p>
      </v-sheet>
    </v-container>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const { t } = useI18n()

definePageMeta({
  middleware: ['auth', 'admin'],
  showRightWidgets: false,
})

useHead({
  title: computed(() => t('admin.userManagement.metaTitle')),
})
</script>
