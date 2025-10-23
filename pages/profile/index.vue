<template>
  <main aria-labelledby="profile-title">
    <header
      class="mb-2"
      aria-describedby="profile-subtitle"
    >
      <SidebarCard
        class="text-card-foreground px-3 py-2"
        padding="none"
        glow
      >
        <div class="d-flex flex-column flex-sm-row align-sm-center gap-2">
          <v-avatar
            size="96"
            class="flex-shrink-0"
            color="primary"
            variant="tonal"
          >
            <NuxtImg
              :src="avatarSrc"
              :alt="avatarAlt"
              width="96"
              height="96"
              fit="cover"
            />
          </v-avatar>
          <div class="flex-grow-1 w-100">
            <div class="d-flex flex-column flex-sm-row align-sm-center justify-space-between gap-3">
              <div>
                <h1
                  id="profile-title"
                  class="text-h4 font-weight-bold mb-1"
                >
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
                <span
                  v-else
                  class="text-body-2 text-medium-emphasis"
                  >{{ placeholderValue }}</span
                >
              </div>
            </div>
            <p
              id="profile-subtitle"
              class="text-body-1 text-medium-emphasis mt-4 mb-0"
            >
              {{ t("pages.profile.subtitle") }}
            </p>
          </div>
        </div>
      </SidebarCard>
    </header>

    <v-row
      dense
      align="stretch"
    >
      <v-col cols="12">
        <v-row
          dense
          align="stretch"
        >
          <v-col
            v-if="showSocialSection"
            cols="12"
          >
            <section
              aria-labelledby="social-section-title"
              class="h-100"
            >
              <SidebarCard
                class="text-card-foreground px-3 py-2"
                padding="none"
                glow
              >
                <h2
                  id="social-section-title"
                  class="text-h5 font-weight-semibold mb-4"
                >
                  {{ t("pages.profile.sections.social") }}
                </h2>
                <dl
                  class="d-flex align-center gap-4"
                  :aria-label="t('pages.profile.stats.title')"
                >
                  <div class="d-flex align-center gap-2">
                    <dt class="text-body-2 text-medium-emphasis mb-0">
                      {{ t("pages.profile.labels.friends") }}
                    </dt>
                    <dd class="text-body-1 font-weight-medium mb-0">
                      {{ formattedFriendsCount }}
                    </dd>
                  </div>
                  <div class="d-flex align-center gap-2">
                    <dt class="text-body-2 text-medium-emphasis mb-0">
                      {{ t("pages.profile.labels.stories") }}
                    </dt>
                    <dd class="text-body-1 font-weight-medium mb-0">
                      {{ formattedStoriesCount }}
                    </dd>
                  </div>
                  <div class="d-flex align-center gap-2">
                    <dt class="text-body-2 text-medium-emphasis mb-0">
                      {{ t("pages.profile.labels.accountStatus") }}
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
              </SidebarCard>
            </section>
          </v-col>

          <v-col
            v-if="showContactSection"
            cols="12"
            md="6"
          >
            <section
              aria-labelledby="contact-section-title"
              class="h-100"
            >
              <SidebarCard
                class="text-card-foreground px-3 py-2"
                padding="none"
                glow
              >
                <h2
                  id="contact-section-title"
                  class="text-h5 font-weight-semibold mb-4"
                >
                  {{ t("pages.profile.sections.contact") }}
                </h2>
                <dl class="d-flex flex-column gap-4">
                  <div
                    v-for="item in contactItems"
                    :key="item.id"
                    class="d-flex align-center gap-2"
                  >
                    <dt class="text-body-2 text-medium-emphasis mb-0">{{ item.label }}</dt>
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
              </SidebarCard>
            </section>
          </v-col>

          <v-col
            v-if="showDetailsSection"
            cols="12"
            md="6"
          >
            <section
              aria-labelledby="profile-section-title"
              class="h-100"
            >
              <SidebarCard
                class="text-card-foreground px-3 py-2"
                padding="none"
                glow
              >
                <h2
                  id="profile-section-title"
                  class="text-h5 font-weight-semibold mb-4"
                >
                  {{ t("pages.profile.sections.profile") }}
                </h2>
                <dl class="d-flex flex-column gap-4">
                  <div
                    v-for="item in profileItems"
                    :key="item.id"
                    class="d-flex align-center gap-2"
                  >
                    <dt class="text-body-2 text-medium-emphasis mb-0">{{ item.label }}</dt>
                    <dd class="text-body-1 font-weight-medium mb-0">{{ item.value }}</dd>
                  </div>
                </dl>
              </SidebarCard>
            </section>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </main>
