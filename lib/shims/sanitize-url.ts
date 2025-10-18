const URL_SCHEME_REGEX = /^([a-z0-9+.-]+):/i;
const RELATIVE_URL_REGEX = /^[/?#]/;
const SAFE_PROTOCOLS = new Set([
  "http",
  "https",
  "mailto",
  "tel",
  "sms",
  "ftp",
  "ftps",
  "news",
  "irc",
  "ircs",
  "gopher",
  "nntp",
  "feed",
  "geo",
  "magnet",
  "cid",
  "mid",
  "file",
  "blob",
  "about",
  "data",
]);
const SAFE_DATA_URL_REGEX = /^data:image\/(?:gif|png|jpeg|webp|bmp);/i;

function stripControlCharacters(value: string): string {
  let result = "";

  for (const character of value) {
    const code = character.codePointAt(0);
    if (code === undefined) {
      continue;
    }

    if ((code >= 0 && code <= 31) || code === 127) {
      continue;
    }

    result += character;
  }

  return result;
}

function sanitizeUrl(url: unknown): string {
  if (typeof url !== "string") {
    return "about:blank";
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return "about:blank";
  }

  const cleaned = stripControlCharacters(trimmed);
  if (!cleaned) {
    return "about:blank";
  }

  if (RELATIVE_URL_REGEX.test(cleaned)) {
    return cleaned;
  }

  const match = URL_SCHEME_REGEX.exec(cleaned);
  if (!match) {
    return cleaned;
  }

  const protocol = match[1].toLowerCase();
  if (!SAFE_PROTOCOLS.has(protocol)) {
    return "about:blank";
  }

  if (protocol === "data") {
    return SAFE_DATA_URL_REGEX.test(cleaned) ? cleaned : "about:blank";
  }

  return cleaned;
}

export { sanitizeUrl };
export default sanitizeUrl;
