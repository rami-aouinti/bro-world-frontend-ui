import { Buffer } from "node:buffer";
import { describe, expect, it } from "vitest";
import {
  normalizeCredentialPayload,
  resolveCredentialIdentifier,
  resolveCredentialPassword,
} from "~/server/utils/auth/credentials";

describe("credential helpers", () => {
  it("returns trimmed identifier from any supported field", () => {
    expect(resolveCredentialIdentifier({ identifier: "   john@example.com  " })).toBe(
      "john@example.com",
    );
    expect(resolveCredentialIdentifier({ username: "  johndoe" })).toBe("johndoe");
    expect(resolveCredentialIdentifier({ email: " jane " })).toBe("jane");
  });

  it("returns first non-empty identifier value", () => {
    expect(resolveCredentialIdentifier({ identifier: "   ", username: " user " })).toBe("user");
  });

  it("normalizes identifier arrays by using their first item", () => {
    expect(resolveCredentialIdentifier({ identifier: ["  admin  ", "ignored"] })).toBe("admin");
  });

  it("normalizes the password field", () => {
    expect(resolveCredentialPassword({ password: "  secret" })).toBe("secret");
    expect(resolveCredentialPassword({ password: ["  hunter2  ", "ignored"] })).toBe("hunter2");
  });

  it("returns an empty string when fields are missing", () => {
    expect(resolveCredentialIdentifier(undefined)).toBe("");
    expect(resolveCredentialPassword(undefined)).toBe("");
  });

  it("normalizes different credential payload formats", () => {
    expect(normalizeCredentialPayload({ username: "jane", password: "secret" })).toEqual({
      username: "jane",
      password: "secret",
    });

    expect(normalizeCredentialPayload('{"identifier":"john","password":"hunter2"}')).toEqual({
      identifier: "john",
      password: "hunter2",
    });

    expect(normalizeCredentialPayload("username=john-root&password=password-root")).toEqual({
      username: "john-root",
      password: "password-root",
    });

    const searchParams = new URLSearchParams();
    searchParams.set("email", "user@example.com");
    searchParams.set("password", "secret");

    expect(normalizeCredentialPayload(searchParams)).toEqual({
      email: "user@example.com",
      password: "secret",
    });

    const bufferPayload = Buffer.from(
      JSON.stringify({ username: "buffer-user", password: "hunter2" }),
    );

    expect(normalizeCredentialPayload(bufferPayload)).toEqual({
      username: "buffer-user",
      password: "hunter2",
    });

    expect(
      normalizeCredentialPayload({ body: { username: "nested", password: "secret" } }),
    ).toEqual({ username: "nested", password: "secret" });
  });
});
