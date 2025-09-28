<template>
  <main class="py-10" aria-labelledby="admin-title">
    <v-container>
      <header class="mb-10">
        <div class="d-flex flex-column flex-lg-row align-lg-center justify-space-between gap-4">
          <div>
            <h1 id="admin-title" class="text-h4 text-lg-h3 font-weight-bold mb-2">
              Espace d'administration
            </h1>
            <p id="admin-subtitle" class="text-body-1 text-medium-emphasis mb-0">
              Pilotez l'ensemble de la plateforme, suivez les indicateurs clés et activez les bons leviers en quelques clics.
            </p>
          </div>
          <div class="d-flex flex-wrap gap-3">
            <v-btn color="primary" variant="flat" prepend-icon="mdi-shield-account" class="text-none">
              Nouveau rôle admin
            </v-btn>
            <v-btn color="primary" variant="tonal" prepend-icon="mdi-file-chart" class="text-none">
              Exporter le rapport
            </v-btn>
          </div>
        </div>
      </header>

      <section aria-labelledby="admin-stats" class="mb-12">
        <div class="d-flex flex-column flex-md-row align-md-center justify-space-between gap-4 mb-4">
          <h2 id="admin-stats" class="text-h5 font-weight-semibold mb-0">Aperçu en temps réel</h2>
          <span class="text-body-2 text-medium-emphasis">Données consolidées sur les dernières 24 heures</span>
        </div>
        <v-row dense>
          <v-col
            v-for="metric in metrics"
            :key="metric.id"
            cols="12"
            sm="6"
            md="3"
          >
            <v-card class="pa-5 h-100" rounded="xl" elevation="8" variant="elevated">
              <div class="d-flex justify-space-between align-start">
                <div>
                  <p class="text-subtitle-2 text-medium-emphasis mb-1">{{ metric.label }}</p>
                  <p class="text-h5 text-lg-h4 font-weight-bold mb-0">{{ metric.value }}</p>
                  <div class="d-flex align-center gap-2 mt-3">
                    <v-chip
                      :color="metric.trendIsPositive ? 'success' : 'error'"
                      variant="tonal"
                      size="x-small"
                      class="font-weight-medium"
                    >
                      <v-icon
                        :icon="metric.trendIsPositive ? 'mdi-arrow-up-bold' : 'mdi-arrow-down-bold'"
                        size="16"
                        class="me-1"
                      />
                      {{ metric.trend }}
                    </v-chip>
                    <span class="text-caption text-medium-emphasis">{{ metric.caption }}</span>
                  </div>
                </div>
                <v-avatar color="primary" variant="tonal" size="44">
                  <v-icon :icon="metric.icon" size="26" />
                </v-avatar>
              </div>
              <p class="text-body-2 text-medium-emphasis mb-0 mt-4">{{ metric.description }}</p>
            </v-card>
          </v-col>
        </v-row>
      </section>

      <section aria-labelledby="admin-controls" class="mb-12">
        <div class="d-flex flex-column flex-md-row align-md-center justify-space-between gap-4 mb-4">
          <h2 id="admin-controls" class="text-h5 font-weight-semibold mb-0">Contrôles globaux</h2>
          <span class="text-body-2 text-medium-emphasis">Activez ou désactivez les fonctionnalités critiques du site</span>
        </div>
        <v-row dense>
          <v-col
            v-for="control in controlToggles"
            :key="control.id"
            cols="12"
            md="6"
          >
            <v-card class="pa-6 h-100" rounded="xl" variant="tonal">
              <div class="d-flex justify-space-between align-start">
                <div>
                  <h3 class="text-subtitle-1 font-weight-semibold mb-2">{{ control.label }}</h3>
                  <p class="text-body-2 text-medium-emphasis mb-4">{{ control.description }}</p>
                </div>
                <v-avatar color="primary" variant="tonal">
                  <v-icon :icon="control.icon" />
                </v-avatar>
              </div>
              <v-switch
                v-model="control.model.value"
                inset
                :color="control.model.value ? control.activeColor : 'primary'"
                :class="['mt-2', 'text-body-2']"
                :label="control.model.value ? control.enabledLabel : control.disabledLabel"
                hide-details
              />
              <p class="text-caption text-medium-emphasis mt-3 mb-0">{{ control.helper }}</p>
            </v-card>
          </v-col>
        </v-row>
      </section>

      <section aria-labelledby="admin-actions" class="mb-12">
        <div class="d-flex flex-column flex-md-row align-md-center justify-space-between gap-4 mb-4">
          <h2 id="admin-actions" class="text-h5 font-weight-semibold mb-0">Actions rapides</h2>
          <span class="text-body-2 text-medium-emphasis">Déclenchez les opérations de gestion les plus utilisées</span>
        </div>
        <v-row dense>
          <v-col
            v-for="action in quickActions"
            :key="action.id"
            cols="12"
            md="4"
          >
            <v-card class="pa-6 h-100" rounded="xl" elevation="6">
              <div class="d-flex align-start gap-4">
                <v-avatar :color="action.color" variant="tonal" size="48">
                  <v-icon :icon="action.icon" size="26" />
                </v-avatar>
                <div class="flex-grow-1">
                  <h3 class="text-subtitle-1 font-weight-semibold mb-2">{{ action.title }}</h3>
                  <p class="text-body-2 text-medium-emphasis mb-4">{{ action.description }}</p>
                  <v-btn
                    :color="action.color"
                    variant="flat"
                    class="text-none"
                    block
                    prepend-icon="mdi-play-circle"
                  >
                    Lancer
                  </v-btn>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </section>

      <section aria-labelledby="admin-modules" class="mb-12">
        <div class="d-flex flex-column flex-md-row align-md-center justify-space-between gap-4 mb-4">
          <h2 id="admin-modules" class="text-h5 font-weight-semibold mb-0">Modules de gestion</h2>
          <span class="text-body-2 text-medium-emphasis">Retrouvez les espaces dédiés à chaque pilier de la plateforme</span>
        </div>
        <v-row dense>
          <v-col
            v-for="module in adminModules"
            :key="module.id"
            cols="12"
            md="6"
          >
            <v-card class="pa-6 h-100" rounded="xl" variant="elevated" elevation="6">
              <div class="d-flex flex-column gap-4">
                <div class="d-flex align-start gap-3">
                  <v-avatar color="primary" variant="tonal" size="44">
                    <v-icon :icon="module.icon" size="24" />
                  </v-avatar>
                  <div>
                    <h3 class="text-subtitle-1 font-weight-semibold mb-1">{{ module.title }}</h3>
                    <p class="text-body-2 text-medium-emphasis mb-0">{{ module.description }}</p>
                  </div>
                </div>
                <div class="d-flex flex-wrap gap-2" role="list">
                  <v-chip
                    v-for="tag in module.tags"
                    :key="tag"
                    role="listitem"
                    color="primary"
                    variant="tonal"
                    size="small"
                  >
                    {{ tag }}
                  </v-chip>
                </div>
                <div class="d-flex flex-column gap-2">
                  <v-btn
                    color="primary"
                    variant="flat"
                    class="text-none"
                    prepend-icon="mdi-open-in-new"
                  >
                    Ouvrir le module
                  </v-btn>
                  <v-btn
                    color="primary"
                    variant="tonal"
                    class="text-none"
                    prepend-icon="mdi-clipboard-text"
                  >
                    Voir les politiques
                  </v-btn>
                </div>
                <p class="text-caption text-medium-emphasis mb-0">{{ module.status }}</p>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </section>

      <v-row dense align="stretch" class="mb-12">
        <v-col cols="12" md="6">
          <section aria-labelledby="admin-activity" class="h-100">
            <v-card class="pa-6 h-100" rounded="xl" variant="tonal">
              <div class="d-flex justify-space-between align-start mb-4">
                <div>
                  <h2 id="admin-activity" class="text-h5 font-weight-semibold mb-1">Activité récente</h2>
                  <p class="text-body-2 text-medium-emphasis mb-0">Suivi des actions réalisées par les administrateurs</p>
                </div>
                <v-btn color="primary" variant="text" class="text-none" prepend-icon="mdi-history">
                  Historique complet
                </v-btn>
              </div>
              <v-divider class="mb-4" />
              <div class="d-flex flex-column gap-4" role="list">
                <div
                  v-for="item in activityFeed"
                  :key="item.id"
                  role="listitem"
                  class="d-flex gap-3"
                >
                  <v-avatar :color="item.color" variant="tonal" size="40">
                    <v-icon :icon="item.icon" size="22" />
                  </v-avatar>
                  <div class="flex-grow-1">
                    <div class="d-flex align-center justify-space-between gap-2">
                      <h3 class="text-subtitle-2 font-weight-semibold mb-0">{{ item.title }}</h3>
                      <span class="text-caption text-medium-emphasis">{{ item.time }}</span>
                    </div>
                    <p class="text-body-2 text-medium-emphasis mb-0 mt-1">{{ item.description }}</p>
                  </div>
                </div>
              </div>
            </v-card>
          </section>
        </v-col>
        <v-col cols="12" md="6">
          <section aria-labelledby="admin-health" class="h-100">
            <v-card class="pa-6 h-100" rounded="xl" variant="tonal">
              <div class="d-flex justify-space-between align-start mb-4">
                <div>
                  <h2 id="admin-health" class="text-h5 font-weight-semibold mb-1">Santé du système</h2>
                  <p class="text-body-2 text-medium-emphasis mb-0">Surveillez les flux critiques et leur état opérationnel</p>
                </div>
                <v-btn color="primary" variant="text" class="text-none" prepend-icon="mdi-connection">
                  Centre de statut
                </v-btn>
              </div>
              <v-divider class="mb-4" />
              <div class="d-flex flex-column gap-4" role="list">
                <div
                  v-for="service in systemStatus"
                  :key="service.id"
                  role="listitem"
                  class="d-flex flex-column gap-2"
                >
                  <div class="d-flex align-center justify-space-between">
                    <div class="d-flex align-center gap-3">
                      <v-avatar :color="service.color" variant="tonal" size="36">
                        <v-icon :icon="service.icon" size="20" />
                      </v-avatar>
                      <div>
                        <p class="text-subtitle-2 font-weight-semibold mb-0">{{ service.name }}</p>
                        <span class="text-caption text-medium-emphasis">{{ service.description }}</span>
                      </div>
                    </div>
                    <v-chip :color="service.color" variant="flat" size="small" class="font-weight-medium text-none">
                      {{ service.status }}
                    </v-chip>
                  </div>
                  <v-progress-linear
                    :model-value="service.uptime"
                    :color="service.color"
                    height="6"
                    rounded
                  />
                  <div class="d-flex justify-space-between text-caption text-medium-emphasis">
                    <span>Disponibilité</span>
                    <span>{{ service.uptime }}%</span>
                  </div>
                </div>
              </div>
            </v-card>
          </section>
        </v-col>
      </v-row>

      <section aria-labelledby="admin-resources" class="mb-6">
        <v-card class="pa-6" rounded="xl" variant="elevated" elevation="4">
          <div class="d-flex flex-column flex-md-row align-md-center justify-space-between gap-4">
            <div>
              <h2 id="admin-resources" class="text-h5 font-weight-semibold mb-1">Ressources & conformité</h2>
              <p class="text-body-2 text-medium-emphasis mb-0">Assurez-vous que vos équipes disposent des bonnes directives pour maintenir la qualité du site.</p>
            </div>
            <div class="d-flex flex-wrap gap-3">
              <v-btn color="primary" variant="flat" class="text-none" prepend-icon="mdi-book-open-page-variant">
                Centre de connaissances
              </v-btn>
              <v-btn color="primary" variant="tonal" class="text-none" prepend-icon="mdi-shield-check">
                Audit de conformité
              </v-btn>
            </div>
          </div>
          <v-divider class="my-6" />
          <div class="d-flex flex-column flex-md-row gap-6" role="list">
            <div
              v-for="resource in resources"
              :key="resource.id"
              role="listitem"
              class="flex-grow-1"
            >
              <p class="text-subtitle-2 font-weight-semibold mb-2">{{ resource.title }}</p>
              <p class="text-body-2 text-medium-emphasis mb-3">{{ resource.description }}</p>
              <v-btn color="primary" variant="text" class="text-none" prepend-icon="mdi-download">
                Télécharger
              </v-btn>
            </div>
          </div>
        </v-card>
      </section>
    </v-container>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

