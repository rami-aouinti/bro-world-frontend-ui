<template>
  <aside
    class="app-card app-sidebar"
    :class="{ 'app-sidebar--sticky': sticky }"
    aria-label="Main navigation"
  >
    <SidebarCard class="text-card-foreground px-3 py-2">
      <!-- glows -->
      <span
        class="pointer-events-none absolute -left-14 top-8 h-40 w-40 rounded-full bg-primary/25 blur-3xl"
      ></span>
      <span
        class="pointer-events-none absolute -right-16 -top-10 h-48 w-48 rounded-full bg-primary/35 blur-3xl"
      ></span>
      <div class="sidebar-menu-card__content">
        <nav>
          <ul class="flex flex-col gap-3">
            <li
              v-for="item in localizedItems"
              :key="item.key"
              class="sidebar-group"
            >
              <component
                :is="item.to ? NuxtLink : 'button'"
                v-bind="item.to ? { to: item.to } : { type: 'button' }"
                class="sidebar-item"
                :class="{ 'sidebar-item--active': isItemActive(item, resolvedActiveKey) }"
                :aria-label="item.to ? resolveLabel(item) : undefined"
                :aria-current="isItemActive(item, resolvedActiveKey) ? 'page' : undefined"
                @click="handleParentSelect(item)"
              >
                <div class="flex items-center gap-3">
                  <Icon
                    v-if="item.icon"
                    :name="item.icon"
                    :size="20"
                  />
                  <span class="text-sm font-medium text-foreground">{{ resolveLabel(item) }}</span>
                </div>
                <button
                  v-if="item.children?.length"
                  type="button"
                  class="sidebar-toggle"
                  :aria-controls="`sidebar-group-${item.key}`"
                  :aria-expanded="isGroupExpanded(item.key)"
                  @click.stop="toggleGroup(item.key)"
                >
                  <Icon
                    class="sidebar-toggle-icon"
                    name="mdi:chevron-down"
                    :class="{ 'sidebar-toggle-icon--open': isGroupExpanded(item.key) }"
                  />
                  <span class="sr-only">{{ t("layout.sidebar.navigate") }}</span>
                </button>
                <span
                  v-else-if="item.to"
                  class="sr-only"
                  >{{ t("layout.sidebar.navigate") }}</span
                >
              </component>

              <ul
                v-if="item.children?.length"
                v-show="isGroupExpanded(item.key)"
                :id="`sidebar-group-${item.key}`"
                class="sidebar-sublist"
                :aria-hidden="!isGroupExpanded(item.key)"
              >
                <li
                  v-for="child in item.children"
                  :key="child.key"
                >
                  <NuxtLink
                    :to="child.to"
                    class="sidebar-subitem"
                    :class="{ 'sidebar-subitem--active': child.key === resolvedActiveKey }"
                    :aria-label="resolveLabel(child)"
                    :aria-current="child.key === resolvedActiveKey ? 'page' : undefined"
                    @click="emit('select', child.key)"
                  >
                    <Icon
                      v-if="child.icon"
                      :name="child.icon"
                      :size="18"
                    />
                    <span class="text-sm text-muted-foreground">{{ resolveLabel(child) }}</span>
                  </NuxtLink>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </SidebarCard>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { NuxtLink } from "#components";
import type { LayoutSidebarItem } from "~/lib/navigation/sidebar";
import {
  ADMIN_ROLE_KEYS,
  buildProfileSidebarItems,
  buildSidebarItems,
} from "~/lib/navigation/sidebar";
import { useAuthSession } from "~/stores/auth-session";
import { useSiteSettingsState } from "~/composables/useSiteSettingsState";

type SidebarVariant = "default" | "profile";

const props = withDefaults(
  defineProps<{
    items?: LayoutSidebarItem[];
    isDark?: boolean;
    activeKey?: string;
    sticky?: boolean;
    variant?: SidebarVariant;
  }>(),
  {
    sticky: true,
    variant: "default",
    isDark: false,
  },
);
const isDark = computed(() => props.isDark);
const sticky = computed(() => props.sticky);
const shouldRenderParticles = ref(false);
const { t, locale } = useI18n();
const localePath = useLocalePath();
const router = useRouter();
const currentRoute = computed(() => router.currentRoute.value);
const auth = useAuthSession();
const siteSettings = useSiteSettingsState();

const canAccessAdmin = computed(() => {
  if (!auth.isAuthenticated.value) return false;
  const roles = auth.currentUser.value?.roles ?? [];
  return roles.some((role) => ADMIN_ROLE_KEYS.includes(role));
});

const variantItems = computed<LayoutSidebarItem[]>(() => {
  if (props.variant === "profile") {
    return buildProfileSidebarItems();
  }

  return buildSidebarItems(siteSettings.value, canAccessAdmin.value);
});

const resolvedItems = computed<LayoutSidebarItem[]>(() => props.items ?? variantItems.value);

const localizedItems = computed<LayoutSidebarItem[]>(() =>
  resolvedItems.value.map((item) => localizeItem(item)),
);

const derivedActiveKey = computed(() => {
  const items = localizedItems.value;
  const fullPath = currentRoute.value?.fullPath ?? "/";
  const match = findActiveSidebarKey(fullPath, items);
  if (match) return match;
  return "";
});

const resolvedActiveKey = computed(() => props.activeKey ?? derivedActiveKey.value);

const expandedGroups = ref(new Set<string>());

