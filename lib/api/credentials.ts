export function shouldSendCredentials(baseURL: string): boolean {
  if (import.meta.server) {
    return true;
  }

  const location = globalThis.location;

  if (!location) {
    return false;
  }

  try {
    const resolvedURL = new URL(baseURL, location.origin);
    return resolvedURL.origin === location.origin;
  } catch {
    return false;
  }
}
