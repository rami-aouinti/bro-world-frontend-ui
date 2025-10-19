import { describe, expect, it } from "vitest";

import { optimizeAvatarUrl } from "~/lib/images/avatar";

describe("optimizeAvatarUrl", () => {
  it("adds format parameter for bro-world avatars", () => {
    const result = optimizeAvatarUrl("https://bro-world.org/uploads/avatar/example.jpg", 48);

    if (!result) {
      throw new Error("Expected a transformed URL");
    }

    const url = new URL(result);

    expect(url.searchParams.get("size")).toBe("48x48");
    expect(url.searchParams.get("width")).toBe("48");
    expect(url.searchParams.get("height")).toBe("48");
    expect(url.searchParams.get("format")).toBe("webp");
  });

  it("adds format parameter for bro-world-space avatars", () => {
    const result = optimizeAvatarUrl(
      "https://media.bro-world-space.com/uploads/avatar/example.jpg",
      64,
    );

    if (!result) {
      throw new Error("Expected a transformed URL");
    }

    const url = new URL(result);

    expect(url.searchParams.get("size")).toBe("64x64");
    expect(url.searchParams.get("width")).toBe("64");
    expect(url.searchParams.get("height")).toBe("64");
    expect(url.searchParams.get("format")).toBe("webp");
  });

  it("does not overwrite an existing format parameter", () => {
    const result = optimizeAvatarUrl(
      "https://bro-world.org/uploads/avatar/example.jpg?format=avif",
      32,
    );

    if (!result) {
      throw new Error("Expected a transformed URL");
    }

    const url = new URL(result);

    expect(url.searchParams.get("size")).toBe("32x32");
    expect(url.searchParams.get("format")).toBe("avif");
  });

  it("preserves explicit width and height parameters", () => {
    const result = optimizeAvatarUrl(
      "https://bro-world.org/uploads/avatar/example.jpg?width=200&height=100",
      32,
    );

    if (!result) {
      throw new Error("Expected a transformed URL");
    }

    const url = new URL(result);

    expect(url.searchParams.get("width")).toBe("200");
    expect(url.searchParams.get("height")).toBe("100");
    expect(url.searchParams.get("size")).toBe("32x32");
  });

  it("returns untouched URLs for other hosts", () => {
    const source = "https://example.com/avatar.jpg";
    const result = optimizeAvatarUrl(source, 50);

    expect(result).toBe(source);
  });

  it("keeps cached entries scoped by size", () => {
    const source = "https://avatars.githubusercontent.com/u/123?v=4";

    const large = optimizeAvatarUrl(source, 96);
    const small = optimizeAvatarUrl(source, 32);

    expect(large).toContain("s=96");
    expect(small).toContain("s=32");
  });
});
