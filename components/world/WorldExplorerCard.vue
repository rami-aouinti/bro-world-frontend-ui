<template>
  <SidebarCard
    class="world-explorer-card text-card-foreground px-3 py-2"
    glow
    :aria-label="ariaLabel"
  >
    <div class="world-explorer-card__header">
      <div class="world-explorer-card__heading">
        <v-chip
          class="world-explorer-card__visibility"
          size="small"
          variant="outlined"
          color="primary"
        >
          {{ visibilityLabel }}
        </v-chip>

        <NuxtLink :to="targetRoute">
          <h6 class="world-explorer-card__title">
            {{ truncatedWorldName }}
          </h6>
        </NuxtLink>
      </div>

      <v-chip
        class="world-explorer-card__badge"
        :color="statusChipColor"
        size="small"
        variant="outlined"
      >
        <div
          v-if="hasRating"
          class="world-explorer-card__stat"
        >
          {{ ratingLabel }}
        </div>
      </v-chip>
    </div>

    <div class="world-explorer-card__actions">
      <div class="world-explorer-card__action-wrapper">
        <v-btn
          data-test="world-enter-button"
          class="world-explorer-card__action"
          variant="outlined"
          color="primary"
          density="comfortable"
          size="large"
          block
          :disabled="isEnterDisabled"
          :loading="isEntering"
          :aria-label="t('pages.index.actions.enterAria', { world: world.name })"
          @click="handleEnter"
        >
          {{ t("pages.index.actions.enter") }}
        </v-btn>
        <p
          v-if="enterHelperText"
          class="world-explorer-card__helper"
          data-test="world-enter-helper"
        >
          {{ enterHelperText }}
        </p>
      </div>

      <div class="world-explorer-card__action-wrapper">
        <v-btn
          data-test="world-action-button"
          class="world-explorer-card__action"
          variant="outlined"
          color="primary"
          density="comfortable"
          size="large"
          block
          :disabled="isPrimaryActionDisabled"
          :loading="isActivating"
          :aria-label="activateButtonAriaLabel"
          @click="handlePrimaryAction"
        >
          {{ activateButtonLabel }}
        </v-btn>
        <p
          v-if="primaryHelperText"
          class="world-explorer-card__helper"
          data-test="world-action-helper"
        >
          {{ primaryHelperText }}
        </p>
      </div>
    </div>

    <div
      v-if="showFooter"
      class="world-explorer-card__footer"
    >
      <div
        v-if="hasParticipants"
        class="world-explorer-card__stat"
      >
        <Icon
          name="lucide:users"
          class="world-explorer-card__stat-icon"
          aria-hidden="true"
        />
        <span class="world-explorer-card__stat-text">
          {{ participantsLabel }}
        </span>
      </div>
    </div>
  </SidebarCard>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { Icon } from "#components";
import SidebarCard from "~/components/layout/SidebarCard.vue";
import { useAlertPanel } from "~/stores/useAlertPanel";
import { useWorldMemberships } from "~/stores/world-memberships";
import { useResolvedLocalePath } from "~/composables/useResolvedLocalePath";
import type { SiteWorldSettings } from "~/types/settings";
import type { WorldMembership } from "~/types/world-membership";

const props = defineProps<{
  world: SiteWorldSettings;
  isActive?: boolean;
  membership?: WorldMembership | null;
}>();

const emit = defineEmits<{ (event: "activate", worldId: string): void }>();
const { t, locale } = useI18n();
const router = useRouter();
const alertPanel = useAlertPanel();
const membershipStore = useWorldMemberships();

const localePath = useResolvedLocalePath();

const targetRoute = computed(() => {
  const slug = props.world.slug?.trim() || props.world.id;
  return localePath({ name: "world-slug", params: { slug } });
});

const visibilityLabel = computed(() => {
  const visibility = (props.world.visibility ?? "private").toLowerCase();
  return visibility === "public"
    ? t("pages.index.visibility.public")
    : t("pages.index.visibility.private");
});

const creatorName = computed(() => props.world.createdBy?.name ?? "");
const truncatedCreatorName = computed(() =>
  creatorName.value.length > 7 ? creatorName.value.slice(0, 7) + "…" : creatorName.value,
);

const truncatedWorldName = computed(() => {
  const name = props.world?.name ?? "";
  return name.length > 6 ? name.slice(0, 6) + "…" : name;
});

const participantsCount = computed(() => {
  const value = props.world.participantsCount;
  return typeof value === "number" ? Math.max(0, Math.round(value)) : null;
});

