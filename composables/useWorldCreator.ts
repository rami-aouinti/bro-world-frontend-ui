import { ref } from "vue";
import { resolveApiFetcher } from "~/lib/api/fetcher";
import type { CreateWorldRequestPayload } from "~/types/world";

export function useWorldCreator() {
  const api = resolveApiFetcher();
  const isSubmitting = ref(false);
  const lastError = ref<unknown>(null);

  async function submitWorld(payload: CreateWorldRequestPayload) {
    isSubmitting.value = true;
    lastError.value = null;

    try {
      return await api("/worlds", {
        method: "POST",
        data: payload,
      });
    } catch (error) {
      lastError.value = error;
      throw error;
    } finally {
      isSubmitting.value = false;
    }
  }

  return {
    submitWorld,
    isSubmitting,
    lastError,
  };
}