definePageMeta({
  showRightWidgets: false,
})

useHead({
  title: "Administration",
})

const numberFormatter = new Intl.NumberFormat('fr-FR')

const metrics = computed(() => [
  {
    id: 'users',
    label: 'Utilisateurs actifs',
    value: numberFormatter.format(12486),
    trend: '+12% cette semaine',
    trendIsPositive: true,
    caption: 'Engagement moyen par session',
    icon: 'mdi-account-group',
    description: 'Mesure le nombre de membres connectés au cours des dernières 24 heures.',
  },
  {
    id: 'content',
    label: 'Contenus publiés',
    value: numberFormatter.format(872),
    trend: '+5% vs. hier',
    trendIsPositive: true,
    caption: 'Nouveaux articles et annonces',
    icon: 'mdi-text-box-multiple',
    description: 'Nombre total de publications, événements et annonces validés.',
  },
  {
    id: 'reports',
    label: 'Signalements traités',
    value: numberFormatter.format(94),
    trend: '-8% vs. moyenne',
    trendIsPositive: true,
    caption: 'Temps moyen de résolution: 1h42',
    icon: 'mdi-shield-check',
    description: 'Tickets de modération résolus par l’équipe de support.',
  },
  {
    id: 'availability',
    label: 'Taux de disponibilité',
    value: '99,98%',
    trend: '+0,2 point',
    trendIsPositive: true,
    caption: 'Sur les 30 derniers jours',
    icon: 'mdi-chart-areaspline',
    description: 'Indicateur consolidé sur l’ensemble des services critiques.',
  },
])

