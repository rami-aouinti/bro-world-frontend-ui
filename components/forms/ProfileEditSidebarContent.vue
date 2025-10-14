<template>
  <div>
    <SidebarCard
      class="text-card-foreground mb-6 px-3 py-2"
      padding="none"
      glow
    >
      <h2 class="text-h6 font-weight-semibold mb-4">
        {{ t("pages.profileEdit.sections.social") }}
      </h2>
      <div class="d-flex flex-column gap-4">
        <v-text-field
          :model-value="form.social.linkedin"
          prepend-inner-icon="mdi-linkedin"
          :label="t('pages.profileEdit.labels.linkedin')"
          variant="outlined"
          density="comfortable"
          @update:model-value="updateSocial('linkedin', $event)"
        />
        <v-text-field
          :model-value="form.social.twitter"
          prepend-inner-icon="mdi-twitter"
          :label="t('pages.profileEdit.labels.twitter')"
          variant="outlined"
          density="comfortable"
          @update:model-value="updateSocial('twitter', $event)"
        />
        <v-text-field
          :model-value="form.social.dribbble"
          prepend-inner-icon="mdi-basketball"
          :label="t('pages.profileEdit.labels.dribbble')"
          variant="outlined"
          density="comfortable"
          @update:model-value="updateSocial('dribbble', $event)"
        />
        <v-text-field
          :model-value="form.social.behance"
          prepend-inner-icon="mdi-briefcase-outline"
          :label="t('pages.profileEdit.labels.behance')"
          variant="outlined"
          density="comfortable"
          @update:model-value="updateSocial('behance', $event)"
        />
      </div>
    </SidebarCard>

    <SidebarCard
      class="text-card-foreground px-3 py-2"
      padding="none"
      glow
    >
      <h2 class="text-h6 font-weight-semibold mb-3">
        {{ t("pages.profileEdit.sections.contact") }}
      </h2>
      <p class="text-body-2 text-medium-emphasis mb-4">
        {{ t("pages.profileEdit.helpers.summary") }}
      </p>
      <div class="d-flex flex-column gap-3">
        <div class="d-flex align-center gap-3">
          <v-avatar
            size="40"
            color="primary"
            variant="tonal"
          >
            <span class="text-body-2 font-weight-semibold">{{ initials }}</span>
          </v-avatar>
          <div>
            <div class="text-subtitle-2 font-weight-semibold">{{ fullName }}</div>
            <div class="text-caption text-medium-emphasis">{{ form.headline }}</div>
          </div>
        </div>
        <div class="text-body-2 text-medium-emphasis">
          <div>{{ form.email }}</div>
          <div v-if="form.phone">{{ form.phone }}</div>
          <div v-if="form.location">{{ form.location }}</div>
        </div>
      </div>
    </SidebarCard>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";

import type { ProfileForm } from "~/types/pages/profile";

const SidebarCard = defineAsyncComponent({
  loader: () => import("~/components/layout/SidebarCard.vue"),
  suspensible: false,
});

const props = defineProps<{
  form: ProfileForm;
  fullName: string;
  initials: string;
}>();

const { t } = useI18n();

const form = computed(() => props.form);
const fullName = computed(() => props.fullName);
const initials = computed(() => props.initials);

function updateSocial(network: keyof ProfileForm["social"], value: string) {
  form.value.social[network] = value;
}
</script>
