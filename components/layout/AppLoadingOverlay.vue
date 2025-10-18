<template>
  <Teleport to="body">
    <Transition name="app-loading-fade">
      <div
        v-if="visible"
        class="app-loading-overlay"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <span class="sr-only">{{ t("layout.loadingOverlay.srLabel") }}</span>
        <div class="app-loading-scene" aria-hidden="true">
          <div class="app-loading-column app-loading-column--nav">
            <span class="app-loading-logo app-loading-skeleton" />
            <div class="app-loading-nav">
              <span
                v-for="item in 6"
                :key="item"
                class="app-loading-nav-item app-loading-skeleton"
              />
            </div>
          </div>
          <div class="app-loading-column app-loading-column--feed">
            <div class="app-loading-card app-loading-card--primary">
              <div class="app-loading-card-header">
                <span class="app-loading-avatar app-loading-skeleton" />
                <div class="app-loading-meta">
                  <span class="app-loading-line app-loading-skeleton" />
                  <span class="app-loading-line app-loading-line--short app-loading-skeleton" />
                </div>
              </div>
              <div class="app-loading-body">
                <span class="app-loading-line app-loading-skeleton" />
                <span class="app-loading-line app-loading-skeleton" />
                <span class="app-loading-line app-loading-line--medium app-loading-skeleton" />
              </div>
              <div class="app-loading-emojis">
                <span v-for="emoji in 3" :key="emoji" class="app-loading-emoji app-loading-skeleton" />
              </div>
              <div class="app-loading-footer">
                <span class="app-loading-tag app-loading-skeleton" />
                <span class="app-loading-tag app-loading-skeleton" />
              </div>
            </div>
            <div class="app-loading-card app-loading-card--secondary">
              <div class="app-loading-card-header">
                <span class="app-loading-avatar app-loading-skeleton" />
                <div class="app-loading-meta">
                  <span class="app-loading-line app-loading-line--short app-loading-skeleton" />
                  <span class="app-loading-line app-loading-line--tiny app-loading-skeleton" />
                </div>
              </div>
              <div class="app-loading-body">
                <span class="app-loading-line app-loading-line--medium app-loading-skeleton" />
                <span class="app-loading-line app-loading-line--short app-loading-skeleton" />
              </div>
            </div>
          </div>
          <div class="app-loading-column app-loading-column--aside">
            <div class="app-loading-aside-card app-loading-skeleton" />
            <div class="app-loading-aside-card app-loading-aside-card--tall app-loading-skeleton" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

withDefaults(
  defineProps<{
    visible?: boolean;
  }>(),
  {
    visible: false,
  },
);

const { t } = useI18n();
</script>

<style scoped>
.app-loading-fade-enter-active,
.app-loading-fade-leave-active {
  transition: opacity 0.4s ease;
}

.app-loading-fade-enter-from,
.app-loading-fade-leave-to {
  opacity: 0;
}

.app-loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  padding: clamp(1.25rem, 4vw, 3rem);
  background: radial-gradient(circle at 20% 20%, rgba(56, 189, 248, 0.1), transparent 55%),
    radial-gradient(circle at 80% 10%, rgba(34, 211, 238, 0.12), transparent 60%),
    radial-gradient(circle at 50% 100%, rgba(99, 102, 241, 0.18), transparent 65%),
    hsl(var(--background) / 0.93);
  backdrop-filter: blur(14px) saturate(130%);
}

.app-loading-scene {
  width: min(980px, 100%);
  display: grid;
  grid-template-columns: minmax(160px, 1fr) minmax(320px, 1.2fr) minmax(200px, 0.9fr);
  gap: clamp(1.5rem, 4vw, 2.5rem);
  align-items: center;
}

.app-loading-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.app-loading-column--nav {
  gap: 1.25rem;
}

.app-loading-logo {
  height: 2.25rem;
  width: 7rem;
  border-radius: 0.75rem;
}

.app-loading-nav {
  display: grid;
  gap: 0.65rem;
}