const maintenanceMode = ref(false)
const openRegistrations = ref(true)
const autoModeration = ref(true)
const globalAnnouncements = ref(false)

const controlToggles = computed(() => [
  {
    id: 'maintenance',
    label: 'Mode maintenance',
    description: 'Activez un message de maintenance et restreignez l’accès aux administrateurs uniquement.',
    helper: 'Recommandé uniquement pour les mises à jour majeures.',
    icon: 'mdi-tools',
    enabledLabel: 'Maintenance activée',
    disabledLabel: 'Maintenance désactivée',
    activeColor: 'warning',
    model: maintenanceMode,
  },
  {
    id: 'registrations',
    label: 'Inscriptions ouvertes',
    description: 'Permettez aux nouveaux membres de créer un compte sans invitation préalable.',
    helper: 'Surveillez l’afflux via les rapports de croissance.',
    icon: 'mdi-account-plus',
    enabledLabel: 'Inscriptions autorisées',
    disabledLabel: 'Inscriptions fermées',
    activeColor: 'success',
    model: openRegistrations,
  },
  {
    id: 'moderation',
    label: 'Modération assistée',
    description: 'Lance automatiquement la détection de contenu sensible avant publication.',
    helper: 'Réglable depuis le module de modération avancée.',
    icon: 'mdi-robot-outline',
    enabledLabel: 'Automatisation active',
    disabledLabel: 'Automatisation inactive',
    activeColor: 'info',
    model: autoModeration,
  },
  {
    id: 'broadcast',
    label: 'Annonce globale épinglée',
    description: 'Affiche une bannière d’information en haut de toutes les pages publiques.',
    helper: 'Utilisez-le pour les communications officielles ou urgentes.',
    icon: 'mdi-bullhorn',
    enabledLabel: 'Annonce visible',
    disabledLabel: 'Annonce masquée',
    activeColor: 'primary',
    model: globalAnnouncements,
  },
])

