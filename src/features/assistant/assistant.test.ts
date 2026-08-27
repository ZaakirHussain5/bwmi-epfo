import { describe, expect, it } from "vitest";
import { planFallbackTurn } from "./intent-router";
import { isAffirmative, isNegative, isSensitiveTool } from "./sensitive";
import { executeAssistantTool } from "./tool-executor";
import { MockEPFDataProvider } from "@/services/epf-data-provider/mock-provider";

describe("voice and intent routing", () => {
  it("routes spoken balance questions to member summary", () => {
    const plan = planFallbackTurn("How much EPF do I have?", {});
    expect(plan.tools[0]?.name).toBe("get_member_summary");
  });

  it("routes spoken navigation to the claims page", () => {
    const plan = planFallbackTurn("Take me to claims", {});
    expect(plan.tools[0]).toMatchObject({
      name: "navigate_ui",
      args: { href: "/claims" },
    });
  });

  it("routes a spoken medical claim request into a draft save that requires later confirmation", () => {
    const plan = planFallbackTurn(
      "Submit a medical advance of 25000 for illness treatment after hospitalization",
      {},
    );
    expect(plan.tools[0]?.name).toBe("save_medical_advance_draft");
    expect(plan.submitDraftAfterSave).toBe(true);
    expect(plan.tools[0]?.args.amount).toBe(25000);
  });

  it("routes account analysis prompts to account insights", () => {
    const plan = planFallbackTurn("Analyze my EPF health and risks", {});
    expect(plan.tools[0]).toMatchObject({
      name: "get_account_insights",
      args: { focus: "general" },
    });
  });

  it("routes new-claim navigation intent to the start claim flow", () => {
    const plan = planFallbackTurn("Open the new claim form", {});
    expect(plan.tools[0]).toMatchObject({
      name: "navigate_ui",
      args: { href: "/claims?start=1" },
    });
  });

  it("blends member context with EPF guidance for generic EPF questions", () => {
    const plan = planFallbackTurn("What are EPF withdrawal rules for me?", {});
    expect(plan.tools[0]?.name).toBe("get_member_summary");
    expect(plan.tools[1]?.name).toBe("search_epf_knowledge");
  });

  it("treats confirm/cancel voice replies as safety gates", () => {
    expect(isAffirmative("confirm")).toBe(true);
    expect(isAffirmative("go ahead")).toBe(true);
    expect(isNegative("cancel")).toBe(true);
    expect(isSensitiveTool("submit_medical_advance_claim")).toBe(true);
    expect(isSensitiveTool("get_claims")).toBe(false);
  });
});

describe("sensitive action safety", () => {
  it("does not submit a claim until confirmed=true", async () => {
    const provider = new MockEPFDataProvider();
    const draft = await provider.saveMedicalAdvanceDraft({
      amount: 18000,
      purpose: "Illness treatment",
      notes: "Needs confirmation",
      claimFormType: "form_31",
      bankVerificationState: "verified",
      selectedEmploymentMemberId: "MHBAN0012345000",
      selectedEmploymentEmployer: "Nidhi Manufacturing Pvt Ltd",
    });

    const blocked = await executeAssistantTool(
      "submit_medical_advance_claim",
      { draftId: draft.id, confirmed: false },
      { provider },
    );
    expect(blocked.pendingConfirmation?.tool).toBe("submit_medical_advance_claim");
    const stillDraft = await provider.getClaimById(draft.id);
    expect(stillDraft.status).toBe("draft");

    const submitted = await executeAssistantTool(
      "submit_medical_advance_claim",
      { draftId: draft.id, confirmed: true },
      { provider },
    );
    expect(submitted.pendingConfirmation).toBeUndefined();
    expect((submitted.data as { status: string }).status).toBe("active");
  });

  it("does not create a support ticket until confirmed=true", async () => {
    const provider = new MockEPFDataProvider();
    const beforeCount = (await provider.getSupportTickets()).length;
    const blocked = await executeAssistantTool(
      "create_support_ticket",
      {
        subject: "Passbook question",
        category: "passbook",
        description: "June looks low",
        confirmed: false,
      },
      { provider },
    );
    expect(blocked.pendingConfirmation?.tool).toBe("create_support_ticket");
    expect((await provider.getSupportTickets()).length).toBe(beforeCount);

    const created = await executeAssistantTool(
      "create_support_ticket",
      {
        subject: "Passbook question",
        category: "passbook",
        description: "June looks low",
        confirmed: true,
      },
      { provider },
    );
    expect((created.data as { status: string }).status).toBe("open");
    expect((await provider.getSupportTickets()).length).toBe(beforeCount + 1);
  });

  it("returns structured account insights for analysis intent", async () => {
    const provider = new MockEPFDataProvider();
    const insights = await executeAssistantTool(
      "get_account_insights",
      { focus: "claims" },
      { provider },
    );
    expect(insights.ok).toBe(true);
    expect((insights.data as { focus?: string }).focus).toBe("claims");
    expect((insights.data as { readiness?: { score?: number } }).readiness?.score).toBeGreaterThan(0);
  });
});
