<template>
  <div
    ref="canvasContainerRef"
    :class="$props.class"
    aria-hidden="true"
  >
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { useMouse, useDevicePixelRatio } from "@vueuse/core";
import {
  ref,
  onMounted,
  onBeforeUnmount,
  watch,
  computed,
  reactive,
  type WatchStopHandle,
} from "vue";

type Circle = {
  x: number;
  y: number;
  translateX: number;
  translateY: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  dx: number;
  dy: number;
  magnetism: number;
};

type Props = {
  color?: string;
  quantity?: number;
  staticity?: number;
  ease?: number;
  class?: string;
  autoStart?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  color: "#FFF",
  quantity: 100,
  staticity: 50,
  ease: 50,
  class: "",
  autoStart: false,
});

const canvasRef = ref<HTMLCanvasElement | null>(null);
const canvasContainerRef = ref<HTMLDivElement | null>(null);
const context = ref<CanvasRenderingContext2D | null>(null);
let circles: Circle[] = [];
const mouse = reactive<{ x: number; y: number }>({ x: 0, y: 0 });
const canvasSize = reactive<{ w: number; h: number }>({ w: 0, h: 0 });
const canvasRect = ref<DOMRect | null>(null);
let animationFrameId: number | null = null;
const { x: mouseX, y: mouseY } = useMouse();
const { pixelRatio } = useDevicePixelRatio();
const isAnimating = ref(false);
const startRequested = ref(false);
const prefersReducedMotion = ref(false);
let stopMouseWatch: WatchStopHandle | null = null;
let resizeListenerActive = false;
let motionMediaQuery: MediaQueryList | null = null;
let idleCallbackId: number | null = null;
let startTimeoutId: ReturnType<typeof setTimeout> | null = null;

