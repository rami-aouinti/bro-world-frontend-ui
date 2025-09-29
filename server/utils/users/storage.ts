import { createError } from "h3";
import { useStorage } from "nitropack/runtime";
import type { AuthUser } from "../../../types/auth";
import { normalizeUserPayload } from "../../../lib/users/normalizers";

export interface StoredUser extends AuthUser {
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "users";

const seedUsers: StoredUser[] = [
  {
    id: "1d2f8e7a-2f2e-4a05-8e2d-4d6f65b4c001",
    username: "admin",
    email: "admin@example.com",
    firstName: "System",
    lastName: "Administrator",
    enabled: true,
    roles: ["admin"],
    createdAt: "2024-01-01T08:00:00.000Z",
    updatedAt: "2024-01-01T08:00:00.000Z",
  },
  {
    id: "2a3b4c5d-6e7f-4890-a123-456789abcdef",
    username: "moderator",
    email: "moderator@example.com",
    firstName: "Morgan",
    lastName: "Lee",
    enabled: true,
    roles: ["moderator"],
    createdAt: "2024-01-02T09:30:00.000Z",
    updatedAt: "2024-01-02T09:30:00.000Z",
  },
  {
    id: "3c4d5e6f-7081-4a2b-9c3d-5e6f7a8b9c0d",
    username: "guest-author",
    email: "guest.author@example.com",
    firstName: "Jamie",
    lastName: "Rivera",
    enabled: false,
    roles: ["author"],
    createdAt: "2024-01-03T11:15:00.000Z",
    updatedAt: "2024-01-03T11:15:00.000Z",
  },
];

let seedPromise: Promise<void> | null = null;

async function ensureSeed() {
  if (!seedPromise) {
    seedPromise = (async () => {
      const storage = useStorage();
      const existing = await storage.getItem<StoredUser[] | null>(STORAGE_KEY);

      if (!Array.isArray(existing) || existing.length === 0) {
        await storage.setItem(STORAGE_KEY, [...seedUsers]);
      }
    })();
  }

  await seedPromise;
}

async function readUsers(): Promise<StoredUser[]> {
  await ensureSeed();
  const storage = useStorage();
  const users = await storage.getItem<StoredUser[] | null>(STORAGE_KEY);

  if (!Array.isArray(users)) {
    return [];
  }

  return users;
}

async function writeUsers(users: StoredUser[]): Promise<void> {
  const storage = useStorage();
  await storage.setItem(STORAGE_KEY, users);
}

export async function listUsers(): Promise<StoredUser[]> {
  return readUsers();
}

export async function findUserById(id: string): Promise<StoredUser | null> {
  const trimmedId = id?.trim();

  if (!trimmedId) {
    return null;
  }

  const users = await readUsers();
  return users.find((user) => user.id === trimmedId) ?? null;
}

export async function createUser(payload: Partial<AuthUser>): Promise<StoredUser> {
  const normalized = normalizeUserPayload(payload);
  const email = normalized.email;
  const username = normalized.username;

  if (!email || !username) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required fields",
      data: {
        message: "Both username and email are required to create a user.",
      },
    });
  }

  const users = await readUsers();

  if (users.some((user) => user.email === email)) {
    throw createError({
      statusCode: 409,
      statusMessage: "Duplicate email",
      data: {
        message: "An account already exists for this email.",
      },
    });
  }

  const now = new Date().toISOString();

  const newUser: StoredUser = {
    id: normalized.id ?? crypto.randomUUID(),
    username,
    email,
    firstName: normalized.firstName ?? null,
    lastName: normalized.lastName ?? null,
    enabled: normalized.enabled ?? true,
    roles: normalized.roles ?? [],
    createdAt: now,
    updatedAt: now,
  };

  const nextUsers = [newUser, ...users];
  await writeUsers(nextUsers);

  return newUser;
}

export async function updateUser(id: string, payload: Partial<AuthUser>): Promise<StoredUser> {
  const trimmedId = id?.trim();

  if (!trimmedId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing user identifier",
    });
  }

  const users = await readUsers();
  const index = users.findIndex((user) => user.id === trimmedId);

  if (index === -1) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found",
    });
  }

  const normalized = normalizeUserPayload(payload);
  const existing = users[index];

  if (normalized.email && normalized.email !== existing.email) {
    const emailTaken = users.some((user, position) => position !== index && user.email === normalized.email);

    if (emailTaken) {
      throw createError({
        statusCode: 409,
        statusMessage: "Duplicate email",
        data: {
          message: "An account already exists for this email.",
        },
      });
    }
  }

  const updated: StoredUser = {
    ...existing,
    ...normalized,
    updatedAt: new Date().toISOString(),
  };

  users.splice(index, 1, updated);
  await writeUsers(users);

  return updated;
}

export async function removeUser(id: string): Promise<void> {
  const trimmedId = id?.trim();

  if (!trimmedId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing user identifier",
    });
  }

  const users = await readUsers();
  const index = users.findIndex((user) => user.id === trimmedId);

  if (index === -1) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found",
    });
  }

  users.splice(index, 1);
  await writeUsers(users);
}
