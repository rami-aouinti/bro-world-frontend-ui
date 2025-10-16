import { createError, getHeader } from "h3";
import type { H3Event } from "h3";
import { joinURL } from "ufo";
import type { FetchOptions } from "ofetch";
import type { QueryObject } from "ufo";
import { useRuntimeConfig } from "#imports";
import type { AuthUser } from "~/types/auth";
import type {
  FriendEntry,
  FriendStory,
  ProfileEvent,
  ProfileUser,
} from "~/types/pages/profile";
import { getSessionToken } from "../auth/session";

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

function normalizeProfileEvent(raw: unknown): ProfileEvent | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const idCandidate = record.id;
  const titleCandidate = record.title;
  const startCandidate = record.start;

  const id = typeof idCandidate === "string" && idCandidate.trim()
    ? idCandidate.trim()
    : idCandidate != null
      ? String(idCandidate)
      : "";
  const title = typeof titleCandidate === "string" ? titleCandidate : "";
  const start = typeof startCandidate === "string" ? startCandidate : "";

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

  if (typeof record.end === "string") {
    event.end = record.end;
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

async function requestUsersApi<T>(
  event: H3Event,
  path: string,
  options: UsersFetchOptions = {},
): Promise<T> {
  const config = useRuntimeConfig(event);
  const endpoint = joinURL(getUsersApiBase(event), path);

  const serviceToken = config.users?.apiToken?.trim();
  const forwardedAuthorization = getHeader(event, "authorization")?.trim();
  const sessionToken = getSessionToken(event)?.trim();
  const { headers: initialHeaders, ...requestOptions } = options;
  const headers = new Headers(initialHeaders ?? {});

  headers.set("accept", "application/json");

  if (!headers.has("authorization")) {
    if (forwardedAuthorization) {
      headers.set("authorization", forwardedAuthorization);
    } else if (serviceToken) {
      const value = serviceToken.startsWith("Bearer ") ? serviceToken : `Bearer ${serviceToken}`;

      headers.set("authorization", value);
    } else if (sessionToken) {
      const value = sessionToken.startsWith("Bearer ") ? sessionToken : `Bearer ${sessionToken}`;

      headers.set("authorization", value);
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

    const message =
      typeof (error as { data?: { message?: string } })?.data?.message === "string"
        ? (error as { data: { message: string } }).data.message
        : error instanceof Error
          ? error.message
          : "Users API request failed.";

    throw createError({
      statusCode,
      statusMessage: "Users API request failed",
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
  const payload = await requestUsersApi<UsersListSource>(event, "/user", { method: "GET" });
  return unwrapUsersList(payload);
}

export async function fetchCurrentProfileFromSource(event: H3Event) {
  const payload = await requestUsersApi<ProfileSource>(event, "/profile", { method: "GET" });

  return unwrapProfile(payload);
}

export async function fetchProfileEventsFromSource(event: H3Event, query: QueryObject = {}) {
  const payload = await requestUsersApi<ProfileEventsSource>(event, "/profile/events", {
    method: "GET",
    query,
  });

  return normalizeProfileEvents(payload);
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
  const response = await requestUsersApi<{ count?: number | null }>(event, "/user/count", {
    method: "GET",
  });

  const count = typeof response?.count === "number" ? response.count : 0;

  return { count };
}
