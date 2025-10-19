<template>
  <SidebarCard
    class="text-card-foreground px-3 py-2"
    glow
  >
    <div class="flex flex-col gap-5 animate-pulse">
      <header class="flex flex-col gap-3">
        <div class="h-3 w-24 rounded-full bg-muted/50" />
        <div class="h-6 w-40 rounded-full bg-muted/70" />
        <div class="space-y-2">
          <div class="h-3 w-full rounded-full bg-muted/40" />
          <div class="h-3 w-5/6 rounded-full bg-muted/30" />
        </div>
      </header>

      <ul class="flex flex-col gap-4">
        <li
          v-for="index in 3"
          :key="index"
          class="flex flex-col gap-3"
        >
          <div class="flex items-start gap-3">
            <div class="h-10 w-10 rounded-2xl bg-muted/40" />
            <div class="flex-1 space-y-2">
              <div class="h-4 w-32 rounded-full bg-muted/70" />
              <div class="h-3 w-48 rounded-full bg-muted/40" />
            </div>
          </div>
          <div class="h-4 w-24 rounded-full bg-primary/30" />
        </li>
      </ul>
    </div>
  </SidebarCard>
</template>
