import OpenAI from "openai";
import type {
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionMessageParam,
  ChatCompletionToolMessageParam,
} from "openai/resources/chat/completions";
import { getAssistantEnv } from "@/lib/env";
import { formatCurrency } from "@/lib/utils/format";
import { getSessionEpfDataProvider } from "@/services/epf-data-provider";
import { lastUserMessage, planFallbackTurn } from "./intent-router";
import { isAffirmative, isNegative } from "./sensitive";
import { buildSystemPrompt } from "./system-prompt";
import { executeAssistantTool } from "./tool-executor";
import { assistantTools } from "./tools";
import type {
  AssistantChatRequest,
  AssistantChatResponse,
  ClientAction,
  PendingConfirmation,
} from "./types";

const MAX_TOOL_LOOPS = 6;

function supportsSamplingParams(model: string) {
  return !/^(gpt-5|o[1-9]|codex)/i.test(model);
}

function shouldUseFallbackForOpenAIError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }
  const maybeError = error as { status?: number; code?: string; type?: string };
  return (
    maybeError.status === 429 ||
    maybeError.code === "insufficient_quota" ||
    maybeError.code === "rate_limit_exceeded" ||
    maybeError.type === "insufficient_quota"
  );
}

function ownerLabel(owner: string | undefined) {
  return owner ? owner.toUpperCase() : "EPFO";
}

function mergeActions(existing: ClientAction[], incoming: ClientAction[]) {
  const seen = new Set(existing.map((action) => JSON.stringify(action)));
  const merged = [...existing];
  for (const action of incoming) {
    const key = JSON.stringify(action);
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(action);
    }
  }
  return merged;
}

