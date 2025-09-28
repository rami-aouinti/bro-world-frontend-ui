<template>
  <main aria-labelledby="blog-heading">

    <NewPost
        v-if="isAuthenticated"
        :avatar="user.avatarUrl"
        :user-name="user.name"
        @submit="createPost"
        @attach="onAttach"
    />

    <div v-if="pending" class="grid gap-4">
      <PostCardSkeleton v-for="index in 4" :key="index" />
    </div>

    <template v-else>

      <div class="flex flex-col gap-4">
        <BlogPostCard
            v-for="post in posts"
            :key="post.id"
            :post="post"
            :default-avatar="defaultAvatar"
            :reaction-emojis="reactionEmojis"
            :reaction-labels="reactionLabels"
        />
      </div>
    </template>
  </main>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { callOnce } from "#imports";
import { usePostsStore } from "~/composables/usePostsStore";
import { useAuthStore } from "~/composables/useAuthStore";
import type { ReactionType } from "~/lib/mock/blog";
import PostCardSkeleton from "~/components/blog/PostCardSkeleton.vue";

definePageMeta({
  showRightWidgets: true,
});

const defaultAvatar = "https://bro-world-space.com/img/person.png";
const { isAuthenticated } = useAuthStore();
const user = {
  name: 'Rami Aouinti',
  avatarUrl: 'https://bro-world-space.com/img/person.png',
}

function onAttach(type: string) {
  // Ouvre sélecteur média / GIF / etc.
}
const reactionEmojis: Record<ReactionType, string> = {
  like: "👍",
  love: "❤️",
  wow: "😮",
  haha: "😂",
  sad: "😢",
  angry: "😡",
  dislike: "👎",
};

const { t } = useI18n();

const reactionLabels = computed<Record<ReactionType, string>>(() => ({
  like: t("blog.reactions.reactionTypes.like"),
  love: t("blog.reactions.reactionTypes.love"),
  wow: t("blog.reactions.reactionTypes.wow"),
  haha: t("blog.reactions.reactionTypes.haha"),
  sad: t("blog.reactions.reactionTypes.sad"),
  angry: t("blog.reactions.reactionTypes.angry"),
  dislike: t("blog.reactions.reactionTypes.dislike"),
}));

const { posts, pending, fetchPosts, createPost } = usePostsStore();

await callOnce(() => fetchPosts());
</script>
