<template>
  <SidebarCard
    class="text-card-foreground px-4 py-5"
    glow
    :intrinsic-height="INTRINSIC_HEIGHT"
  >
    <div class="flex flex-col gap-5">
      <header class="flex items-center gap-4">
        <v-avatar
          class="shadow-lg ring-2 ring-primary/20"
          size="64"
        >
          <v-img
            :src="avatarSrc"
            :alt="authorName"
            cover
          />
        </v-avatar>
        <div class="flex flex-col gap-1">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary/70">
            {{ t("blog.authors.title") }}
          </p>
          <h2 class="text-xl font-semibold text-foreground">
            {{ authorName }}
          </h2>
          <p
            v-if="authorUsername"
            class="text-sm text-muted-foreground"
          >
            @{{ authorUsername }}
          </p>
        </div>
      </header>

      <p class="text-sm leading-relaxed text-muted-foreground">
        {{ description }}
      </p>

      <dl class="flex flex-col gap-3 text-sm text-muted-foreground">
        <div
          v-if="authorEmail"
          class="flex items-center gap-3"
        >
          <div
            class="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary"
          >
            <v-icon
              icon="mdi:email-outline"
              size="20"
              aria-hidden="true"
            />
          </div>
          <div class="flex flex-col gap-1">
            <dt class="text-xs font-semibold uppercase tracking-[0.25em] text-primary/70">
              {{ emailLabel }}
            </dt>
            <dd class="text-sm text-muted-foreground break-all">
              {{ authorEmail }}
            </dd>
          </div>
        </div>
        <div
          v-if="authorUsername"
          class="flex items-center gap-3"
        >
          <div
            class="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary"
          >
            <v-icon
              icon="mdi:account-outline"
              size="20"
              aria-hidden="true"
            />
          </div>
          <div class="flex flex-col gap-1">
            <dt class="text-xs font-semibold uppercase tracking-[0.25em] text-primary/70">
              {{ usernameLabel }}
            </dt>
            <dd class="text-sm text-muted-foreground break-all">@{{ authorUsername }}</dd>
          </div>
        </div>
      </dl>

      <div class="flex flex-col gap-3">
        <v-btn
          v-if="authorLink"
          :to="authorLink"
          color="primary"
          variant="flat"
          class="text-none font-semibold"
          :aria-label="authorLinkAria"
        >
          {{ authorLinkLabel }}
        </v-btn>
        <NuxtLink
          v-if="worldFeedLink"
          :to="worldFeedLink"
          class="inline-flex w-fit items-center gap-2 text-sm font-medium text-primary transition hover:text-primary/80 focus-visible:underline"
        >
          {{ worldLinkLabel }}
          <v-icon
            icon="mdi:arrow-top-right"
            size="16"
            aria-hidden="true"
          />
        </NuxtLink>
      </div>
    </div>
  </SidebarCard>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useLocalePath } from "#imports";

import SidebarCard from "~/components/layout/SidebarCard.vue";
import type { BlogUser } from "~/lib/mock/blog";

const INTRINSIC_HEIGHT = 420;
const DEFAULT_AVATAR = "/images/avatars/avatar-default.svg";

const props = defineProps<{
  author: BlogUser;
  worldSlug?: string | null;
}>();

const { t } = useI18n();
const localePath = useLocalePath();

const authorName = computed(() => {
  const nameParts = [props.author.firstName, props.author.lastName].filter(Boolean) as string[];

  if (nameParts.length > 0) {
    return nameParts.join(" ");
  }

  return (
    props.author.username?.trim() || props.author.email?.trim() || t("blog.posts.detailHeading")
  );
});

const authorUsername = computed(() => props.author.username?.trim() || "");
const authorEmail = computed(() => props.author.email?.trim() || "");
const avatarSrc = computed(() => props.author.photo?.trim() || DEFAULT_AVATAR);

const description = computed(() => {
  const personalized = t("blog.authors.description", { name: authorName.value });

  if (typeof personalized === "string" && personalized.trim()) {
    return personalized;
  }

  return t("blog.authors.defaultDescription");
});

const emailLabel = computed(() => t("admin.userManagement.form.email"));
const usernameLabel = computed(() => t("admin.userManagement.form.username"));

const authorId = computed(() => props.author.id?.trim() || "");

const authorLink = computed(() => {
  const id = authorId.value;

  if (!id) {
    return null;
  }

  try {
    return localePath({ name: "blog-author-id", params: { id } });
  } catch (error) {
    if (import.meta.dev) {
      console.warn("[PostAuthorSidebarCard] Failed to resolve author link", error);
    }

    return `/blog/author/${encodeURIComponent(id)}`;
  }
});

const authorLinkLabel = computed(() =>
  t("blog.posts.actions.viewAuthorAria", { name: authorName.value }),
);
const authorLinkAria = computed(() => authorLinkLabel.value);

const normalizedWorldSlug = computed(() => props.worldSlug?.toString().trim() || "");

const worldFeedLink = computed(() => {
  const slug = normalizedWorldSlug.value;

  if (!slug) {
    return null;
  }

  try {
    return localePath(`/world/${encodeURIComponent(slug)}`);
  } catch (error) {
    if (import.meta.dev) {
      console.warn("[PostAuthorSidebarCard] Failed to resolve world feed link", error);
    }

    return `/world/${encodeURIComponent(slug)}`;
  }
});

const worldLinkLabel = computed(() => t("blog.posts.backToFeed"));
</script>

<style scoped>
@reference "~/assets/css/tailwind.css";
</style>
