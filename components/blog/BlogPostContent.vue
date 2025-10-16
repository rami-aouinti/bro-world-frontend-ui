<template>
  <section
    class="blog-post-content mx-auto w-full max-w-[590px] space-y-3 px-2 py-4"
    aria-label="Blog post content"
  >
    <h2
      v-if="normalizedTitle"
      class="text-xl font-semibold leading-tight text-foreground sm:text-2xl"
    >
      {{ normalizedTitle }}
    </h2>
    <p
      v-if="normalizedSummary"
      class="text-base leading-relaxed text-muted-foreground"
    >
      {{ normalizedSummary }}
    </p>
    <!-- eslint-disable vue/no-v-html -->
    <div
      v-if="safeHtml"
      class="prose prose-neutral dark:prose-invert max-w-none text-base text-foreground/90 [&>p]:leading-relaxed"
      v-html="safeHtml"
    />
    <!-- eslint-enable vue/no-v-html -->
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import DOMPurify from "dompurify";

const props = defineProps<{
  title?: string;
  summary?: string;
  content?: string;
}>();

function normalizeText(value?: string | null) {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : "";
}

function basicSanitize(value: string) {
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/on[a-z]+\s*=\s*"[^"]*"/gi, "")
    .replace(/on[a-z]+\s*=\s*'[^']*'/gi, "")
    .replace(/on[a-z]+\s*=\s*[^\s>]+/gi, "")
    .replace(/javascript:/gi, "");
}

const normalizedTitle = computed(() => normalizeText(props.title));
const normalizedSummary = computed(() => normalizeText(props.summary));
const rawHtml = computed(() => normalizeText(props.content));

const hasBrowserDom = typeof window !== "undefined" && typeof document !== "undefined";
const ALLOWED_TAGS = [
  // texte & inline
  "p",
  "div",
  "span",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "sub",
  "sup",
  "small",
  "mark",
  "abbr",
  "kbd",
  "code",
  "pre",
  "blockquote",
  "q",
  "cite",
  "time",
  "br",
  "hr",
  "wbr",
  // listes
  "ul",
  "ol",
  "li",
  "dl",
  "dt",
  "dd",
  // titres
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  // tableaux
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  "colgroup",
  "col",
  // médias
  "img",
  "picture",
  "source",
  "figure",
  "figcaption",
  "audio",
  "video",
  "track",
  // liens
  "a",
];

const ALLOWED_ATTR = [
  // global “raisonnables”
  "id",
  "class",
  "title",
  "lang",
  "dir",
  "tabindex",
  "role",
  "aria-label",
  "aria-hidden",
  "aria-describedby",
  // liens
  "href",
  "target",
  "rel",
  // images / sources
  "src",
  "srcset",
  "sizes",
  "alt",
  "width",
  "height",
  "loading",
  "decoding",
  "crossorigin",
  // media <audio>/<video>
  "controls",
  "autoplay",
  "loop",
  "muted",
  "playsinline",
  "poster",
  "preload",
  "controlsList",
  "type",
  // tableaux
  "colspan",
  "rowspan",
  "scope",
  // divers
  "datetime",
  "start",
  "value",
];

const domPurifySanitize = (() => {
  if (!hasBrowserDom) {
    return null;
  }

  if (typeof DOMPurify?.sanitize === "function") {
    return (value: string) =>
      DOMPurify.sanitize(value, {
        ALLOWED_TAGS,
        ALLOWED_ATTR,
      });
  }

  if (typeof DOMPurify === "function") {
    return (value: string) =>
      DOMPurify(value, {
        ALLOWED_TAGS,
        ALLOWED_ATTR,
      });
  }

  return null;
})();

const safeHtml = computed(() => {
  const value = rawHtml.value;

  if (!value) {
    return "";
  }

  const sanitized = domPurifySanitize ? domPurifySanitize(value) : basicSanitize(value);
  return sanitized.trim();
});
</script>

<style scoped></style>
