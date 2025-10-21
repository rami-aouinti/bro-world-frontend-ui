import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { useRuntimeConfig } from "#imports";

export type RuntimeConfigEvent = Parameters<typeof useRuntimeConfig>[0];

function resolveBooleanFlag(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    if (value === 1) {
      return true;
    }

    if (value === 0) {
      return false;
    }
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (!normalized) {
      return false;
    }

    if (["1", "true", "yes", "on"].includes(normalized)) {
      return true;
    }

    if (["0", "false", "no", "off"].includes(normalized)) {
      return false;
    }
  }

  return false;
}

export function resolveGameApiBase(event: RuntimeConfigEvent) {
  const config = useRuntimeConfig(event);
  const base = config.public?.apiGameBase;
  const normalized = typeof base === "string" ? base.trim() : "";

  const shouldUseMock =
    !normalized ||
    normalized === "mock" ||
    resolveBooleanFlag(config.public?.useMockData) ||
    resolveBooleanFlag((config as { useMockData?: unknown }).useMockData);

  if (shouldUseMock) {
    return {
      baseUrl: null as string | null,
      useMock: true,
    };
  }

  return {
    baseUrl: normalized.replace(/\/$/, ""),
    useMock: false,
  };
}

export async function readQuizMock<T>(name: string): Promise<T> {
  const filePath = join(process.cwd(), "server/mock", `quiz-${name}.json`);
  const payload = await readFile(filePath, "utf8");
  return JSON.parse(payload) as T;
}
