const SAFE_TAGS = new Set([
  "a",
  "abbr",
  "b",
  "blockquote",
  "br",
  "code",
  "em",
  "figure",
  "figcaption",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "i",
  "img",
  "li",
  "ol",
  "p",
  "pre",
  "s",
  "span",
  "strong",
  "sub",
  "sup",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "u",
  "ul",
]);

const SELF_CLOSING_TAGS = new Set(["br", "hr", "img"]);

const GLOBAL_ATTRIBUTES = new Set([
  "aria-label",
  "aria-hidden",
  "aria-live",
  "dir",
  "lang",
  "role",
  "title",
]);

const TAG_ATTRIBUTES: Record<string, Set<string>> = {
  a: new Set(["href", "rel", "target"]),
  img: new Set(["alt", "src", "width", "height", "loading"]),
  table: new Set(["summary"]),
  th: new Set(["scope"]),
  td: new Set(["colspan", "rowspan"]),
};

const ALLOWED_URI_SCHEMES = new Set(["http", "https", "mailto", "tel"]);
const ALLOWED_IMG_SCHEMES = new Set(["http", "https", "data"]);

const ATTRIBUTE_PATTERN = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>`]+)))?/g;

function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isUriAllowed(tag: string, attribute: string, value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  if (trimmed.startsWith("#")) {
    return true;
  }

  const lowerValue = trimmed.toLowerCase();

  if (lowerValue.startsWith("javascript:")) {
    return false;
  }

  if (lowerValue.startsWith("data:")) {
    if (tag === "img" && attribute === "src") {
      return /^data:image\/(png|jpe?g|gif|webp);/i.test(lowerValue);
    }

    return false;
  }

  const schemeMatch = lowerValue.match(/^([a-z0-9+.-]+):/);
  if (!schemeMatch) {
    return true;
  }

  const scheme = schemeMatch[1];
  if (tag === "img" && attribute === "src") {
    return ALLOWED_IMG_SCHEMES.has(scheme);
  }

  return ALLOWED_URI_SCHEMES.has(scheme);
}

function buildAttributes(tag: string, rawAttributes: string): string {
  if (!rawAttributes) {
    return "";
  }

  const allowedAttributes = new Set([
    ...GLOBAL_ATTRIBUTES,
    ...(TAG_ATTRIBUTES[tag] ?? new Set<string>()),
  ]);

  if (allowedAttributes.size === 0) {
    return "";
  }

  ATTRIBUTE_PATTERN.lastIndex = 0;

  const collected: string[] = [];
  let hasRelAttribute = false;
  let hasTargetBlank = false;

  let match: RegExpExecArray | null;
  while ((match = ATTRIBUTE_PATTERN.exec(rawAttributes)) !== null) {
    const name = match[1]?.toLowerCase();
    if (!name) {
      continue;
    }

    if (name.startsWith("on") || name.startsWith("data-")) {
      continue;
    }

    if (!allowedAttributes.has(name)) {
      continue;
    }

    const value = match[2] ?? match[3] ?? match[4] ?? "";

    if (name === "href" || name === "src") {
      if (!isUriAllowed(tag, name, value)) {
        continue;
      }
    }

    if (name === "target") {
      const normalisedTarget = value.trim().toLowerCase();
      if (!["_self", "_blank", "_parent", "_top"].includes(normalisedTarget)) {
        continue;
      }

      if (normalisedTarget === "_blank") {
        hasTargetBlank = true;
      }
    }

    if (name === "rel") {
      hasRelAttribute = true;
    }

    const escapedValue = escapeAttribute(value);
    if (!escapedValue && name !== "alt") {
      continue;
    }

    collected.push(`${name}="${escapedValue}"`);
  }

  if (tag === "a" && hasTargetBlank && !hasRelAttribute) {
    collected.push('rel="noopener noreferrer"');
  }

  if (!collected.length) {
    return "";
  }

  return ` ${collected.join(" ")}`;
}

function sanitizeNode(
  match: string,
  closingSlash: string,
  tagName: string,
  rawAttributes: string,
  original: string,
): string {
  const tag = tagName.toLowerCase();

  if (!SAFE_TAGS.has(tag)) {
    return "";
  }

  if (closingSlash) {
    return `</${tag}>`;
  }

  const isSelfClosing = SELF_CLOSING_TAGS.has(tag) || /\/>\s*$/.test(original);
  const attributes = buildAttributes(tag, rawAttributes ?? "");
  const closing = isSelfClosing ? " />" : ">";

  return `<${tag}${attributes}${closing}`;
}

const TAG_PATTERN = /<(\/)?([a-zA-Z0-9:-]+)([^>]*)>/g;
const SCRIPT_STYLE_PATTERN = /<(script|style)[^>]*>[\s\S]*?<\/\1>/gi;
const COMMENT_PATTERN = /<!--([\s\S]*?)-->/g;

export function sanitizeRichText(input: unknown): string {
  if (typeof input !== "string") {
    return "";
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return "";
  }

  const withoutDangerousBlocks = trimmed
    .replace(COMMENT_PATTERN, "")
    .replace(SCRIPT_STYLE_PATTERN, "");

  const sanitized = withoutDangerousBlocks.replace(
    TAG_PATTERN,
    (match, closingSlash, tagName, rawAttributes) =>
      sanitizeNode(match, closingSlash ?? "", tagName ?? "", rawAttributes ?? "", match),
  );

  return sanitized;
}
