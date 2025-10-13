<template>
  <div
    ref="cardRef"
    :class="[
      'relative w-full max-w-[40rem] overflow-hidden rounded-lg border border-white/[0.08] bg-[#1d1c20] p-4 md:p-8 sm:p-6',
      props.class,
    ]"
    @mouseenter="mouseEnterHandler"
    @mouseleave="mouseLeaveHandler"
    @mousemove="mouseMoveHandler"
    @touchstart="mouseEnterHandler"
    @touchend="mouseLeaveHandler"
    @touchmove="touchMoveHandler"
  >
    <slot name="header"></slot>
    <div class="relative flex h-40 items-center overflow-hidden">
      <div
        :style="{
          width: '100%',
          opacity: widthPercentage > 0 ? 1 : 0,
          clipPath: `inset(0 ${100 - widthPercentage}% 0 0)`,
          transition: isMouseOver ? 'none' : 'all 0.4s ease-out',
        }"
        class="absolute z-20 bg-[#1d1c20] will-change-transform"
      >
        <slot name="text" />
      </div>

      <div
        :style="{
          left: `${widthPercentage}%`,
          transform: `rotate(${rotateDeg}deg)`,
          opacity: widthPercentage > 0 ? 1 : 0,
          transition: isMouseOver ? 'none' : 'all 0.4s ease-out',
        }"
        class="absolute z-50 h-40 w-[8px] bg-gradient-to-b from-transparent via-neutral-800 to-transparent will-change-transform"
      ></div>

      <div
        class="overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,white,transparent)]"
      >
        <slot name="revealText"></slot>

        <TextRevealStars
          :stars-count="starsCount"
          :class="starsClass"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEventListener, useResizeObserver } from "@vueuse/core";
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from "vue";
import type { HTMLAttributes } from "vue";

interface Props {
  class?: HTMLAttributes["class"];
  starsCount?: number;
  starsClass?: HTMLAttributes["class"];
}
const props = withDefaults(defineProps<Props>(), {
  starsCount: 130,
});

const cardRef = ref<HTMLElement | null>(null);
const widthPercentage = ref(0);
const isMouseOver = ref(false);
const cardRect = shallowRef<DOMRectReadOnly | null>(null);

let measureRaf: number | null = null;

function measureCardRect() {
  if (!cardRef.value) {
    cardRect.value = null;
    return;
  }

  cardRect.value = cardRef.value.getBoundingClientRect();
}

function scheduleMeasure() {
  if (measureRaf !== null) return;

  measureRaf = requestAnimationFrame(() => {
    measureRaf = null;
    measureCardRect();
  });
}

const rotateDeg = computed(() => (widthPercentage.value - 50) * 0.1);

onMounted(() => {
  scheduleMeasure();
});

onBeforeUnmount(() => {
  if (measureRaf !== null) {
    cancelAnimationFrame(measureRaf);
    measureRaf = null;
  }
});

if (import.meta.client) {
  useEventListener(window, "resize", scheduleMeasure, { passive: true });
  useEventListener(window, "scroll", scheduleMeasure, { passive: true });
  useResizeObserver(cardRef, () => {
    scheduleMeasure();
  });
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function updateWidthFromClientX(clientX: number | null | undefined) {
  if (clientX == null) return;

  const rect = cardRect.value;
  if (!rect || rect.width === 0) {
    scheduleMeasure();
    return;
  }

  const relativeX = clientX - rect.left;
  widthPercentage.value = clamp((relativeX / rect.width) * 100, 0, 100);
}

function mouseMoveHandler(event: MouseEvent) {
  event.preventDefault();
  updateWidthFromClientX(event.clientX);
}

function mouseLeaveHandler() {
  isMouseOver.value = false;
  setTimeout(() => {
    if (!isMouseOver.value) {
      widthPercentage.value = 0;
    }
  }, 100);
}

function mouseEnterHandler() {
  isMouseOver.value = true;
  scheduleMeasure();
}

function touchMoveHandler(event: TouchEvent) {
  event.preventDefault();
  const touch = event.touches[0];
  if (!touch) return;

  updateWidthFromClientX(touch.clientX);
}
</script>
