<template>
  <main class="py-10" aria-labelledby="profile-title">
    <v-container>
      <header class="mb-8" aria-describedby="profile-subtitle">
        <v-card class="pa-6" rounded="xl" elevation="10">
          <div class="d-flex flex-column flex-sm-row align-sm-center gap-4">
            <v-avatar size="96" class="flex-shrink-0" color="primary" variant="tonal">
              <v-img :src="avatarSrc" :alt="avatarAlt" cover />
            </v-avatar>
            <div class="flex-grow-1 w-100">
              <div class="d-flex flex-column flex-sm-row align-sm-center justify-space-between gap-3">
                <div>
                  <h1 id="profile-title" class="text-h4 font-weight-bold mb-1">
                    {{ displayName }}
                  </h1>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    {{ usernameLabel }}
                  </p>
                </div>
                <div
                  class="d-flex flex-wrap align-center gap-2"
                  :aria-label="t('pages.profile.labels.roles')"
                  role="list"
                >
                  <template v-if="hasRoles">
                    <v-chip
                      v-for="role in roles"
                      :key="role"
                      color="primary"
                      variant="tonal"
                      size="small"
                      role="listitem"
                    >
                      {{ role }}
                    </v-chip>
                  </template>
                  <span v-else class="text-body-2 text-medium-emphasis">{{ placeholderValue }}</span>
                </div>
              </div>
              <p id="profile-subtitle" class="text-body-1 text-medium-emphasis mt-4 mb-0">
                {{ t('pages.profile.subtitle') }}
              </p>
            </div>
          </div>
        </v-card>
      </header>

      <v-row dense align="stretch">
        <v-col cols="12" md="4">
          <section aria-labelledby="contact-section-title" class="h-100">
            <v-card class="pa-6 h-100" rounded="lg" variant="tonal">
              <h2 id="contact-section-title" class="text-h5 font-weight-semibold mb-4">
                {{ t('pages.profile.sections.contact') }}
              </h2>
              <dl class="d-flex flex-column gap-4">
                <div v-for="item in contactItems" :key="item.id">
                  <dt class="text-body-2 text-medium-emphasis mb-1">{{ item.label }}</dt>
                  <dd class="text-body-1 font-weight-medium mb-0">
                    <a
                      v-if="item.href && item.value !== placeholderValue"
                      :href="item.href"
                      class="text-primary text-decoration-none"
                    >
                      {{ item.value }}
                    </a>
                    <span v-else>{{ item.value }}</span>
                  </dd>
                </div>
              </dl>
            </v-card>
          </section>
        </v-col>

        <v-col cols="12" md="4">
          <section aria-labelledby="profile-section-title" class="h-100">
            <v-card class="pa-6 h-100" rounded="lg" variant="tonal">
              <h2 id="profile-section-title" class="text-h5 font-weight-semibold mb-4">
                {{ t('pages.profile.sections.profile') }}
              </h2>
              <dl class="d-flex flex-column gap-4">
                <div v-for="item in profileItems" :key="item.id">
                  <dt class="text-body-2 text-medium-emphasis mb-1">{{ item.label }}</dt>
                  <dd class="text-body-1 font-weight-medium mb-0">{{ item.value }}</dd>
                </div>
              </dl>
            </v-card>
          </section>
        </v-col>

        <v-col cols="12" md="4">
          <section aria-labelledby="social-section-title" class="h-100">
            <v-card class="pa-6 h-100" rounded="lg" variant="tonal">
              <h2 id="social-section-title" class="text-h5 font-weight-semibold mb-4">
                {{ t('pages.profile.sections.social') }}
              </h2>
              <dl class="d-flex flex-column gap-4" :aria-label="t('pages.profile.stats.title')">
                <div>
                  <dt class="text-body-2 text-medium-emphasis mb-1">
                    {{ t('pages.profile.labels.friends') }}
                  </dt>
                  <dd class="text-body-1 font-weight-medium mb-0">{{ formattedFriendsCount }}</dd>
                </div>
                <div>
                  <dt class="text-body-2 text-medium-emphasis mb-1">
                    {{ t('pages.profile.labels.stories') }}
                  </dt>
                  <dd class="text-body-1 font-weight-medium mb-0">{{ formattedStoriesCount }}</dd>
                </div>
                <div>
                  <dt class="text-body-2 text-medium-emphasis mb-1">
                    {{ t('pages.profile.labels.accountStatus') }}
                  </dt>
                  <dd class="text-body-1 font-weight-medium mb-0">
                    <v-chip
                      v-if="accountStatus"
                      :color="accountStatus.color"
                      size="small"
                      variant="flat"
                    >
                      {{ accountStatus.label }}
                    </v-chip>
                    <span v-else>{{ placeholderValue }}</span>
                  </dd>
                </div>
              </dl>
            </v-card>
          </section>
        </v-col>
      </v-row>
    </v-container>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useAuthSession } from '~/stores/auth-session'
