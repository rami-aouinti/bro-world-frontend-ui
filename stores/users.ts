import { computed } from "vue";
import { useRequestFetch } from "#app";
import { useState } from "#imports";
import { defineStore } from "~/lib/pinia-shim";
import type { AuthUser } from "~/types/auth";
import { normalizeRolesInput, normalizeUserPayload } from "~/lib/users/normalizers";

export interface UsersStoreUser extends AuthUser {
  createdAt?: string | null;
  updatedAt?: string | null;
  __optimistic?: boolean;
}

interface UsersListResponse {
  data: UsersStoreUser[];
  count: number;
}

interface UserResponse {
  data: UsersStoreUser;
}

interface UserFormPayload {
  username: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  enabled?: boolean;
  roles?: string[];
}

function resolveFetcher() {
  if (import.meta.server) {
    return useRequestFetch();
  }

  return $fetch;
}

function buildRequestBody(payload: UserFormPayload) {
  const normalized = normalizeUserPayload(payload);

  return {
    username: normalized.username ?? payload.username,
    email: normalized.email ?? payload.email,
    firstName: normalized.firstName ?? payload.firstName ?? null,
    lastName: normalized.lastName ?? payload.lastName ?? null,
    enabled: normalized.enabled ?? payload.enabled ?? true,
    roles: normalized.roles ?? normalizeRolesInput(payload.roles ?? []),
  } satisfies UserFormPayload;
}

function createOptimisticUser(id: string, payload: UserFormPayload): UsersStoreUser {
  const normalized = normalizeUserPayload(payload);

  return {
    id,
    username: normalized.username ?? payload.username,
    email: normalized.email ?? payload.email,
    firstName: normalized.firstName ?? payload.firstName ?? null,
    lastName: normalized.lastName ?? payload.lastName ?? null,
    enabled: normalized.enabled ?? payload.enabled ?? true,
    roles: normalized.roles ?? normalizeRolesInput(payload.roles ?? []),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    __optimistic: true,
  };
}

