import { describe, expect, it } from "vitest";
import {
  resolveCredentialIdentifier,
  resolveCredentialPassword,
} from "~/server/utils/auth/credentials";

describe("credential helpers", () => {
  it("returns trimmed identifier from any supported field", () => {
    expect(
      resolveCredentialIdentifier({ identifier: "   john@example.com  " }),
    ).toBe("john@example.com");
    expect(resolveCredentialIdentifier({ username: "  johndoe" })).toBe(
      "johndoe",
    );
    expect(resolveCredentialIdentifier({ email: " jane " })).toBe("jane");
  });

  it("returns first non-empty identifier value", () => {
    expect(
      resolveCredentialIdentifier({ identifier: "   ", username: " user " }),
    ).toBe("user");
  });

  it("normalizes identifier arrays by using their first item", () => {
    expect(
      resolveCredentialIdentifier({ identifier: ["  admin  ", "ignored"] }),
    ).toBe("admin");
  });

  it("normalizes the password field", () => {
    expect(resolveCredentialPassword({ password: "  secret" })).toBe("secret");
    expect(
      resolveCredentialPassword({ password: ["  hunter2  ", "ignored"] }),
    ).toBe("hunter2");
  });

  it("returns an empty string when fields are missing", () => {
    expect(resolveCredentialIdentifier(undefined)).toBe("");
    expect(resolveCredentialPassword(undefined)).toBe("");
  });
});
