export function optimizeAvatarUrl(input: string | null | undefined, size: number): string | null {
  if (!input) {
    return null;
  }

  const trimmed = input.trim();

  if (!trimmed) {
    return null;
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const normalizedSize = Number.isFinite(size) ? Math.max(1, Math.round(size)) : 1;

  try {
    const url = new URL(trimmed);
    const host = url.hostname.toLowerCase();

    if (host === "avatars.githubusercontent.com") {
      url.searchParams.set("s", String(normalizedSize));
      return url.toString();
    }

    if (host.endsWith("bro-world.org")) {
      url.searchParams.set("size", `${normalizedSize}x${normalizedSize}`);
      return url.toString();
    }

    if (host.endsWith("bro-world-space.com")) {
      url.searchParams.set("size", `${normalizedSize}x${normalizedSize}`);
      return url.toString();
    }

    return url.toString();
  } catch {
    return trimmed;
  }
}