export const useUsersStore = defineStore("users", () => {
  const items = useState<Record<string, UsersStoreUser>>("users-items", () => ({}));
  const listIds = useState<string[]>("users-list-ids", () => []);
  const pending = useState<boolean>("users-pending", () => false);
  const error = useState<string | null>("users-error", () => null);
  const creating = useState<boolean>("users-creating", () => false);
  const createError = useState<string | null>("users-create-error", () => null);
  const updating = useState<Record<string, boolean>>("users-updating", () => ({}));
  const deleting = useState<Record<string, boolean>>("users-deleting", () => ({}));
  const lastFetched = useState<number | null>("users-last-fetched", () => null);

  const users = computed(() =>
    listIds.value
      .map((id) => items.value[id])
      .filter((user): user is UsersStoreUser => Boolean(user)),
  );

  function setUsersFromResponse(response: UsersListResponse) {
    const nextItems: Record<string, UsersStoreUser> = {};
    const nextIds: string[] = [];

    for (const user of response.data ?? []) {
      if (!user?.id) {
        continue;
      }

      nextItems[user.id] = { ...user, __optimistic: false };
      nextIds.push(user.id);
    }

    items.value = nextItems;
    listIds.value = nextIds;
    lastFetched.value = Date.now();
  }

  function upsertUser(user: UsersStoreUser, position?: number) {
    const index = listIds.value.indexOf(user.id);

    if (index !== -1) {
      listIds.value.splice(index, 1);
    }

    if (typeof position === "number" && position >= 0) {
      listIds.value.splice(position, 0, user.id);
    } else {
      listIds.value.unshift(user.id);
    }

    items.value = {
      ...items.value,
      [user.id]: user,
    };
  }

  function removeUserFromState(id: string) {
    const index = listIds.value.indexOf(id);

    if (index !== -1) {
      listIds.value.splice(index, 1);
    }

    if (items.value[id]) {
      const { [id]: _removed, ...rest } = items.value;
      items.value = rest;
    }

    return index;
  }

  async function fetchUsers(options: { force?: boolean } = {}) {
    if (pending.value) {
      return users.value;
    }

    if (!options.force && lastFetched.value && Date.now() - lastFetched.value < 60_000) {
      return users.value;
    }

    pending.value = true;
    error.value = null;

    const fetcher = resolveFetcher();

    try {
      const response = await fetcher<UsersListResponse>('/api/users', {
        method: 'GET',
      });

      if (!response?.data) {
        throw new Error('Invalid users response.');
      }

      setUsersFromResponse(response);
      return users.value;
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : String(caughtError ?? '');
      error.value = message || 'Unable to load users.';
      throw new Error(error.value);
    } finally {
      pending.value = false;
    }
  }

  async function createUser(payload: UserFormPayload) {
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticUser = createOptimisticUser(optimisticId, payload);

    creating.value = true;
    createError.value = null;

    upsertUser(optimisticUser);

    const fetcher = resolveFetcher();

    try {
      const response = await fetcher<UserResponse>("/api/users", {
        method: 'POST',
        body: buildRequestBody(payload),
      });

      if (!response?.data) {
        throw new Error('Invalid create user response.');
      }

      removeUserFromState(optimisticId);
      upsertUser({ ...response.data, __optimistic: false }, 0);

      return response.data;
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : String(caughtError ?? '');
      createError.value = message || 'Unable to create user.';
      removeUserFromState(optimisticId);
      throw new Error(createError.value);
    } finally {
      creating.value = false;
    }
  }

  async function updateUser(id: string, payload: UserFormPayload) {
    const trimmedId = id?.trim();

    if (!trimmedId) {
      throw new Error('A user identifier is required.');
    }

    const existing = items.value[trimmedId];

    if (!existing) {
      throw new Error('User not found in state.');
    }

    updating.value = {
      ...updating.value,
      [trimmedId]: true,
    };

    const previous = { ...existing };
    const position = listIds.value.indexOf(trimmedId);
    const optimisticUser = {
      ...existing,
      ...payload,
      roles: payload.roles ? normalizeRolesInput(payload.roles) : existing.roles,
      __optimistic: true,
    };

    upsertUser(optimisticUser, position);

    const fetcher = resolveFetcher();

    try {
      const response = await fetcher<UserResponse>(
        `/api/users/${encodeURIComponent(trimmedId)}`,
        {
          method: "PUT",
          body: buildRequestBody(payload),
        },
      );

      if (!response?.data) {
        throw new Error('Invalid update user response.');
      }

      upsertUser({ ...response.data, __optimistic: false }, position);

      return response.data;
    } catch (caughtError) {
      upsertUser(previous, position);
      const message = caughtError instanceof Error ? caughtError.message : String(caughtError ?? '');
      throw new Error(message || 'Unable to update user.');
    } finally {
      const { [trimmedId]: _flag, ...rest } = updating.value;
      updating.value = rest;
    }
  }

  async function deleteUser(id: string) {
    const trimmedId = id?.trim();

    if (!trimmedId) {
      throw new Error('A user identifier is required.');
    }

    const existing = items.value[trimmedId];

    if (!existing) {
      throw new Error('User not found in state.');
    }

    deleting.value = {
      ...deleting.value,
      [trimmedId]: true,
    };

    const position = removeUserFromState(trimmedId);

    const fetcher = resolveFetcher();

    try {
      await fetcher(`/api/users/${encodeURIComponent(trimmedId)}`, {
        method: 'DELETE',
      });
    } catch (caughtError) {
      if (position !== -1) {
        upsertUser(existing, position);
      } else {
        upsertUser(existing);
      }

      const message = caughtError instanceof Error ? caughtError.message : String(caughtError ?? '');
      throw new Error(message || 'Unable to delete user.');
    } finally {
      const { [trimmedId]: _flag, ...rest } = deleting.value;
      deleting.value = rest;
    }
  }

  return {
    users,
    pending: computed(() => pending.value),
    error: computed(() => error.value),
    creating: computed(() => creating.value),
    createError: computed(() => createError.value),
    updating: computed(() => updating.value),
    deleting: computed(() => deleting.value),
    lastFetched: computed(() => lastFetched.value),
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  };
});
