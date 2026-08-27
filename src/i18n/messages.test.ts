import { describe, expect, it } from "vitest";
import { messages } from "./messages";

function collectKeys(value: unknown, prefix = ""): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return prefix ? [prefix] : [];
  }
  return Object.entries(value as Record<string, unknown>).flatMap(([key, nested]) =>
    collectKeys(nested, prefix ? `${prefix}.${key}` : key),
  );
}

describe("i18n catalogs", () => {
  it("keeps Hindi and Kannada keys aligned with English", () => {
    const english = collectKeys(messages.en).sort();
    expect(collectKeys(messages.hi).sort()).toEqual(english);
    expect(collectKeys(messages.kn).sort()).toEqual(english);
  });
});
