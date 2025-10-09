<template>
  <div :class="cn('flex flex-col items-center gap-4', $props.class)">
    <transition-group
      name="list"
      tag="div"
      class="flex flex-col-reverse items-center gap-3"
      move-class="move"
    >
      <!-- Only render the items up to the current index -->
      <Motion
        v-for="data in itemsToShow"
        :key="data.id"
        as="div"
        :initial="{ scale: 0, opacity: 0 }"
        :animate="{
          scale: 1,
          opacity: 1,
          y: 0,
        }"
        :exit="{
          scale: 0,
          opacity: 0,
          y: 0,
        }"
        :transition="{
          type: 'spring',
          stiffness: 350,
          damping: 40,
        }"
        :class="cn('mx-auto w-full')"
      >
        <component :is="data.node" />
      </Motion>
    </transition-group>
  </div>
</template>

<script lang="ts" setup>
import { Motion } from "motion-v";
import { computed, onBeforeUnmount, onMounted, ref, useSlots } from "vue";
import { cn } from "@/lib/utils";

interface Props {
  class?: string;
  delay?: number;
}

const props = withDefaults(defineProps<Props>(), {
  delay: 1000,
});

const slots = useSlots();
const displayedItems = ref<{ node: unknown; id: string }[]>([]);
const nextIndex = ref(0);
const activeTimeouts = new Set<ReturnType<typeof setTimeout>>();
let stopRequested = false;

onMounted(() => {
  stopRequested = false;
  void startLoop();
});

onBeforeUnmount(() => {
  stopRequested = true;

  for (const timeoutId of activeTimeouts) {
    clearTimeout(timeoutId);
  }

  activeTimeouts.clear();
});

function resolveNotifications() {
  const slotContent = slots.default ? slots.default() : [];

  if (!Array.isArray(slotContent) || slotContent.length === 0) {
    return [] as unknown[];
  }

  const firstEntry = slotContent[0];
  const children = Array.isArray(firstEntry?.children) ? firstEntry.children : [];

  return children;
}

async function startLoop() {
  const notifications = resolveNotifications();

  if (!notifications.length || stopRequested) {
    return;
  }

  while (displayedItems.value.length < notifications.length && !stopRequested) {
    displayedItems.value.push({
      node: notifications[nextIndex.value],
      id: `${nextIndex.value}-${Date.now()}`,
    });
    nextIndex.value = (nextIndex.value + 1) % notifications.length;

    if (stopRequested) {
      return;
    }

    await wait(props.delay);
  }

  while (!stopRequested) {
    displayedItems.value.shift();
    displayedItems.value.push({
      node: notifications[nextIndex.value],
      id: `${nextIndex.value}-${Date.now()}`,
    });
    nextIndex.value = (nextIndex.value + 1) % notifications.length;

    if (stopRequested) {
      return;
    }

    await wait(props.delay);
  }
}

const itemsToShow = computed(() => displayedItems.value);

function wait(ms: number) {
  if (stopRequested || typeof ms !== "number" || ms <= 0) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const timeoutId = setTimeout(() => {
      activeTimeouts.delete(timeoutId);
      resolve();
    }, ms);

    activeTimeouts.add(timeoutId);
  });
}
</script>

<style scoped>
.move {
  transition: transform 0.4s ease-out;
}
</style>
