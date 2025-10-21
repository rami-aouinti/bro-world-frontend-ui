export function blogPostCardLoader() {
  return import("~/components/blog/BlogPostCard.vue");
}

const blogPostCardDependencyLoaders = [
  blogPostCardLoader,
  () => import("~/components/blog/BlogPostReactCard.vue"),
  () => import("~/components/blog/CommentSortMenu.vue"),
  () => import("~/components/blog/CommentThread.vue"),
  () => import("~/components/blog/BlogPostEditDialog.vue"),
  () => import("~/components/blog/BlogPostDeleteDialog.vue"),
  () => import("~/components/auth/LoginDialog.vue"),
  () => import("~/components/blog/PostShareDialog.vue"),
];

export async function prefetchBlogPostCard() {
  await Promise.all(blogPostCardDependencyLoaders.map((loader) => loader()));
}