import type { AuthUser } from '~/types/auth'

interface ProfileDetails {
  id?: string
  title?: string | null
  phone?: string | null
  birthday?: string | null
  gender?: string | null
  photo?: string | null
  description?: string | null
  address?: string | null
}

interface FriendEntry {
  user?: string | null
  stories?: unknown[] | null
  status?: number | null
}

interface ProfileUser extends AuthUser {
  profile?: ProfileDetails | null
  stories?: unknown[] | null
  friends?: Record<string, FriendEntry | null> | FriendEntry[] | null
}

definePageMeta({
  middleware: 'auth',
  title: 'profile',
})

const auth = useAuthSession()
const { t, locale, localeProperties } = useI18n()
const route = useRoute()
const runtimeConfig = useRuntimeConfig()

const baseUrl = computed(() => runtimeConfig.public.baseUrl ?? 'https://bro-world-space.com')

useHead(() => {
  const title = t('seo.profile.title')
  const description = t('seo.profile.description')
  const canonical = new URL(route.path, baseUrl.value).toString()
  const iso = localeProperties.value?.iso ?? locale.value

  return {
    title,
    meta: [
      { key: 'description', name: 'description', content: description },
      { key: 'og:title', property: 'og:title', content: title },
      { key: 'og:description', property: 'og:description', content: description },
      { key: 'og:type', property: 'og:type', content: 'website' },
      { key: 'og:url', property: 'og:url', content: canonical },
      { key: 'og:locale', property: 'og:locale', content: iso },
      { key: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
      { key: 'twitter:title', name: 'twitter:title', content: title },
      { key: 'twitter:description', name: 'twitter:description', content: description },
      { key: 'twitter:url', name: 'twitter:url', content: canonical },
    ],
    link: [{ rel: 'canonical', href: canonical }],
  }
})

const defaultAvatar = 'https://bro-world-space.com/img/person.png'
const placeholderValue = computed(() => t('pages.profile.placeholders.missing'))

function asString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

const user = computed<ProfileUser | null>(() => auth.currentUser.value as ProfileUser | null)

const displayName = computed(() => {
  const first = asString(user.value?.firstName)
  const last = asString(user.value?.lastName)
  const parts = [first, last].filter(Boolean) as string[]

  if (parts.length > 0) {
    return parts.join(' ')
  }

  const username = asString(user.value?.username)

  if (username) {
    return username
  }

  const email = asString(user.value?.email)

  if (email) {
    return email
  }

  return placeholderValue.value
})

const usernameLabel = computed(() => {
  const username = asString(user.value?.username)
  return username ? `@${username}` : placeholderValue.value
})

const roles = computed(() =>
  (user.value?.roles ?? []).filter((role): role is string => typeof role === 'string' && role.trim().length > 0),
)
const hasRoles = computed(() => roles.value.length > 0)

const profileDetails = computed(() => user.value?.profile ?? null)

const avatarSrc = computed(() => {
  const profilePhoto = asString(profileDetails.value?.photo)

  if (profilePhoto) {
    return profilePhoto
  }

  const userPhoto = asString(user.value?.photo)

  if (userPhoto) {
    return userPhoto
  }

  return defaultAvatar
})

const avatarAlt = computed(() => {
  const name = displayName.value

  if (name && name !== placeholderValue.value) {
    return t('pages.profile.avatarAlt', { name })
  }

  return t('pages.profile.avatarAltFallback')
})

const email = computed(() => asString(user.value?.email))
const phone = computed(() => asString(profileDetails.value?.phone))
const address = computed(() => asString(profileDetails.value?.address))
const titleValue = computed(() => asString(profileDetails.value?.title))
const gender = computed(() => asString(profileDetails.value?.gender))
const description = computed(() => asString(profileDetails.value?.description))
const birthdayFormatted = computed(() => {
  const raw = asString(profileDetails.value?.birthday)

  if (!raw) {
    return null
  }

  const date = new Date(raw)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  const targetLocale = locale.value || 'en-US'
  return new Intl.DateTimeFormat(targetLocale, { dateStyle: 'long' }).format(date)
})

function formatNumber(value: number) {
  return new Intl.NumberFormat(locale.value || 'en-US').format(value)
}

const friendEntries = computed(() => {
  const raw = user.value?.friends

  if (!raw) {
    return [] as FriendEntry[]
  }

  if (Array.isArray(raw)) {
    return raw.filter(Boolean) as FriendEntry[]
  }

  return Object.values(raw).filter(Boolean) as FriendEntry[]
})

const friendsCount = computed(() => friendEntries.value.length)

const ownStoriesCount = computed(() => (Array.isArray(user.value?.stories) ? user.value!.stories.length : 0))

const friendStoriesCount = computed(() =>
  friendEntries.value.reduce((total, entry) => {
    if (entry && Array.isArray(entry.stories)) {
      return total + entry.stories.length
    }

    return total
  }, 0),
)

const totalStoriesCount = computed(() => ownStoriesCount.value + friendStoriesCount.value)

const formattedFriendsCount = computed(() => formatNumber(friendsCount.value))

const formattedStoriesCount = computed(() => {
  if (totalStoriesCount.value <= 0) {
    return t('pages.profile.placeholders.noStories')
  }

  return formatNumber(totalStoriesCount.value)
})

const accountStatus = computed(() => {
  if (typeof user.value?.enabled === 'boolean') {
    return {
      label: user.value.enabled ? t('pages.profile.statuses.enabled') : t('pages.profile.statuses.disabled'),
      color: user.value.enabled ? 'success' : 'error',
    }
  }

  return null
})

const contactItems = computed(() => {
  const placeholder = placeholderValue.value

  return [
    {
      id: 'email',
      label: t('pages.profile.labels.email'),
      value: email.value ?? placeholder,
      href: email.value ? `mailto:${email.value}` : undefined,
    },
    {
      id: 'phone',
      label: t('pages.profile.labels.phone'),
      value: phone.value ?? placeholder,
      href: phone.value ? `tel:${phone.value}` : undefined,
    },
    {
      id: 'address',
      label: t('pages.profile.labels.address'),
      value: address.value ?? placeholder,
    },
  ]
})

const profileItems = computed(() => {
  const placeholder = placeholderValue.value

  return [
    {
      id: 'title',
      label: t('pages.profile.labels.title'),
      value: titleValue.value ?? placeholder,
    },
    {
      id: 'gender',
      label: t('pages.profile.labels.gender'),
      value: gender.value ?? placeholder,
    },
    {
      id: 'birthday',
      label: t('pages.profile.labels.birthday'),
      value: birthdayFormatted.value ?? placeholder,
    },
    {
      id: 'description',
      label: t('pages.profile.labels.description'),
      value: description.value ?? placeholder,
    },
  ]
})
</script>

<style scoped>
main {
  background: transparent;
}

dl {
  margin: 0;
}

dt {
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
</style>
