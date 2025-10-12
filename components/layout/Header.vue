<template>
  <header
    class="sticky top-0 z-40 bg-transparent text-foreground"
    :class="{ 'border-b': config.header.border }"
  >
    <div
      class="flex h-14 items-center justify-between gap-2 px-4 md:px-8"
      :class="{
        'container max-w-screen-2xl': config.main.padded,
      }"
    >
      <LayoutHeaderLogo class="hidden flex-1 md:flex" />
      <LayoutMobileNav />
      <LayoutHeaderLogo
        v-if="config.header.showTitleInMobile"
        class="flex md:hidden"
      />
      <LayoutHeaderNav class="hidden flex-1 lg:flex" />
      <div class="flex flex-1 justify-end gap-2">
        <LayoutSearchButton v-if="!config.search.inAside && config.search.style === 'input'" />
        <div class="flex">
          <LayoutSearchButton v-if="!config.search.inAside && config.search.style === 'button'" />
          <LangSwitcher v-if="i18nEnabled" />
          <ThemePopover v-if="config.theme.customizable" />
          <DarkModeToggle v-if="config.header.darkModeToggle" />
          <template
            v-for="(link, i) in headerLinks"
            :key="i"
          >
            <UiDropdownMenu v-if="link.menuItems?.length">
              <UiDropdownMenuTrigger as-child>
                <UiButton
                  variant="ghost"
                  size="icon"
                  class="flex gap-2"
                  :aria-label="link?.label"
                >
                  <AppSmartIcon
                    v-if="link.icon"
                    :name="link.icon"
                    :size="18"
                  />
                  <span
                    v-if="link?.label"
                    class="sr-only"
                  >
                    {{ link.label }}
                  </span>
                </UiButton>
              </UiDropdownMenuTrigger>
              <UiDropdownMenuContent class="w-44">
                <UiDropdownMenuItem
                  v-for="item in link.menuItems"
                  :key="item.title"
                  @select="handleMenuItemSelect(item)"
                >
                  <div class="flex w-full items-center gap-2">
                    <AppSmartIcon
                      v-if="item.icon"
                      :name="item.icon"
                      :size="16"
                    />
                    <span>{{ $t(item.title) }}</span>
                  </div>
                </UiDropdownMenuItem>
              </UiDropdownMenuContent>
            </UiDropdownMenu>
            <a
              v-else-if="link.external"
              :href="link?.to"
              :target="link?.target ?? '_blank'"
              rel="noreferrer"
            >
              <UiButton
                variant="ghost"
                size="icon"
                class="flex gap-2"
                :aria-label="link?.label"
              >
                <AppSmartIcon
                  v-if="link?.icon"
                  :name="link.icon"
                  :size="18"
                />
                <span
                  v-if="link?.label"
                  class="sr-only"
                >
                  {{ link.label }}
                </span>
              </UiButton>
            </a>
            <NuxtLinkLocale
              v-else
              :to="localePath(link?.to)"
              :target="link?.target"
            >
              <UiButton
                variant="ghost"
                size="icon"
                class="flex gap-2"
                :aria-label="link?.label"
              >
                <AppSmartIcon
                  v-if="link?.icon"
                  :name="link.icon"
                  :size="18"
                />
                <span
                  v-if="link?.label"
                  class="sr-only"
                >
                  {{ link.label }}
                </span>
              </UiButton>
            </NuxtLinkLocale>
          </template>
          <UiButton
            v-if="isAuthenticated"
            variant="ghost"
            size="icon"
            class="flex gap-2"
            :aria-label="t('auth.signOut')"
            :disabled="loggingOut"
            @click="handleLogout"
          >
            <AppSmartIcon
              name="mdi:logout"
              :size="18"
            />
            <span class="sr-only">{{ t("auth.signOut") }}</span>
          </UiButton>
          <NuxtLinkLocale
            v-else
            :to="localePath('/login')"
          >
            <UiButton
              variant="ghost"
              size="icon"
              class="flex gap-2"
              :aria-label="t('auth.signIn')"
            >
              <AppSmartIcon
                name="mdi:login"
                :size="18"
              />
              <span class="sr-only">{{ t("auth.signIn") }}</span>
            </UiButton>
          </NuxtLinkLocale>
        </div>
      </div>
    </div>
    <div
      v-if="baseRouteName !== 'index' && config.aside.levelStyle === 'header'"
      class="md:mt-2 md:px-8"
      :class="{
        'md:container md:max-w-screen-2xl': config.main.padded,
      }"
    >
      <LayoutHeaderTopLevelNav />
    </div>
    <div
      v-if="showToc"
      class="lg:hidden"
    >
      <LayoutToc is-small />
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthSession } from "~/stores/auth-session";

type HeaderLinkMenuItem = {
  title: string;
  to?: string;
  icon?: string;
  target?: string;
  external?: boolean;
};

type HeaderLink = {
  icon?: string;
  to?: string;
  target?: string;
  label?: string;
  external?: boolean;
  menuItems?: HeaderLinkMenuItem[];
};

const config = useConfig();
const { i18nEnabled, localePath } = useI18nDocs();
const { page } = useContent();
const { t } = useI18n();
const auth = useAuthSession();
const loggingOut = ref(false);

const headerLinks = computed<HeaderLink[]>(() => config.value.header.links ?? []);
const isAuthenticated = computed(() => auth.isAuthenticated.value);

const showToc = computed(() => {
  return (
    config.value.toc.enable &&
    config.value.toc.enableInMobile &&
    (page.value?._path === "/" ? config.value.toc.enableInHomepage : true)
  );
});

const router = useRouter();
const currentRoute = computed(() => router.currentRoute.value);
const resolveRouteBaseName = useRouteBaseName();
const baseRouteName = computed(() => {
  const route = currentRoute.value ?? router.currentRoute.value;
  return route ? resolveRouteBaseName(route) : undefined;
});

function handleMenuItemSelect(item: HeaderLinkMenuItem) {
  if (!item?.to) return;

  if (item.external) {
    if (typeof window !== "undefined") window.open(item.to, item.target ?? "_blank");

    return;
  }

  navigateTo(localePath(item.to));
}

async function handleLogout() {
  if (loggingOut.value) {
    return;
  }

  loggingOut.value = true;

  try {
    await auth.logout();
  } finally {
    loggingOut.value = false;
  }
}
</script>
