import type { DirectiveBinding, ObjectDirective } from "vue";

type SafeHtmlBinding = string | null | undefined;

function normalizeHtmlValue(value: SafeHtmlBinding): string {
  if (typeof value === "string") {
    return value;
  }

  if (value == null) {
    return "";
  }

  return String(value);
}

function applyHtml(el: HTMLElement, value: SafeHtmlBinding) {
  el.innerHTML = normalizeHtmlValue(value);
}

const safeHtmlDirective: ObjectDirective<HTMLElement, SafeHtmlBinding> = {
  beforeMount(el, binding) {
    applyHtml(el, binding.value);
  },
  updated(el, binding) {
    if (binding.value !== binding.oldValue) {
      applyHtml(el, binding.value);
    }
  },
  getSSRProps(binding: DirectiveBinding<SafeHtmlBinding>) {
    return {
      innerHTML: normalizeHtmlValue(binding.value),
    };
  },
};

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive("safe-html", safeHtmlDirective);
});