const color = computed(() => {
  // Remove the leading '#' if it's present
  let hex = props.color.replace(/^#/, "");

  // If the hex code is 3 characters, expand it to 6 characters
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  // Parse the r, g, b values from the hex string
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255; // Extract the red component
  const g = (bigint >> 8) & 255; // Extract the green component
  const b = bigint & 255; // Extract the blue component

  // Return the RGB values as a string separated by spaces
  return `${r} ${g} ${b}`;
});

const rgbaColor = computed(() => color.value.split(" ").join(", "));

function cleanupMouseWatch() {
  if (stopMouseWatch) {
    stopMouseWatch();
    stopMouseWatch = null;
  }
}

function enableMouseTracking() {
  if (stopMouseWatch) {
    return;
  }

  stopMouseWatch = watch([mouseX, mouseY], () => {
    onMouseMove();
  });
}

function addResizeListener() {
  if (resizeListenerActive) {
    return;
  }

  window.addEventListener("resize", initCanvas, { passive: true });
  resizeListenerActive = true;
}

function removeResizeListener() {
  if (!resizeListenerActive) {
    return;
  }

  window.removeEventListener("resize", initCanvas);
  resizeListenerActive = false;
}

type IdleDeadline = {
  didTimeout: boolean;
  timeRemaining: () => number;
};

type IdleCallback = (deadline: IdleDeadline) => void;

type IdleOptions = { timeout?: number };

type IdleScheduler = (callback: IdleCallback, options?: IdleOptions) => number;

type IdleWindow = Window & {
  requestIdleCallback?: IdleScheduler;
  cancelIdleCallback?: (handle: number) => void;
};

function cancelScheduledStart() {
  if (!import.meta.client) {
    idleCallbackId = null;
    startTimeoutId = null;
    return;
  }

  const idleWindow = window as IdleWindow;

  if (idleCallbackId !== null && typeof idleWindow.cancelIdleCallback === "function") {
    idleWindow.cancelIdleCallback(idleCallbackId);
  }

  if (startTimeoutId !== null) {
    window.clearTimeout(startTimeoutId);
  }

  idleCallbackId = null;
  startTimeoutId = null;
}

function stopAnimation() {
  if (!import.meta.client) {
    isAnimating.value = false;
    cleanupMouseWatch();
    removeResizeListener();
    circles.length = 0;
    clearContext();
    return;
  }

  if (!isAnimating.value) {
    return;
  }

  isAnimating.value = false;

  if (animationFrameId !== null) {
    window.cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  cleanupMouseWatch();
  removeResizeListener();
  circles.length = 0;
  clearContext();
}

function startAnimation() {
  if (!startRequested.value || prefersReducedMotion.value) {
    return;
  }

  if (isAnimating.value) {
    return;
  }

  if (!canvasRef.value) {
    return;
  }

  if (!context.value) {
    context.value = canvasRef.value.getContext("2d");
  }

  initCanvas();
  enableMouseTracking();
  addResizeListener();
  isAnimating.value = true;
  animationFrameId = window.requestAnimationFrame(animate);
}

function scheduleStart() {
  if (!import.meta.client || !startRequested.value || prefersReducedMotion.value) {
    return;
  }

  if (isAnimating.value) {
    return;
  }

  cancelScheduledStart();

  const idleWindow = window as IdleWindow;

  function begin() {
    cancelScheduledStart();
    startAnimation();
  }

  if (typeof idleWindow.requestIdleCallback === "function") {
    idleCallbackId = idleWindow.requestIdleCallback(() => begin(), { timeout: 1500 });
    return;
  }

  startTimeoutId = window.setTimeout(begin, 240);
}

function handleReducedMotionChange(event: MediaQueryListEvent) {
  prefersReducedMotion.value = event.matches;

  if (prefersReducedMotion.value) {
    cancelScheduledStart();
    stopAnimation();
    return;
  }

  if (startRequested.value) {
    scheduleStart();
  }
}

onMounted(() => {
  if (!import.meta.client) {
    return;
  }

  motionMediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  prefersReducedMotion.value = motionMediaQuery.matches;

  if (props.autoStart && !prefersReducedMotion.value) {
    start();
  } else if (props.autoStart) {
    startRequested.value = true;
  }

  motionMediaQuery.addEventListener("change", handleReducedMotionChange);
});

onBeforeUnmount(() => {
  cancelScheduledStart();
  stopAnimation();

  if (motionMediaQuery) {
    motionMediaQuery.removeEventListener("change", handleReducedMotionChange);
    motionMediaQuery = null;
  }
});

if (import.meta.client) {
  watch(
    () => props.autoStart,
    (value) => {
      if (value) {
        start();
      } else {
        stop();
      }
    },
  );
}

function start() {
  startRequested.value = true;

  if (!import.meta.client || prefersReducedMotion.value) {
    return;
  }

  if (isAnimating.value) {
    return;
  }

  scheduleStart();
}

function stop() {
  startRequested.value = false;

  cancelScheduledStart();
  stopAnimation();
}

defineExpose({
  start,
  stop,
});

function initCanvas() {
  resizeCanvas();
  drawParticles();
}

function onMouseMove() {
  if (canvasRect.value) {
    const { w, h } = canvasSize;
    const x = mouseX.value - canvasRect.value.left - w / 2;
    const y = mouseY.value - canvasRect.value.top - h / 2;

    const inside = x < w / 2 && x > -w / 2 && y < h / 2 && y > -h / 2;
    if (inside) {
      mouse.x = x;
      mouse.y = y;
    }
  }
}

function resizeCanvas() {
  if (canvasContainerRef.value && canvasRef.value) {
    if (!context.value) {
      context.value = canvasRef.value.getContext("2d");
    }

    circles.length = 0;
    canvasSize.w = canvasContainerRef.value.offsetWidth;
    canvasSize.h = canvasContainerRef.value.offsetHeight;
    canvasRef.value.width = canvasSize.w * pixelRatio.value;
    canvasRef.value.height = canvasSize.h * pixelRatio.value;
    canvasRef.value.style.width = canvasSize.w + "px";
    canvasRef.value.style.height = canvasSize.h + "px";
    context.value?.setTransform(pixelRatio.value, 0, 0, pixelRatio.value, 0, 0);
    canvasRect.value = canvasRef.value.getBoundingClientRect();
  }
}

function circleParams(): Circle {
  const x = Math.floor(Math.random() * canvasSize.w);
  const y = Math.floor(Math.random() * canvasSize.h);
  const translateX = 0;
  const translateY = 0;
  const size = Math.floor(Math.random() * 2) + 1;
  const alpha = 0;
  const targetAlpha = parseFloat((Math.random() * 0.6 + 0.1).toFixed(1));
  const dx = (Math.random() - 0.5) * 0.2;
  const dy = (Math.random() - 0.5) * 0.2;
  const magnetism = 0.1 + Math.random() * 4;
  return {
    x,
    y,
    translateX,
    translateY,
    size,
    alpha,
    targetAlpha,
    dx,
    dy,
    magnetism,
  };
}

function drawCircle(circle: Circle, update = false) {
  if (!context.value) {
    return;
  }

  const { x, y, translateX, translateY, size, alpha } = circle;
  const drawX = x + translateX;
  const drawY = y + translateY;

  context.value.beginPath();
  context.value.arc(drawX, drawY, size, 0, 2 * Math.PI);
  context.value.fillStyle = `rgba(${rgbaColor.value}, ${alpha})`;
  context.value.fill();

  if (!update) {
    circles.push(circle);
  }
}

function clearContext() {
  if (!context.value) {
    return;
  }

  context.value.clearRect(0, 0, canvasSize.w, canvasSize.h);
}

function drawParticles() {
  clearContext();
  const width = canvasSize.w;
  let density = 1;

  if (width > 0 && width < 420) {
    density = 0.45;
  } else if (width < 768) {
    density = 0.7;
  } else if (width < 1280) {
    density = 0.85;
  }

  const particleCount = Math.max(8, Math.round(props.quantity * density));
  for (let i = 0; i < particleCount; i++) {
    const circle = circleParams();
    drawCircle(circle);
  }
}

function remapValue(
  value: number,
  start1: number,
  end1: number,
  start2: number,
  end2: number,
): number {
  const remapped = ((value - start1) * (end2 - start2)) / (end1 - start1) + start2;
  return remapped > 0 ? remapped : 0;
}

function animate() {
  if (!isAnimating.value) {
    return;
  }

  clearContext();
  for (let i = circles.length - 1; i >= 0; i--) {
    const circle = circles[i];
    // Handle the alpha value
    const edge = [
      circle.x + circle.translateX - circle.size, // distance from left edge
      canvasSize.w - circle.x - circle.translateX - circle.size, // distance from right edge
      circle.y + circle.translateY - circle.size, // distance from top edge
      canvasSize.h - circle.y - circle.translateY - circle.size, // distance from bottom edge
    ];

    const closestEdge = edge.reduce((a, b) => Math.min(a, b));
    const remapClosestEdge = parseFloat(remapValue(closestEdge, 0, 20, 0, 1).toFixed(2));

    if (remapClosestEdge > 1) {
      circle.alpha += 0.02;
      if (circle.alpha > circle.targetAlpha) circle.alpha = circle.targetAlpha;
    } else {
      circle.alpha = circle.targetAlpha * remapClosestEdge;
    }

    circle.x += circle.dx;
    circle.y += circle.dy;
    circle.translateX +=
      (mouse.x / (props.staticity / circle.magnetism) - circle.translateX) / props.ease;
    circle.translateY +=
      (mouse.y / (props.staticity / circle.magnetism) - circle.translateY) / props.ease;

    // circle gets out of the canvas
    if (
      circle.x < -circle.size ||
      circle.x > canvasSize.w + circle.size ||
      circle.y < -circle.size ||
      circle.y > canvasSize.h + circle.size
    ) {
      // remove the circle from the array
      circles.splice(i, 1);
      // create a new circle
      const newCircle = circleParams();
      drawCircle(newCircle);
      continue;
    }

    drawCircle(
      {
        ...circle,
        x: circle.x,
        y: circle.y,
        translateX: circle.translateX,
        translateY: circle.translateY,
        alpha: circle.alpha,
      },
      true,
    );
  }
  if (!isAnimating.value) {
    return;
  }

  animationFrameId = window.requestAnimationFrame(animate);
}
</script>
