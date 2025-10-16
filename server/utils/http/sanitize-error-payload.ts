const STACK_KEYS = new Set(["stack", "stacktrace"]);

function isRemovableStack(value: unknown): boolean {
  return typeof value === "string" || Array.isArray(value);
}

function sanitizeObject(value: unknown, visited: WeakSet<object>) {
  if (!value || typeof value !== "object") {
    return;
  }

  if (visited.has(value as object)) {
    return;
  }

  visited.add(value as object);

  if (Array.isArray(value)) {
    for (const entry of value) {
      sanitizeObject(entry, visited);
    }

    return;
  }

  const record = value as Record<string, unknown>;

  for (const key of Object.keys(record)) {
    if (STACK_KEYS.has(key) && isRemovableStack(record[key])) {
      delete record[key];
      continue;
    }

    const nested = record[key];

    if (nested && typeof nested === "object") {
      sanitizeObject(nested, visited);
    }
  }
}

export function sanitizeErrorPayload<T>(payload: T): T {
  if (!payload || typeof payload !== "object") {
    return payload;
  }

  const visited = new WeakSet<object>();

  sanitizeObject(payload, visited);

  return payload;
}
