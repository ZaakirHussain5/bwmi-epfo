import { describe, expect, it } from "vitest";
import {
  LOGIN_OTP,
  findSeedMember,
  isValidOtp,
  listAccounts,
  seedMembers,
} from "./seed-members";

describe("seed members", () => {
  it("includes fully and partially activated accounts", () => {
    const accounts = listAccounts();
    expect(accounts.some((account) => account.activation === "fully_activated")).toBe(true);
    expect(accounts.some((account) => account.activation === "partially_activated")).toBe(true);
    expect(accounts.length).toBeGreaterThanOrEqual(4);
  });

  it("keeps KYC and bank complete for fully activated members", () => {
    const fullyActivated = seedMembers.filter((member) => member.activation === "fully_activated");
    expect(fullyActivated.length).toBeGreaterThan(0);
    for (const member of fullyActivated) {
      expect(member.profile.uanStatus).toBe("active");
      expect(member.profile.kyc.aadhaarStatus).toBe("verified");
      expect(member.profile.kyc.panStatus).toBe("verified");
      expect(member.profile.bank.readyForClaims).toBe(true);
    }
  });

  it("keeps at least one incomplete check for partially activated members", () => {
    const partiallyActivated = seedMembers.filter(
      (member) => member.activation === "partially_activated",
    );
    expect(partiallyActivated.length).toBeGreaterThan(0);
    for (const member of partiallyActivated) {
      const incomplete =
        member.profile.uanStatus !== "active" ||
        member.profile.kyc.aadhaarStatus !== "verified" ||
        member.profile.kyc.panStatus !== "verified" ||
        !member.profile.bank.readyForClaims;
      expect(incomplete).toBe(true);
    }
  });

  it("accepts only the configured OTP 123456", () => {
    expect(isValidOtp(LOGIN_OTP)).toBe(true);
    expect(isValidOtp("000000")).toBe(false);
    expect(isValidOtp("12345")).toBe(false);
    expect(isValidOtp("654321")).toBe(false);
  });

  it("looks up members by UAN", () => {
    expect(findSeedMember("uan-xxxx-1234")?.name).toBe("Zaakir Hussain");
    expect(findSeedMember("UAN-XXXX-2345")?.activation).toBe("fully_activated");
    expect(findSeedMember("UNKNOWN")).toBeUndefined();
  });
});
