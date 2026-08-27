import type { ChatTurn, PendingConfirmation } from "./types";

export interface FallbackPlan {
  tools: Array<{ name: string; args: Record<string, unknown> }>;
  reply?: string;
  cancelConfirmation?: boolean;
  submitDraftAfterSave?: boolean;
}

const AMOUNT_PATTERN = /(?:rs\.?|inr|₹)?\s*(\d{4,7})/i;

function extractAmount(text: string) {
  const match = text.match(AMOUNT_PATTERN);
  return match ? Number(match[1]) : undefined;
}

function inferPurpose(text: string) {
  if (/marriage/i.test(text)) {
    return "Marriage";
  }
  if (/education/i.test(text)) {
    return "Education";
  }
  if (/housing|home/i.test(text)) {
    return "Housing";
  }
  if (/unemploy/i.test(text)) {
    return "Unemployment";
  }
  if (/final/i.test(text)) {
    return "Final settlement";
  }
  return "Medical treatment";
}

function inferTicketCategory(text: string) {
  if (/claim/i.test(text)) {
    return "claim";
  }
  if (/passbook|contribution|balance/i.test(text)) {
    return "passbook";
  }
  if (/profile|nominee|kyc|bank/i.test(text)) {
    return "profile";
  }
  if (/uan|account|login/i.test(text)) {
    return "account";
  }
  return "other";
}

function inferInsightFocus(text: string) {
  if (/passbook|contribution|interest|month|wage/i.test(text)) {
    return "passbook";
  }
  if (/claim|rejection|under review|processing|settlement/i.test(text)) {
    return "claims";
  }
  if (/profile|kyc|aadhaar|pan|bank|nominee|uan/i.test(text)) {
    return "profile";
  }
  if (/ticket|support|grievance|complaint|case/i.test(text)) {
    return "support";
  }
  return "general";
}

