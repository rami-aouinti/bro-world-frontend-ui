<template>
  <section class="space-y-2 py-4 my-3 px-2 w-full mx-auto">
    <h4 class="text font-semibold leading-tight text-foreground mx-auto">
      {{ props.title }}
    </h4>
    <p
      v-if="props.summary"
      class="text-base leading-relaxed text-slate-500 mx-2 mx-auto"
    >
      {{ props.summary }}
    </p>
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

  return (value: string) => value;
})();

const safeHtml = computed(() => domPurifySanitize(props.content ?? ""));
</script>

<style scoped></style>
