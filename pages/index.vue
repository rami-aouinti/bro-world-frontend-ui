<template>
  <div class="relative min-h-screen overflow-hidden bg-transparent text-slate-50">
    <div class="relative z-10">
      <section class="mx-auto max-w-7xl px-6 pb-24">
        <div
          class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px]"
        >
          <div class="space-y-10">
            <div
              v-if="pending"
              class="grid gap-8 md:grid-cols-2"
            >
              <div
                v-for="index in 4"
                :key="index"
                class="flex flex-col gap-6 rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-xl"
              >
                <div class="flex items-center gap-4">
                  <div class="h-14 w-14 rounded-2xl bg-white/10" />
                  <div class="space-y-3">
                    <div class="h-3 w-32 rounded-full bg-white/10" />
                    <div class="h-3 w-24 rounded-full bg-white/10" />
                  </div>
                </div>
                <div class="space-y-3">
                  <div class="h-3 w-3/4 rounded-full bg-white/10" />
                  <div class="h-3 w-2/3 rounded-full bg-white/10" />
                  <div class="h-3 w-full rounded-full bg-white/10" />
                </div>
                <div class="mt-auto flex gap-3">
                  <div class="h-7 w-28 rounded-full bg-white/5" />
                  <div class="h-7 w-28 rounded-full bg-white/5" />
                </div>
              </div>
            </div>

            <template v-else>
              <PostCard
                v-for="post in posts"
                :key="post.id"
                :post="post"
                :default-avatar="defaultAvatar"
                :reaction-emojis="reactionEmojis"
                :reaction-labels="reactionLabels"
              />
            </template>
          </div>

          <LayoutRightSidebar />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { callOnce } from "#imports";
import { usePostsStore } from "~/composables/usePostsStore";
import type { ReactionType } from "~/lib/mock/blog";

const defaultAvatar = "https://bro-world-space.com/img/person.png";

const reactionEmojis: Record<ReactionType, string> = {
  like: "👍",
  love: "❤️",
  wow: "😮",
  haha: "😂",
  sad: "😢",
  angry: "😡",
};

const { t } = useI18n();

const reactionLabels = computed<Record<ReactionType, string>>(() => ({
  like: t("blog.reactions.reactionTypes.like"),
  love: t("blog.reactions.reactionTypes.love"),
  wow: t("blog.reactions.reactionTypes.wow"),
  haha: t("blog.reactions.reactionTypes.haha"),
  sad: t("blog.reactions.reactionTypes.sad"),
  angry: t("blog.reactions.reactionTypes.angry"),
}));

const { posts, pending, fetchPosts } = usePostsStore();

await callOnce(() => fetchPosts());
</script>
