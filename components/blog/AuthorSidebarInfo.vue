<template>
  <SidebarCard
    class="author-sidebar-card text-card-foreground px-4 py-4"
    glow
  >
    <div class="author-sidebar-card__content">
      <v-avatar
        size="88"
        class="author-sidebar-card__avatar"
        color="primary"
        variant="tonal"
      >
        <NuxtImg
          :src="avatar"
          :alt="name"
          width="88"
          height="88"
          class="author-sidebar-card__avatar-image"
        />
      </v-avatar>

      <div class="author-sidebar-card__header">
        <h3 class="author-sidebar-card__title">
          {{ name }}
        </h3>
        <p class="author-sidebar-card__subtitle">
          {{ subtitle }}
        </p>
      </div>

      <dl class="author-sidebar-card__stats">
        <div class="author-sidebar-card__stat">
          <dt class="author-sidebar-card__stat-label">
            {{ postCountLabel }}
          </dt>
          <dd class="author-sidebar-card__stat-value">
            {{ resolvedPostCount }}
          </dd>
        </div>
        <div
          v-if="username"
          class="author-sidebar-card__stat"
        >
          <dt class="author-sidebar-card__stat-label">
            {{ usernameLabel }}
          </dt>
          <dd class="author-sidebar-card__stat-value">
            {{ resolvedUsername }}
          </dd>
        </div>
        <div
          v-if="email"
          class="author-sidebar-card__stat"
        >
          <dt class="author-sidebar-card__stat-label">
            {{ emailLabel }}
          </dt>
          <dd class="author-sidebar-card__stat-value author-sidebar-card__stat-value--email">
            {{ email }}
          </dd>
        </div>
      </dl>
    </div>
  </SidebarCard>
</template>

<script setup lang="ts">
import { computed } from "vue";

import SidebarCard from "~/components/layout/SidebarCard.vue";

const props = withDefaults(
  defineProps<{
    name: string;
    subtitle: string;
    avatar: string;
    username: string | null;
    email: string | null;
    postCount: number;
    postCountLabel: string;
    usernameLabel: string;
    emailLabel: string;
    formattedPostCount?: string;
  }>(),
  {
    username: null,
    email: null,
    formattedPostCount: "",
  },
);

const resolvedPostCount = computed(() => {
  const formatted = props.formattedPostCount?.trim();

  if (formatted) {
    return formatted;
  }

  return String(props.postCount);
});

const resolvedUsername = computed(() => {
  const value = props.username?.trim();

  if (!value) {
    return "";
  }

  return value.startsWith("@") ? value : `@${value}`;
});
</script>

<style scoped>
.author-sidebar-card {
  display: block;
}

.author-sidebar-card__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.author-sidebar-card__avatar {
  width: 88px;
  height: 88px;
}

.author-sidebar-card__avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.author-sidebar-card__header {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.author-sidebar-card__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.author-sidebar-card__subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.author-sidebar-card__stats {
  margin: 0;
  padding: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.author-sidebar-card__stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: 100%;
}

.author-sidebar-card__stat-label {
  margin: 0;
  font-size: 0.75rem;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.author-sidebar-card__stat-value {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  word-break: break-word;
}

.author-sidebar-card__stat-value--email {
  word-break: break-all;
}
</style>