</template>

<script setup lang="ts">
import { useDevicePixelRatio } from "@vueuse/core";
import { computed, defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";
import { useLayoutRightSidebar } from "~/composables/useLayoutRightSidebar";
import { useSiteSettingsState } from "~/composables/useSiteSettingsState";
import { useAuthSession } from "~/stores/auth-session";
import { getDefaultSiteSettings } from "~/lib/settings/defaults";
import { optimizeAvatarUrl } from "~/lib/images/avatar";
import type {
  FriendEntry,
  FriendProfile,
  FriendStory,
  ProfileDetails,
  ProfileUser,
  SidebarFriend,
} from "~/types/pages/profile";

const ProfileSidebar = defineAsyncComponent({
  loader: () => import("~/components/layout/ProfileSidebar.vue"),
  suspensible: false,
});
const SidebarCard = defineAsyncComponent({
  loader: () => import("~/components/layout/SidebarCard.vue"),
  suspensible: false,
});
const ProfileCalendar = defineAsyncComponent({
  loader: () => import("~/components/profile/ProfileCalendar.vue"),
  suspensible: false,
});

definePageMeta({
  middleware: "auth",
  title: "profile",
  sidebarVariant: "profile",
  documentDriven: false,
});
const { t, locale, localeProperties } = useI18n();

const pageDescription = computed(() => t("seo.profile.description"));

useSeoMeta(() => ({
  description: pageDescription.value,
}));
const auth = useAuthSession();
const router = useRouter();
const currentRoute = computed(() => router.currentRoute.value);
const runtimeConfig = useRuntimeConfig();

const baseUrl = computed(() => runtimeConfig.public.baseUrl ?? "https://bro-world-space.com");

useHead(() => {
  const title = t("seo.profile.title");
  const canonicalPath = currentRoute.value?.path ?? "/";
  const canonical = new URL(canonicalPath, baseUrl.value).toString();
  const iso = localeProperties.value?.iso ?? locale.value;

  return {
    title,
    meta: [
      { key: "og:title", property: "og:title", content: title },
      { key: "og:type", property: "og:type", content: "website" },
      { key: "og:url", property: "og:url", content: canonical },
      { key: "og:locale", property: "og:locale", content: iso },
      { key: "twitter:card", name: "twitter:card", content: "summary_large_image" },
      { key: "twitter:title", name: "twitter:title", content: title },
      { key: "twitter:url", name: "twitter:url", content: canonical },
    ],
  };
});

const defaultAvatar = "/images/avatars/avatar-default.svg";
const placeholderValue = computed(() => t("pages.profile.placeholders.missing"));

const siteSettings = useSiteSettingsState();
const profileSettings = computed(
  () => siteSettings.value?.profile ?? getDefaultSiteSettings().profile,
);
const allowProfileCustomization = computed(
  () => profileSettings.value.allowCustomization !== false,
);
const showContactSection = computed(() => profileSettings.value.showContactSection !== false);
const showDetailsSection = computed(() => profileSettings.value.showDetailsSection !== false);
const showSocialSection = computed(() => profileSettings.value.showSocialSection !== false);
const defaultProfileBio = computed(() => profileSettings.value.defaultBio?.trim() || null);

function asString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

const user = computed<ProfileUser | null>(() => auth.currentUser.value as ProfileUser | null);

const displayName = computed(() => {
  const first = asString(user.value?.firstName);
  const last = asString(user.value?.lastName);
  const parts = [first, last].filter(Boolean) as string[];

  if (parts.length > 0) {
    return parts.join(" ");
  }

  const username = asString(user.value?.username);

  if (username) {
    return username;
  }

  const email = asString(user.value?.email);

  if (email) {
    return email;
  }

  return placeholderValue.value;
});

const usernameLabel = computed(() => {
  const username = asString(user.value?.username);
  return username ? `@${username}` : placeholderValue.value;
});

const roles = computed(() =>
  (user.value?.roles ?? []).filter(
    (role): role is string => typeof role === "string" && role.trim().length > 0,
  ),
);
const hasRoles = computed(() => roles.value.length > 0);

const profileDetails = computed(() => user.value?.profile ?? null);

const avatarDisplaySize = 96;
const { pixelRatio } = useDevicePixelRatio({ initialValue: 1 });

const normalizedPixelRatio = computed(() => {
  const ratio = pixelRatio.value ?? 1;

  if (!Number.isFinite(ratio) || ratio <= 0) {
    return 1;
  }

  return Math.min(3, ratio);
});

const avatarPixelSize = computed(() =>
  Math.max(avatarDisplaySize, Math.round(avatarDisplaySize * normalizedPixelRatio.value)),
);

const rawAvatarSrc = computed(() => {
  const profilePhoto = asString(profileDetails.value?.photo);

  if (profilePhoto) {
    return profilePhoto;
  }

  const userPhoto = asString(user.value?.photo);

  if (userPhoto) {
    return userPhoto;
  }

  return defaultAvatar;
});

const avatarSrc = computed(() => {
  const raw = rawAvatarSrc.value;
  const optimized = optimizeAvatarUrl(raw, avatarPixelSize.value);

  return optimized ?? raw ?? defaultAvatar;
});

const avatarAlt = computed(() => {
  const name = displayName.value;

  if (name && name !== placeholderValue.value) {
    return t("pages.profile.avatarAlt", { name });
  }

  return t("pages.profile.avatarAltFallback");
});

const email = computed(() => asString(user.value?.email));
const phone = computed(() => asString(profileDetails.value?.phone));
const address = computed(() => asString(profileDetails.value?.address));
const titleValue = computed(() => asString(profileDetails.value?.title));
const gender = computed(() => asString(profileDetails.value?.gender));
const description = computed(() => {
  const custom = asString(profileDetails.value?.description);

  if (custom) {
    return custom;
  }

  return defaultProfileBio.value ?? null;
});
const hometown = computed(() => asString(profileDetails.value?.hometown));
const birthdayFormatter = computed(
  () => new Intl.DateTimeFormat(locale.value || "en-US", { dateStyle: "long" }),
);

const birthdayFormatted = computed(() => {
  const raw = asString(profileDetails.value?.birthday);

  if (!raw) {
    return null;
  }

  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return birthdayFormatter.value.format(date);
});

const numberFormatter = computed(() => new Intl.NumberFormat(locale.value || "en-US"));

function formatNumber(value: number) {
  return numberFormatter.value.format(value);
}

const friendEntries = computed(() => {
  const raw = user.value?.friends;

  if (!raw) {
    return [] as FriendEntry[];
  }

  if (Array.isArray(raw)) {
    return raw.filter(Boolean) as FriendEntry[];
  }

  return Object.values(raw).filter(Boolean) as FriendEntry[];
});

const friendsCount = computed(() => friendEntries.value.length);

const ownStoriesCount = computed(() =>
  Array.isArray(user.value?.stories) ? user.value!.stories.length : 0,
);

const friendStoriesCount = computed(() =>
  friendEntries.value.reduce((total, entry) => {
    if (entry && Array.isArray(entry.stories)) {
      return total + entry.stories.length;
    }

    return total;
  }, 0),
);

const totalStoriesCount = computed(() => ownStoriesCount.value + friendStoriesCount.value);

const formattedFriendsCount = computed(() => formatNumber(friendsCount.value));

const formattedStoriesCount = computed(() => {
  if (totalStoriesCount.value <= 0) {
    return t("pages.profile.placeholders.noStories");
  }

  return formatNumber(totalStoriesCount.value);
});

const accountStatus = computed(() => {
  if (typeof user.value?.enabled === "boolean") {
    return {
      label: user.value.enabled
        ? t("pages.profile.statuses.enabled")
        : t("pages.profile.statuses.disabled"),
      color: user.value.enabled ? "success" : "error",
    };
  }

  return null;
});

const contactItems = computed(() => {
  const placeholder = placeholderValue.value;

  return [
    {
      id: "email",
      label: t("pages.profile.labels.email"),
      value: email.value ?? placeholder,
      href: email.value ? `mailto:${email.value}` : undefined,
    },
    {
      id: "phone",
      label: t("pages.profile.labels.phone"),
      value: phone.value ?? placeholder,
      href: phone.value ? `tel:${phone.value}` : undefined,
    },
    {
      id: "address",
      label: t("pages.profile.labels.address"),
      value: address.value ?? placeholder,
    },
  ];
});

const profileItems = computed(() => {
  const placeholder = placeholderValue.value;

  return [
    {
      id: "title",
      label: t("pages.profile.labels.title"),
      value: titleValue.value ?? placeholder,
    },
    {
      id: "gender",
      label: t("pages.profile.labels.gender"),
      value: gender.value ?? placeholder,
    },
    {
      id: "birthday",
      label: t("pages.profile.labels.birthday"),
      value: birthdayFormatted.value ?? placeholder,
    },
    {
      id: "description",
      label: t("pages.profile.labels.description"),
      value: description.value ?? placeholder,
    },
  ];
});

const sidebarUser = computed(() => {
  const placeholder = placeholderValue.value;

  const sanitizedBio = description.value ?? undefined;
  const sanitizedLivesIn = address.value ?? undefined;
  const sanitizedFrom = hometown.value ?? undefined;
  const schools = Array.isArray(profileDetails.value?.schools)
    ? (profileDetails.value!.schools.filter(
        (value): value is string => typeof value === "string" && value.trim().length > 0,
      ) as string[])
    : [];

  return {
    name: displayName.value || placeholder,
    bio: sanitizedBio,
    livesIn: sanitizedLivesIn,
    from: sanitizedFrom,
    schools,
  };
});

const sidebarPhotos = computed(() => {
  const photo = avatarSrc.value;
  const alt = avatarAlt.value;

  if (!photo) {
    return [] as { src: string; alt?: string }[];
  }

  return [{ src: photo, alt }];
});

const sidebarFriends = computed<SidebarFriend[]>(() => {
  const placeholder = placeholderValue.value;

  return friendEntries.value.reduce<SidebarFriend[]>((acc, entry) => {
    if (!entry) {
      return acc;
    }

    const friend = entry.user;

    if (!friend) {
      return acc;
    }

    const id = asString(friend.id) ?? undefined;
    const username = asString(friend.username);
    const firstName = asString(friend.firstName);
    const lastName = asString(friend.lastName);
    const profile = friend.profile ?? null;

    const profilePhoto = asString(profile?.photo);
    const fallbackPhoto = asString((friend as { photo?: string | null })?.photo);

    const avatar = profilePhoto ?? fallbackPhoto ?? defaultAvatar;

    const displayName = [firstName, lastName].filter(Boolean).join(" ") || username || placeholder;

    const rawStories = Array.isArray(entry.stories) ? entry.stories : [];
    const stories = rawStories.filter((story): story is FriendStory => Boolean(story));

    acc.push({
      id,
      username,
      firstName,
      lastName,
      name: displayName,
      avatar,
      profile,
      status: typeof entry.status === "number" ? entry.status : null,
      stories,
    });

    return acc;
  }, []);
});

useProfileSidebarContent();
</script>

<style scoped src="~/assets/styles/pages/profile.scss" lang="scss"></style>
