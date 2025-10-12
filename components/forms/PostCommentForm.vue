<template>
  <v-form
    ref="formRef"
    class="post-comment-form"
    @submit.prevent="handleSubmit"
  >
    <div
      class="composer"
      :class="{ 'composer--disabled': disabled }"
    >
      <v-avatar
        size="34"
        class="composer__avatar"
      >
        <v-img
          :src="avatar || defaultAvatar"
          alt=""
          width="34"
          height="34"
        />
      </v-avatar>

      <div class="composer__box">
        <v-textarea
          v-model="localValue"
          rounded
          rows="1"
          auto-grow
          variant="plain"
          :placeholder="placeholderText"
          hide-details="auto"
          class="composer__input"
          :disabled="disabled"
          :counter="showCounter"
          :maxlength="maxLength"
          :rules="validationRules"
          data-test="post-comment-textarea"
          @keydown.enter.exact.prevent="handleSubmit"
        />

        <div class="composer__toolbar">
          <div class="composer__actions">
            <slot name="actions">
              <v-btn
                icon
                variant="text"
                size="small"
                :aria-label="emojiAriaLabel"
                :disabled="disabled"
              >
                <Icon name="mdi-emoticon-happy-outline" />
              </v-btn>
              <v-btn
                icon
                variant="text"
                size="small"
                :aria-label="mediaAriaLabel"
                :disabled="disabled"
              >
                <Icon name="mdi-image-outline" />
              </v-btn>
              <v-btn
                icon
                variant="text"
                size="small"
                :aria-label="gifAriaLabel"
                :disabled="disabled"
              >
                <Icon name="mdi-gif" />
              </v-btn>
            </slot>
          </div>

          <v-spacer />

          <v-btn
            color="primary"
            size="small"
            variant="flat"
            type="submit"
            class="composer__submit"
            :loading="submitting"
            :disabled="!canSubmit"
            data-test="post-comment-submit"
          >
            {{ submitLabel }}
          </v-btn>
        </div>
      </div>
    </div>
  </v-form>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

interface Props {
  modelValue?: string;
  avatar?: string;
  placeholder?: string;
  disabled?: boolean;
  submitting?: boolean;
  maxLength?: number | null;
  showCounter?: boolean;
  rules?: ((value: string) => true | string)[];
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  placeholder: undefined,
  avatar: undefined,
  disabled: false,
  submitting: false,
  maxLength: 280,
  showCounter: false,
  rules: () => [],
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "submit", text: string): void;
}>();

const { t } = useI18n();

const defaultAvatar = "https://i.pravatar.cc/80?img=3";
const formRef = ref();
const localValue = ref(props.modelValue);

watch(
  () => props.modelValue,
  (value) => {
    if (value !== localValue.value) {
      localValue.value = value;
    }
  },
);

watch(localValue, (value) => {
  emit("update:modelValue", value);
});

const placeholderText = computed(() => props.placeholder ?? t("blog.comments.placeholder"));
const submitLabel = computed(() => t("blog.comments.submit"));
const emojiAriaLabel = computed(() => t("blog.comments.addEmoji"));
const mediaAriaLabel = computed(() => t("blog.comments.addMedia"));
const gifAriaLabel = computed(() => t("blog.comments.addGif"));

const validationRules = computed(() => {
  return [
    (value: string) => Boolean(value?.trim()) || t("blog.comments.validation"),
    ...props.rules,
  ];
});

const disabled = computed(() => props.disabled || props.submitting);
const maxLength = computed(() => (props.maxLength ?? undefined) || undefined);
const showCounter = computed(() => Boolean(props.showCounter && props.maxLength));

const canSubmit = computed(() => {
  if (disabled.value) {
    return false;
  }

  if (!localValue.value?.trim()) {
    return false;
  }

  if (props.maxLength && localValue.value.length > props.maxLength) {
    return false;
  }

  return true;
});

function handleSubmit() {
  if (!canSubmit.value) {
    return;
  }

  const text = localValue.value.trim();

  emit("submit", text);
  localValue.value = "";
  formRef.value?.resetValidation?.();
}

const submitting = computed(() => props.submitting);

defineExpose({
  reset: () => {
    localValue.value = "";
    formRef.value?.resetValidation?.();
  },
  focus: () => {
    const textarea: HTMLTextAreaElement | null =
      formRef.value?.$el?.querySelector?.("textarea") ?? null;

    textarea?.focus();
  },
  validate: () => formRef.value?.validate?.(),
});
</script>

<style scoped>
.post-comment-form {
  width: 100%;
}

.composer {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.composer--disabled {
  opacity: 0.6;
  pointer-events: none;
}

.composer__avatar {
  margin-top: 2px;
}

.composer__box {
  flex: 1;
  background: rgba(var(--v-theme-on-surface), 0.04);
  border-radius: 18px;
  padding: 6px 8px;
}

.composer__input :deep(textarea) {
  padding-top: 8px !important;
  padding-bottom: 6px !important;
}

.composer__toolbar {
  display: flex;
  align-items: center;
  padding: 0 4px 4px;
}

.composer__actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.composer__submit {
  min-width: 110px;
}
</style>
