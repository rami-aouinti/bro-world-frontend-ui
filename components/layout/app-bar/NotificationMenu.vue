<template>
  <v-menu
    v-model="open"
    location="bottom end"
    :offset="8"
  >
    <template #activator="{ props: menuProps }">
      <button
        type="button"
        :class="props.iconTriggerClasses"
        :aria-label="props.buttonLabel"
        v-bind="menuProps"
      >
        <v-badge
          v-if="props.unreadCount > 0"
          :content="props.unreadCount"
          location="top right"
          color="primary"
          max="99"
          size="small"
        >
          <AppIcon
            name="mdi:bell-outline"
            :size="26"
          />
        </v-badge>
        <template v-else>
          <AppIcon
            name="mdi:bell-outline"
            :size="26"
          />
        </template>
      </button>
    </template>
    <NotificationMenuContent
      :items="props.items"
      :title="props.title"
      :subtitle="props.subtitle"
      :empty-text="props.emptyText"
      :mark-all-text="props.markAllText"
      :view-all-text="props.viewAllText"
      :view-all-to="props.viewAllTo"
      @mark-all="handleMarkAll"
    />
  </v-menu>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent } from "vue";
import type { AppNotification } from "~/types/layout";

const NotificationMenuContent = defineAsyncComponent({
  loader: () => import("./NotificationMenuContent.vue"),
  suspensible: false,
});

const props = defineProps<{
  items: AppNotification[];
  iconTriggerClasses: string;
  title: string;
  subtitle?: string;
  emptyText: string;
  markAllText: string;
  buttonLabel: string;
  unreadCount: number;
  viewAllText?: string;
  viewAllTo?: string;
}>();

const emit = defineEmits<{
  (e: "mark-all"): void;
}>();

const open = ref(false);

function handleMarkAll() {
  emit("mark-all");
}
</script>
