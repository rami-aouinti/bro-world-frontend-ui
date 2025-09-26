<template>
  <div class="story-grid">
    <BaseCard hoverable>
      <template #header>
        <div class="flex items-center gap-3">
          <div class="h-12 w-12 rounded-2xl bg-white/10" />
          <div>
            <p class="text-sm font-semibold text-white">Default solid</p>
            <p class="text-xs text-slate-300">Hover to see elevation</p>
          </div>
        </div>
        <span class="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">Nouvelle</span>
      </template>

      <p>
        Créez des cartes riches en contenu avec des sections de header, body et footer en utilisant les slots fournis.
        Cette variante solide fonctionne parfaitement pour des panneaux d'information.
      </p>

      <template #footer>
        <span class="text-xs text-slate-300">Mis à jour il y a 2 heures</span>
        <div class="flex items-center gap-2">
          <div class="h-8 w-8 rounded-full bg-white/10" />
          <div class="h-8 w-20 rounded-full bg-white/10" />
        </div>
      </template>
    </BaseCard>

    <BaseCard variant="glass" hoverable media-class="p-0">
      <template #media>
        <div class="aspect-video w-full rounded-[1.5rem] bg-gradient-to-br from-primary/30 via-white/10 to-transparent" />
      </template>
      <template #header>
        <div>
          <p class="text-sm font-semibold text-white">Glass card</p>
          <p class="text-xs text-slate-200">Utilise un effet de verre dépoli</p>
        </div>
      </template>
      <p>
        Idéale pour mettre en avant des visuels. Combinez le slot <code>media</code> avec le contenu principal pour créer une
        mise en page immersive.
      </p>
      <template #footer>
        <span class="text-xs text-slate-200">Voir plus</span>
        <span class="h-9 w-24 rounded-full bg-white/10" />
      </template>
    </BaseCard>

    <BaseCard variant="outline" padding="lg" spacing="lg">
      <template #header>
        <div>
          <p class="text-sm font-semibold text-white">Outline</p>
          <p class="text-xs text-slate-300">Parfaite pour les résumés</p>
        </div>
      </template>
      <p>
        Définissez facilement la densité du contenu grâce à la prop <code>spacing</code>. Les sections optionnelles sont
        rendues uniquement lorsqu'elles sont utilisées.
      </p>
      <ul class="list-disc space-y-2 pl-5 text-sm text-slate-300">
        <li>Slots nommés pour media, header et footer.</li>
        <li>Contrôles pour les rayons, le padding et l'effet hover.</li>
        <li>Compatibles avec les loaders dédiés.</li>
      </ul>
    </BaseCard>

    <BaseCard variant="gradient" hoverable rounded="lg" padding="sm">
      <template #header>
        <div class="flex flex-col">
          <p class="text-sm font-semibold text-white">Gradient</p>
          <p class="text-xs text-slate-100">Accent color</p>
        </div>
      </template>
      <p class="text-sm text-slate-100">
        Utilisez la variante gradient pour les mises en avant de sections clés ou les call-to-action.
      </p>
      <template #footer>
        <span class="text-xs text-slate-100">CTA</span>
        <div class="h-8 w-20 rounded-full bg-white/20" />
      </template>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { BaseCard } from '../index'
</script>

<style scoped>
.story-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
}
</style>
