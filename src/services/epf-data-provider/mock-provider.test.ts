import { describe, expect, it } from "vitest";
import { MockEPFDataProvider } from "./mock-provider";

describe("MockEPFDataProvider", () => {
  it("builds a member summary from passbook totals", async () => {
    const provider = new MockEPFDataProvider();
    const summary = await provider.getMemberSummary();

    expect(summary.uan).toBe("UAN-XXXX-1234");
    expect(summary.totalBalance).toBeGreaterThan(0);
    expect(summary.employeeContributionTotal).toBeGreaterThan(0);
  });

  it("loads a fully activated seed member by UAN", async () => {
    const provider = new MockEPFDataProvider("UAN-XXXX-2345");
    const profile = await provider.getProfile();
    const summary = await provider.getMemberSummary();

    expect(profile.name).toBe("Priya Sharma");
    expect(profile.bank.readyForClaims).toBe(true);
    expect(profile.kyc.aadhaarStatus).toBe("verified");
    expect(summary.uan).toBe("UAN-XXXX-2345");
  });

  it("saves a medical advance draft and submits it into the active timeline", async () => {
    const provider = new MockEPFDataProvider();
    const draft = await provider.saveMedicalAdvanceDraft({
      amount: 25000,
      purpose: "Illness treatment",
      notes: "Hospital stay",
      hospitalizationDate: "2026-08-01",
      claimFormType: "form_31",
      bankVerificationState: "verified",
      selectedEmploymentMemberId: "MHBAN0012345000",
      selectedEmploymentEmployer: "Nidhi Manufacturing Pvt Ltd",
    });

    expect(draft.status).toBe("draft");
    expect(draft.type).toBe("medical_advance");

    const submitted = await provider.submitMedicalAdvanceClaim(draft.id);
    expect(submitted.status).toBe("active");
    expect(submitted.currentStage).toBe("initial_checks");
    expect(submitted.timeline.some((stage) => stage.state === "current")).toBe(true);

    const claims = await provider.getClaims();
    expect(claims.some((claim) => claim.id === submitted.id && claim.status === "active")).toBe(true);
  });

  it("creates a support ticket for the signed-in member", async () => {
    const provider = new MockEPFDataProvider();
    const beforeCount = (await provider.getSupportTickets()).length;
    const ticket = await provider.createSupportTicket({
      subject: "June contribution question",
      category: "passbook",
      description: "Please explain the partial June entry.",
    });

    const tickets = await provider.getSupportTickets();
    expect(ticket.status).toBe("open");
    expect(tickets[0]?.id).toBe(ticket.id);
    expect(tickets.length).toBe(beforeCount + 1);
  });
});