const quickActions = [
  {
    id: 'content-review',
    title: 'Valider les contenus en attente',
    description: 'Passez en revue les contributions de la communauté avant leur mise en ligne.',
    icon: 'mdi-check-decagram',
    color: 'primary',
  },
  {
    id: 'security-scan',
    title: 'Analyser la sécurité',
    description: 'Lancez un contrôle automatisé des permissions et des rôles sensibles.',
    icon: 'mdi-shield-lock',
    color: 'secondary',
  },
  {
    id: 'community-update',
    title: 'Envoyer une mise à jour globale',
    description: 'Programmez une newsletter ou une notification push à l’ensemble des membres.',
    icon: 'mdi-email-send',
    color: 'purple',
  },
]

const adminModules = [
  {
    id: 'content',
    title: 'Gestion du contenu',
    description: 'Planifiez, publiez et archivez les articles, événements et ressources pédagogiques.',
    icon: 'mdi-file-document-edit',
    tags: ['Workflow éditorial', 'Validation', 'Programmation'],
    status: '12 contenus nécessitent une revue éditoriale.',
  },
  {
    id: 'community',
    title: 'Communauté & modération',
    description: 'Paramétrez les règles de modération, gérez les signalements et les sanctions.',
    icon: 'mdi-account-group-outline',
    tags: ['Signalements', 'Sanctions', 'Messages privés'],
    status: 'Temps moyen de réponse : 1 h 42.',
  },
  {
    id: 'commerce',
    title: 'Monétisation & offres',
    description: 'Administrez les abonnements, codes promotionnels et partenariats commerciaux.',
    icon: 'mdi-cash-sync',
    tags: ['Abonnements', 'Facturation', 'Coupons'],
    status: 'Taux de conversion en hausse de 3,4 % cette semaine.',
  },
  {
    id: 'governance',
    title: 'Gouvernance & conformité',
    description: 'Auditez les accès, gérez les rôles sensibles et préparez les rapports de conformité.',
    icon: 'mdi-gavel',
    tags: ['Audit', 'Rôles', 'Traçabilité'],
    status: 'Dernier audit complet réalisé il y a 5 jours.',
  },
]

