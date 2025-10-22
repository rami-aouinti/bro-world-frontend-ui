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

        <div
          class="app-loading-scene"
          aria-hidden="true"
        >
          <!-- NAVBAR -->
          <header class="app-loading-navbar">
            <div class="app-loading-navbar-inner">
              <span class="app-loading-brand app-loading-skeleton" />
              <span class="app-loading-search app-loading-skeleton" />
              <div class="app-loading-actions">
                <span class="app-loading-action app-loading-skeleton" />
                <span class="app-loading-action app-loading-skeleton" />
                <span class="app-loading-action app-loading-skeleton" />
                <span class="app-loading-avatar app-loading-skeleton" />
              </div>
            </div>
          </header>

          <!-- COLONNE GAUCHE (sidebar) -->
          <aside class="app-loading-column app-loading-column--nav mt-5">
            <div class="app-loading-aside-card app-loading-aside-card--nav app-loading-skeleton">
              <div class="app-loading-nav">
                <span
                  v-for="item in 7"
                  :key="`nav-${item}`"
                  class="app-loading-nav-item app-loading-skeleton"
                />
              </div>
            </div>
          </aside>

          <!-- COLONNE CENTRALE (grid 3x3) -->
          <section class="app-loading-column app-loading-column--feed mt-5">
            <div class="app-loading-card app-loading-card--mini app-loading-skeleton">
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

              <div class="app-loading-footer">
                <span class="app-loading-tag app-loading-skeleton" />
                <span class="app-loading-tag app-loading-skeleton" />
              </div>
            </div>
            <div class="app-loading-grid">
              <div
                v-for="i in 9"
                :key="`card-${i}`"
                class="app-loading-card app-loading-card--mini app-loading-skeleton"
              >
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

                <div class="app-loading-footer">
                  <span class="app-loading-tag app-loading-skeleton" />
                  <span class="app-loading-tag app-loading-skeleton" />
                </div>
              </div>
            </div>
          </section>

          <!-- COLONNE DROITE (widgets) -->
          <aside class="app-loading-column app-loading-column--aside mt-5">
            <div class="app-loading-aside-card app-loading-skeleton" />
            <div class="app-loading-aside-card app-loading-skeleton" />
            <div
              class="app-loading-aside-card app-loading-aside-card--tall-2 app-loading-skeleton"
            />
          </aside>
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
  { visible: false },
);

const { t } = useI18n();
</script>

<style scoped>
/* --- Transition --- */
.app-loading-fade-enter-active,
.app-loading-fade-leave-active {
  transition: opacity 0.35s ease;
}
.app-loading-fade-enter-from,
.app-loading-fade-leave-to {
  opacity: 0;
}

/* --- Overlay --- */
.app-loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  width: 100vw;
  min-height: 100vh;
  box-sizing: border-box;
  padding: clamp(1.25rem, 4vw, 3rem);
  background:
    radial-gradient(circle at 20% 20%, rgba(56, 189, 248, 0.1), transparent 55%),
    radial-gradient(circle at 80% 10%, rgba(34, 211, 238, 0.12), transparent 60%),
    radial-gradient(circle at 50% 100%, rgba(99, 102, 241, 0.18), transparent 65%),
    hsl(var(--background) / 0.93);
  backdrop-filter: blur(14px) saturate(130%);
}

/* --- Navbar skeleton --- */
.app-loading-navbar {
  --nav-h: 56px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: var(--nav-h);
  display: flex;
  align-items: center;
  padding: 0 clamp(1rem, 3vw, 1.5rem);
  background: linear-gradient(150deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.82));
  backdrop-filter: blur(10px) saturate(120%);
  border-bottom: 1px solid rgb(3, 32, 61);
  z-index: 1;
}
.app-loading-navbar-inner {
  width: 100%;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: clamp(0.75rem, 2vw, 1rem);
}
.app-loading-brand {
  width: 11rem;
  height: 1.75rem;
  border-radius: 0.6rem;
}
.app-loading-search {
  height: 2.2rem;
  border-radius: 999px;
  width: min(100%, 560px);
  justify-self: center;
}
.app-loading-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.app-loading-action {
  width: 2rem;
  height: 2rem;
  border-radius: 0.75rem;
}
@media (max-width: 720px) {
  .app-loading-navbar-inner {
    grid-template-columns: auto auto;
  }
  .app-loading-search {
    display: none;
  }
}

/* --- Scène (3 colonnes) --- */
.app-loading-scene {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) minmax(520px, 1.4fr) minmax(280px, 1fr);
  gap: clamp(1.25rem, 3.5vw, 2.25rem);
  align-items: start;
  width: 100%;
  margin-top: var(--nav-h); /* éviter le recouvrement */
}
.app-loading-column {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* --- Sidebar gauche --- */
.app-loading-aside-card {
  border-radius: 1.25rem;
  height: auto;
}
.app-loading-aside-card--nav {
  padding: 0.8rem 0;
}
.app-loading-nav {
  display: grid;
  gap: 0.85rem;
  padding: 0.35rem 0.5rem;
}
.app-loading-nav-item {
  height: 2.8rem;
  border-radius: 999px;
}

/* --- Colonne centrale (grid 3x3) --- */
.app-loading-grid {
  display: grid;
  gap: clamp(0.9rem, 2vw, 1.25rem);
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.app-loading-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border-radius: 1rem;
  padding: clamp(1rem, 2.2vw, 1.25rem);
  background: linear-gradient(150deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.82));
  border: 1px solid rgba(148, 163, 184, 0.14);
  box-shadow:
    0 18px 36px rgba(15, 23, 42, 0.45),
    0 8px 16px rgba(15, 23, 42, 0.28);
}
.app-loading-card-header {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}
.app-loading-avatar {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 999px;
}
.app-loading-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.app-loading-body {
  display: grid;
  gap: 0.55rem;
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
.app-loading-footer {
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
}
.app-loading-tag {
  height: 1.5rem;
  width: clamp(4.2rem, 25%, 6rem);
  border-radius: 999px;
}

/* --- Colonne droite (widgets cards) --- */
.app-loading-column--aside .app-loading-aside-card {
  height: clamp(7.5rem, 18vw, 11rem);
  border-radius: 1.15rem;
}
.app-loading-aside-card--tall-2 {
  height: clamp(7rem, 18vw, 7rem);
}

/* --- Skeleton skin + shimmer --- */
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

/* --- Responsive --- */
@media (max-width: 1200px) {
  .app-loading-scene {
    grid-template-columns: minmax(200px, 1fr) minmax(420px, 1.2fr) minmax(240px, 1fr);
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
  .app-loading-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
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
  }
  .app-loading-column--aside {
    order: 3;
    grid-template-columns: 1fr;
  }
  .app-loading-grid {
    grid-template-columns: 1fr;
  }
}

/* --- SR only --- */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
