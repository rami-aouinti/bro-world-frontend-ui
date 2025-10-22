<template>
  <div
    class="home-feed-overlay"
    aria-hidden="true"
  >
    <div class="home-feed-overlay__stack">
      <NewPostSkeleton />
      <StoriesStripSkeleton />
    </div>
    <div class="home-feed-overlay__posts">
      <PostCardSkeleton
        v-for="index in 3"
        :key="`post-${index}`"
        :show-comment-skeleton="index === 1"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import NewPostSkeleton from "~/components/blog/NewPostSkeleton.vue";
import PostCardSkeleton from "~/components/blog/PostCardSkeleton.vue";
import StoriesStripSkeleton from "~/components/stories/StoriesStripSkeleton.vue";
</script>

<style scoped>
.home-feed-overlay {
  display: grid;
  gap: clamp(1.5rem, 4vw, 2.5rem);
  width: min(960px, 100%);
}

.home-feed-overlay__stack {
  display: grid;
  gap: clamp(1.25rem, 3vw, 1.75rem);
}

.home-feed-overlay__posts {
  display: grid;
  gap: clamp(1.5rem, 3vw, 2rem);
}
</style>
