import { createError, getHeader } from "h3";
import type { H3Event } from "h3";
import { joinURL } from "ufo";
import type { FetchOptions } from "ofetch";
import type { QueryObject } from "ufo";
import { useRuntimeConfig } from "#imports";
import type { AuthUser } from "~/types/auth";
import { profileEventsSample } from "~/lib/mock/profile";
import { usersListSample } from "~/lib/mock/users";
import {
  deleteCachedProfile,
  readCachedProfile,
  writeCachedProfile,
} from "../cache/profile";
import type {
  FriendEntry,
  FriendStory,
  ProfileEvent,
  ProfileUser,
} from "~/types/pages/profile";
import {
  getSessionToken,
  getSessionUser,
  requireSessionToken,
  withAuthHeaders,
} from "../auth/session";

export interface UsersApiUser extends AuthUser {
  language?: string | null;
  locale?: string | null;
  timezone?: string | null;
  profile?: unknown;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface UsersListEnvelope {
  data?: UsersApiUser[];
  count?: number;
}

interface UserEnvelope {
  data?: UsersApiUser;
}

type UsersListSource = UsersApiUser[] | UsersListEnvelope | null | undefined;
type UserSource = UsersApiUser | UserEnvelope | null | undefined;

type UsersFetchOptions = FetchOptions<"json">;

type ProfileSource =
  | ProfileUser
  | {
      data?: ProfileUser | null;
      profile?: ProfileUser | null;
      user?: ProfileUser | null;
    }
  | null
  | undefined;

type ProfileEventsEnvelope = {
  data?: ProfileEvent[] | null;
  events?: ProfileEvent[] | null;
};

type ProfileEventsSource = ProfileEvent[] | ProfileEventsEnvelope | null | undefined;

const mockFallbackWarnings = new Set<string>();

function extractErrorReason(error: unknown): string | null {
  if (!error) {
    return null;
  }

  if (typeof error === "string") {
    const trimmed = error.trim();

    return trimmed.length > 0 ? trimmed : null;
  }

  if (error instanceof Error) {
    const trimmed = error.message.trim();

    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof error === "object") {
    const messageCandidate =
      (error as { data?: { message?: unknown } }).data?.message ??
      (error as { message?: unknown }).message;

    if (typeof messageCandidate === "string") {
      const trimmed = messageCandidate.trim();

      if (trimmed.length > 0) {
        return trimmed;
      }
    }
  }

  return null;
}

function warnMockFallback(key: string, subject: string, error: unknown) {
  if (mockFallbackWarnings.has(key)) {
    return;
  }

  mockFallbackWarnings.add(key);

  const reason = extractErrorReason(error);
  const details =
    reason && !reason.endsWith(".") ? `${reason}.` : reason ?? "";
  const hint =
    "Sign in to your account or configure the users service API credentials to load live data.";

  const message = details
    ? `[mock] Falling back to mock ${subject}. ${details} ${hint}`
    : `[mock] Falling back to mock ${subject}. ${hint}`;

  console.warn(message);
}

function formatCalendarDateTime(date: Date, useUTC: boolean): string {
  const year = useUTC ? date.getUTCFullYear() : date.getFullYear();
  const month = (useUTC ? date.getUTCMonth() : date.getMonth()) + 1;
  const day = useUTC ? date.getUTCDate() : date.getDate();
  const hours = useUTC ? date.getUTCHours() : date.getHours();
  const minutes = useUTC ? date.getUTCMinutes() : date.getMinutes();

  const monthString = String(month).padStart(2, "0");
  const dayString = String(day).padStart(2, "0");
  const hourString = String(hours).padStart(2, "0");
  const minuteString = String(minutes).padStart(2, "0");

  return `${year}-${monthString}-${dayString} ${hourString}:${minuteString}`;
}

function sanitizeEventTimestamp(raw: unknown): string | null {
  if (raw == null) {
    return null;
  }

  if (typeof raw === "string") {
    const trimmed = raw.trim();

    if (!trimmed) {
      return null;
    }

    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(trimmed)) {
      const [year, month, day] = trimmed.split("-");

      const normalizedYear = year.padStart(4, "0");
      const normalizedMonth = month.padStart(2, "0");
      const normalizedDay = day.padStart(2, "0");

      return `${normalizedYear}-${normalizedMonth}-${normalizedDay}`;
    }

    if (/^\d{4}-\d{1,2}-\d{1,2}[ T]\d{1,2}:\d{2}$/.test(trimmed)) {
      const [datePart, timePart] = trimmed.replace("T", " ").split(" ");
      const [year, month, day] = datePart.split("-");
      const [hours, minutes] = timePart.split(":");

      const normalizedYear = year.padStart(4, "0");
      const normalizedMonth = month.padStart(2, "0");
      const normalizedDay = day.padStart(2, "0");
      const normalizedHours = hours.padStart(2, "0");
      const normalizedMinutes = minutes.padStart(2, "0");

      return `${normalizedYear}-${normalizedMonth}-${normalizedDay} ${normalizedHours}:${normalizedMinutes}`;
    }

    const parsed = new Date(trimmed);

    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    const includesTimezone = /[+-]\d{2}:?\d{2}$|Z$/i.test(trimmed);

    return formatCalendarDateTime(parsed, includesTimezone);
  }