const activityFeed = [
  {
    id: '1',
    title: 'Revue de 18 contenus publiée',
    description: 'Clara Dupont a validé le lot de contenus en attente pour la rubrique Blog.',
    time: 'Il y a 12 minutes',
    icon: 'mdi-clipboard-check',
    color: 'success',
  },
  {
    id: '2',
    title: 'Nouveau rôle attribué',
    description: 'Ahmed B. a reçu les permissions de modérateur senior pour la zone Communauté.',
    time: 'Il y a 47 minutes',
    icon: 'mdi-account-key',
    color: 'primary',
  },
  {
    id: '3',
    title: 'Signalement critique résolu',
    description: 'Un contenu signalé pour incitation à la haine a été supprimé et l’utilisateur suspendu.',
    time: 'Il y a 2 heures',
    icon: 'mdi-alert-decagram',
    color: 'error',
  },
]

const systemStatus = [
  {
    id: 'api',
    name: 'API publique',
    description: 'Flux GraphQL et Webhooks pour les intégrations tierces.',
    status: 'Opérationnel',
    uptime: 99,
    icon: 'mdi-api',
    color: 'success',
  },
  {
    id: 'payments',
    name: 'Passerelle de paiement',
    description: 'Transactions, facturation et webhooks financiers.',
    status: 'Incident mineur',
    uptime: 96,
    icon: 'mdi-credit-card-sync',
    color: 'warning',
  },
  {
    id: 'notifications',
    name: 'Notifications temps réel',
    description: 'Envoi d’e-mails transactionnels et de notifications push.',
    status: 'Opérationnel',
    uptime: 98,
    icon: 'mdi-bell-ring',
    color: 'info',
  },
]

const resources = [
  {
    id: 'charter',
    title: 'Charte éditoriale & guide de modération',
    description: 'Règles officielles qui encadrent la publication de contenu sur la plateforme.',
  },
  {
    id: 'security',
    title: 'Procédure de gestion des incidents de sécurité',
    description: 'Checklist opérationnelle en cas de faille de sécurité ou de tentative d’intrusion.',
  },
  {
    id: 'compliance',
    title: 'Document RGPD & traitement des données',
    description: 'Inventaire des traitements, durées de conservation et modèles de réponse aux utilisateurs.',
  },
]
</script>

<style scoped>
.gap-2 {
  gap: 0.5rem;
}

.gap-3 {
  gap: 0.75rem;
}

.gap-4 {
  gap: 1rem;
}

.gap-6 {
  gap: 1.5rem;
}

.text-none {
  text-transform: none;
}
</style>
