<template>
  <motion.span
    v-for="(char, index) in props.text"
    :key="`${char}-${count}-${index}`"
    :initial="getInitialState()"
    :transition="getTransition(index)"
    :animate="getAnimateState(index)"
    :exit="getExitState()"
  >
    {{ char }}
  </motion.span>
</template>

<script setup lang="ts">
import { motion } from "motion-v";
import { ref, onMounted, onUnmounted } from "vue";

interface Props {
  text: string;
  colors?: string[];
  startColor?: string;
  duration?: number;
}

const props = withDefaults(defineProps<Props>(), {
  startColor: "rgb(255,255,255)",
  duration: 0.5,
  colors: () => [
    "rgb(131, 179, 32)",
    "rgb(47, 195, 106)",
    "rgb(42, 169, 210)",
    "rgb(4, 112, 202)",
    "rgb(107, 10, 255)",
    "rgb(183, 0, 218)",
    "rgb(218, 0, 171)",
    "rgb(230, 64, 92)",
    "rgb(232, 98, 63)",
    "rgb(249, 129, 47)",
  ],
});

const currentColors = ref(props.colors);
const count = ref(0);
const lastHidden = ref(0);
const shouldReduceMotion = ref(false);

// eslint-disable-next-line no-undef
let intervalId: undefined | NodeJS.Timeout = undefined;
let mediaQuery: MediaQueryList | undefined;

const stopAnimationLoop = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = undefined;
  }

  currentColors.value = props.colors;
  count.value = 0;
};

const startAnimationLoop = () => {
  if (intervalId || shouldReduceMotion.value) {
    return;
  }

  intervalId = setInterval(() => {
    const shuffled = [...props.colors].sort(() => 0.5 - Math.random());
    currentColors.value = shuffled;

    if (typeof document !== "undefined" && document.visibilityState === "visible") {
      if (Date.now() - lastHidden.value > 500) {
        count.value++;
      }
    } else {
      lastHidden.value = Date.now();
    }
  }, 5000);
};

const applyMotionPreference = (matches: boolean) => {
  shouldReduceMotion.value = matches;

  if (matches) {
    stopAnimationLoop();
  } else {
    startAnimationLoop();
  }
};

const handlePreferenceChange = (event: MediaQueryListEvent) => {
  applyMotionPreference(event.matches);
};

onMounted(() => {
  if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
    mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    applyMotionPreference(mediaQuery.matches);

    if ("addEventListener" in mediaQuery) {
      mediaQuery.addEventListener("change", handlePreferenceChange);
    } else if ("addListener" in mediaQuery) {
      mediaQuery.addListener(handlePreferenceChange);
    }
  } else {
    applyMotionPreference(false);
  }

  if (!shouldReduceMotion.value) {
    startAnimationLoop();
  }
});

onUnmounted(() => {
  stopAnimationLoop();

  if (!mediaQuery) {
    return;
  }

  if ("removeEventListener" in mediaQuery) {
    mediaQuery.removeEventListener("change", handlePreferenceChange);
  } else if ("removeListener" in mediaQuery) {
    mediaQuery.removeListener(handlePreferenceChange);
  }
});

const getColorForIndex = (index: number) => {
  const palette = currentColors.value.length > 0 ? currentColors.value : props.colors;
  const safeIndex = palette.length === 0 ? 0 : index % palette.length;
  return palette[safeIndex] ?? props.startColor;
};

const getInitialState = () => {
  if (shouldReduceMotion.value) {
    return {
      y: 0,
      opacity: 1,
      color: props.startColor,
      scale: 1,
      filter: "blur(0px)",
    };
  }

  return {
    y: 0,
    opacity: 0.2,
    color: props.startColor,
    scale: 1,
    filter: "blur(5px)",
  };
};

const getTransition = (index: number) => {
  if (shouldReduceMotion.value) {
    return {
      duration: 0,
      delay: 0,
    };
  }

  return {
    duration: props.duration,
    delay: index * 0.05,
  };
};

const getAnimateState = (index: number) => {
  if (shouldReduceMotion.value) {
    return {
      y: 0,
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      color: getColorForIndex(index),
    };
  }

  return {
    y: [0, -3, 0],
    opacity: [1, 0.8, 1],
    scale: [1, 1.01, 1],
    filter: ["blur(0px)", "blur(5px)", "blur(0px)"],
    color: getColorForIndex(index),
  };
};

const getExitState = () => {
  if (shouldReduceMotion.value) {
    return {
      y: 0,
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      color: props.startColor,
    };
  }

  return {
    y: -3,
    opacity: 1,
    scale: 1,
    filter: "blur(5px)",
    color: props.startColor,
  };
};
</script>

<style scoped></style>