const participantsNumberFormatter = computed(
  () => new Intl.NumberFormat(locale.value || undefined, { maximumFractionDigits: 0 }),
);

const formattedParticipantsCount = computed(() => {
  if (participantsCount.value === null) {
    return "";
  }

  return participantsNumberFormatter.value.format(participantsCount.value);
});

const participantsLabel = computed(() =>
  participantsCount.value === null
    ? ""
    : t("pages.index.participantsLabel", { count: formattedParticipantsCount.value }),
);

const ratingValue = computed(() => {
  const value = props.world.rating;

  if (typeof value !== "number") {
    return null;
  }

  const clamped = Math.min(Math.max(value, 0), 5);
  return Math.round(clamped * 10) / 10;
});

const formattedRating = computed(() => {
  if (ratingValue.value === null) {
    return "";
  }

  const hasDecimal = Math.abs(ratingValue.value % 1) > Number.EPSILON;
  return ratingValue.value.toFixed(hasDecimal ? 1 : 0);
});

const ratingLabel = computed(() =>
  ratingValue.value === null
    ? ""
    : t("pages.index.ratingLabel", { rating: formattedRating.value }),
);

const hasParticipants = computed(() => participantsCount.value !== null);
const hasRating = computed(() => ratingValue.value !== null);
const showFooter = computed(() => hasParticipants.value || hasRating.value);

const membership = computed<WorldMembership>(() => membershipStore.getMembership(props.world.id));
const membershipStatus = computed(() => membership.value.status);
const membershipRole = computed(() => membership.value.role);
const isOwner = computed(() => membership.value.isOwner || membershipRole.value === "owner");
const isPrivateWorld = computed(
  () => (props.world.visibility ?? "private").toLowerCase() === "private",
);
const isMembershipActive = computed(
  () => membershipStatus.value === "active" || isOwner.value,
);
const isActivating = computed(() => membershipStore.isActivating(props.world.id));
const isEntering = computed(() => membershipStore.isEntering(props.world.id));
const isEnterDisabled = computed(() => !isMembershipActive.value || isEntering.value);
const statusChipColor = computed(() => {
  if (membershipStatus.value === "pending") {
    return "warning";
  }

  if (membershipStatus.value === "denied") {
    return "error";
  }

  if (isMembershipActive.value) {
    return "success";
  }

  if (!hasRating.value || ratingValue.value === null) {
    return "primary";
  }

  if (ratingValue.value >= 4) {
    return "success";
  }

  if (ratingValue.value >= 2.5) {
    return "warning";
  }

  return "error";
});
const requiresAccessRequest = computed(
  () => isPrivateWorld.value && !isMembershipActive.value && !isOwner.value,
);
const canRequestAccess = computed(
  () =>
    requiresAccessRequest.value &&
    membershipStatus.value !== "pending" &&
    membershipStatus.value !== "denied",
);

const enterHelperText = computed(() => {
  if (isMembershipActive.value) {
    return "";
  }

  if (membershipStatus.value === "pending") {
    return t("pages.index.membership.pendingHelper");
  }

  if (membershipStatus.value === "denied") {
    return t("pages.index.membership.deniedHelper");
  }

  if (requiresAccessRequest.value) {
    return t("pages.index.membership.requestAccessHelper");
  }

  return "";
});

const primaryHelperText = computed(() => {
  if (!requiresAccessRequest.value) {
    return "";
  }

  if (membershipStatus.value === "pending") {
    return t("pages.index.membership.pendingHelper");
  }

  if (membershipStatus.value === "denied") {
    return t("pages.index.membership.deniedHelper");
  }

  return "";
});

const activateButtonLabel = computed(() => {
  if (props.isActive) {
    return t("pages.index.actions.active");
  }

  if (requiresAccessRequest.value) {
    return t("pages.index.actions.requestAccess");
  }

  return t("pages.index.actions.setActive");
});

const activateButtonAriaLabel = computed(() => {
  if (props.isActive) {
    return t("pages.index.actions.active");
  }

  if (requiresAccessRequest.value) {
    return t("pages.index.actions.requestAccessAria", { world: props.world.name });
  }

  return t("pages.index.actions.activateAria", { world: props.world.name });
});

const isPrimaryActionDisabled = computed(() => {
  if (props.isActive) {
    return true;
  }

  if (requiresAccessRequest.value) {
    return !canRequestAccess.value || isActivating.value;
  }

  return isActivating.value;
});

const ariaLabel = computed(() =>
  t("pages.index.cardAria", {
    name: props.world.name,
    visibility: visibilityLabel.value,
  }),
);

