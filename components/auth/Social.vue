<template>
  <div :class="socialClasses">
    <button
      v-for="button in buttons"
      :key="button.provider"
      type="button"
      class="auth-social__button"
      :class="{ 'auth-social__button--compact': isCompact }"
      :style="{ background: button.gradient }"
      :aria-label="button.label"
      :disabled="props.loading"
      @click="handleRedirect(button.provider)"
    >
      <Icon
        :name="button.icon"
        :size="isCompact ? 20 : 24"
        :color="button.iconColor"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import type { SocialProvider } from "~/lib/auth/social";

const props = withDefaults(
  defineProps<{
    loading?: boolean;
    size?: "default" | "compact";
  }>(),
  {
    loading: false,
    size: "default",
  },
);

const emit = defineEmits<{
  (e: "redirect", provider: SocialProvider): void;
}>();

const { t } = useI18n();

const baseButtons = [
  {
    provider: "google",
    icon: "mdi:google",
    gradient: "linear-gradient(135deg, #ff8a00 0%, #ff2d55 100%)",
    iconColor: "#ffffff",
  },
  {
    provider: "github",
    icon: "mdi:github",
    gradient: "linear-gradient(135deg, #232526 0%, #414345 100%)",
    iconColor: "#ffffff",
  },
  {
    provider: "microsoft",
    icon: "mdi:microsoft",
    gradient: "linear-gradient(135deg, #00b4db 0%, #0083b0 100%)",
    iconColor: "#ffffff",
  },
] as const satisfies ReadonlyArray<{
  provider: SocialProvider;
  icon: string;
  gradient: string;
  iconColor: string;
}>;

const buttons = computed(() =>
  baseButtons.map((button) => ({
    ...button,
    label: t(`auth.social.${button.provider}`),
  })),
);

const isCompact = computed(() => props.size === "compact");
const socialClasses = computed(() => ["auth-social", { "auth-social--compact": isCompact.value }]);

function handleRedirect(provider: SocialProvider) {
  if (props.loading) return;

  emit("redirect", provider);
}
</script>

<style scoped>
.auth-social {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.1rem;
}

.auth-social--compact {
  gap: 0.75rem;
}

.auth-social__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 50%;
  border: none;
  color: #ffffff;
  box-shadow: 0 20px 38px rgba(15, 23, 42, 0.2);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  cursor: pointer;
}

.auth-social__button--compact {
  width: 2.75rem;
  height: 2.75rem;
  box-shadow: 0 16px 28px rgba(15, 23, 42, 0.18);
}

.auth-social__button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

.auth-social__button:not(:disabled):hover {
  transform: translateY(-3px);
  box-shadow: 0 24px 44px rgba(236, 72, 153, 0.28);
}

.auth-social__button:not(:disabled):active {
  transform: translateY(-1px);
}
</style>
