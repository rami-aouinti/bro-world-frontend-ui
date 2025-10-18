<template>
  <div class="help-article">
    <aside v-if="tocItems.length" class="help-article__toc" aria-label="toc">
      <h2 class="text-subtitle-1 font-weight-semibold mb-3">{{ tocTitle }}</h2>
      <nav>
        <ul>
          <li v-for="item in tocItems" :key="item.id" :class="[`level-${item.level}`]">
            <a :href="`#${item.id}`" class="help-article__toc-link">{{ item.text }}</a>
          </li>
        </ul>
      </nav>
    </aside>
    <article ref="contentRef" class="help-article__content" v-html="safeHtml"></article>
    <div class="visually-hidden" aria-live="polite">
      <span v-if="recentlyCopied">{{ copiedLabel }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import DOMPurify from "dompurify";

const props = defineProps<{
  content: string;
  tocTitle: string;
  copyLabel: string;
  copiedLabel: string;
}>();

interface TocItem {
  id: string;
  text: string;
  level: number;
}

const contentRef = ref<HTMLElement | null>(null);
const tocItems = ref<TocItem[]>([]);
const recentlyCopied = ref<string | null>(null);

const allowedTags = [
  "p",
  "div",
  "span",
  "strong",
  "em",
  "b",
  "i",
  "ul",
  "ol",
  "li",
  "blockquote",
  "code",
  "pre",
  "a",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "img",
  "figure",
  "figcaption",
];

const allowedAttributes = [
  "href",
  "target",
  "rel",
  "id",
  "class",
  "title",
  "alt",
  "src",
  "width",
  "height",
  "loading",
  "aria-label",
  "aria-hidden",
  "role",
];

const domPurifySanitize = (() => {
  if (typeof DOMPurify?.sanitize === "function") {
    return (value: string) =>
      DOMPurify.sanitize(value, {
        ALLOWED_TAGS: allowedTags,
        ALLOWED_ATTR: allowedAttributes,
      });
  }

  if (typeof DOMPurify === "function") {
    return (value: string) =>
      DOMPurify(value, {
        ALLOWED_TAGS: allowedTags,
        ALLOWED_ATTR: allowedAttributes,
      });
  }

  return (value: string) => value;
})();

const safeHtml = computed(() => domPurifySanitize(props.content ?? ""));

function generateSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/(^-|-$)+/g, "");
}

function enhanceHeadings() {
  const container = contentRef.value;
  if (!container) {
    return;
  }

  const headings = Array.from(container.querySelectorAll<HTMLElement>("h2, h3"));
  const items: TocItem[] = headings.map((heading) => {
    if (!heading.id) {
      heading.id = generateSlug(heading.textContent ?? "heading");
    }

    heading.classList.add("help-article__heading");

    let button = heading.querySelector<HTMLButtonElement>("button[data-copy-anchor]");
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.dataset.copyAnchor = "true";
      button.className = "help-article__anchor";
      button.setAttribute("aria-label", props.copyLabel);
      button.innerHTML = "<span aria-hidden=\"true\">#</span>";
      button.addEventListener("click", () => handleCopy(heading.id));
      heading.appendChild(button);
    } else {
      button.setAttribute("aria-label", props.copyLabel);
    }

    return {
      id: heading.id,
      text: heading.textContent?.replace(/[#]+$/g, "").trim() ?? "",
      level: heading.tagName.toLowerCase() === "h3" ? 3 : 2,
    };
  });

  tocItems.value = items;
  updateHeadingButtons();
}

async function handleCopy(id: string) {
  const url = new URL(window.location.href);
  url.hash = id;

  try {
    await navigator.clipboard.writeText(url.toString());
    recentlyCopied.value = id;
    updateHeadingButtons(id);
    window.setTimeout(() => {
      recentlyCopied.value = null;
      updateHeadingButtons();
    }, 1800);
  } catch {
    recentlyCopied.value = null;
  }
}

function updateHeadingButtons(activeId?: string | null) {
  const container = contentRef.value;
  if (!container) {
    return;
  }

  const buttons = container.querySelectorAll<HTMLButtonElement>("button[data-copy-anchor]");
  buttons.forEach((button) => {
    const parentHeading = button.parentElement as HTMLElement | null;
    const headingId = parentHeading?.id ?? "";

    if (activeId && headingId === activeId) {
      button.setAttribute("aria-label", props.copiedLabel);
      button.classList.add("is-copied");
    } else {
      button.setAttribute("aria-label", props.copyLabel);
      button.classList.remove("is-copied");
    }
  });
}

onMounted(async () => {
  await nextTick();
  enhanceHeadings();
});

watch(
  () => safeHtml.value,
  async () => {
    await nextTick();
    enhanceHeadings();
  },
);
</script>

<style scoped>
.help-article {
  display: grid;
  gap: 2.5rem;
}

@media (min-width: 992px) {
  .help-article {
    grid-template-columns: 280px 1fr;
    align-items: flex-start;
  }
}

.help-article__toc {
  position: sticky;
  top: 120px;
  background: rgba(15, 23, 42, 0.03);
  border-radius: 18px;
  padding: 1.25rem 1.5rem;
}

.help-article__toc ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.help-article__toc li + li {
  margin-top: 0.5rem;
}

.help-article__toc li.level-3 {
  margin-inline-start: 1rem;
}

.help-article__toc-link {
  color: rgba(15, 23, 42, 0.8);
  text-decoration: none;
  font-size: 0.95rem;
}

.help-article__toc-link:hover,
.help-article__toc-link:focus-visible {
  text-decoration: underline;
}

.help-article__content :deep(img) {
  max-width: 100%;
  border-radius: 12px;
}

.help-article__heading {
  position: relative;
}

.help-article__anchor {
  background: none;
  border: none;
  color: rgba(82, 67, 255, 0.9);
  cursor: pointer;
  font-size: 0.85rem;
  margin-inline-start: 0.5rem;
}

.help-article__anchor:hover,
.help-article__anchor:focus-visible {
  text-decoration: underline;
}

.help-article__anchor.is-copied {
  color: rgba(22, 163, 74, 0.9);
}

.visually-hidden {
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
}
</style>