.app-loading-nav-item {
  height: 0.95rem;
  border-radius: 999px;
}

.app-loading-column--feed {
  position: relative;
  gap: 1.75rem;
}

.app-loading-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  border-radius: 1.5rem;
  padding: clamp(1.5rem, 3vw, 2rem);
  background: linear-gradient(150deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.82));
  box-shadow:
    0 28px 60px rgba(15, 23, 42, 0.6),
    0 12px 24px rgba(15, 23, 42, 0.35);
  border: 1px solid rgba(148, 163, 184, 0.15);
}

.app-loading-card--primary {
  z-index: 2;
}

.app-loading-card--secondary {
  align-self: flex-end;
  gap: 1.25rem;
  width: clamp(240px, 60%, 280px);
  margin-right: clamp(0rem, 5vw, 1.5rem);
  padding-block: clamp(1.25rem, 2.5vw, 1.75rem);
  background: linear-gradient(160deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.75));
  opacity: 0.88;
}

.app-loading-card-header {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.app-loading-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 999px;
}

.app-loading-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.app-loading-body {
  display: grid;
  gap: 0.75rem;
}

.app-loading-line {
  height: 0.85rem;
  border-radius: 999px;
}

.app-loading-line--medium {
  width: 80%;
}

.app-loading-line--short {
  width: 55%;
}

.app-loading-line--tiny {
  width: 40%;
}

.app-loading-emojis {
  display: flex;
  gap: 0.5rem;
}

.app-loading-emoji {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.85rem;
}

.app-loading-footer {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.app-loading-tag {
  height: 1.75rem;
  width: clamp(4.5rem, 25%, 6.5rem);
  border-radius: 999px;
}

.app-loading-column--aside {
  gap: 1.5rem;
}

.app-loading-aside-card {
  height: clamp(5.5rem, 12vw, 7rem);
  border-radius: 1.25rem;
}

.app-loading-aside-card--tall {
  height: clamp(9rem, 18vw, 11rem);
}

.app-loading-skeleton {
  position: relative;
  overflow: hidden;
  background: rgba(148, 163, 184, 0.14);
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.app-loading-skeleton::after {
  content: "";
  position: absolute;
  inset: -60%;
  background: linear-gradient(
    120deg,
    transparent 15%,
    rgba(248, 250, 252, 0.18) 45%,
    rgba(248, 250, 252, 0.28) 55%,
    transparent 85%
  );
  animation: app-loading-shimmer 1.6s ease-in-out infinite;
}

.app-loading-column--feed .app-loading-card::before {
  content: "";
  position: absolute;
  inset: 1px;
  border-radius: inherit;
  border: 1px solid rgba(255, 255, 255, 0.03);
}

.app-loading-column--feed .app-loading-card.app-loading-card--primary::after {
  content: "";
  position: absolute;
  inset: -40% -35% 50% 55%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(56, 189, 248, 0.18), transparent 65%);
  filter: blur(0.5px);
  opacity: 0.7;
}

@keyframes app-loading-shimmer {
  0% {
    transform: translateX(-20%);
  }
  50% {
    transform: translateX(45%);
  }
  100% {
    transform: translateX(110%);
  }
}

@media (max-width: 1024px) {
  .app-loading-scene {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .app-loading-column--aside {
    order: 3;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }
}

@media (max-width: 720px) {
  .app-loading-overlay {
    padding: 1.25rem;
  }

  .app-loading-scene {
    grid-template-columns: 1fr;
  }

  .app-loading-column--feed {
    order: 1;
  }

  .app-loading-column--nav {
    order: 2;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }

  .app-loading-nav {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
  }

  .app-loading-column--aside {
    order: 3;
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .app-loading-card {
    border-radius: 1.25rem;
    padding: 1.5rem;
  }

  .app-loading-card-header {
    gap: 0.75rem;
  }

  .app-loading-avatar {
    width: 2.5rem;
    height: 2.5rem;
  }
}
</style>
