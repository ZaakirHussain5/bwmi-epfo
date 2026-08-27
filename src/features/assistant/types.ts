import type { SupportTicketCategory } from "@/types/epf";

export const ASSISTANT_ROUTES = [
  "/dashboard",
  "/passbook",
  "/claims",
  "/claims?start=1",
  "/profile",
  "/services",
  "/help",
  "/help#raise-ticket",
] as const;

export type AssistantRoute = (typeof ASSISTANT_ROUTES)[number];

export type ChatRole = "user" | "assistant";

export interface ChatTurn {
  role: ChatRole;
  content: string;
}

export type AssistantToolName =
  | "get_member_summary"
  | "get_account_insights"
  | "get_passbook"
  | "get_claims"
  | "get_claim_details"
  | "get_profile"
  | "save_medical_advance_draft"
  | "submit_medical_advance_claim"
  | "create_support_ticket"
  | "get_support_tickets"
  | "search_epf_knowledge"
  | "navigate_ui";

export const SENSITIVE_TOOLS: AssistantToolName[] = [
  "submit_medical_advance_claim",
  "create_support_ticket",
];

export interface NavigateAction {
  type: "navigate";
  href: AssistantRoute;
  reason?: string;
}

export interface RefreshAction {
  type: "refresh";
  entity: "claims" | "tickets" | "profile";
}

export interface RunScriptAction {
  type: "run_script";
  script: string;
  description?: string;
}

export type ClientAction = NavigateAction | RefreshAction | RunScriptAction;

export interface PendingConfirmation {
  tool: Extract<AssistantToolName, "submit_medical_advance_claim" | "create_support_ticket">;
  args: Record<string, unknown>;
  title: string;
  summary: string;
}

export interface ToolExecutionResult {
  ok: boolean;
  data: unknown;
  clientActions: ClientAction[];
  pendingConfirmation?: PendingConfirmation;
}

export interface ConfirmedAction {
  tool: PendingConfirmation["tool"];
  args: Record<string, unknown>;
}

export interface AssistantChatRequest {
  messages: ChatTurn[];
  currentPath?: string;
  confirmedAction?: ConfirmedAction;
  pendingConfirmation?: PendingConfirmation;
  locale?: "en" | "hi" | "kn";
}

export interface AssistantChatResponse {
  message: string;
  mode: "openai" | "fallback";
  clientActions: ClientAction[];
  pendingConfirmation?: PendingConfirmation;
}

export const TICKET_CATEGORIES: SupportTicketCategory[] = [
  "claim",
  "passbook",
  "profile",
  "account",
  "other",
];
