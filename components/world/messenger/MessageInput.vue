<template>
  <div class="pa-4">
    <v-form @submit.prevent="send">
      <v-text-field
        v-model="text"
        :label="label"
        :placeholder="placeholder"
        :disabled="disabled"
        :append-inner-icon="appendIcon"
        color="primary"
        variant="outlined"
        density="comfortable"
        rounded="xl"
        hide-details
        @click:append-inner="send"
        @keydown.enter.exact.prevent="send"
        @paste="handlePaste"
      />
    </v-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { MessengerAttachment } from "~/types/messenger";

const props = withDefaults(
  defineProps<{
    label?: string;
    placeholder?: string;
    appendIcon?: string;
    disabled?: boolean;
  }>(),
  {
    label: "Type your message",
    placeholder: "Type your message",
    appendIcon: "mdi-send",
    disabled: false,
  },
);

const emit = defineEmits<{
  (e: "send", payload: { content: string; attachments?: MessengerAttachment[] }): void;
}>();

const text = ref("");

function reset() {
  text.value = "";
}

function send() {
  const content = text.value.trim();

  if (!content) {
    return;
  }

  emit("send", { content });
  reset();
}

function createAttachment(file: File): Promise<MessengerAttachment | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (typeof result !== "string") {
        resolve(null);
        return;
      }

      resolve({
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: file.name || "Attachment",
        url: result,
        mimeType: file.type || undefined,
        size: file.size || undefined,
      });
    };

    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

async function handlePaste(event: ClipboardEvent) {
  const items = event.clipboardData?.items;

  if (!items?.length) {
    return;
  }

  for (const item of items) {
    if (item.kind === "file" && item.type.startsWith("image/")) {
      const file = item.getAsFile();

      if (!file) {
        continue;
      }

      const attachment = await createAttachment(file);

      if (attachment) {
        emit("send", { content: "", attachments: [attachment] });
        event.preventDefault();
        reset();
        break;
      }
    }
  }
}
</script>