  if (raw instanceof Date) {
    if (Number.isNaN(raw.getTime())) {
      return null;
    }

    return formatCalendarDateTime(raw, false);
  }

  if (typeof raw === "number" && Number.isFinite(raw)) {
    const parsed = new Date(raw);

    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return formatCalendarDateTime(parsed, false);
  }

  return null;
}

function isAuthorizationError(error: unknown): boolean {
  const status =
    typeof (error as { statusCode?: number })?.statusCode === "number"
      ? (error as { statusCode: number }).statusCode
      : typeof (error as { status?: number })?.status === "number"
        ? (error as { status: number }).status
        : typeof (error as { response?: { status?: number } })?.response?.status === "number"
          ? ((error as { response: { status?: number } }).response?.status ?? NaN)
          : NaN;

  return status === 401 || status === 403;
}

function normalizeProfileEvent(raw: unknown): ProfileEvent | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const idCandidate = record.id;
  const titleCandidate = record.title;
  const start = sanitizeEventTimestamp(record.start);

  const id = typeof idCandidate === "string" && idCandidate.trim()
    ? idCandidate.trim()
    : idCandidate != null
      ? String(idCandidate)
      : "";
  const title = typeof titleCandidate === "string" ? titleCandidate : "";

  if (!id || !title || !start) {
    return null;
  }

  const event: ProfileEvent = {
    id,
    title,
    start,
  };

  if (typeof record.description === "string") {
    event.description = record.description;
  } else if (record.description === null) {
    event.description = null;
  }

  const end = sanitizeEventTimestamp(record.end);

  if (end) {
    event.end = end;
  } else if (record.end === null) {
    event.end = null;
  }

  if (typeof record.allDay === "boolean") {
    event.allDay = record.allDay;
  }

  if (typeof record.color === "string") {
    event.color = record.color;
  } else if (record.color === null) {
    event.color = null;
  }

  if (typeof record.location === "string") {
    event.location = record.location;
  } else if (record.location === null) {
    event.location = null;
  }

  if (typeof record.isPrivate === "boolean") {
    event.isPrivate = record.isPrivate;
  }

  return event;
}

function normalizeProfileEvents(payload: ProfileEventsSource): ProfileEvent[] {
  const candidates = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object"
      ? Array.isArray((payload as ProfileEventsEnvelope).events)
        ? (payload as ProfileEventsEnvelope).events ?? []
        : Array.isArray((payload as ProfileEventsEnvelope).data)
          ? (payload as ProfileEventsEnvelope).data ?? []
          : []
      : [];

  return candidates
    .map((entry) => normalizeProfileEvent(entry))
    .filter((entry): entry is ProfileEvent => Boolean(entry));
}

