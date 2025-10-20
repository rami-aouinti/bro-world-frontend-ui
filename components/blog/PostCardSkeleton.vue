<template>
  <SidebarCard
    class="post-skeleton text-card-foreground px-3 py-3"
    glow
    role="status"
    aria-live="polite"
    :aria-label="loadingLabel"
  >
    <PostMetaSkeleton class="mb-4" />
    <BlogPostContentSkeleton class="mb-6" />
    <BlogPostReactCardSkeleton />
    <div
      v-if="showComments"
      class="post-skeleton__comments"
    >
      <div class="post-skeleton__comments-header">
        <v-skeleton-loader
          class="post-skeleton__sort"
          type="chip"
          width="140"
          height="36"
        />
      </div>
      <CommentThreadSkeleton
        class="post-skeleton__comment-thread"
        :show-composer="showComposer"
      />
    </div>
  </SidebarCard>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import BlogPostContentSkeleton from "./BlogPostContentSkeleton.vue";
import BlogPostReactCardSkeleton from "./BlogPostReactCardSkeleton.vue";
import CommentThreadSkeleton from "./CommentThreadSkeleton.vue";
import PostMetaSkeleton from "./PostMetaSkeleton.vue";
import SidebarCard from "~/components/layout/SidebarCard.vue";

const { t } = useI18n();
const props = withDefaults(
  defineProps<{
    showCommentSkeleton?: boolean;
    showComposer?: boolean;
  }>(),
  {
    showCommentSkeleton: false,
    showComposer: false,
  },
);

const loadingLabel = computed(() => t("blog.posts.loading"));
const showComments = computed(() => props.showCommentSkeleton);
const showComposer = computed(() => showComments.value && props.showComposer);
</script>

<style scoped>
.post-skeleton {
  display: flex;
  flex-direction: column;
}

.post-skeleton__comments {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 0.5rem;
}

.post-skeleton__comments-header {
  display: flex;
  justify-content: flex-end;
}

.post-skeleton__sort {
  border-radius: 9999px;
}
</style>
