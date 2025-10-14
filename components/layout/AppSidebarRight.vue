<template>
  <aside
    class="app-card app-sidebar"
    :class="{ 'app-sidebar--sticky': sticky }"
    aria-label="Secondary navigation"
    data-test="app-sidebar-right"
  >
    <SidebarCard
      v-if="!isAuthenticated"
      class="text-card-foreground px-3 py-2"
      glow
    >
      <div class="sidebar-login-card__content">
        <h2 class="sidebar-login-card__title text-foreground">Bro World</h2>
        <AuthSocial
          class="sidebar-login-card__socials"
          size="compact"
          :loading="isRedirecting"
          @redirect="handleSocialRedirect"
        />

        <div class="sidebar-login-card__form">
          <AuthLoginForm
            variant="compact"
            :disabled="isRedirecting"
          />
        </div>
      </div>
    </SidebarCard>
    <slot />
  </aside>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { resolveSocialRedirect, type SocialProvider } from "~/lib/auth/social";
import { useAuthSession } from "~/stores/auth-session";

const HaloSearch = defineAsyncComponent({
  loader: () => import("~/components/content/inspira/ui/halo-search/HaloSearch.vue"),
  suspensible: false,
});
const ParticlesBg = defineAsyncComponent({
  loader: () => import("~/components/content/inspira/ui/particles-bg/ParticlesBg.vue"),
  suspensible: false,
});
const AuthLoginForm = defineAsyncComponent({
  loader: () => import("~/components/auth/LoginForm.vue"),
  suspensible: false,
});
const AuthSocial = defineAsyncComponent({
  loader: () => import("~/components/auth/Social.vue"),
  suspensible: false,
});

interface SidebarItem {
  key: string;
  label: string;
  icon?: string;
  to?: string;
  children?: SidebarItem[];
}

const props = withDefaults(
  defineProps<{
    items: SidebarItem[];
    activeKey: string;
    sticky?: boolean;
    isDark?: boolean;
    eager?: boolean;
  }>(),
  {
    sticky: true,
    eager: false,
    isDark: false,
  },
);

const sticky = computed(() => props.sticky);
const isDark = computed(() => props.isDark);
function tryUseAuthSession() {
  try {
    return useAuthSession();
  } catch (error) {
    if (import.meta.dev) {
      console.error(
        "[AppSidebarRight] Failed to access auth session store. Falling back to guest mode.",
        error,
      );
    }

    return null;
  }
}

const auth = tryUseAuthSession();
const isAuthenticated = computed(() => auth?.isAuthenticated.value ?? false);
const { t } = useI18n();

const isRedirecting = ref(false);
const shouldRenderParticles = ref(false);

let particlesScheduled = false;

function scheduleParticles() {
  if (particlesScheduled || !import.meta.client) {
    return;
  }

  particlesScheduled = true;

  const idleWindow = window as typeof window & {
    requestIdleCallback?: (callback: () => void) => number;
  };

  function enableParticles() {
    shouldRenderParticles.value = true;
  }

  if (typeof idleWindow.requestIdleCallback === "function") {
    idleWindow.requestIdleCallback(enableParticles);
    return;
  }

  window.setTimeout(enableParticles, 200);
}

onMounted(() => {
  scheduleParticles();
});

if (auth) {
  watch(
    () => auth.isAuthenticated.value,
    (value) => {
      if (value) {
        isRedirecting.value = false;
      }
    },
  );
}

function handleSocialRedirect(provider: SocialProvider) {
  const target = resolveSocialRedirect(provider);

  if (!target) return;

  isRedirecting.value = true;

  if (import.meta.client) {
    window.location.href = target;
  }
}
</script>

<style scoped>
@reference "../../assets/css/tailwind.css";

.app-card {
  padding: 1.5rem 1.25rem;
}

.app-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.app-sidebar--sticky {
  position: sticky;
}

.sidebar-login-card {
  position: relative;
  overflow: hidden;
  border-radius: var(
    --ui-card-radius,
    calc(var(--radius, var(--ui-radius)) + 8px)
  );
  padding: 1.75rem 1.25rem;
  box-shadow:
    0 5px 5px rgba(var(--v-theme-primary), 0.2),
    0 14px 30px rgba(15, 23, 42, 0.12);
}

.sidebar-login-card__particles {
  position: absolute;
  inset: 0;
  opacity: 0.55;
}

.sidebar-login-card__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.sidebar-login-card__title {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 800;
  text-align: center;
}

.sidebar-login-card__subtitle {
  margin: 0;
  font-size: 0.85rem;
  text-align: center;
  color: rgba(71, 85, 105, 0.75);
}

.sidebar-login-card__socials {
  display: flex;
  justify-content: center;
}

.sidebar-login-card__form {
  margin-top: 0.5rem;
}

.sidebar-login-card :deep(.login-form__inner) {
  gap: 0.75rem;
}

.sidebar-login-card :deep(.login-field) {
  box-shadow: 0 12px 26px rgba(236, 72, 153, 0.18);
}

.sidebar-login-card :deep(.login-form__submit) {
  box-shadow: 0 16px 32px rgba(236, 72, 153, 0.28);
}
</style>
