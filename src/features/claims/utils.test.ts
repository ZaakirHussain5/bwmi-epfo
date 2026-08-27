import { describe, expect, it } from "vitest";
import { claimStageLabel, claimStatusTone, claimTypeLabel } from "./utils";

describe("claim helpers", () => {
  it("labels claim types and stages in plain language", () => {
    expect(claimTypeLabel("medical_advance")).toBe("Medical advance");
    expect(claimStageLabel("under_review")).toBe("Under review");
    expect(claimStatusTone("draft")).toContain("amber");
  });
});
