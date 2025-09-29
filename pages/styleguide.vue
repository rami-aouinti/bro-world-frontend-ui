<template>
  <main class="styleguide-page px-6 pb-16 pt-10">
    <header class="styleguide-header mx-auto mb-10 flex w-full max-w-5xl flex-col gap-6">
      <div class="flex flex-col gap-2">
        <h1 class="text-3xl font-semibold tracking-tight">Design System Styleguide</h1>
        <p class="max-w-3xl text-base text-muted-foreground">
          Aperçu interactif des composants fondamentaux de l'interface BroWorld.
          Utilisez les contrôles ci-dessous pour vérifier les variantes, les états d'accessibilité,
          la compatibilité responsive et la cohérence des modes clair/sombre.
        </p>
      </div>

      <div class="styleguide-controls grid gap-4 rounded-xl border border-border bg-card/60 p-4 shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <h2 class="text-lg font-semibold">Aperçu global</h2>
          <p class="text-sm text-muted-foreground">
            Les contrôles s'appliquent à toutes les démonstrations ci-dessous pour faciliter la revue visuelle.
          </p>
        </div>

        <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div class="flex flex-1 flex-col gap-2">
            <span class="text-sm font-medium uppercase tracking-wide text-muted-foreground">Mode couleur</span>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="option in colorModeOptions"
                :key="option.value"
                type="button"
                class="styleguide-toggle"
                :class="{ 'styleguide-toggle--active': activeColorMode === option.value }"
                :aria-pressed="activeColorMode === option.value"
                @click="setColorPreference(option.value)"
              >
                {{ option.label }}
              </button>
            </div>
            <p class="text-xs text-muted-foreground">
              Astuce : le mode "Auto" s'aligne sur le système et permet de comparer rapidement la bascule.
            </p>
          </div>

          <div class="flex flex-1 flex-col gap-2">
            <span class="text-sm font-medium uppercase tracking-wide text-muted-foreground">Breakpoint</span>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="option in breakpointOptions"
                :key="option.value"
                type="button"
                class="styleguide-toggle"
                :class="{ 'styleguide-toggle--active': selectedBreakpoint === option.value }"
                :aria-pressed="selectedBreakpoint === option.value"
                @click="selectedBreakpoint = option.value"
              >
                {{ option.label }}
              </button>
            </div>
            <p class="text-xs text-muted-foreground">
              {{ breakpointDescription }}
            </p>
          </div>
        </div>
      </div>
    </header>

    <div class="styleguide-preview-wrapper mx-auto flex w-full justify-center px-2">
      <div
        class="styleguide-preview grid w-full gap-10"
        :style="previewStyle"
      >
        <section class="styleguide-section">
          <header class="styleguide-section__header">
            <h2>Boutons</h2>
            <p>Variantes, tailles et états principaux.</p>
          </header>
          <div class="space-y-8">
            <div
              v-for="variant in buttonVariants"
              :key="variant"
              class="space-y-4"
            >
              <h3 class="text-sm font-semibold uppercase text-muted-foreground">{{ variant }}</h3>
              <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div
                  v-for="state in buttonStates"
                  :key="`${variant}-${state.id}`"
                  class="styleguide-state-card"
                  :data-state="state.id"
                >
                  <p class="styleguide-state-card__label">{{ state.label }}</p>
                  <BaseButton
                    :variant="variant"
                    :size="state.size"
                    :loading="state.loading"
                    :disabled="state.disabled"
                    :class="state.className"
                  >
                    {{ state.label }}
                  </BaseButton>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="styleguide-section">
          <header class="styleguide-section__header">
            <h2>Cards</h2>
            <p>Conteneurs avec variantes contenu/squelette.</p>
          </header>
          <div class="grid gap-6 lg:grid-cols-2">
            <BaseCard class="flex flex-col gap-4">
              <h3 class="text-lg font-semibold">Card par défaut</h3>
              <p class="text-sm text-muted-foreground">
                Utilisée pour les encarts de contenu avec padding interne et fond conforme aux thèmes.
              </p>
              <div class="flex flex-wrap gap-3">
                <BaseButton size="sm" variant="tonal">Action</BaseButton>
                <BaseButton size="sm" variant="outline">Secondaire</BaseButton>
              </div>
            </BaseCard>

            <BaseCardLoader class="h-full">
              <span class="sr-only">Chargement du contenu</span>
            </BaseCardLoader>
          </div>
        </section>

        <section class="styleguide-section">
          <header class="styleguide-section__header">
            <h2>Formulaires</h2>
            <p>Champs de saisie avec focus, erreurs et états désactivés.</p>
          </header>
          <div class="grid gap-6 lg:grid-cols-2">
            <div class="flex flex-col gap-4">
              <FormField label="Email" :error="true" hint="Nous n'utiliserons jamais votre email pour du spam.">
                <BaseInput
                  v-model="formValues.email"
                  placeholder="john@bro.world"
                  type="email"
                  :error-messages="['Adresse invalide']"
                />
              </FormField>
              <FormField label="Message" hint="Saisissez un message de démonstration.">
                <BaseTextarea
                  v-model="formValues.message"
                  placeholder="Votre message"
                  rows="3"
                />
              </FormField>
              <FormField label="Pays" hint="Menu déroulant avec état désactivé">
                <BaseSelect
                  v-model="formValues.country"
                  :items="selectOptions"
                  placeholder="Choisir un pays"
                />
              </FormField>
            </div>
            <div class="flex flex-col gap-6">
              <FormField label="Préférences">
                <div class="grid gap-4">
                  <BaseCheckbox v-model="formValues.agree" label="J'accepte les conditions" />
                  <BaseSwitch v-model="formValues.notifications" label="Notifications" />
                </div>
              </FormField>

              <FormField label="Plan" hint="Afficher les états actif/désactivé">
                <BaseRadioGroup
                  v-model="formValues.plan"
                  :options="radioOptions"
                  direction="vertical"
                  :error-messages="['Choisissez une option']"
                  :error="formValues.plan === ''"
                />
              </FormField>
            </div>
          </div>
        </section>

        <section class="styleguide-section">
          <header class="styleguide-section__header">
            <h2>Listes et contenu</h2>
            <p>Utilisation des tokens de liste et typographie.</p>
          </header>
          <BaseCard class="flex flex-col gap-4">
            <h3 class="text-lg font-semibold">Liste d'actions</h3>
            <ul class="styleguide-list">
              <li v-for="item in listItems" :key="item.label">
                <div class="flex items-center gap-4">
                  <div class="styleguide-list__icon">{{ item.icon }}</div>
                  <div>
                    <p class="font-medium">{{ item.label }}</p>
                    <p class="text-sm text-muted-foreground">{{ item.description }}</p>
                  </div>
                </div>
                <BaseButton
                  size="sm"
                  variant="text"
                  class="styleguide-list__action"
                >
                  Voir détail
                </BaseButton>
              </li>
            </ul>
          </BaseCard>
        </section>

        <section class="styleguide-section">
          <header class="styleguide-section__header">
            <h2>Dialogues</h2>
            <p>Modales primaires et confirmation destructive.</p>
          </header>
          <div class="flex flex-wrap gap-4">
            <BaseButton variant="filled" @click="showPrimaryModal = true">Ouvrir la modale</BaseButton>
            <BaseButton variant="outline" color="error" @click="showDeleteModal = true">Supprimer un élément</BaseButton>
          </div>
        </section>
      </div>
    </div>

    <BaseModal
      v-model="showPrimaryModal"
      title="Modale de démonstration"
      @primary="showPrimaryModal = false"
    >
      <p class="text-sm text-muted-foreground">
        Cette modale illustre la typographie par défaut et le footer primaire.
        Testez la navigation clavier pour vérifier le focus visible.
      </p>
    </BaseModal>

    <DeleteConfirmModal
      v-model="showDeleteModal"
      title="Supprimer un commentaire"
      confirm-label="Confirmer"
      message="Cette action est irréversible."
      @confirm="showDeleteModal = false"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useCookieColorMode } from '#imports'
