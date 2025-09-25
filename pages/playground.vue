<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-semibold tracking-tight">Playground</h1>
      <p class="mt-2 text-base text-muted-foreground">
        Quick spot-check for the shared Vuetify and Tailwind design surface.
      </p>
    </div>
    <v-card class="p-6">
      <div class="flex flex-wrap items-center gap-4">
        <v-btn
          color="primary"
          variant="flat"
        >
          Vuetify Button
        </v-btn>
        <button
          type="button"
          class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
        >
          Tailwind Button
        </button>
      </div>
    </v-card>
    <v-card class="p-6">
      <div class="grid gap-4 md:grid-cols-2">
        <v-alert
          type="info"
          variant="flat"
        >
          Vuetify components render with their expected theme tokens.
        </v-alert>
        <div class="rounded-lg border border-dashed border-border bg-background/60 p-4">
          <p class="text-sm text-muted-foreground">
            Tailwind utility styles layer on top without overriding the Vuetify base styles. Use this page to verify new layout
            changes quickly.
          </p>
        </div>
      </div>
    </v-card>
  </div>
</template>
