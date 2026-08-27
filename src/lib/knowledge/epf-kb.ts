export interface KnowledgeArticle {
  id: string;
  title: string;
  tags: string[];
  body: string;
}

export const EPF_KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  {
    id: "kb-disclaimer",
    title: "Guidance disclaimer",
    tags: ["disclaimer", "official", "epfo", "advice"],
    body: "Nidhi is an independent portal experience. Answers here are based on member account data and a curated knowledge base. They are not official EPFO or Government of India advice. Confirm any real-world action on the official EPFO portal.",
  },
  {
    id: "kb-balance",
    title: "Understanding your EPF balance",
    tags: ["balance", "epf", "pf", "uan", "contribution", "employee", "employer", "eps", "interest", "pension"],
    body: "Your EPF balance is the sum of employee contributions, employer contributions, EPS credits, and interest. Ask Nidhi 'How much EPF do I have?' to hear your current totals and latest month contribution trend. The Universal Account Number (UAN) stays the same across jobs.",
  },
  {
    id: "kb-passbook",
    title: "Reading the EPF passbook",
    tags: ["passbook", "month", "contribution", "interest", "anomaly", "june", "missing", "gap", "trend"],
    body: "Each passbook row is one wage month. Employee and employer shares are listed separately. Interest may appear in selected months and can post in a batch. A lower month can be a partial payroll period, such as a job transition. Use Passbook filters or ask Nidhi to explain a specific month and compare it with the previous month.",
  },
  {
    id: "kb-medical-advance",
    title: "Medical advance claims",
    tags: ["claim", "medical", "advance", "hospital", "submit", "draft", "form 31", "withdrawal"],
    body: "You can start a medical advance (Form 31 flow), autosave a draft, review details, then submit with explicit confirmation. Amount should be at least INR 1,000, with a purpose and notes. After submit, the claim appears as active and moves through initial checks.",
  },
  {
    id: "kb-claim-stages",
    title: "Claim status stages",
    tags: ["claim", "status", "timeline", "review", "payment", "track", "rejected", "eligibility", "owner"],
    body: "Claim stages in Nidhi: submitted, initial checks, under review, processing, payment initiated, and completed. 'Under review' means records are being checked and usually no member action is needed. Rejected claims include explainability and next resolution steps. Ask 'Where is my claim?' to hear owner, next action, and stage.",
  },
  {
    id: "kb-profile-kyc",
    title: "Profile, KYC, bank and nominees",
    tags: ["profile", "kyc", "aadhaar", "pan", "bank", "nominee", "verification", "claim readiness"],
    body: "Keep mobile, email, bank, and nominee details current before claims. Aadhaar, PAN, and bank should remain verified. Nominee share should total 100%. If bank or KYC is pending, claim payout can be delayed. You can edit contact details and add nominees on Profile.",
  },
  {
    id: "kb-support",
    title: "Raising a support ticket",
    tags: ["support", "ticket", "help", "complaint", "issue"],
    body: "If something looks wrong, raise a support ticket from Help or by asking Nidhi. Include the page, month, or claim reference. Sensitive ticket creation asks for confirmation first.",
  },
  {
    id: "kb-transfer",
    title: "EPF transfer between employers",
    tags: ["transfer", "previous", "employer", "member id", "service history", "doe", "uan"],
    body: "Transfer moves PF from a previous member ID to the current account. Employment history on Profile shows current and past establishments. Missing Date of Exit or unresolved transfer status can delay settlement and future claims.",
  },
];
