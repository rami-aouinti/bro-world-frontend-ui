<template>
  <SidebarCard
    class="text-card-foreground px-3 py-2"
    glow
  >
    <div class="space-y-6 animate-pulse">
      <header class="flex items-center justify-between text-card-foreground">
        <div class="space-y-2">
          <div class="h-5 w-32 rounded-full bg-muted/70" />
          <div class="h-3 w-40 rounded-full bg-muted/50" />
        </div>
        <div class="flex items-center gap-3">
          <div class="h-8 w-8 rounded-full bg-muted/40" />
          <div class="space-y-2 text-right">
            <div class="h-6 w-12 rounded-full bg-muted/70" />
            <div class="h-3 w-10 rounded-full bg-muted/40" />
          </div>
        </div>
      </header>

      <div class="flex flex-col items-center gap-3">
        <div class="h-6 w-28 rounded-full bg-muted/40" />
        <div class="h-3 w-24 rounded-full bg-muted/30" />
      </div>

      <div class="space-y-4">
        <div
          v-for="index in 3"
          :key="index"
          class="flex items-center gap-3"
        >
          <div class="h-4 w-16 rounded-full bg-muted/50" />
          <div class="h-2 flex-1 rounded-full bg-muted/40" />
          <div class="h-3 w-8 rounded-full bg-muted/40" />
        </div>
      </div>

      <div class="h-12 rounded-2xl border border-dashed border-border/60 bg-muted/30" />
    </div>
  </SidebarCard>
</template>