import {
  BaseButton,
  BaseCard,
  BaseCardLoader,
  BaseCheckbox,
  BaseInput,
  BaseRadioGroup,
  BaseSelect,
  BaseSwitch,
  BaseTextarea,
  DeleteConfirmModal,
  FormField,
  BaseModal,
} from '~/components/ui'

const colorMode = useCookieColorMode()
const activeColorMode = computed(() => {
  const raw = colorMode.preference ?? (colorMode.value as 'auto' | 'light' | 'dark' | undefined)
  return raw ?? 'auto'
})

const colorModeOptions = [
  { label: 'Auto', value: 'auto' as const },
  { label: 'Clair', value: 'light' as const },
  { label: 'Sombre', value: 'dark' as const },
]

type BreakpointKey = 'auto' | 'sm' | 'md' | 'lg' | 'xl'

const breakpointOptions: Array<{ label: string; value: BreakpointKey; width: number | null }> = [
  { label: 'Auto', value: 'auto', width: null },
  { label: 'sm', value: 'sm', width: 640 },
  { label: 'md', value: 'md', width: 768 },
  { label: 'lg', value: 'lg', width: 1024 },
  { label: 'xl', value: 'xl', width: 1280 },
]

const selectedBreakpoint = ref<BreakpointKey>('auto')

const previewStyle = computed(() => {
  const option = breakpointOptions.find((candidate) => candidate.value === selectedBreakpoint.value)
  if (!option || !option.width) {
    return {
      width: '100%',
    }
  }
  return {
    width: '100%',
    maxWidth: `${option.width}px`,
  }
})