function showInfo(message: string) {
  alertPanel.push({
    type: "info",
    message,
  });
}

function showSuccess(message: string) {
  alertPanel.push({
    type: "success",
    message,
  });
}

function showError(message: string) {
  alertPanel.push({
    type: "error",
    message,
  });
}

async function handleActivate() {
  if (props.isActive) {
    return;
  }

  try {
    const membership = await membershipStore.activateWorld(props.world.id);

    if (membership.status === "active" || membership.isOwner) {
      emit("activate", props.world.id);
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error ?? t("pages.index.membership.requestError"));
    showError(message || t("pages.index.membership.requestError"));
  }
}

async function handleRequestAccess() {
  try {
    await membershipStore.activateWorld(props.world.id);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error ?? t("pages.index.membership.requestError"));
    showError(message || t("pages.index.membership.requestError"));
  }
}

async function handlePrimaryAction() {
  if (requiresAccessRequest.value) {
    if (!canRequestAccess.value) {
      return;
    }

    await handleRequestAccess();
    return;
  }

  await handleActivate();
}

async function handleEnter() {
  if (isEnterDisabled.value) {
    if (membershipStatus.value === "pending") {
      showInfo(t("pages.index.membership.pendingHelper"));
    } else if (membershipStatus.value === "denied") {
      showError(t("pages.index.membership.deniedHelper"));
    }

    return;
  }

  try {
    await membershipStore.enterWorld(props.world.id);
    await router.push(targetRoute.value);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error ?? t("pages.index.membership.enterError"));
    showError(message || t("pages.index.membership.enterError"));
  }
}

watch(
  () => membershipStatus.value,
  (next, previous) => {
    if (typeof previous === "undefined" || next === previous) {
      return;
    }

    if (next === "pending") {
      showInfo(t("pages.index.membership.pendingToast", { world: props.world.name }));
    } else if (next === "denied") {
      showError(t("pages.index.membership.deniedToast", { world: props.world.name }));
    } else if (next === "active" && previous !== "active") {
      showSuccess(t("pages.index.membership.approvedToast", { world: props.world.name }));
    }
  },
  { immediate: true },
);
</script>

<style scoped>
.world-explorer-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  height: 100%;
  border-radius: 1rem;
  padding: 1.25rem;
  transition:
    transform 0.28s ease,
    box-shadow 0.28s ease,
    border-color 0.28s ease;
  isolation: isolate;
}
.world-explorer-card::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.7;
}
.world-explorer-card:hover {
  transform: translateY(-4px);
}
.world-explorer-card:focus-within {
  outline: 0;
  box-shadow:
    0 0 0 2px color-mix(in oklab, hsl(var(--primary)) 25%, transparent),
    0 12px 32px -10px rgba(0, 0, 0, 0.5);
}

.world-explorer-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}
.world-explorer-card__heading {
  display: grid;
  gap: 0.5rem;
}
.world-explorer-card__visibility {
  align-self: flex-start;
  letter-spacing: 0.3px;
}

.world-explorer-card__title {
  line-height: 1.2;
  font-weight: 700;
  font-size: clamp(1.15rem, 0.6rem + 1.2vw, 1.35rem);
  margin: 0;
}
.world-explorer-card__badge {
  font-weight: 700;
  border-radius: 999px;
}

.world-explorer-card__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 0.75rem;
}

.world-explorer-card__actions {
  display: grid;
  gap: 0.6rem;
  margin-top: 0.25rem;
}
.world-explorer-card__action-wrapper {
  display: grid;
  gap: 0.35rem;
}
.world-explorer-card__action {
  text-transform: none;
  font-weight: 600;
  border-radius: 0.9rem;
}
.world-explorer-card__helper {
  margin: 0;
  font-size: 0.8rem;
  line-height: 1.4;
  color: color-mix(in oklab, hsl(var(--muted-foreground)), hsl(var(--foreground)) 25%);
}

.world-explorer-card__footer {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  color: color-mix(in oklab, hsl(var(--muted-foreground)), hsl(var(--foreground)) 35%);
}

.world-explorer-card__stat {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
  font-size: 0.85rem;
}
.world-explorer-card__stat-icon {
  width: 0.5rem;
  height: 1rem;
  opacity: 0.9;
}
.world-explorer-card__stat-text {
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
}

@media (prefers-reduced-motion: reduce) {
  .world-explorer-card {
    transition: none;
  }
  .world-explorer-card:hover {
    transform: none;
  }
}
</style>