function isProfileUser(candidate: unknown): candidate is ProfileUser {
  if (!candidate || typeof candidate !== "object") {
    return false;
  }

  const value = candidate as Record<string, unknown>;

  return (
    typeof value.id === "string" ||
    typeof value.username === "string" ||
    typeof value.email === "string"
  );
}

function normalizeFriendStories(raw: unknown): FriendStory[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.filter((story): story is FriendStory => Boolean(story));
}

function normalizeFriendEntry(entry: FriendEntry | null | undefined): FriendEntry | null {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const sanitized: FriendEntry = { ...entry };

  sanitized.stories = normalizeFriendStories(entry.stories);

  return sanitized;
}

function normalizeFriendEntries(raw: ProfileUser["friends"]): FriendEntry[] {
  if (!raw) {
    return [];
  }

  const entries = Array.isArray(raw) ? raw : Object.values(raw);

  return entries
    .map((entry) => normalizeFriendEntry(entry))
    .filter((entry): entry is FriendEntry => Boolean(entry));
}

function normalizeStories(raw: unknown): FriendStory[] {
  return normalizeFriendStories(raw);
}

function unwrapProfile(payload: ProfileSource): ProfileUser {
  if (isProfileUser(payload)) {
    return {
      ...payload,
      friends: normalizeFriendEntries(payload.friends),
      stories: normalizeStories(payload.stories),
    };
  }

  if (payload && typeof payload === "object") {
    const envelope = payload as {
      data?: ProfileUser | null;
      profile?: ProfileUser | null;
      user?: ProfileUser | null;
    };

    const candidates = [envelope.data, envelope.profile, envelope.user];

    for (const candidate of candidates) {
      if (isProfileUser(candidate)) {
        return {
          ...candidate,
          friends: normalizeFriendEntries(candidate.friends),
          stories: normalizeStories(candidate.stories),
        };
      }
    }
  }

  throw createError({
    statusCode: 502,
    statusMessage: "Users API request failed",
    data: { message: "Invalid profile payload." },
  });
}

function getUsersApiBase(event: H3Event) {
  const config = useRuntimeConfig(event);
  const base = config.users?.apiBase ?? "https://bro-world.org/api/v1";

  return base.endsWith("/") ? base.slice(0, -1) : base;
}

type RuntimeConfig = ReturnType<typeof useRuntimeConfig>;

function resolveUsersServiceToken(config: RuntimeConfig): string | null {
  return (
    [config.users?.apiToken, config.auth?.apiToken]
      .map((candidate) => (typeof candidate === "string" ? candidate.trim() : ""))
      .find((token) => token.length > 0) || null
  );
}