const breakpointDescription = computed(() => {
  const option = breakpointOptions.find((candidate) => candidate.value === selectedBreakpoint.value)
  if (!option) {
    return 'Prévisualisation pleine largeur.'
  }
  if (!option.width) {
    return 'Prévisualisation pleine largeur.'
  }
  return `Conteneur limité à ${option.width}px pour simuler le breakpoint ${option.label}.`
})

const buttonVariants = ['filled', 'tonal', 'outline', 'text', 'plain'] as const

type ButtonStateId = 'default' | 'hover' | 'focus' | 'disabled' | 'loading'

const buttonStates: Array<{
  id: ButtonStateId
  label: string
  loading?: boolean
  disabled?: boolean
  className?: string
  size: 'sm' | 'md' | 'lg'
}> = [
  { id: 'default', label: 'Défaut', size: 'md' },
  { id: 'hover', label: 'Hover', className: 'is-simulated-hover', size: 'md' },
  { id: 'focus', label: 'Focus', className: 'is-simulated-focus', size: 'md' },
  { id: 'disabled', label: 'Désactivé', disabled: true, size: 'md' },
  { id: 'loading', label: 'Chargement', loading: true, size: 'md' },
]

const formValues = reactive({
  email: '',
  message: '',
  country: '',
  agree: true,
  notifications: false,
  plan: '',
})

const selectOptions = [
  { label: 'France', value: 'fr' },
  { label: 'Canada', value: 'ca' },
  { label: 'Tunisie', value: 'tn' },
  { label: 'Brésil', value: 'br', disabled: true },
]

const radioOptions = [
  { label: 'Gratuit', value: 'free', hint: 'Fonctionnalités de base' },
  { label: 'Pro', value: 'pro', hint: 'Accès aux analytics', disabled: false },
  { label: 'Entreprise', value: 'enterprise', hint: 'Support dédié', disabled: true },
]

const listItems = [
  { icon: '📝', label: 'Brief créatif', description: 'Valider le contenu principal des campagnes.' },
  { icon: '🎯', label: 'Objectifs', description: 'Aligner l’équipe sur les KPIs trimestriels.' },
  { icon: '🛠️', label: 'Maintenance', description: 'Suivi des corrections et dettes techniques.' },
]

const showPrimaryModal = ref(false)
const showDeleteModal = ref(false)

function setColorPreference(value: 'auto' | 'light' | 'dark') {
  colorMode.preference = value
}

definePageMeta({
  showRightWidgets: false,
})
</script>

<style scoped>
.styleguide-page {
  min-height: 100vh;
}

.styleguide-controls {
  backdrop-filter: blur(12px);
}

.styleguide-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  border: 1px solid var(--border-color, hsl(var(--border)));
  padding: 0.375rem 0.875rem;
  font-size: 0.875rem;
  font-weight: 600;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
  background-color: transparent;
  color: hsl(var(--foreground));
}

.styleguide-toggle:hover {
  background-color: hsl(var(--muted));
}

.styleguide-toggle--active {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border-color: transparent;
}

.styleguide-preview {
  background: linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted)) 100%);
  border-radius: 1.25rem;
  border: 1px solid hsl(var(--border));
  padding: clamp(1.5rem, 3vw, 3rem);
}

.styleguide-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.styleguide-section__header h2 {
  font-size: 1.5rem;
  font-weight: 600;
}

.styleguide-section__header p {
  color: hsl(var(--muted-foreground));
  font-size: 0.9375rem;
  margin-top: 0.25rem;
}

.styleguide-state-card {
  border-radius: 0.75rem;
  border: 1px dashed hsl(var(--border));
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background-color: hsl(var(--card));
}

.styleguide-state-card__label {
  font-size: 0.875rem;
  font-weight: 600;
}

.styleguide-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.styleguide-list li {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: 1fr auto;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid hsl(var(--border));
}

.styleguide-list li:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.styleguide-list__icon {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 9999px;
  display: grid;
  place-items: center;
  background-color: hsl(var(--muted));
  font-size: 1.125rem;
}

.styleguide-list__action {
  justify-self: end;
}

:deep(.is-simulated-hover .v-btn) {
  position: relative;
}

:deep(.is-simulated-hover .v-btn::after) {
  content: '';
  position: absolute;
  inset: 0;
  background-color: currentColor;
  opacity: 0.08;
  pointer-events: none;
  border-radius: inherit;
}

:deep(.is-simulated-focus .v-btn) {
  box-shadow: var(--ui-focus, 0 0 0 3px color-mix(in srgb, hsl(var(--primary)) 40%, transparent));
}

:deep(.v-overlay__scrim) {
  backdrop-filter: blur(2px);
}

@media (max-width: 640px) {
  .styleguide-preview {
    border-radius: 1rem;
  }
}
</style>
