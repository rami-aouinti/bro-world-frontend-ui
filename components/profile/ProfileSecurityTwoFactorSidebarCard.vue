<template>
  <div class="flex flex-col gap-4">
    <SidebarCard
      class="text-card-foreground px-3 py-2"
      padding="none"
      glow
    >
      <ProfileSecurityTwoFactorSection
        v-model:enabled="enabled"
        @generate-codes="handleGenerateCodes"
      />
    </SidebarCard>

    <v-snackbar
      v-model="snackbar.visible"
      color="primary"
      timeout="2500"
      variant="flat"
    >
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";

const SidebarCard = defineAsyncComponent({
  loader: () => import("~/components/layout/SidebarCard.vue"),
  suspensible: false,
});

const ProfileSecurityTwoFactorSection = defineAsyncComponent({
  loader: () => import("~/components/profile/ProfileSecurityTwoFactorSection.vue"),
  suspensible: false,
});

const { t } = useI18n();

const enabled = ref(true);
const snackbar = reactive({
  visible: false,
  message: "",
});

function handleGenerateCodes() {
  snackbar.message = t("pages.profileSecurity.recoveryCodes.title");
  snackbar.visible = true;
}
</script>
