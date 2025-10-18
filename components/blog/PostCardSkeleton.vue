<template>
  <v-card
    class="post-skeleton"
    variant="tonal"
    elevation="6"
    rounded="xl"
    role="status"
    aria-live="polite"
    :aria-label="loadingLabel"
  >
    <PostMetaSkeleton class="mb-4" />
    <BlogPostContentSkeleton class="mb-6" />
    <BlogPostReactCardSkeleton />
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import BlogPostContentSkeleton from "./BlogPostContentSkeleton.vue";
import BlogPostReactCardSkeleton from "./BlogPostReactCardSkeleton.vue";
import PostMetaSkeleton from "./PostMetaSkeleton.vue";

const { t } = useI18n();
const loadingLabel = computed(() => t("blog.posts.loading"));
</script>

<style scoped>
.post-skeleton {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
}

</style>