function summarizeToolResult(name: string, result: Awaited<ReturnType<typeof executeAssistantTool>>) {
  if (result.pendingConfirmation) {
    return result.pendingConfirmation.summary;
  }
  if (!result.ok) {
    const error = (result.data as { error?: string } | undefined)?.error;
    return error || "The requested action could not be completed.";
  }

  if (name === "get_member_summary") {
    const summary = result.data as {
      name: string;
      uan: string;
      totalBalance: number;
      recentContribution: number;
      recentContributionMonth: string;
      accountHealth?: { score?: number };
    };
    return `${summary.name} (UAN ${summary.uan}) has ${formatCurrency(summary.totalBalance)}. Latest contribution ${formatCurrency(summary.recentContribution)} for ${summary.recentContributionMonth}.${summary.accountHealth?.score ? ` Account health is ${summary.accountHealth.score}%.` : ""}`;
  }

  if (name === "get_account_insights") {
    const insights = result.data as {
      focus: "general" | "passbook" | "claims" | "profile" | "support";
      readiness?: { score?: number; claimReadinessPercent?: number; proactiveAlerts?: string[] };
      contributionTrend?: {
        latestMonth?: string;
        latestTotal?: number;
        previousMonth?: string;
        previousTotal?: number;
        deltaPercent?: number;
      };
      claims?: { draft?: number; active?: number; completed?: number; rejected?: number };
      tickets?: { open?: number; in_progress?: number; resolved?: number };
      topRisks?: Array<{ title?: string; severity?: string; owner?: string; nextStep?: string }>;
      recommendedActions?: Array<{ title?: string; reason?: string; href?: string }>;
    };
    const readiness = insights.readiness;
    const trend = insights.contributionTrend;
    const riskLines = (insights.topRisks ?? [])
      .slice(0, 2)
      .map(
        (risk) =>
          `- ${risk.title ?? "Risk"} (${risk.severity ?? "unknown"}, owner ${ownerLabel(risk.owner)}): ${risk.nextStep ?? "Review required."}`,
      );
    const actions = (insights.recommendedActions ?? [])
      .slice(0, 2)
      .map(
        (action) =>
          `- ${action.title ?? "Action"}: ${action.reason ?? "Review this item."}${action.href ? ` (${action.href})` : ""}`,
      );
    return [
      `EPF analysis (${insights.focus}) — readiness ${readiness?.score ?? 0}% and claim readiness ${readiness?.claimReadinessPercent ?? 0}%.`,
      trend?.latestMonth
        ? `Latest contribution snapshot: ${trend.latestMonth} is ${formatCurrency(trend.latestTotal ?? 0)}${trend.previousMonth ? ` vs ${trend.previousMonth} ${formatCurrency(trend.previousTotal ?? 0)} (${trend.deltaPercent ?? 0}% change)` : ""}.`
        : "",
      insights.claims
        ? `Claims: ${insights.claims.active ?? 0} active, ${insights.claims.draft ?? 0} draft, ${insights.claims.rejected ?? 0} rejected.`
        : "",
      insights.tickets
        ? `Support: ${insights.tickets.open ?? 0} open, ${insights.tickets.in_progress ?? 0} in progress.`
        : "",
      riskLines.length ? `Top risks:\n${riskLines.join("\n")}` : "",
      actions.length ? `Recommended next steps:\n${actions.join("\n")}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (name === "navigate_ui") {
    const action = result.data as { href: string; reason?: string };
    return `Opened ${action.href}${action.reason ? `: ${action.reason}` : ""}`;
  }

  if (name === "submit_medical_advance_claim") {
    const claim = result.data as { referenceNumber?: string; status?: string };
    return `Claim ${claim.referenceNumber ?? ""} is now ${claim.status ?? "submitted"}.`;
  }

  if (name === "create_support_ticket") {
    const ticket = result.data as { referenceNumber?: string; subject?: string };
    return `Support ticket ${ticket.referenceNumber ?? ""} created for "${ticket.subject ?? ""}".`;
  }

  if (name === "save_medical_advance_draft") {
    const claim = result.data as { referenceNumber?: string; amount?: number; id?: string };
    return `Saved draft ${claim.referenceNumber ?? claim.id} for ${formatCurrency(claim.amount ?? 0)}. Ask the member to confirm if they want to submit.`;
  }

  if (name === "get_claims") {
    const claims = result.data as Array<{
      referenceNumber: string;
      status: string;
      currentStage: string;
      currentOwner?: string;
      userAction?: string;
    }>;
    if (!claims.length) {
      return "No claims are currently available in your account.";
    }
    const lines = claims.slice(0, 4).map((claim) => {
      return `- ${claim.referenceNumber}: ${claim.status} (${claim.currentStage.replaceAll("_", " ")}), owner ${ownerLabel(claim.currentOwner)}${claim.userAction ? `, your action: ${claim.userAction}` : ""}.`;
    });
    return `Here is your latest claim status summary:\n${lines.join("\n")}`;
  }

  if (name === "get_claim_details") {
    const claim = result.data as {
      referenceNumber: string;
      status: string;
      currentStage: string;
      currentOwner?: string;
      userAction?: string;
      expectedNextStep?: string;
    };
    return `${claim.referenceNumber} is ${claim.status} at ${claim.currentStage.replaceAll("_", " ")}. Owner: ${ownerLabel(claim.currentOwner)}. Your action: ${claim.userAction ?? "None required"}. Next step: ${claim.expectedNextStep ?? "Processing update pending"}.`;
  }

  if (name === "get_profile") {
    const profile = result.data as {
      name: string;
      uan: string;
      bank?: { status?: string; readyForClaims?: boolean };
      kyc?: { aadhaarStatus?: string; panStatus?: string };
      employment?: Array<{ employerName?: string; status?: string; transferStatus?: string }>;
    };
    const currentEmployer =
      profile.employment?.find((item) => item.status === "current")?.employerName ??
      "current establishment";
    const transferAttention = profile.employment?.some(
      (item) => item.status === "past" && item.transferStatus !== "completed",
    );
    return `${profile.name} (UAN ${profile.uan}) profile is loaded. Aadhaar: ${profile.kyc?.aadhaarStatus ?? "unknown"}, PAN: ${profile.kyc?.panStatus ?? "unknown"}, bank: ${profile.bank?.status ?? "unknown"}${profile.bank?.readyForClaims === false ? " (not claim-ready yet)" : ""}. Current employer: ${currentEmployer}.${transferAttention ? " Previous account transfer still needs attention." : ""}`;
  }

  if (name === "get_passbook") {
    const entries = result.data as Array<{
      wageMonth: string;
      employeeContribution: number;
      employerContribution: number;
      interestCredit: number;
      monthlyTotal: number;
      note?: string;
    }>;
    if (!entries.length) {
      return "No passbook entries were found for this filter.";
    }
    const latest = entries.at(-1);
    if (!latest) {
      return "Passbook data is available.";
    }
    return `Passbook is loaded. Latest month ${latest.wageMonth}: total ${formatCurrency(latest.monthlyTotal)} (employee ${formatCurrency(latest.employeeContribution)}, employer ${formatCurrency(latest.employerContribution)}, interest ${formatCurrency(latest.interestCredit)}).${latest.note ? ` Note: ${latest.note}` : ""}`;
  }

  if (name === "get_support_tickets") {
    const tickets = result.data as Array<{
      referenceNumber: string;
      status: string;
      subject: string;
      currentOwner?: string;
      nextExpectedAction?: string;
    }>;
    if (!tickets.length) {
      return "You have no support cases right now.";
    }
    const lines = tickets.slice(0, 4).map((ticket) => {
      return `- ${ticket.referenceNumber}: ${ticket.status} (${ticket.subject}) · owner ${ownerLabel(ticket.currentOwner)}${ticket.nextExpectedAction ? ` · next: ${ticket.nextExpectedAction}` : ""}.`;
    });
    return `Here are your current support cases:\n${lines.join("\n")}`;
  }

  if (name === "search_epf_knowledge") {
    const data = result.data as {
      query?: string;
      articles?: Array<{ title?: string; body?: string }>;
    };
    if (!data.articles?.length) {
      return "I could not find a matching guidance article right now.";
    }
    const top = data.articles
      .slice(0, 3)
      .map((article) => `- **${article.title ?? "Guidance"}**: ${(article.body ?? "").slice(0, 160)}...`);
    return `Here are the most relevant guidance notes${data.query ? ` for "${data.query}"` : ""}:\n${top.join("\n")}`;
  }

  return "I completed the requested lookup.";
}

async function executeToolList(
  tools: Array<{ name: string; args: Record<string, unknown> }>,
) {
  const clientActions: ClientAction[] = [];
  let pendingConfirmation: PendingConfirmation | undefined;
  const notes: string[] = [];
  let lastData: unknown;

  for (const tool of tools) {
    const result = await executeAssistantTool(tool.name, tool.args, {
      forceConfirm: tool.args.confirmed === true,
    });
    clientActions.push(...result.clientActions);
    notes.push(summarizeToolResult(tool.name, result));
    lastData = result.data;
    if (result.pendingConfirmation) {
      pendingConfirmation = result.pendingConfirmation;
    }
  }

  return { clientActions, pendingConfirmation, notes, lastData };
}

async function runOpenAI(
  request: AssistantChatRequest,
  pendingFromClient?: PendingConfirmation,
): Promise<AssistantChatResponse> {
  const env = getAssistantEnv();
  const epfDataProvider = await getSessionEpfDataProvider();
  const summary = await epfDataProvider.getMemberSummary();
  const client = new OpenAI({ apiKey: env.apiKey });
  const openaiMessages: ChatCompletionMessageParam[] = [
    { role: "system", content: buildSystemPrompt({ summary, currentPath: request.currentPath, locale: request.locale }) },
    ...request.messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
  ];

  if (pendingFromClient) {
    openaiMessages.push({
      role: "system",
      content: `A confirmation is waiting: ${pendingFromClient.title}. ${pendingFromClient.summary}. If the member agrees, call ${pendingFromClient.tool} with confirmed=true and args ${JSON.stringify(pendingFromClient.args)}.`,
    });
  }

  let clientActions: ClientAction[] = [];
  let pendingConfirmation: PendingConfirmation | undefined;

  for (let step = 0; step < MAX_TOOL_LOOPS; step += 1) {
    const completionParams: ChatCompletionCreateParamsNonStreaming = {
      model: env.model,
      messages: openaiMessages,
      tools: assistantTools,
      tool_choice: "auto",
    };
    if (supportsSamplingParams(env.model)) {
      completionParams.temperature = 0.2;
    }
    const completion = await client.chat.completions.create(completionParams);

    const choice = completion.choices[0];
    const message = choice?.message;
    if (!message) {
      throw new Error("LLM returned an empty message.");
    }

    openaiMessages.push(message);

    if (!message.tool_calls?.length) {
      const finalMessage = message.content?.trim();
      if (!finalMessage) {
        throw new Error("LLM did not return a response message.");
      }
      return {
        message: finalMessage,
        mode: "openai",
        clientActions,
        pendingConfirmation,
      };
    }

    const toolMessages: ChatCompletionToolMessageParam[] = [];
    for (const toolCall of message.tool_calls) {
      if (toolCall.type !== "function") {
        continue;
      }
      let parsed: Record<string, unknown> = {};
      try {
        parsed = JSON.parse(toolCall.function.arguments || "{}") as Record<string, unknown>;
      } catch {
        parsed = {};
      }
      const result = await executeAssistantTool(toolCall.function.name, parsed);
      clientActions = mergeActions(clientActions, result.clientActions);
      if (result.pendingConfirmation) {
        pendingConfirmation = result.pendingConfirmation;
      }
      toolMessages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(result.pendingConfirmation ?? result.data).slice(0, 8000),
      });
    }
    openaiMessages.push(...toolMessages);
  }

  if (pendingConfirmation?.summary) {
    return {
      message: pendingConfirmation.summary,
      mode: "openai",
      clientActions,
      pendingConfirmation,
    };
  }

  throw new Error("LLM could not complete the request.");
}

async function runFallback(
  request: AssistantChatRequest,
  pendingFromClient?: PendingConfirmation,
): Promise<AssistantChatResponse> {
  const userText = lastUserMessage(request.messages);
  const plan = planFallbackTurn(userText, {
    pendingConfirmation: pendingFromClient,
    currentPath: request.currentPath,
  });

  if (plan.cancelConfirmation) {
    return {
      message: plan.reply ?? "Cancelled. No change was made.",
      mode: "fallback",
      clientActions: [],
    };
  }

  let clientActions: ClientAction[] = [];
  let pendingConfirmation: PendingConfirmation | undefined;
  const notes: string[] = [];
  let lastData: unknown;

  if (plan.tools.length) {
    const executed = await executeToolList(plan.tools);
    clientActions = mergeActions(clientActions, executed.clientActions);
    pendingConfirmation = executed.pendingConfirmation;
    notes.push(...executed.notes);
    lastData = executed.lastData;
  }

  if (plan.submitDraftAfterSave) {
    const draftId =
      lastData && typeof lastData === "object" && "id" in lastData
        ? ((lastData as { id?: unknown }).id ?? "").toString()
        : "";
    if (draftId) {
      const submitGate = await executeToolList([
        {
          name: "submit_medical_advance_claim",
          args: { draftId, confirmed: false },
        },
      ]);
      clientActions = mergeActions(clientActions, submitGate.clientActions);
      pendingConfirmation = submitGate.pendingConfirmation ?? pendingConfirmation;
      notes.push(...submitGate.notes);
    }
  }

  if (pendingConfirmation?.summary) {
    return {
      message: pendingConfirmation.summary,
      mode: "fallback",
      clientActions,
      pendingConfirmation,
    };
  }

  return {
    message:
      plan.reply ?? (notes.join(" ") || "I can help with balance, claims, profile, passbook, or support."),
    mode: "fallback",
    clientActions,
    pendingConfirmation,
  };
}

export async function runAssistantChat(
  request: AssistantChatRequest,
): Promise<AssistantChatResponse> {
  const env = getAssistantEnv();
  const userText = lastUserMessage(request.messages);
  const pendingFromClient = request.pendingConfirmation;

  if (request.confirmedAction) {
    const executed = await executeToolList([
      {
        name: request.confirmedAction.tool,
        args: { ...request.confirmedAction.args, confirmed: true },
      },
    ]);
    return {
      message: executed.notes.join(" ") || "Done.",
      mode: "openai",
      clientActions: executed.clientActions,
    };
  }

  if (pendingFromClient && isNegative(userText)) {
    return {
      message: "Cancelled. No change was made.",
      mode: "openai",
      clientActions: [],
    };
  }

  if (pendingFromClient && isAffirmative(userText)) {
    const executed = await executeToolList([
      {
        name: pendingFromClient.tool,
        args: { ...pendingFromClient.args, confirmed: true },
      },
    ]);
    return {
      message: executed.notes.join(" ") || "Confirmed.",
      mode: "openai",
      clientActions: executed.clientActions,
    };
  }

  if (!env.openaiConfigured) {
    return await runFallback(request, pendingFromClient);
  }

  try {
    return await runOpenAI(request, pendingFromClient);
  } catch (error) {
    if (shouldUseFallbackForOpenAIError(error)) {
      console.warn("OpenAI unavailable; using local fallback routing.", error);
      const fallback = await runFallback(request, pendingFromClient);
      return {
        ...fallback,
        message: `OpenAI is temporarily unavailable, so I switched to local assistant mode. ${fallback.message}`,
      };
    }
    throw error;
  }
}
