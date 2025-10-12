<template>
  <v-menu
    v-model="open"
    location="bottom end"
    offset="8"
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
          color="primary"
          floating
          max="99"
          offset-x="4"
          offset-y="2"
          size="small"
        >
          <AppIcon
            name="mdi:message-outline"
            :size="26"
          />
        </v-badge>
        <template v-else>
          <AppIcon
            name="mdi:message-outline"
            :size="26"
          />
        </template>
      </button>
    </template>
    <div
        class="min-w-[280px] overflow-hidden bg-background text-card-foreground px-3 py-2 shadow-xl ring-1 ring-black/5 dark:ring-white/10 rounded-3xl"
    >
      <!-- glows -->
      <span
        class="pointer-events-none absolute -left-14 top-8 h-40 w-40 rounded-full bg-primary/25 blur-3xl"
      ></span>
      <span
        class="pointer-events-none absolute -right-16 -top-10 h-48 w-48 rounded-full bg-primary/35 blur-3xl"
      ></span>
      <div class="relative z-10 flex flex-col">
        <div class="flex items-center justify-between rounded-2xl px-4 py-3">
          <div>
            <p class="text-sm font-semibold leading-tight">
              {{ props.title }}
            </p>
            <p
              v-if="props.subtitle"
              class="text-xs text-muted-foreground"
            >
              {{ props.subtitle }}
            </p>
          </div>
          <v-btn
            variant="text"
            size="small"
            class="text-primary"
            :aria-label="props.viewAllLabel"
            @click="handleViewAll"
          >
            {{ props.viewAllLabel }}
          </v-btn>
        </div>
        <v-divider />
        <div
          v-if="props.loading"
          class="flex flex-col gap-3 px-4 py-6"
        >
          <div
            v-for="index in 3"
            :key="index"
            class="flex items-center gap-3"
          >
            <v-skeleton-loader
              class="rounded-full"
              height="40"
              type="avatar"
              width="40"
            />
            <div class="flex flex-1 flex-col gap-2">
              <v-skeleton-loader
                height="12"
                type="text"
              />
              <v-skeleton-loader
                height="10"
                type="text"
              />
            </div>
          </div>
        </div>
        <template v-else>
          <v-list
            v-if="previews.length"
            class="py-1 rounded-xl"
            density="comfortable"
            lines="two"
          >
            <v-list-item
              v-for="preview in previews"
              :key="preview.id"
              :class="[
                'px-4 py-3 transition-colors',
                preview.unread ? 'bg-primary/5 dark:bg-primary/15' : '',
              ]"
              link
              @click="openConversation(preview.id)"
            >
              <template #prepend>
                <v-avatar
                  :size="40"
                  class="bg-muted text-sm font-semibold text-muted-foreground"
                >
                  <img
                    v-if="preview.avatarUrl"
                    :alt="preview.title"
                    :src="preview.avatarUrl"
                    width="40"
                    height="40"
                    loading="lazy"
                    decoding="async"
                    class="h-full w-full object-cover"
                  />
                  <span v-else>
                    {{ preview.initials }}
                  </span>
                </v-avatar>
              </template>
              <div class="flex flex-col gap-1">
                <p class="text-sm font-medium leading-tight">
                  {{ preview.title }}
                </p>
                <p class="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                  <span
                    v-if="preview.sender"
                    class="font-medium text-foreground"
                  >
                    {{ preview.sender }}
                  </span>
                  <span v-if="preview.sender && preview.snippet"> &nbsp;&mdash;&nbsp; </span>
                  <span>
                    {{ preview.snippet || props.emptyText }}
                  </span>
                </p>
              </div>
              <template #append>
                <div class="flex flex-col items-end gap-2">
                  <span class="text-xs text-muted-foreground">
                    {{ preview.timeAgo }}
                  </span>
                  <span
                    v-if="preview.unread && preview.unreadCount"
                    class="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground"
                  >
                    {{ preview.unreadCount > 99 ? "99+" : preview.unreadCount }}
                  </span>
                  <span
                    v-else-if="preview.unread"
                    class="h-2 w-2 rounded-full bg-primary"
                  />
                </div>
              </template>
            </v-list-item>
          </v-list>
          <div
            v-else
            class="flex flex-col items-center justify-center gap-2 px-6 py-8 text-center"
          >
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"
            >
              <AppIcon
                name="mdi:message-plus-outline"
                :size="28"
              />
            </div>
            <p class="text-sm font-medium">
              {{ props.emptyText }}
            </p>
          </div>
        </template>
      </div>
    </div>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthSession } from "~/stores/auth-session";
import {
  resolveConversationAvatar,
  resolveConversationTitle,
  resolveMessageSender,
} from "~/lib/messenger/display";
import { formatRelativeTime } from "~/lib/datetime/relative-time";
import type { MessengerConversation } from "~/types/messenger";
import type { MessengerPreviewEntry } from "~/types/messenger/ui";
import SidebarCard from "~/components/layout/SidebarCard.vue";

const props = defineProps<{
  iconTriggerClasses: string;
  conversations: MessengerConversation[];
  title: string;
  subtitle?: string;
  viewAllLabel: string;
  buttonLabel: string;
  emptyText: string;
  unknownLabel: string;
  loading: boolean;
}>();

const router = useRouter();
const { locale } = useI18n();
const auth = useAuthSession();
const currentUserId = computed(() => auth.currentUser.value?.id ?? null);
const fallbackInitials = computed(() => props.unknownLabel.slice(0, 2).toUpperCase());
const open = ref(false);

const previews = computed<MessengerPreviewEntry[]>(() => {
  const userId = currentUserId.value;
  const initialsFallback = fallbackInitials.value;

  return props.conversations.slice(0, 3).map((conversation) => {
    const title = resolveConversationTitle(conversation, userId, props.unknownLabel);
    const lastMessage = conversation.lastMessage ?? null;
    const snippet = lastMessage?.content ?? "";
    const sender = resolveMessageSender(lastMessage, "");
    const avatar = resolveConversationAvatar(conversation, userId, initialsFallback);

    return {
      id: conversation.id,
      title,
      sender,
      snippet,
      unread: (conversation.unreadCount ?? 0) > 0,
      unreadCount: conversation.unreadCount ?? 0,
      avatarUrl: avatar.url,
      initials: avatar.initials,
      timeAgo: formatRelativeTime(
        conversation.lastMessage?.createdAt ?? conversation.updatedAt,
        locale.value,
      ),
    };
  });
});

function openConversation(id: string) {
  open.value = false;
  router.push({ path: `/messenger/${id}` });
}

function handleViewAll() {
  open.value = false;
  router.push({ path: "/messenger" });
}
</script>