watch(
  () => [resolvedActiveKey.value, localizedItems.value],
  ([activeKey]) => {
    let updated = false;
    const next = new Set(expandedGroups.value);
    const availableGroups = new Set(
      localizedItems.value.filter((item) => item.children?.length).map((item) => item.key),
    );

    for (const item of localizedItems.value) {
      if (!item.children?.length) continue;

      if (isItemActive(item, activeKey)) {
        if (!next.has(item.key)) {
          next.add(item.key);
          updated = true;
        }
      }
    }

    for (const groupKey of Array.from(next)) {
      if (!availableGroups.has(groupKey)) {
        next.delete(groupKey);
        updated = true;
      }
    }

    if (updated) expandedGroups.value = next;
  },
  { immediate: true, deep: true },
);

function isItemActive(item: LayoutSidebarItem, key: string): boolean {
  if (item.key === key) return true;

  if (item.children) return item.children.some((child) => isItemActive(child, key));

  return false;
}

function toggleGroup(key: string) {
  const next = new Set(expandedGroups.value);

  if (next.has(key)) next.delete(key);
  else next.add(key);

  expandedGroups.value = next;
}

function isGroupExpanded(key: string) {
  return expandedGroups.value.has(key);
}

function handleParentSelect(item: LayoutSidebarItem) {
  emit("select", item.key);

  if (item.children?.length && !isGroupExpanded(item.key)) toggleGroup(item.key);
}

const emit = defineEmits<{ (e: "select", key: string): void }>();

function resolveLabel(item: LayoutSidebarItem): string {
  if (item.translate === false) {
    return item.label;
  }

  return t(item.label);
}

function findActiveSidebarKey(path: string, items: LayoutSidebarItem[]): string | null {
  let bestMatch: { key: string; score: number } | null = null;

  for (const item of items) {
    if (item.children?.length) {
      const childMatch = findActiveSidebarKey(path, item.children);
      if (childMatch && (!bestMatch || childMatch.score > bestMatch.score)) {
        bestMatch = childMatch;
      }
    }

    if (!item.to) continue;

    const score = getRouteMatchScore(path, item.to);
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { key: item.key, score };
    }
  }

  return bestMatch?.key ?? null;
}

function getRouteMatchScore(path: string, target: string) {
  if (target === "/") {
    return path === "/" || path.startsWith("/?") ? 1 : 0;
  }

  if (path === target) {
    return target.length + 1000;
  }

  if (path.startsWith(`${target}/`) || path.startsWith(`${target}?`)) {
    return target.length;
  }

  return 0;
}

function localizeItem(item: LayoutSidebarItem): LayoutSidebarItem {
  const localizedChildren = item.children?.map((child) => localizeItem(child));

  return {
    ...item,
    to: resolveLocalizedPath(item.to),
    children: localizedChildren?.length ? localizedChildren : undefined,
  } satisfies LayoutSidebarItem;
}

function resolveLocalizedPath(target?: string): string | undefined {
  if (!target) return undefined;

  const hasScheme = /^[a-z][a-z0-9+\-.]*:/i.test(target);

  if (hasScheme || target.startsWith("//") || target.startsWith("#")) {
    return target;
  }

  const currentLocale = locale.value;

  if (target === `/${currentLocale}` || target.startsWith(`/${currentLocale}/`)) {
    return target;
  }

  try {
    return localePath({ path: target });
  } catch (error) {
    if (import.meta.dev) {
      console.warn("[AppSidebar] Failed to resolve localized path for target", target, error);
    }

    return target;
  }
}
</script>

<style scoped>
@reference "../../assets/css/tailwind.css";

.app-card {
  padding: 4px 16px;
}

.app-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.app-sidebar--sticky {
  position: sticky;
}

.sidebar-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sidebar-item {
  @apply flex items-center justify-between text-left transition;
  padding: 0.75rem 1rem;
  border-radius: calc(var(--radius) + 8px);
  @apply hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2;
  --tw-bg-opacity: 0.7;
}

.sidebar-group:focus-within .sidebar-item {
  @apply ring-2 ring-primary ring-offset-2;
  --tw-ring-opacity: 0.7;
}

.sidebar-item--active {
  @apply bg-primary shadow-[0_10px_25px_rgba(243,126,205,0.35)];
  --tw-bg-opacity: 0.1;
}

.sidebar-icon {
  @apply flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary;
  --tw-bg-opacity: 0.1;
}

.sidebar-item:hover {
  --tw-bg-opacity: 0.05;
}

.sidebar-item:focus-visible {
  --tw-ring-opacity: 0.7;
}

.sidebar-toggle {
  @apply ml-3 inline-flex h-8 w-8 items-center justify-center rounded-full transition;
  @apply hover:bg-muted focus-visible:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2;
  --tw-ring-opacity: 0.7;
}

.sidebar-toggle-icon {
  @apply text-muted-foreground transition-transform;
}

.sidebar-toggle-icon--open {
  transform: rotate(180deg);
}

.sidebar-sublist {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-left: 2rem;
}

.sidebar-subitem {
  @apply flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition;
  color: var(--v-theme-on-surface-variant);
}

.sidebar-subitem:hover,
.sidebar-subitem:focus-visible {
  @apply bg-primary/10 text-foreground;
}

.sidebar-subitem:focus-visible {
  @apply outline-none ring-2 ring-primary ring-offset-2;
  --tw-ring-opacity: 0.7;
}

.sidebar-subitem--active {
  @apply bg-primary/15 text-foreground;
}

.sidebar-subicon {
  @apply text-muted-foreground;
}

.sidebar-menu-card {
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  padding: 1.75rem 1.25rem;
  box-shadow:
    0 5px 5px rgba(var(--v-theme-primary), 0.2),
    0 14px 30px rgba(15, 23, 42, 0.12);
}

.sidebar-menu-card__particles {
  position: absolute;
  inset: 0;
  opacity: 0.55;
}

.sidebar-menu-card__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
</style>
