<template>
  <div class="flex h-[calc(100vh-50px)] flex-col md:flex-row">
    <ConversationsList
      :conversations="conversations"
      :active-id="null"
      :loading="loading"
      :search-placeholder="t('messenger.searchPlaceholder')"
      :empty-label="t('messenger.emptyList')"
      :unknown-label="t('messenger.unknownParticipant')"
      @select="handleSelect"
    />
    <div class="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
      <div
        class="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary"
      >
        <AppIcon
          name="mdi:message-outline"
          :size="48"
        />
      </div>
      <div class="space-y-2">
        <h1 class="text-2xl font-semibold">
          {{ t("messenger.emptyTitle") }}
        </h1>
        <p class="max-w-md text-sm text-muted-foreground">
          {{ t("messenger.emptyDescription") }}
        </p>
      </div>
      <v-btn
        color="primary"
        variant="flat"
        :to="emptyCtaTo"
      >
        {{ t("messenger.emptyCtaLabel") }}
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { callOnce, navigateTo } from "#imports";
import { useMessengerStore } from "~/stores/messenger";

const ConversationsList = defineAsyncComponent({
  loader: () => import("~/components/messenger/ConversationsList.vue"),
  suspensible: false,
});

definePageMeta({
  documentDriven: false,
});
const messenger = useMessengerStore();
const router = useRouter();
const { t } = useI18n();

await callOnce(() => messenger.fetchThreads({ limit: 50 }));

const latestConversationId = messenger.latestConversationId.value;

if (latestConversationId) {
  await navigateTo({ path: `/messenger/${latestConversationId}`, replace: true });
}

const conversations = computed(() => messenger.orderedConversations.value ?? []);
const loading = computed(() => messenger.loadingList.value);
const emptyCtaTo = computed(() => {
  const raw = t("messenger.emptyCtaLink");
  return raw === "messenger.emptyCtaLink" ? undefined : raw;
});

function handleSelect(id: string) {
  router.push({ path: `/messenger/${id}` });
}
</script>
