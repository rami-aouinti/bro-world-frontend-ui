<template>
  <Transition
    enter-active-class="transition-opacity duration-200 ease-out"
    enter-from-class="opacity-0"
    leave-active-class="transition-opacity duration-200 ease-in"
    leave-to-class="opacity-0"
  >
    <div
      v-if="visible"
      class="fixed inset-0 z-[200] flex items-center justify-center bg-background/70 px-6 py-16 backdrop-blur-2xl"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        class="w-full max-w-xl space-y-8 rounded-3xl border border-black/5 bg-white/80 p-8 text-left shadow-[0_40px_120px_-40px_rgba(15,23,42,0.45)] ring-1 ring-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/85 dark:ring-white/10"
      >
        <div class="flex items-center gap-4">
          <img
            src="/world-logo-primary.svg"
            alt="Bro World"
            class="h-10 w-auto"
          />
          <div class="flex flex-col">
            <span class="text-xs font-semibold uppercase tracking-[0.35em] text-primary/80"
              >Bro World</span
            >
            <span class="text-xl font-semibold text-slate-900 dark:text-slate-100"
              >Nous préparons votre expérience</span
            >
          </div>
        </div>

        <div class="space-y-4">
          <div
            v-for="(step, index) in steps"
            :key="step.title"
            class="flex items-start gap-4"
          >
            <span
              class="mt-1 inline-flex size-7 items-center justify-center rounded-full border text-xs font-semibold transition-all"
              :class="
                index === activeStep
                  ? 'border-primary bg-primary text-white shadow-[0_8px_16px_-8px_rgba(59,130,246,0.65)]'
                  : 'border-primary/30 bg-white/70 text-primary dark:bg-neutral-900/60'
              "
            >
              {{ index + 1 }}
            </span>
            <div class="flex flex-col">
              <span
                class="text-base font-medium transition-colors"
                :class="[
                  index === activeStep
                    ? 'text-primary dark:text-primary-200'
                    : index < activeStep
                      ? 'text-slate-900 dark:text-slate-100'
                      : 'text-slate-900/70 dark:text-slate-100/60',
                ]"
              >
                {{ step.title }}
              </span>
              <p
                class="mt-1 text-sm leading-relaxed text-slate-500 transition-opacity dark:text-slate-400"
                :class="index === activeStep ? 'opacity-100' : 'opacity-75'"
              >
                {{ step.subtitle }}
              </p>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span
            v-for="dot in dots"
            :key="dot"
            class="route-loader-dot inline-flex size-2.5 rounded-full bg-primary/70"
            :style="{ animationDelay: `${(dot - 1) * 0.15}s` }"
          ></span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { onUnmounted, ref, watch } from "vue";

const props = defineProps<{ visible: boolean }>();

const steps = [
  {
    title: "Connexion à votre univers",
    subtitle: "Synchronisation de vos préférences personnelles.",
  },
  {
    title: "Collecte des dernières activités",
    subtitle: "Nous recherchons les nouveautés de votre réseau.",
  },
  {
    title: "Préparation de l'interface",
    subtitle: "Mise en place des widgets et composants interactifs.",
  },
];

const dots = [1, 2, 3];
const activeStep = ref(0);
let rotationTimer: ReturnType<typeof setInterval> | null = null;

function clearTimer() {
  if (rotationTimer) {
    clearInterval(rotationTimer);
    rotationTimer = null;
  }
}

function startTimer() {
  clearTimer();
  rotationTimer = setInterval(() => {
    activeStep.value = (activeStep.value + 1) % steps.length;
  }, 2600);
}

watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible) {
      activeStep.value = 0;
      startTimer();
    } else {
      clearTimer();
    }
  },
  { immediate: true },
);

onUnmounted(() => {
  clearTimer();
});
</script>

<style scoped>
.route-loader-dot {
  animation: route-loader-pulse 1.1s ease-in-out infinite;
  opacity: 0.4;
}

@keyframes route-loader-pulse {
  0%,
  80%,
  100% {
    opacity: 0.35;
    transform: scale(0.85);
  }
  40% {
    opacity: 1;
    transform: scale(1.25);
  }
}
</style>
