<template>
  <v-dialog
    v-model="dialogOpen"
    max-width="680"
    scrollable
    persistent
  >
    <v-card class="rounded-xl">
      <v-card-title class="d-flex align-center justify-space-between py-3">
        <span class="text-h6 font-weight-semibold">{{ title }}</span>
        <v-btn
          icon
          variant="text"
          @click="handleClose"
        >
          <Icon name="mdi:close" />
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-4">
        <div class="d-flex align-start ga-3 mb-3">
          <v-avatar size="44">
            <v-img
              :src="currentUserAvatarSrc"
              :alt="currentUserName"
              width="44"
              height="44"
            />
          </v-avatar>

          <div class="d-flex flex-column ga-1">
            <div class="text-subtitle-2 font-weight-medium">
              {{ currentUserName || t("blog.posts.shareDialog.defaultName") }}
            </div>
            <v-chip
              size="small"
              color="primary"
              variant="tonal"
              class="text-capitalize"
            >
              {{ audienceLabel }}
            </v-chip>
          </div>
        </div>

        <v-textarea
          v-model="message"
          variant="plain"
          auto-grow
          :rows="4"
          :max-length="maxLength"
          :placeholder="messagePlaceholder"
          class="text-body-1 mb-2"
          data-test="share-post-message"
        />

        <div class="d-flex justify-end text-caption text-medium-emphasis mb-4">
          {{ message.length }}/{{ maxLength }}
        </div>

        <v-card
          variant="outlined"
          class="rounded-xl share-preview"
        >
          <div class="d-flex align-start ga-3">
            <v-avatar size="40">
              <v-img
                :src="postAuthorAvatar"
                :alt="postAuthorName"
                width="40"
                height="40"
              />
            </v-avatar>

            <div class="d-flex flex-column">
              <span class="text-subtitle-2 font-weight-medium">{{ postAuthorName }}</span>
              <span class="text-caption text-medium-emphasis">{{ postPublishedLabel }}</span>
            </div>
          </div>

          <v-divider class="my-3" />

          <div class="text-body-1 font-weight-medium mb-1">
            {{ post.title }}
          </div>
          <div class="text-body-2 text-medium-emphasis">
            {{ post.summary }}
          </div>
        </v-card>
      </v-card-text>

      <v-card-actions class="px-4 pb-4">
        <v-btn
          variant="text"
          class="me-2"
          @click="handleClose"
        >
          {{ cancelLabel }}
        </v-btn>
        <v-btn
          color="primary"
          :disabled="message.length > maxLength"
          @click="handleShare"
        >
          {{ shareButtonLabel }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRelativeTime } from "~/composables/useRelativeTime";
import type { BlogPost } from "~/lib/mock/blog";
import { optimizeAvatarUrl } from "~/lib/images/avatar";

interface Props {
  open?: boolean;
  post: BlogPost;
  currentUserName?: string;
  currentUserAvatar?: string;
  maxLength?: number;
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  currentUserName: "",
  currentUserAvatar: undefined,
  maxLength: 500,
});

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "share", payload: { message: string }): void;
  (e: "close"): void;
}>();

const { t } = useI18n();
const { formatRelativeTime } = useRelativeTime();

const dialogOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit("update:open", value),
});

const message = ref("");

const maxLength = computed(() => props.maxLength ?? 500);

const title = computed(() => t("blog.posts.shareDialog.title"));
const messagePlaceholder = computed(() =>
  props.currentUserName
    ? t("blog.posts.shareDialog.placeholderNamed", { name: props.currentUserName })
    : t("blog.posts.shareDialog.placeholder"),
);
const shareButtonLabel = computed(() => t("blog.posts.shareDialog.submit"));
const cancelLabel = computed(() => t("blog.posts.shareDialog.cancel"));
const audienceLabel = computed(() => t("blog.posts.shareDialog.feedAudience"));

const currentUserAvatarSrc = computed(
  () =>
    optimizeAvatarUrl(props.currentUserAvatar ?? null, 44) ??
    props.currentUserAvatar ??
    "/avatar.png",
);

const postAuthorName = computed(() => {
  const user = props.post.user;
  const parts = [user?.firstName, user?.lastName].filter(Boolean) as string[];

  if (parts.length > 0) {
    return parts.join(" ");
  }

  return user?.username || user?.email || "";
});

const postAuthorAvatar = computed(
  () =>
    optimizeAvatarUrl(props.post.user?.photo ?? null, 40) ??
    props.post.user?.photo ??
    "/avatar.png",
);

const postPublishedLabel = computed(() => formatRelativeTime(props.post.publishedAt));

watch(dialogOpen, (open) => {
  if (!open) {
    message.value = "";
    emit("close");
  }
});

watch(message, (value) => {
  if (value.length > maxLength.value) {
    message.value = value.slice(0, maxLength.value);
  }
});

function handleClose() {
  dialogOpen.value = false;
}

function handleShare() {
  emit("share", { message: message.value.trim() });
  message.value = "";
  dialogOpen.value = false;
}
</script>

<style scoped>
.share-preview {
  padding: 16px;
}
</style>
