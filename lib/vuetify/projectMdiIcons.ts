// Core project-specific MDI icons that must be available eagerly for above-the-fold UI.
// Icons that are only needed deeper in the experience should live in the lazy chunk
// exported from `projectMdiIcons.full.ts` so they can be code-split and loaded on demand.
import {
  mdiAccount,
  mdiAccountOutline,
  mdiArrowLeft,
  mdiBellOutline,
  mdiBellPlusOutline,
  mdiChatOutline,
  mdiChevronLeft,
  mdiChevronRight,
  mdiClose,
  mdiDotsVertical,
  mdiEmoticonHappyOutline,
  mdiFormatAlignJustify,
  mdiForumOutline,
  mdiImageMultiple,
  mdiLoading,
  mdiMagnify,
  mdiMicrophone,
  mdiMenu,
  mdiMessageOutline,
  mdiPlus,
  mdiRefresh,
  mdiShareOutline,
  mdiShoppingOutline,
  mdiThumbUpOutline,
  mdiVideo,
} from "@mdi/js";

export const coreProjectMdiIcons: Record<string, string> = {
  "mdi-account": mdiAccount,
  "mdi-account-outline": mdiAccountOutline,
  "mdi-arrow-left": mdiArrowLeft,
  "mdi-bell-outline": mdiBellOutline,
  "mdi-bell-plus-outline": mdiBellPlusOutline,
  "mdi-chat-outline": mdiChatOutline,
  "mdi-chevron-left": mdiChevronLeft,
  "mdi-chevron-right": mdiChevronRight,
  "mdi-close": mdiClose,
  "mdi-dots-vertical": mdiDotsVertical,
  "mdi-emoticon-happy-outline": mdiEmoticonHappyOutline,
  "mdi-format-align-justify": mdiFormatAlignJustify,
  "mdi-forum-outline": mdiForumOutline,
  "mdi-image-multiple": mdiImageMultiple,
  "mdi-loading": mdiLoading,
  "mdi-magnify": mdiMagnify,
  "mdi-menu": mdiMenu,
  "mdi-message-outline": mdiMessageOutline,
  "mdi-microphone": mdiMicrophone,
  "mdi-plus": mdiPlus,
  "mdi-refresh": mdiRefresh,
  "mdi-share-outline": mdiShareOutline,
  "mdi-shopping-outline": mdiShoppingOutline,
  "mdi-thumb-up-outline": mdiThumbUpOutline,
  "mdi-video": mdiVideo,
};

const loadedLazyIconNames = new Set<string>();
let cachedLazyIcons: Record<string, string> | null = null;

function normalizeIconName(name: string): string {
  if (!name) {
    return "";
  }

  const trimmed = name.trim();

  if (trimmed.startsWith("mdi:")) {
    return `mdi-${trimmed.slice(4)}`;
  }

  if (!trimmed.startsWith("mdi-")) {
    return `mdi-${trimmed}`;
  }

  return trimmed;
}

async function loadLazyIconModule(): Promise<Record<string, string>> {
  if (cachedLazyIcons) {
    return cachedLazyIcons;
  }

  const module = await import("./projectMdiIcons.full");
  cachedLazyIcons = module.fullProjectMdiIcons as Record<string, string>;

  return cachedLazyIcons;
}

export async function ensureProjectMdiIcons(names: string[]): Promise<Record<string, string>> {
  const resolved: Record<string, string> = {};
  const missing: string[] = [];

  for (const rawName of names) {
    const name = normalizeIconName(rawName);

    if (!name) {
      continue;
    }

    if (name in coreProjectMdiIcons) {
      resolved[name] = coreProjectMdiIcons[name];
      continue;
    }

    if (loadedLazyIconNames.has(name)) {
      if (cachedLazyIcons?.[name]) {
        resolved[name] = cachedLazyIcons[name];
      }
      continue;
    }

    missing.push(name);
  }

  if (missing.length === 0) {
    return resolved;
  }

  const lazyIcons = await loadLazyIconModule();

  for (const name of missing) {
    const value = lazyIcons[name];

    if (value) {
      loadedLazyIconNames.add(name);
      resolved[name] = value;
    }
  }

  return resolved;
}

export type EnsureProjectMdiIcons = typeof ensureProjectMdiIcons;
