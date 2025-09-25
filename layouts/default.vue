<template>
  <v-app>
    <v-layout class="min-h-screen">
      <v-navigation-drawer
        v-model="leftDrawer"
        app
        :permanent="isDesktop"
        :temporary="!isDesktop"
        :scrim="!isDesktop"
        width="280"
        border="end"
      >
        <v-toolbar
          flat
          density="comfortable"
        >
          <v-toolbar-title class="text-base font-semibold">
            Navigation
          </v-toolbar-title>
        </v-toolbar>
        <v-divider />
        <v-list
          nav
          density="comfortable"
        >
          <v-list-item
            v-for="item in mainNavigation"
            :key="item.to"
            :title="item.title"
            :subtitle="item.subtitle"
            :to="item.to"
            :active="route.path === item.to"
            color="primary"
            link
          />
        </v-list>
      </v-navigation-drawer>

      <v-navigation-drawer
        v-model="rightDrawer"
        app
        location="end"
        :permanent="isDesktop"
        :temporary="!isDesktop"
        :scrim="!isDesktop"
        width="300"
        border="start"
      >
        <v-toolbar
          flat
          density="comfortable"
        >
          <v-toolbar-title class="text-base font-semibold">
            Quick Actions
          </v-toolbar-title>
        </v-toolbar>
        <v-divider />
        <div class="space-y-4 px-4 py-4">
          <p class="text-sm text-muted-foreground">
            Use these shortcuts to validate that Vuetify and Tailwind styles render together.
          </p>
          <v-btn
            color="primary"
            variant="flat"
            block
          >
            Vuetify Action
          </v-btn>
          <button
            type="button"
            class="w-full rounded-md border border-dashed border-border px-3 py-2 text-sm font-medium text-foreground transition hover:border-primary"
          >
            Tailwind Action
          </button>
        </div>
        <v-divider />
        <v-list
          nav
          density="comfortable"
        >
          <v-list-subheader>Resources</v-list-subheader>
          <v-list-item
            v-for="item in resourceLinks"
            :key="item.title"
            :title="item.title"
            :subtitle="item.subtitle"
            :href="item.href"
            target="_blank"
            rel="noopener"
            append-icon="mdi-open-in-new"
            color="primary"
            link
          />
        </v-list>
      </v-navigation-drawer>

      <v-app-bar
        app
        flat
        height="64"
        border="bottom"
      >
        <v-app-bar-nav-icon
          class="md:hidden"
          aria-label="Toggle navigation drawer"
          @click="toggleLeftDrawer"
        />
        <v-toolbar-title class="font-semibold">
          Bro World
        </v-toolbar-title>
        <v-spacer />
        <v-btn
          class="md:hidden"
          icon
          variant="text"
          aria-label="Toggle quick actions"
          @click="toggleRightDrawer"
        >
          <v-icon icon="mdi-dots-vertical" />
        </v-btn>
      </v-app-bar>

      <v-main class="bg-muted/10">
        <v-container
          class="py-6"
          fluid
        >
          <slot />
        </v-container>
      </v-main>

      <Toaster />

      <v-footer
        app
        border="top"
        class="px-4 py-3 text-sm text-muted-foreground"
      >
        <span class="mr-1">&copy; {{ currentYear }}</span>
        <span>Bro World</span>
      </v-footer>
    </v-layout>
  </v-app>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useDisplay } from 'vuetify'
import Toaster from 'shadcn-docs-nuxt/components/ui/toast/Toaster.vue'

const route = useRoute()
const display = useDisplay()

const isDesktop = computed(() => display.mdAndUp.value)
const leftDrawer = ref(false)
const rightDrawer = ref(false)

watch(
  isDesktop,
  (value) => {
    leftDrawer.value = value
    rightDrawer.value = value
  },
  { immediate: true },
)

watch(
  () => route.fullPath,
  () => {
    if (!isDesktop.value) {
      leftDrawer.value = false
      rightDrawer.value = false
    }
  },
)

function toggleLeftDrawer() {
  leftDrawer.value = !leftDrawer.value
}

function toggleRightDrawer() {
  rightDrawer.value = !rightDrawer.value
}

const currentYear = new Date().getFullYear()

const mainNavigation = [
  { title: 'Home', subtitle: 'Back to the dashboard', to: '/' },
  { title: 'Playground', subtitle: 'UI verification page', to: '/playground' },
]

const resourceLinks = [
  {
    title: 'Documentation',
    subtitle: 'Project knowledge base',
    href: 'https://bro-world-space.com/docs',
  },
  {
    title: 'Support',
    subtitle: 'Contact the team',
    href: 'mailto:hello@bro-world-space.com',
  },
]
</script>
