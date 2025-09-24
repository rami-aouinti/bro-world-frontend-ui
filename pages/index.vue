<template>
  <div
    class="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50"
  >
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div
        class="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-primary/10 blur-3xl"
      />
      <div
        class="absolute left-1/3 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-2xl"
      />
    </div>

    <div class="relative z-10">
      <section class="mx-auto max-w-4xl px-6 pb-16 pt-20 text-center md:pt-28">
        <span
          class="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary/80 ring-1 ring-inset ring-primary/30"
        >
          <span class="h-2 w-2 rounded-full bg-primary" />
          Blog
        </span>
        <h1 class="mt-6 text-4xl font-semibold tracking-tight text-white md:text-5xl">
          L'actualité de la communauté BroWorld
        </h1>
        <p class="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
          Explorez les dernières histoires, réactions et commentaires des membres de la communauté.
          Chaque post révèle une énergie différente, prenez le temps de les découvrir.
        </p>
      </section>

      <section class="mx-auto max-w-7xl px-6 pb-24">
        <div
          class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]"
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
              <article
                v-for="post in posts"
                :key="post.id"
                class="group relative overflow-hidden rounded-3xl border border-white/5 bg-white/10 backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:border-primary/50 hover:bg-white/15 hover:shadow-[0_25px_55px_-20px_hsl(var(--primary)/0.35)]"
              >
                <div
                  class="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-primary/15 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
                <div class="relative flex flex-col gap-8 p-8 sm:p-10">
                  <header class="flex flex-wrap items-center gap-6">
                    <div class="flex items-center gap-4">
                      <div
                        class="relative h-14 w-14 overflow-hidden rounded-2xl border border-white/20 bg-white/10"
                      >
                        <img
                          :src="post.user.photo ?? defaultAvatar"
                          :alt="`${post.user.firstName} ${post.user.lastName}`"
                          class="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div>
                        <p class="text-sm font-medium text-slate-200">
                          {{ post.user.firstName }} {{ post.user.lastName }}
                        </p>
                        <p class="text-xs text-slate-400">
                          Publié le {{ formatDateTime(post.publishedAt) }}
                        </p>
                      </div>
                    </div>
                    <div class="ms-auto flex flex-wrap gap-3 text-sm text-slate-200">
                      <span
                        class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1"
                      >
                        <span class="text-base">{{ reactionEmojis.like }}</span>
                        {{ formatNumber(post.reactions_count) }} réactions
                      </span>
                      <span
                        class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1"
                      >
                        <span class="text-base">💬</span>
                        {{ formatNumber(post.totalComments) }} commentaires
                      </span>
                    </div>
                  </header>

                  <div class="space-y-4">
                    <h2
                      class="text-3xl font-semibold leading-tight text-white transition-colors duration-300 group-hover:text-primary"
                    >
                      {{ post.title }}
                    </h2>
                    <p class="text-base text-slate-200/80">
                      {{ post.summary }}
                    </p>
                  </div>

                  <div
                    v-if="post.comments_preview.length"
                    class="rounded-2xl border border-white/10 bg-black/20 p-6"
                  >
                    <div class="flex items-center justify-between">
                      <p class="text-sm font-semibold uppercase tracking-wide text-slate-300">
                        Commentaires récents
                      </p>
                      <p class="text-xs text-slate-400">
                        {{ formatNumber(post.comments_preview.length) }} aperçus
                      </p>
                    </div>
                    <div class="mt-4 space-y-4">
                      <article
                        v-for="comment in post.comments_preview.slice(0, 4)"
                        :key="comment.id"
                        class="flex flex-col gap-3 rounded-2xl border border-white/5 bg-white/5 p-4"
                      >
                        <div class="flex items-center gap-3">
                          <div
                            class="h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-white/10"
                          >
                            <img
                              :src="comment.user.photo ?? defaultAvatar"
                              :alt="`${comment.user.firstName} ${comment.user.lastName}`"
                              class="h-full w-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <div>
                            <p class="text-sm font-medium text-slate-200">
                              {{ comment.user.firstName }} {{ comment.user.lastName }}
                            </p>
                            <p class="text-[11px] uppercase tracking-wide text-slate-400">
                              {{ formatDateTime(comment.publishedAt) }}
                            </p>
                          </div>
                        </div>
                        <p class="text-sm leading-relaxed text-slate-200/80">
                          {{ comment.content }}
                        </p>
                        <div
                          class="mt-auto flex items-center justify-between text-xs text-slate-400"
                        >
                          <span
                            class="inline-flex items-center gap-1 rounded-full bg-black/20 px-2 py-1"
                          >
                            <span class="text-base">{{ reactionEmojis.like }}</span>
                            {{ formatNumber(comment.reactions_count) }} réactions
                          </span>
                          <span
                            class="inline-flex items-center gap-1 rounded-full bg-black/10 px-2 py-1"
                          >
                            <span class="text-base">💬</span>
                            {{ formatNumber(comment.totalComments) }} réponses
                          </span>
                        </div>
                      </article>
                    </div>
                  </div>

                  <footer
                    v-if="post.reactions_preview.length"
                    class="flex flex-wrap items-center gap-3 text-sm"
                  >
                    <span class="text-xs uppercase tracking-wide text-slate-400"
                      >Réactions coup de cœur</span
                    >
                    <div class="flex flex-wrap gap-3">
                      <div
                        v-for="reaction in post.reactions_preview.slice(0, 4)"
                        :key="reaction.id"
                        class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-slate-200 shadow-sm"
                      >
                        <span class="text-lg">{{ reactionEmojis[reaction.type] }}</span>
                        <span class="text-sm font-medium">{{ reaction.user.firstName }}</span>
                        <span class="text-[11px] uppercase tracking-wide text-slate-400">{{
                          reactionLabels[reaction.type]
                        }}</span>
                      </div>
                    </div>
                  </footer>
                </div>
              </article>
            </template>
          </div>

          <LayoutRightSidebar class="hidden lg:flex" />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
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

const reactionLabels: Record<ReactionType, string> = {
  like: "Like",
  love: "Love",
  wow: "Wow",
  haha: "Haha",
  sad: "Sad",
  angry: "Angry",
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatNumber(value: number | null | undefined) {
  return new Intl.NumberFormat("fr-FR").format(value ?? 0);
}

const { posts, pending, fetchPosts } = usePostsStore();

await callOnce(() => fetchPosts());
</script>
