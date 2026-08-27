import type { ChatCompletionTool } from "openai/resources/chat/completions";

export const assistantTools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_member_summary",
      description:
        "Get the logged-in member's EPF balance, UAN, contribution totals, and pending actions.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "get_account_insights",
      description:
        "Analyze the logged-in member account for readiness, anomalies, claim/ticket risk, and contribution trends.",
      parameters: {
        type: "object",
        properties: {
          focus: {
            type: "string",
            enum: ["general", "passbook", "claims", "profile", "support"],
            description: "Optional focus area for the analysis.",
          },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_passbook",
      description: "Get passbook entries. Optionally filter by calendar year or search query.",
      parameters: {
        type: "object",
        properties: {
          year: { type: "number", description: "Calendar year such as 2026" },
          query: { type: "string", description: "Month or note search, e.g. 2026-06" },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_claims",
      description: "List draft, active, and completed claims for the logged-in member.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "get_claim_details",
      description: "Get one claim by id or reference number.",
      parameters: {
        type: "object",
        properties: {
          claimId: { type: "string" },
        },
        required: ["claimId"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_profile",
      description: "Get profile, KYC, bank, employment, and nominee details for the logged-in member.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "save_medical_advance_draft",
      description:
        "Create or update a medical advance claim draft. Amount must be at least 1000 INR.",
      parameters: {
        type: "object",
        properties: {
          draftId: { type: "string" },
          amount: { type: "number" },
          purpose: { type: "string" },
          notes: { type: "string" },
          hospitalizationDate: { type: "string", description: "ISO date YYYY-MM-DD" },
        },
        required: ["amount", "purpose", "notes"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "submit_medical_advance_claim",
      description:
        "Submit a draft medical advance claim. Do not set confirmed=true until the member has clearly agreed.",
      parameters: {
        type: "object",
        properties: {
          draftId: { type: "string" },
          confirmed: { type: "boolean" },
        },
        required: ["draftId"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_support_ticket",
      description:
        "Raise a support ticket. Do not set confirmed=true until the member has clearly agreed.",
      parameters: {
        type: "object",
        properties: {
          subject: { type: "string" },
          category: {
            type: "string",
            enum: ["claim", "passbook", "profile", "account", "other"],
          },
          description: { type: "string" },
          confirmed: { type: "boolean" },
        },
        required: ["subject", "category", "description"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_support_tickets",
      description: "List support tickets for the logged-in member.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "search_epf_knowledge",
      description: "Search the curated EPF knowledge base and return relevant guidance.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string" },
        },
        required: ["query"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "navigate_ui",
      description: "Navigate the member to a portal page so they can see or complete the task.",
      parameters: {
        type: "object",
        properties: {
          href: {
            type: "string",
            enum: [
              "/dashboard",
              "/passbook",
              "/claims",
              "/claims?start=1",
              "/profile",
              "/services",
              "/help",
              "/help#raise-ticket",
            ],
          },
          reason: { type: "string" },
        },
        required: ["href"],
        additionalProperties: false,
      },
    },
  },
];
