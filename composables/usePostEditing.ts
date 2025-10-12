import { nextTick, reactive, ref, type Ref, watch } from "vue";

import { useNuxtApp } from "#app";
import { useI18n } from "#imports";

import { usePostsStore } from "~/composables/usePostsStore";
import type { BlogPost } from "~/lib/mock/blog";

interface EditFormState {
  title: string;
  summary: string;
  content: string;
}

export function usePostEditing(postSource: Ref<BlogPost | null | undefined> | Ref<BlogPost>) {
  const post = postSource as Ref<BlogPost | null | undefined>;
  const { t } = useI18n();
  const { $notify } = useNuxtApp();
  const { updatePost, deletePost } = usePostsStore();

  const editForm = reactive<EditFormState>({
    title: "",
    summary: "",
    content: "",
  });

  const saveLoading = ref(false);
  const deleteLoading = ref(false);

  function resolvePost(): BlogPost | null {
    const current = post.value ?? null;

    if (current && typeof current === "object") {
      return current as BlogPost;
    }

    return null;
  }

  function syncFormFromPost() {
    const currentPost = resolvePost();

    if (!currentPost) {
      editForm.title = "";
      editForm.summary = "";
      editForm.content = "";
      return;
    }

    editForm.title = currentPost.title ?? "";
    editForm.summary = currentPost.summary ?? "";
    editForm.content = currentPost.content ?? "";
  }

  watch(
    () => post.value,
    () => {
      if (!saveLoading.value) {
        syncFormFromPost();
      }
    },
    { immediate: true, deep: true },
  );

  async function handleSaveEdit() {
    if (saveLoading.value) {
      return false;
    }

    const currentPost = resolvePost();

    if (!currentPost?.id) {
      return false;
    }

    saveLoading.value = true;

    try {
      const payload = {
        title: editForm.title,
        summary: editForm.summary,
        content: editForm.content,
      };

      await updatePost(currentPost.id, payload);

      $notify({
        type: "success",
        title: t("blog.posts.actions.editSuccessTitle"),
        message: t("blog.posts.actions.editSuccessDescription"),
      });

      await nextTick();
      syncFormFromPost();

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error ?? "");

      $notify({
        type: "error",
        title: t("blog.posts.actions.editErrorTitle"),
        message: message || t("blog.posts.actions.editErrorDescription"),
        timeout: null,
      });

      return false;
    } finally {
      saveLoading.value = false;
    }
  }

  async function handleDeletePost() {
    if (deleteLoading.value) {
      return false;
    }

    const currentPost = resolvePost();

    if (!currentPost?.id) {
      return false;
    }

    deleteLoading.value = true;

    try {
      await deletePost(currentPost.id);

      $notify({
        type: "success",
        title: t("blog.posts.actions.deleteSuccessTitle"),
        message: t("blog.posts.actions.deleteSuccessDescription"),
      });

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error ?? "");

      $notify({
        type: "error",
        title: t("blog.posts.actions.deleteErrorTitle"),
        message: message || t("blog.posts.actions.deleteErrorDescription"),
        timeout: null,
      });

      return false;
    } finally {
      deleteLoading.value = false;
    }
  }

  return {
    editForm,
    saveLoading,
    deleteLoading,
    syncFormFromPost,
    handleSaveEdit,
    handleDeletePost,
  };
}
