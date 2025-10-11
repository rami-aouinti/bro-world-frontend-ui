<template>
  <v-dialog
    v-model="dialogOpen"
    max-width="680"
    persistent
    scrollable
    data-test="new-post-dialog"
  >
    <v-card class="rounded-xl">
      <v-card-title class="d-flex align-center justify-space-between">
        <span class="text-h6 font-weight-semibold">{{ dialogTitle }}</span>
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="handleClose"
        >
          <Icon name="mdi-close" />
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-4">
        <div class="d-flex align-start ga-3 mb-2">
          <v-avatar size="40">
            <v-img
              :src="avatar"
              alt="Avatar"
              width="40"
              height="40"
            />
          </v-avatar>
          <div class="d-flex flex-column">
            <div class="text-subtitle-2 font-weight-medium">{{ userName }}</div>

            <v-menu>
              <template #activator="{ props: menuProps }">
                <v-btn
                  v-bind="menuProps"
                  size="small"
                  variant="tonal"
                  rounded="pill"
                  prepend-icon="mdi-account-multiple"
                  class="text-capitalize"
                >
                  <Icon
                    name="mdi-account-multiple"
                    class="me-2"
                  />
                  {{ audienceLabel }}
                </v-btn>
              </template>
              <v-list density="compact">
                <v-list-item
                  v-for="opt in audienceOptions"
                  :key="opt.value"
                  @click="audience = opt.value"
                >
                  <template #prepend
                    ><Icon
                      :name="opt.icon"
                      class="mr-2"
                  /></template>
                  <v-list-item-title>{{ opt.label }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </div>

        <v-textarea
          v-model="message"
          variant="plain"
          auto-grow
          :rows="5"
          class="text-body-1"
          :placeholder="placeholder"
          data-test="new-post-message"
        />

        <div class="d-flex justify-end text-caption text-medium-emphasis">
          {{ message.length }}/{{ maxLength }}
        </div>
        <v-card
          variant="outlined"
          class="rounded-xl my-2"
        >
          <div class="d-flex align-center justify-space-between px-3 py-2">
            <div class="text-medium-emphasis text-body-2">{{ addToPostLabel }}</div>
            <div class="d-flex ga-1">
              <v-btn
                icon
                variant="text"
                :title="attachmentLabels.media"
                @click="handleAttach('media')"
              >
                <Icon name="mdi-image-multiple" />
              </v-btn>
              <v-btn
                icon
                variant="text"
                :title="attachmentLabels.tag"
                @click="handleAttach('tag')"
              >
                <Icon name="mdi-account-plus-outline" />
              </v-btn>
              <v-btn
                icon
                variant="text"
                :title="attachmentLabels.feeling"
                @click="handleAttach('feeling')"
              >
                <Icon name="mdi-emoticon-happy-outline" />
              </v-btn>
              <v-btn
                icon
                variant="text"
                :title="attachmentLabels.location"
                @click="handleAttach('location')"
              >
                <Icon name="mdi-map-marker" />
              </v-btn>
              <v-btn
                icon
                variant="text"
                :title="attachmentLabels.gif"
                @click="handleAttach('gif')"
              >
                <Icon name="mdi-gif" />
              </v-btn>
              <v-menu>
                <template #activator="{ props: menuProps }">
                  <v-btn
                    icon
                    variant="text"
                    v-bind="menuProps"
                    ><v-icon icon="mdi-dots-horizontal"
                  /></v-btn>
                </template>
                <v-list density="compact">
                  <v-list-item
                    :title="attachmentLabels.poll"
                    @click="handleAttach('poll')"
                  />
                </v-list>
              </v-menu>
            </div>
          </div>
        </v-card>
      </v-card-text>

      <v-card-actions class="px-2 pb-2">
        <v-btn
          block
          color="primary"
          :disabled="!canPost"
          data-test="new-post-submit"
          @click="handleSubmit"
        >
          {{ postButtonLabel }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

type AudienceOption = "friends" | "public" | "private";

interface Props {
  open?: boolean;
  userName?: string;
  avatar?: string;
  placeholder?: string;
  maxLength?: number;
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  userName: "Rami Aouinti",
  avatar: "/avatar.png",
  placeholder: "",
  maxLength: 5000,
});

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "submit", payload: { text: string; audience: AudienceOption }): void;
  (e: "close"): void;
  (e: "attach", type: string): void;
}>();

const dialogOpen = computed({
  get: () => props.open,
  set: (value) => emit("update:open", value),
});

const message = ref("");
const audience = ref<AudienceOption>("friends");

const { t } = useI18n();

const audienceOptions = computed(() => [
  { value: "public" as const, label: t("blog.newPost.audience.public"), icon: "mdi-earth" },
  {
    value: "friends" as const,
    label: t("blog.newPost.audience.friends"),
    icon: "mdi-account-multiple",
  },
  { value: "private" as const, label: t("blog.newPost.audience.private"), icon: "mdi-lock" },
]);

const attachmentLabels = computed(() => ({
  media: t("blog.newPost.attachments.media"),
  tag: t("blog.newPost.attachments.tag"),
  feeling: t("blog.newPost.attachments.feeling"),
  location: t("blog.newPost.attachments.location"),
  gif: t("blog.newPost.attachments.gif"),
  poll: t("blog.newPost.attachments.poll"),
}));

const dialogTitle = computed(() => t("blog.newPost.dialog.title"));
const addToPostLabel = computed(() => t("blog.newPost.dialog.addToPost"));
const postButtonLabel = computed(() => t("blog.newPost.dialog.postButton"));

const audienceLabel = computed(
  () =>
    audienceOptions.value.find((a) => a.value === audience.value)?.label ??
    audienceOptions.value[0]?.label ??
    "",
);

const maxLength = computed(() => props.maxLength);
const canPost = computed(
  () => message.value.trim().length > 0 && message.value.length <= maxLength.value,
);

watch(
  () => props.open,
  (value, oldValue) => {
    if (!value && oldValue) {
      emit("close");
    }
  },
);

function handleAttach(type: string) {
  emit("attach", type);
}

function handleClose() {
  dialogOpen.value = false;
}

function handleSubmit() {
  if (!canPost.value) return;

  emit("submit", { text: message.value.trim(), audience: audience.value });
  message.value = "";
  dialogOpen.value = false;
}
</script>