export function planFallbackTurn(
  userText: string,
  context: { pendingConfirmation?: PendingConfirmation; currentPath?: string },
): FallbackPlan {
  const text = userText.trim();
  const lower = text.toLowerCase();

  if (context.pendingConfirmation) {
    if (/^(no|nope|cancel|don't|do not|stop|never mind|nevermind)\b/i.test(text)) {
      return {
        tools: [],
        cancelConfirmation: true,
        reply: "Cancelled. No change was made.",
      };
    }
    if (
      /^(yes|yep|yeah|yup|confirm|confirmed|go ahead|please submit|submit it|do it|ok|okay|sure|proceed)\b/i.test(
        text,
      )
    ) {
      return {
        tools: [
          {
            name: context.pendingConfirmation.tool,
            args: { ...context.pendingConfirmation.args, confirmed: true },
          },
        ],
      };
    }
  }

  if (/^(hi|hello|hey|namaste|good (morning|afternoon|evening))\b/i.test(text)) {
    return {
      tools: [],
      reply:
        "Hi, I can help with your EPF balance, passbook, claims, support tickets, and account insights. What would you like to check?",
    };
  }

  if (/^(thanks|thank you|thx)\b/i.test(text)) {
    return {
      tools: [],
      reply: "You're welcome. I can also analyze your EPF readiness whenever you want.",
    };
  }

  if (/take me|go to|open|show me|navigate/i.test(lower)) {
    if (/passbook/i.test(lower)) {
      return { tools: [{ name: "navigate_ui", args: { href: "/passbook", reason: "Open passbook." } }] };
    }
    if (/new claim|start (a )?claim|create (a )?claim|file (a )?claim/i.test(lower)) {
      return {
        tools: [{ name: "navigate_ui", args: { href: "/claims?start=1", reason: "Open new claim form." } }],
      };
    }
    if (/claim/i.test(lower)) {
      return { tools: [{ name: "navigate_ui", args: { href: "/claims", reason: "Open claims." } }] };
    }
    if (/profile/i.test(lower)) {
      return { tools: [{ name: "navigate_ui", args: { href: "/profile", reason: "Open profile." } }] };
    }
    if (/service/i.test(lower)) {
      return { tools: [{ name: "navigate_ui", args: { href: "/services", reason: "Open services." } }] };
    }
    if (/raise ticket|new ticket|support form|help desk/i.test(lower)) {
      return {
        tools: [{ name: "navigate_ui", args: { href: "/help#raise-ticket", reason: "Open raise ticket form." } }],
      };
    }
    if (/help|ticket|support/i.test(lower)) {
      return { tools: [{ name: "navigate_ui", args: { href: "/help", reason: "Open help." } }] };
    }
    if (/dashboard|home/i.test(lower)) {
      return { tools: [{ name: "navigate_ui", args: { href: "/dashboard", reason: "Open dashboard." } }] };
    }
  }

  if (/ticket|support|help desk|complaint|issue/i.test(lower) && /raise|create|open|file|submit/i.test(lower)) {
    return {
      tools: [
        {
          name: "create_support_ticket",
          args: {
            subject: text.slice(0, 80),
            category: inferTicketCategory(text),
            description: text,
            confirmed: false,
          },
        },
      ],
    };
  }

  if (/ticket|support request/i.test(lower) && /list|show|my|status/i.test(lower)) {
    return { tools: [{ name: "get_support_tickets", args: {} }] };
  }

  if (/submit|file|raise|start|new|create/.test(lower) && /claim|medical|advance/.test(lower)) {
    const amount = extractAmount(text);
    if (amount) {
      return {
        tools: [
          {
            name: "save_medical_advance_draft",
            args: {
              amount,
              purpose: inferPurpose(text),
              notes: text,
            },
          },
        ],
        submitDraftAfterSave: true,
      };
    }
    return {
      tools: [
        { name: "navigate_ui", args: { href: "/claims?start=1", reason: "Start a new medical claim." } },
      ],
      reply:
        "I can start a medical advance claim now. Share amount, purpose, and a short note, or use the new-claim flow I opened.",
    };
  }

  if (/where.*claim|claim status|track claim|my claim/i.test(lower)) {
    return {
      tools: [
        { name: "get_claims", args: {} },
        { name: "navigate_ui", args: { href: "/claims", reason: "Show claim timeline." } },
      ],
    };
  }

  if (/blocking my claim|why.*under review|what happens next|rejection/i.test(lower)) {
    return {
      tools: [
        { name: "get_claims", args: {} },
        { name: "navigate_ui", args: { href: "/claims", reason: "Review claim ownership and next step." } },
      ],
    };
  }

  if (/how much|balance|uan|do i have/i.test(lower)) {
    return { tools: [{ name: "get_member_summary", args: {} }] };
  }

  if (/passbook|contribution|june|interest/i.test(lower)) {
    return {
      tools: [
        { name: "get_passbook", args: { query: /june/i.test(lower) ? "2026-06" : undefined } },
        { name: "search_epf_knowledge", args: { query: text } },
      ],
    };
  }

  if (/profile|nominee|kyc|bank|email|mobile/i.test(lower)) {
    return { tools: [{ name: "get_profile", args: {} }] };
  }

  if (/ready for (a )?claim|account health|check readiness/i.test(lower)) {
    return {
      tools: [
        { name: "get_account_insights", args: { focus: "profile" } },
        { name: "navigate_ui", args: { href: "/profile", reason: "Review account readiness checks." } },
      ],
    };
  }

  if (
    /analysis|analyse|analyz|insight|health score|trend|risk|anomal|diagnos|readiness report|breakdown/i.test(
      lower,
    )
  ) {
    return {
      tools: [{ name: "get_account_insights", args: { focus: inferInsightFocus(lower) } }],
    };
  }

  if (/what can i do|services|transfer/i.test(lower)) {
    return {
      tools: [
        { name: "search_epf_knowledge", args: { query: text } },
        { name: "navigate_ui", args: { href: "/services", reason: "Browse available services." } },
      ],
    };
  }

  if (/epf|pf|uan|eps|interest|withdraw|pension|kyc|nominee|contribution|form 31|eligibil/i.test(lower)) {
    return {
      tools: [
        { name: "get_member_summary", args: {} },
        { name: "search_epf_knowledge", args: { query: text } },
      ],
    };
  }

  return {
    tools: [
      { name: "get_member_summary", args: {} },
      { name: "search_epf_knowledge", args: { query: text } },
    ],
  };
}

export function lastUserMessage(messages: ChatTurn[]) {
  return [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
}
