import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { useRuntimeConfig } from "#imports";

export type RuntimeConfigEvent = Parameters<typeof useRuntimeConfig>[0];

export function resolveGameApiBase(event: RuntimeConfigEvent) {
  const config = useRuntimeConfig(event);
  const base = config.public?.apiGameBase;
  const normalized = typeof base === "string" ? base.trim() : "";

  if (!normalized || normalized === "mock") {
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
