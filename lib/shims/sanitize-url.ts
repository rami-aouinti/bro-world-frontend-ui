const CONTROL_CHARACTERS_REGEX = /[\u0000-\u001f\u007f]/g;
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

function sanitizeUrl(url: unknown): string {
  if (typeof url !== "string") {
    return "about:blank";
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return "about:blank";
  }

  const cleaned = trimmed.replace(CONTROL_CHARACTERS_REGEX, "");
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
