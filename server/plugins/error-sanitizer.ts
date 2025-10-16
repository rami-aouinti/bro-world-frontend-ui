import type { H3Response } from "h3";
import { sanitizeErrorPayload } from "~/server/utils/http/sanitize-error-payload";

function resolveHeaderValue(headers: H3Response["headers"], name: string): string | null {
  if (!headers) {
    return null;
  }

  const target = name.toLowerCase();

  if (typeof (headers as Headers)?.get === "function") {
    return ((headers as Headers).get(name) ?? null);
  }

  const entries = headers as Record<string, unknown>;

  for (const key of Object.keys(entries)) {
    if (key.toLowerCase() !== target) {
      continue;
    }

    const raw = entries[key];

    if (Array.isArray(raw)) {
      return raw.length > 0 ? String(raw[0]) : null;
    }

    if (typeof raw === "string") {
      return raw;
    }

    if (typeof raw === "number" || typeof raw === "boolean") {
      return String(raw);
    }
  }

  return null;
}

function isJsonResponse(contentType: string | null): boolean {
  if (!contentType) {
    return true;
  }

  return /application\/(json|problem\+json)/i.test(contentType);
}

function isBinaryBody(body: unknown): boolean {
  if (!body || typeof body !== "object") {
    return false;
  }

  if (ArrayBuffer.isView(body)) {
    return true;
  }

  const globalBuffer = (globalThis as typeof globalThis & {
    Buffer?: { isBuffer(value: unknown): boolean };
  }).Buffer;

  if (globalBuffer?.isBuffer?.(body)) {
    return true;
  }

  return false;
}

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("error", (error) => {
    sanitizeErrorPayload(error);
  });

  nitroApp.hooks.hook("render:response", (response) => {
    if (!response || response.body == null) {
      return;
    }

    const contentType = resolveHeaderValue(response.headers, "content-type");

    if (!isJsonResponse(contentType)) {
      return;
    }

    if (typeof response.body === "string") {
      try {
        const parsed = JSON.parse(response.body);
        sanitizeErrorPayload(parsed);
        response.body = JSON.stringify(parsed);
      } catch {
        // Ignore parse errors for non-JSON bodies.
      }

      return;
    }

    if (typeof response.body === "object" && !isBinaryBody(response.body)) {
      sanitizeErrorPayload(response.body);
    }
  });
});
