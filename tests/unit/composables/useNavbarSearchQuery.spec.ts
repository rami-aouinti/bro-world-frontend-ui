import { computed, ref } from "vue";
import { beforeEach, describe, expect, it } from "vitest";

import { filterPostsByQuery, useNavbarSearchQuery } from "~/composables/useNavbarSearch";
import type { BlogPost } from "~/lib/mock/blog";
import { __resetNuxtStateMocks } from "#imports";

describe("useNavbarSearchQuery", () => {
  const samplePosts: BlogPost[] = [
    {
      id: "post-1",
      title: "Welcome to the community",
      summary: "Say hello and introduce yourself to everyone.",
      body: "This is the first post in the feed.",
      author: {
        id: "author-1",
        name: "Alex",
        avatar: "/avatar-1.png",
      },
      publishedAt: "2024-05-01T12:00:00.000Z",
      reactions: [],
      comments: [],
      visibility: "public",
    },
    {
      id: "post-2",
      title: "Weekly update",
      summary: "Highlights from the latest release cycle.",
      body: "Detailed release notes and platform updates are available now.",
      author: {
        id: "author-2",
        name: "Taylor",
        avatar: "/avatar-2.png",
      },
      publishedAt: "2024-05-02T09:00:00.000Z",
      reactions: [],
      comments: [],
      visibility: "public",
    },
    {
      id: "post-3",
      title: "How to deploy",
      summary: "Step-by-step instructions for shipping new features.",
      body: "Follow these deployment guidelines to keep the feed healthy.",
      author: {
        id: "author-3",
        name: "Jordan",
        avatar: "/avatar-3.png",
      },
      publishedAt: "2024-05-03T10:00:00.000Z",
      reactions: [],
      comments: [],
      visibility: "public",
    },
  ];

  beforeEach(() => {
    __resetNuxtStateMocks();
  });

  it("filters posts by the shared navbar search query and restores results when cleared", () => {
    const posts = ref<BlogPost[]>(samplePosts);
    const { query } = useNavbarSearchQuery({ context: "posts" });
    const filtered = computed(() => filterPostsByQuery(posts.value, query.value));

    expect(filtered.value.map((post) => post.id)).toEqual(["post-1", "post-2", "post-3"]);

    query.value = "update";
    expect(filtered.value.map((post) => post.id)).toEqual(["post-2"]);

    query.value = "nonexistent";
    expect(filtered.value).toHaveLength(0);

    query.value = "";
    expect(filtered.value.map((post) => post.id)).toEqual(["post-1", "post-2", "post-3"]);
  });
});
