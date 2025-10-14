import { computed } from "vue";
import { useI18n } from "vue-i18n";

import ProfileSidebar from "~/components/layout/ProfileSidebar.vue";
import { useLayoutRightSidebar } from "~/composables/useLayoutRightSidebar";
import { useAuthSession } from "~/stores/auth-session";
import type {
  FriendEntry,
  FriendStory,
  ProfileUser,
  SidebarFriend,
} from "~/types/pages/profile";

const DEFAULT_AVATAR = "/person.png";

type SidebarLifeEvent = { title: string; date?: string; description?: string };

function asString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function useProfileSidebarContent() {
  const auth = useAuthSession();
  const { t } = useI18n();
  const { registerRightSidebarContent } = useLayoutRightSidebar();

  const placeholderValue = computed(() => t("pages.profile.placeholders.missing"));

  const user = computed<ProfileUser | null>(() => auth.currentUser.value as ProfileUser | null);
  const profileDetails = computed(() => user.value?.profile ?? null);

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

  const avatarSrc = computed(() => {
    const profilePhoto = asString(profileDetails.value?.photo);

    if (profilePhoto) {
      return profilePhoto;
    }

    const userPhoto = asString((user.value as { photo?: string | null })?.photo);

    if (userPhoto) {
      return userPhoto;
    }

    return DEFAULT_AVATAR;
  });

  const sidebarUser = computed(() => {
    const placeholder = placeholderValue.value;

    const sanitizedBio = asString(profileDetails.value?.description) ?? undefined;
    const sanitizedLivesIn = asString(profileDetails.value?.address) ?? undefined;
    const sanitizedFrom = asString(profileDetails.value?.hometown) ?? undefined;
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

    if (!photo) {
      return [] as { src: string; alt?: string }[];
    }

    const alt = displayName.value || undefined;

    return [{ src: photo, alt }];
  });

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

      const avatar = profilePhoto ?? fallbackPhoto ?? DEFAULT_AVATAR;

      const display = [firstName, lastName].filter(Boolean).join(" ") || username || placeholder;

      const rawStories = Array.isArray(entry.stories) ? entry.stories : [];
      const stories = rawStories.filter((story): story is FriendStory => Boolean(story));

      acc.push({
        id,
        username,
        firstName,
        lastName,
        name: display,
        avatar,
        profile,
        status: typeof entry.status === "number" ? entry.status : null,
        stories,
      });

      return acc;
    }, []);
  });

  const sidebarEvents = computed(() => [] as SidebarLifeEvent[]);

  const sidebarContent = computed(() => ({
    component: ProfileSidebar,
    props: {
      user: sidebarUser.value,
      photos: sidebarPhotos.value,
      friends: sidebarFriends.value,
      friendsCount: friendsCount.value,
      lifeEvents: sidebarEvents.value,
    },
    wrapperClass: "flex flex-col gap-4",
  }));

  registerRightSidebarContent(sidebarContent);

  return {
    sidebarContent,
  };
}