async function requestUsersApi<T>(
  event: H3Event,
  path: string,
  options: UsersFetchOptions = {},
): Promise<T> {
  const config = useRuntimeConfig(event);
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  const endpoint = joinURL(getUsersApiBase(event), normalizedPath);

  const forwardedAuthorization = getHeader(event, "authorization")?.trim();
  const sessionToken = getSessionToken(event)?.trim();
  const serviceToken = resolveUsersServiceToken(config);
  const { headers: initialHeaders, ...requestOptions } = options;
  const headers = new Headers(initialHeaders ?? {});

  headers.set("accept", "application/json");

  if (!headers.has("authorization")) {
    if (sessionToken) {
      const authHeaders = withAuthHeaders(event);
      const value =
        authHeaders.Authorization ?? authHeaders.authorization ?? `Bearer ${sessionToken}`;

      headers.set("authorization", value);
    } else if (serviceToken) {
      const value = serviceToken.startsWith("Bearer ") ? serviceToken : `Bearer ${serviceToken}`;

      headers.set("authorization", value);
    } else if (forwardedAuthorization) {
      headers.set("authorization", forwardedAuthorization);
    }
  }

  try {
    return await $fetch<T>(endpoint, {
      ...requestOptions,
      headers: Object.fromEntries(headers.entries()),
    });
  } catch (error) {
    const statusCode =
      typeof (error as { statusCode?: number })?.statusCode === "number"
        ? (error as { statusCode: number }).statusCode
        : typeof (error as { response?: { status?: number } })?.response?.status === "number"
          ? ((error as { response: { status: number } }).response.status ?? 502)
          : 502;

    const payload = (error as { data?: { message?: unknown; error?: unknown } })?.data ?? {};
    const rawMessage =
      typeof payload.message === "string"
        ? payload.message
        : typeof payload.error === "string"
          ? payload.error
          : undefined;
    const fallbackMessage =
      error instanceof Error ? error.message : "Users API request failed.";

    let message = rawMessage || fallbackMessage;

    if (statusCode === 401) {
      message = "Authentication is required to access this resource.";
    } else if (statusCode === 403) {
      message = "You do not have permission to perform this action.";
    } else if (statusCode === 404) {
      message = "The requested resource could not be found.";
    } else if (statusCode >= 500) {
      message = "The users service is currently unavailable. Please try again later.";
    }

    throw createError({
      statusCode,
      statusMessage: message,
      message,
      data: { message },
    });
  }
}

function normalizeUser(raw: unknown): UsersApiUser | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const id = typeof record.id === "string" && record.id.trim() ? record.id.trim() : null;

  if (!id) {
    return null;
  }

  const user: UsersApiUser = {
    id,
    username: typeof record.username === "string" ? record.username : "",
    email: typeof record.email === "string" ? record.email : "",
  };

  if (typeof record.firstName === "string") {
    user.firstName = record.firstName;
  } else if (record.firstName === null) {
    user.firstName = null;
  }

  if (typeof record.lastName === "string") {
    user.lastName = record.lastName;
  } else if (record.lastName === null) {
    user.lastName = null;
  }

  if (typeof record.enabled === "boolean") {
    user.enabled = record.enabled;
  }

  if (Array.isArray(record.roles)) {
    user.roles = record.roles.map((role) => String(role ?? ""));
  }

  if (typeof record.language === "string") {
    user.language = record.language;
  } else if (record.language === null) {
    user.language = null;
  }

  if (typeof record.locale === "string") {
    user.locale = record.locale;
  } else if (record.locale === null) {
    user.locale = null;
  }

  if (typeof record.timezone === "string") {
    user.timezone = record.timezone;
  } else if (record.timezone === null) {
    user.timezone = null;
  }

  if (typeof record.createdAt === "string") {
    user.createdAt = record.createdAt;
  } else if (record.createdAt === null) {
    user.createdAt = null;
  }

  if (typeof record.updatedAt === "string") {
    user.updatedAt = record.updatedAt;
  } else if (record.updatedAt === null) {
    user.updatedAt = null;
  }

  if ("profile" in record) {
    user.profile = record.profile;
  }

  return user;
}

function unwrapUsersList(payload: UsersListSource) {
  const data: UsersApiUser[] = [];

  const source = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object" && Array.isArray((payload as UsersListEnvelope).data)
      ? ((payload as UsersListEnvelope).data ?? [])
      : [];

  for (const entry of source) {
    const normalized = normalizeUser(entry);

    if (normalized) {
      data.push(normalized);
    }
  }

  const count =
    payload &&
    typeof payload === "object" &&
    typeof (payload as UsersListEnvelope).count === "number"
      ? (payload as UsersListEnvelope).count || 0
      : data.length;

  return { data, count };
}

function unwrapUser(payload: UserSource): UsersApiUser {
  const source =
    payload && typeof payload === "object" && "data" in (payload as UserEnvelope)
      ? (payload as UserEnvelope).data
      : payload;

  const normalized = normalizeUser(source);

  if (!normalized) {
    throw new Error("Invalid user payload");
  }

  return normalized;
}

export async function fetchUsersListFromSource(event: H3Event) {
  try {
    const payload = await requestUsersApi<UsersListSource>(event, "/user", { method: "GET" });
    return unwrapUsersList(payload);
  } catch (error) {
    if (!isAuthorizationError(error)) {
      throw error;
    }

    warnMockFallback("users-list", "users list", error);

    return unwrapUsersList(usersListSample);
  }
}

export async function fetchCurrentProfileFromSource(event: H3Event) {
  const sessionToken = requireSessionToken(event, {
    statusMessage: "Authentication is required to access this resource.",
    message: "Authentication is required to access this resource.",
  });

  const cached = await readCachedProfile(event, sessionToken);

  if (cached) {
    return cached;
  }

  try {
    const payload = await requestUsersApi<ProfileSource>(event, "/profile", { method: "GET" });
    const profile = unwrapProfile(payload);

    await writeCachedProfile(event, sessionToken, profile);

    return profile;
  } catch (error) {
    if (isAuthorizationError(error)) {
      void deleteCachedProfile(event, sessionToken);
      throw error;
    }

    const sessionUser = getSessionUser(event);

    if (sessionUser) {
      try {
        const profile = unwrapProfile(sessionUser as ProfileSource);
        await writeCachedProfile(event, sessionToken, profile);
        return profile;
      } catch (fallbackError) {
        console.error("Failed to normalize session user profile", fallbackError);
      }
    }

    throw error;
  }
}

export async function fetchProfileEventsFromSource(event: H3Event, query: QueryObject = {}) {
  try {
    const payload = await requestUsersApi<ProfileEventsSource>(event, "/profile/events", {
      method: "GET",
      query,
    });

    return normalizeProfileEvents(payload);
  } catch (error) {
    if (!isAuthorizationError(error)) {
      throw error;
    }

    warnMockFallback("profile-events", "profile events", error);

    return normalizeProfileEvents(profileEventsSample);
  }
}

export async function fetchUserFromSource(event: H3Event, id: string) {
  const trimmedId = id?.trim();

  if (!trimmedId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing user identifier",
      data: { message: "A user identifier is required." },
    });
  }

  const payload = await requestUsersApi<UserSource>(
    event,
    `/user/${encodeURIComponent(trimmedId)}`,
    { method: "GET" },
  );

  return unwrapUser(payload);
}

export async function createUserThroughApi(event: H3Event, payload: Partial<AuthUser>) {
  const response = await requestUsersApi<UserSource>(event, "/user", {
    method: "POST",
    body: payload,
  });

  return unwrapUser(response);
}

export async function updateUserThroughApi(event: H3Event, id: string, payload: Partial<AuthUser>) {
  const trimmedId = id?.trim();

  if (!trimmedId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing user identifier",
      data: { message: "A user identifier is required." },
    });
  }

  const response = await requestUsersApi<UserSource>(
    event,
    `/user/${encodeURIComponent(trimmedId)}`,
    {
      method: "PUT",
      body: payload,
    },
  );

  return unwrapUser(response);
}

export async function deleteUserThroughApi(event: H3Event, id: string) {
  const trimmedId = id?.trim();

  if (!trimmedId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing user identifier",
      data: { message: "A user identifier is required." },
    });
  }

  await requestUsersApi(event, `/user/${encodeURIComponent(trimmedId)}`, { method: "DELETE" });
}

export async function fetchUsersCountFromSource(event: H3Event) {
  const config = useRuntimeConfig(event);
  const serviceToken = resolveUsersServiceToken(config);
  const forwardedAuthorization = getHeader(event, "authorization")?.trim();

  if (!serviceToken && !forwardedAuthorization) {
    requireSessionToken(event, {
      statusMessage: "Authentication is required to access this resource.",
      message: "Authentication is required to access this resource.",
    });
  }

  const response = await requestUsersApi<{ count?: number | null }>(event, "/user/count", {
    method: "GET",
  });

  const count = typeof response?.count === "number" ? response.count : 0;

  return { count };
}
