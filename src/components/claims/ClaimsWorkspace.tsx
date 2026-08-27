"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AskNidhiButton } from "@/components/assistant/AskNidhiButton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ClaimsOverview } from "@/components/claims/ClaimsOverview";
import { interpolate } from "@/i18n/config";
import { useLocale } from "@/i18n/useLocale";
import { NIDHI_REFRESH_EVENT } from "@/lib/events";
import { formatCurrency, formatDateTime } from "@/lib/utils/format";
import type {
  AccountHealthReport,
  Claim,
  ClaimFormType,
  MedicalClaimDraftInput,
  MemberProfile,
  StatusCategory,
} from "@/types/epf";

interface ClaimsWorkspaceProps {
  initialClaims: Claim[];
  initialProfile: MemberProfile;
  initialHealth?: AccountHealthReport;
  autoStart?: boolean;
  resumeDraftId?: string;
}

type FlowStep = "type" | "employer" | "details" | "review" | "done";
type SaveState = "idle" | "saving" | "error";

const flowStepOrder: FlowStep[] = ["type", "employer", "details", "review", "done"];
const flowStepperKeys: Array<Exclude<FlowStep, "done">> = ["type", "employer", "details", "review"];

const claimFormTypeValues: ClaimFormType[] = ["form_19", "form_10d", "form_31", "form_16c"];

const verificationValues: Array<MedicalClaimDraftInput["bankVerificationState"]> = [
  "verified",
  "pending",
  "needs_attention",
];

const claimPurposeOptions = [
  "Medical treatment",
  "Marriage",
  "Education",
  "Housing",
  "Unemployment",
  "Final settlement",
  "Other eligible purpose",
] as const;

function buildTicketHref(subject: string, description: string) {
  const params = new URLSearchParams({
    subject,
    description,
    category: "claim",
  });
  return `/help?${params.toString()}#raise-ticket`;
}

function buildDefaultForm(profile: ClaimsWorkspaceProps["initialProfile"]): MedicalClaimDraftInput {
  const currentEmployment = profile.employment.find((record) => record.status === "current");
  const fallbackEmployment = currentEmployment ?? profile.employment[0];

  return {
    amount: 0,
    purpose: "",
    notes: "",
    claimFormType: "form_31",
    bankVerificationState: profile.bank.status,
    selectedEmploymentMemberId: fallbackEmployment?.memberId ?? "",
    selectedEmploymentEmployer: fallbackEmployment?.employerName ?? "",
  };
}

function formFromDraft(
  claim: Claim,
  profile: ClaimsWorkspaceProps["initialProfile"],
): MedicalClaimDraftInput {
  const fallback = buildDefaultForm(profile);
  return {
    draftId: claim.id,
    amount: claim.amount,
    purpose: claim.context?.purpose ?? "",
    notes: claim.context?.notes ?? "",
    hospitalizationDate: claim.context?.hospitalizationDate,
    claimFormType: claim.context?.claimFormType ?? fallback.claimFormType,
    bankVerificationState: claim.context?.bankVerificationState ?? fallback.bankVerificationState,
    selectedEmploymentMemberId:
      claim.context?.selectedEmploymentMemberId ?? fallback.selectedEmploymentMemberId,
    selectedEmploymentEmployer:
      claim.context?.selectedEmploymentEmployer ?? fallback.selectedEmploymentEmployer,
  };
}

export function ClaimsWorkspace({
  initialClaims,
  initialProfile,
  initialHealth,
  autoStart = false,
  resumeDraftId,
}: ClaimsWorkspaceProps) {
  const { locale, t } = useLocale();
  const flowStepperSteps = flowStepperKeys.map((key) => ({
    key,
    label: t.claims.steps[key].label,
    description: t.claims.steps[key].description,
  }));
  const claimFormTypeOptions = claimFormTypeValues.map((value) => ({
    value,
    label: t.claims.forms[value],
  }));
  const verificationOptions = verificationValues.map((value) => ({
    value,
    label: t.claims.bankState[value],
  }));
  const defaultForm = useMemo(() => buildDefaultForm(initialProfile), [initialProfile]);
  const resumeDraft = resumeDraftId
    ? initialClaims.find((claim) => claim.id === resumeDraftId)
    : undefined;
  const [claims, setClaims] = useState(initialClaims);
  const [isModalOpen, setIsModalOpen] = useState(autoStart || Boolean(resumeDraft));
  const [flowStep, setFlowStep] = useState<FlowStep>(resumeDraft ? "details" : "type");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [draftId, setDraftId] = useState<string | undefined>(resumeDraft?.id);
  const [form, setForm] = useState<MedicalClaimDraftInput>(
    resumeDraft ? formFromDraft(resumeDraft, initialProfile) : defaultForm,
  );
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankValidationMessage, setBankValidationMessage] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastAutoSavedAt, setLastAutoSavedAt] = useState<string | undefined>();

  const draftClaims = useMemo(
    () => claims.filter((claim) => claim.status === "draft" && claim.type === "medical_advance"),
    [claims],
  );
  const progressPercent = (() => {
    if (flowStep === "done") {
      return 100;
    }
    const activeIndex = flowStepperSteps.findIndex((step) => step.key === flowStep);
    return Math.round(((activeIndex + 1) / flowStepperSteps.length) * 100);
  })();

  const purposeSelected = form.purpose.trim().length > 0;

  const readinessChecks = useMemo<
    Array<{
      id: string;
      label: string;
      ok: boolean;
      detail: string;
      category: StatusCategory;
    }>
  >(
    () => [
      {
        id: "readiness-uan",
        label: t.claims.readinessItems.uan.label,
        ok: initialProfile.uanStatus === "active",
        detail: t.claims.readinessItems.uan.detail,
        category: initialProfile.uanStatus === "active" ? "resolved" : "action_required",
      },
      {
        id: "readiness-aadhaar",
        label: t.claims.readinessItems.aadhaar.label,
        ok: initialProfile.kyc.aadhaarStatus === "verified",
        detail: t.claims.readinessItems.aadhaar.detail,
        category:
          initialProfile.kyc.aadhaarStatus === "verified" ? "resolved" : "action_required",
      },
      {
        id: "readiness-bank",
        label: t.claims.readinessItems.bank.label,
        ok: form.bankVerificationState === "verified" || initialProfile.bank.readyForClaims,
        detail: t.claims.readinessItems.bank.detail,
        category:
          form.bankVerificationState === "verified" || initialProfile.bank.readyForClaims
            ? "resolved"
            : "important",
      },
      {
        id: "readiness-service",
        label: t.claims.readinessItems.service.label,
        ok: initialProfile.careerSummary.totalEligibleServiceMonths >= 24,
        detail: t.claims.readinessItems.service.detail,
        category:
          initialProfile.careerSummary.totalEligibleServiceMonths >= 24
            ? "resolved"
            : "important",
      },
      {
        id: "readiness-employment",
        label: t.claims.readinessItems.employment.label,
        ok: initialProfile.employment.every(
          (record) => record.serviceHistoryStatus === "complete" || record.status === "current",
        ),
        detail: t.claims.readinessItems.employment.detail,
        category:
          initialProfile.employment.every(
            (record) => record.serviceHistoryStatus === "complete" || record.status === "current",
          )
            ? "resolved"
            : "important",
      },
    ],
    [form.bankVerificationState, initialProfile, t.claims.readinessItems],
  );
  const blockingReadiness = readinessChecks.filter((check) => check.category === "action_required");
  const warningReadiness = readinessChecks.filter((check) => check.category === "important");
  const canMovePastEligibility = purposeSelected && blockingReadiness.length === 0;

  const refreshClaims = useCallback(async () => {
    const response = await fetch("/api/claims", { method: "GET" });
    const data = (await response.json()) as Claim[];
    setClaims(data);
  }, [setClaims]);

  useEffect(() => {
    const onRefresh = (event: Event) => {
      const entity = (event as CustomEvent<{ entity?: string }>).detail?.entity;
      if (entity === "claims") {
        void refreshClaims();
      }
    };
    window.addEventListener(NIDHI_REFRESH_EVENT, onRefresh);
    return () => window.removeEventListener(NIDHI_REFRESH_EVENT, onRefresh);
  }, [refreshClaims]);

  const getDraftValidationError = useCallback(() => {
    if (
      !form.amount ||
      form.amount < 1000 ||
      !form.purpose.trim() ||
      !form.notes.trim() ||
      !form.selectedEmploymentMemberId ||
      !form.selectedEmploymentEmployer ||
      form.bankVerificationState !== "verified"
    ) {
      return t.claims.detailsHint;
    }
    return "";
  }, [form, t.claims.detailsHint]);

  const saveDraft = useCallback(async (moveToReview = false, silent = false) => {
    const validationError = getDraftValidationError();
    if (validationError) {
      if (!silent) {
        setErrorMessage(validationError);
      }
      return;
    }

    setErrorMessage("");
    setSaveState("saving");
    try {
      const response = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_draft",
          data: { ...form, draftId },
        }),
      });
      const claim = (await response.json()) as Claim;
      setDraftId(claim.id);
      await refreshClaims();
      setSaveState("idle");
      setHasUnsavedChanges(false);
      setLastAutoSavedAt(new Date().toISOString());
      if (moveToReview) {
        setFlowStep("review");
      }
    } catch {
      setSaveState("error");
      setErrorMessage(t.claims.saveFailed);
    }
  }, [
    draftId,
    form,
    getDraftValidationError,
    refreshClaims,
    setDraftId,
    setErrorMessage,
    setFlowStep,
    setHasUnsavedChanges,
    setLastAutoSavedAt,
    setSaveState,
    t.claims.saveFailed,
  ]);

  const submitClaim = async () => {
    if (!draftId || !confirmed) {
      setErrorMessage(t.claims.confirmRequired);
      return;
    }
    setSaveState("saving");
    setErrorMessage("");
    try {
      await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit_claim",
          draftId,
        }),
      });
      await refreshClaims();
      setFlowStep("done");
      setConfirmed(false);
      setHasUnsavedChanges(false);
      setDraftId(undefined);
      setForm(defaultForm);
      setSaveState("idle");
    } catch {
      setSaveState("error");
      setErrorMessage(t.claims.submitFailed);
    }
  };

  const continueDraft = (claim: Claim) => {
    setDraftId(claim.id);
    setForm(formFromDraft(claim, initialProfile));
    setHasUnsavedChanges(false);
    setFlowStep("details");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saveState === "saving") {
      return;
    }
    if (hasUnsavedChanges) {
      const closeConfirmed = window.confirm(
        t.claims.unsaved,
      );
      if (!closeConfirmed) {
        return;
      }
    }
    setIsModalOpen(false);
  };

  const openNewClaimModal = () => {
    setErrorMessage("");
    setConfirmed(false);
    setFlowStep("type");
    setDraftId(undefined);
    setForm(buildDefaultForm(initialProfile));
    setHasUnsavedChanges(false);
    setBankAccountNumber("");
    setBankValidationMessage("");
    setLastAutoSavedAt(undefined);
    setIsModalOpen(true);
  };

  const selectEmployment = (memberId: string) => {
    const selectedEmployment = initialProfile.employment.find((record) => record.memberId === memberId);
    if (!selectedEmployment) {
      return;
    }
    setForm((current) => ({
      ...current,
      selectedEmploymentMemberId: selectedEmployment.memberId,
      selectedEmploymentEmployer: selectedEmployment.employerName,
    }));
    setHasUnsavedChanges(true);
  };

  const validateBankAccount = () => {
    const normalizedInput = bankAccountNumber.replace(/\D/g, "");
    if (normalizedInput.length < 9 || normalizedInput.length > 18) {
      setForm((current) => ({ ...current, bankVerificationState: "needs_attention" }));
      setBankValidationMessage(t.claims.invalidBank);
      setHasUnsavedChanges(true);
      return;
    }

    const expectedSuffix = initialProfile.bank.accountMasked.replace(/\D/g, "").slice(-4);
    const enteredSuffix = normalizedInput.slice(-4);

    if (expectedSuffix && enteredSuffix === expectedSuffix) {
      setForm((current) => ({ ...current, bankVerificationState: "verified" }));
      setBankValidationMessage(t.claims.bankVerified);
      setHasUnsavedChanges(true);
      return;
    }

    setForm((current) => ({ ...current, bankVerificationState: "pending" }));
    setBankValidationMessage(
      t.claims.bankMismatch,
    );
    setHasUnsavedChanges(true);
  };

  useEffect(() => {
    if (!isModalOpen || flowStep !== "details" || !hasUnsavedChanges || saveState === "saving") {
      return;
    }
    const validationError = getDraftValidationError();
    if (validationError) {
      return;
    }
    const timer = window.setTimeout(() => {
      void saveDraft(false, true);
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [
    flowStep,
    form,
    getDraftValidationError,
    hasUnsavedChanges,
    isModalOpen,
    saveDraft,
    saveState,
  ]);

  const reviewWarnings = useMemo(() => {
    const warnings: string[] = [];
    if (form.notes.trim().length < 16) {
      warnings.push(t.claims.warnNotes);
    }
    if (form.amount > 150000) {
      warnings.push(t.claims.warnAmount);
    }
    if (!initialProfile.bank.readyForClaims && form.bankVerificationState !== "verified") {
      warnings.push(t.claims.warnBank);
    }
    if (
      initialProfile.employment.some(
        (record) => record.status === "past" && record.transferStatus !== "completed",
      )
    ) {
      warnings.push(t.claims.warnTransfer);
    }
    return warnings;
  }, [form.amount, form.bankVerificationState, form.notes, initialProfile, t.claims]);

  return (
    <section className="space-y-4">
      <ClaimsOverview claims={claims} />

      <section className="nidhi-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold">{t.claims.newTitle}</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              {t.claims.newSubtitle}
            </p>
            {initialHealth ? (
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {interpolate(t.claims.readiness, { percent: initialHealth.claimReadinessPercent })}
              </p>
            ) : null}
          </div>
          <button type="button" className="nidhi-btn-primary" onClick={openNewClaimModal}>
            {t.claims.newClaim}
          </button>
        </div>

        {draftClaims.length ? (
          <div className="mt-4">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{t.claims.continueDraft}</p>
            <ul className="mt-2 space-y-2">
              {draftClaims.map((claim) => (
                <li
                  key={claim.id}
                  className="flex items-center justify-between rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900/60"
                >
                  <p className="text-sm text-zinc-700 dark:text-zinc-200">
                    {claim.referenceNumber} - {formatCurrency(claim.amount, locale)}
                  </p>
                  <button
                    type="button"
                    className="text-sm font-medium text-teal-700 hover:underline dark:text-teal-400"
                    onClick={() => continueDraft(claim)}
                  >
                    {t.claims.continuePopup}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {isModalOpen ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-3 md:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={t.claims.popupLabel}
        >
          <section className="flex max-h-[94vh] w-full max-w-4xl flex-col rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl dark:border-zinc-700 dark:bg-zinc-950 md:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-lg font-semibold">{t.claims.flowTitle}</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                  {t.claims.flowSubtitle}
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {interpolate(t.claims.progress, { percent: progressPercent })}
                </p>
              </div>
              <button
                type="button"
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900/70"
                onClick={closeModal}
              >
                {t.claims.close}
              </button>
            </div>

            <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
              <ol className="ux4g-stepper overflow-x-auto pb-1">
                {flowStepperSteps.map((step, index) => {
                  const activeIndex = flowStepOrder.indexOf(flowStep);
                  return (
                    <li
                      key={step.key}
                      className={[
                        "ux4g-stepper-step",
                        index < activeIndex ? "ux4g-stepper-done" : "",
                        index === activeIndex ? "ux4g-stepper-completed" : "",
                      ].join(" ")}
                    >
                      <div className="ux4g-stepper-head">
                        <span className="ux4g-stepper-head-icon">{index + 1}</span>
                        <p className="ux4g-stepper-label">{step.label}</p>
                        <p className="ux4g-stepper-description">{step.description}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>

              {flowStep === "type" ? (
                <div className="mt-4 space-y-4">
                  <h5 className="text-base font-semibold">{t.claims.eligibilityTitle}</h5>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">
                    {t.claims.eligibilityQuestion}
                  </p>
                  <div className="grid gap-2 md:grid-cols-2">
                    {claimPurposeOptions.map((purpose) => {
                      const selected = form.purpose === purpose;
                      return (
                        <button
                          key={purpose}
                          type="button"
                          className={[
                            "rounded-xl border px-3 py-2 text-left text-sm",
                            selected
                              ? "border-teal-500 bg-teal-50 text-teal-900 dark:bg-teal-950/30 dark:text-teal-100"
                              : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900/60",
                          ].join(" ")}
                          onClick={() => {
                            setForm((current) => ({ ...current, purpose }));
                            setHasUnsavedChanges(true);
                          }}
                        >
                          {t.claims.purposes[purpose]}
                        </button>
                      );
                    })}
                  </div>
                  <label className="text-sm">
                    <span className="mb-1 block text-zinc-600 dark:text-zinc-300">{t.claims.claimForm}</span>
                    <select
                      value={form.claimFormType}
                      onChange={(event) => {
                        setForm((current) => ({
                          ...current,
                          claimFormType: event.target.value as ClaimFormType,
                        }));
                        setHasUnsavedChanges(true);
                      }}
                      className="nidhi-input"
                    >
                      {claimFormTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-700">
                    <h6 className="font-medium">{t.claims.readinessCheck}</h6>
                    <ul className="mt-2 space-y-2 text-sm">
                      {readinessChecks.map((check) => (
                        <li
                          key={check.id}
                          className="flex items-start justify-between gap-2 rounded-lg bg-zinc-50 p-2 dark:bg-zinc-900/50"
                        >
                          <div>
                            <p className="font-medium">{check.label}</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">{check.detail}</p>
                          </div>
                          <StatusBadge category={check.category} />
                        </li>
                      ))}
                    </ul>
                    <p
                      className={[
                        "mt-3 rounded-lg px-3 py-2 text-sm",
                        blockingReadiness.length === 0 && warningReadiness.length === 0
                          ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200"
                          : "bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-100",
                      ].join(" ")}
                    >
                      {blockingReadiness.length === 0 && warningReadiness.length === 0
                        ? t.claims.readySubmit
                        : blockingReadiness.length + warningReadiness.length === 1
                          ? t.claims.issuesOne
                          : interpolate(t.claims.issuesMany, {
                              count: blockingReadiness.length + warningReadiness.length,
                            })}
                    </p>
                    {blockingReadiness.length + warningReadiness.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <AskNidhiButton
                          prompt={t.claims.promptReadiness}
                          label={t.common.askNidhi}
                          compact
                        />
                        <Link
                          href={buildTicketHref(
                            t.claims.ticketSubject,
                            t.claims.ticketBody,
                          )}
                          className="rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900/60"
                        >
                          {t.common.raiseTicket}
                        </Link>
                      </div>
                    ) : null}
                  </div>
                  <div className="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-900/50">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      {t.common.needHelp}
                    </p>
                    <AskNidhiButton prompt={t.claims.promptEligibility} />
                  </div>
                </div>
              ) : null}

              {flowStep === "employer" ? (
                <div className="mt-4 space-y-3">
                  <h5 className="text-base font-semibold">{t.claims.employerTitle}</h5>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">
                    {t.claims.employerSubtitle}
                  </p>
                  <ul className="space-y-2">
                    {initialProfile.employment.map((record) => {
                      const selected = form.selectedEmploymentMemberId === record.memberId;
                      return (
                        <li key={`${record.memberId}-${record.status}`}>
                          <label
                            className={[
                              "block cursor-pointer rounded-xl border p-3",
                              selected
                                ? "border-teal-500 bg-teal-50 dark:bg-teal-950/30"
                                : "border-zinc-200 dark:border-zinc-700",
                            ].join(" ")}
                          >
                            <div className="flex items-start gap-3">
                              <input
                                type="radio"
                                name="employmentRecord"
                                checked={selected}
                                onChange={() => selectEmployment(record.memberId)}
                                className="mt-1"
                              />
                              <div>
                                <p className="font-medium">{record.employerName}</p>
                                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                                  {t.claims.memberId}: {record.memberId}
                                </p>
                                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                                  {t.claims.epfService}: {record.dojEpf}{" "}
                                  {record.doeEpf
                                    ? record.doeEpf
                                    : t.claims.toPresent}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                  {t.claims.transfer}: {record.transferStatus.replaceAll("_", " ")} ·{" "}
                                  {t.claims.serviceHistory}:{" "}
                                  {record.serviceHistoryStatus.replaceAll("_", " ")}
                                </p>
                              </div>
                            </div>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-900/50">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      {t.common.needHelp}
                    </p>
                    <AskNidhiButton prompt={t.claims.promptEmployment} />
                  </div>
                </div>
              ) : null}

              {flowStep === "details" ? (
                <div className="mt-4 space-y-3">
                  <h5 className="text-base font-semibold">
                    {t.claims.detailsTitle}
                  </h5>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <span className="mb-1 block text-zinc-600 dark:text-zinc-300">{t.claims.bankAccount}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={bankAccountNumber}
                          onChange={(event) => {
                            setBankAccountNumber(event.target.value);
                            setBankValidationMessage("");
                            setForm((current) => ({ ...current, bankVerificationState: "pending" }));
                            setHasUnsavedChanges(true);
                          }}
                          className="nidhi-input"
                          placeholder={t.claims.enterAccount}
                        />
                        <button
                          type="button"
                          className="rounded-lg border border-teal-600 px-3 py-2 text-xs font-medium text-teal-700 dark:text-teal-300"
                          onClick={validateBankAccount}
                        >
                          {t.claims.validate}
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {t.claims.bankHint}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {interpolate(t.claims.profileAccountEnding, {
                          masked: initialProfile.bank.accountMasked,
                        })}
                      </p>
                      {bankValidationMessage ? (
                        <p
                          className={[
                            "mt-1 text-xs",
                            form.bankVerificationState === "verified"
                              ? "text-emerald-700 dark:text-emerald-300"
                              : "text-amber-700 dark:text-amber-300",
                          ].join(" ")}
                        >
                          {bankValidationMessage}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {t.claims.verificationStatus}{" "}
                        {verificationOptions
                          .find((option) => option.value === form.bankVerificationState)
                          ?.label.toLowerCase()}
                      </p>
                    </div>
                    <label className="text-sm">
                      <span className="mb-1 block text-zinc-600 dark:text-zinc-300">{t.claims.amountInr}</span>
                      <input
                        type="number"
                        min={1000}
                        value={form.amount || ""}
                        onChange={(event) => {
                          setForm((current) => ({
                            ...current,
                            amount: Number(event.target.value || 0),
                          }));
                          setHasUnsavedChanges(true);
                        }}
                        className="nidhi-input"
                      />
                    </label>
                  </div>
                  <label className="text-sm block">
                    <span className="mb-1 block text-zinc-600 dark:text-zinc-300">{t.claims.reason}</span>
                    <select
                      value={form.purpose}
                      onChange={(event) => {
                        setForm((current) => ({
                          ...current,
                          purpose: event.target.value,
                        }));
                        setHasUnsavedChanges(true);
                      }}
                      className="nidhi-input"
                    >
                      <option value="">{t.claims.selectPurpose}</option>
                      {claimPurposeOptions.map((purpose) => (
                        <option key={purpose} value={purpose}>
                          {t.claims.purposes[purpose]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm block">
                    <span className="mb-1 block text-zinc-600 dark:text-zinc-300">{t.claims.notes}</span>
                    <textarea
                      value={form.notes}
                      onChange={(event) => {
                        setForm((current) => ({
                          ...current,
                          notes: event.target.value,
                        }));
                        setHasUnsavedChanges(true);
                      }}
                      className="nidhi-input min-h-24"
                      placeholder={t.claims.notesPlaceholder}
                    />
                  </label>
                  <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-3 text-xs text-teal-900 dark:border-teal-900/40 dark:bg-teal-950/30 dark:text-teal-100">
                    {t.claims.autosave}
                    {lastAutoSavedAt
                      ? ` ${interpolate(t.claims.lastAutosave, { time: formatDateTime(lastAutoSavedAt, locale) })}`
                      : ""}
                  </div>
                  <div className="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-900/50">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      {t.common.needHelp}
                    </p>
                    <AskNidhiButton prompt={t.claims.promptBank} />
                  </div>
                </div>
              ) : null}

              {flowStep === "review" ? (
                <div className="mt-4 space-y-3">
                  <div className="rounded-xl bg-zinc-50 p-3 text-sm dark:bg-zinc-900/60">
                    <p>
                      <strong>{t.claims.type}</strong>{" "}
                      {claimFormTypeOptions.find((option) => option.value === form.claimFormType)?.label}
                    </p>
                    <p>
                      <strong>{t.claims.employmentRecord}</strong> {form.selectedEmploymentEmployer} (
                      {form.selectedEmploymentMemberId})
                    </p>
                    <p>
                      <strong>{t.claims.bankVerification}</strong> {t.claims.bankState[form.bankVerificationState]}
                    </p>
                    <p>
                      <strong>{t.claims.amount}</strong> {formatCurrency(form.amount, locale)}
                    </p>
                    <p>
                      <strong>{t.claims.purpose}</strong>{" "}
                      {t.claims.purposes[form.purpose as keyof typeof t.claims.purposes] ?? form.purpose}
                    </p>
                    <p>
                      <strong>{t.claims.notes}:</strong> {form.notes}
                    </p>
                  </div>
                  <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-700">
                    <h6 className="font-semibold">{t.claims.reviewChecks}</h6>
                    <ul className="mt-2 space-y-2 text-sm">
                      <li className="flex items-center justify-between">
                        <span>{t.claims.purposeSelected}</span>
                        <StatusBadge category={form.purpose ? "resolved" : "action_required"} />
                      </li>
                      <li className="flex items-center justify-between">
                        <span>{t.claims.bankReady}</span>
                        <StatusBadge
                          category={
                            form.bankVerificationState === "verified"
                              ? "resolved"
                              : "action_required"
                          }
                        />
                      </li>
                      <li className="flex items-center justify-between">
                        <span>{t.claims.employmentSelected}</span>
                        <StatusBadge
                          category={
                            form.selectedEmploymentMemberId ? "resolved" : "action_required"
                          }
                        />
                      </li>
                    </ul>
                    {reviewWarnings.length ? (
                      <div className="mt-3 rounded-lg bg-amber-50 p-3 text-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
                        <p className="font-semibold">{t.claims.suspicious}</p>
                        <ul className="mt-1 list-disc space-y-1 pl-4 text-sm">
                          {reviewWarnings.map((warning) => (
                            <li key={warning}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                  <label className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-200">
                    <input
                      type="checkbox"
                      checked={confirmed}
                      onChange={(event) => setConfirmed(event.target.checked)}
                      className="mt-1"
                    />
                    {t.claims.confirmSubmit}
                  </label>
                  <div className="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-900/50">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      {t.common.needHelp}
                    </p>
                    <AskNidhiButton prompt={t.claims.promptReview} />
                  </div>
                </div>
              ) : null}

              {flowStep === "done" ? (
                <div className="mt-4 space-y-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
                  <p>
                    {t.claims.submitted}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link href="/claims" className="nidhi-btn-primary px-3 py-2">
                      {t.claims.viewActive}
                    </Link>
                    <AskNidhiButton prompt={t.claims.promptNext} />
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
              {errorMessage ? (
                <p className="text-sm text-rose-600 dark:text-rose-300">{errorMessage}</p>
              ) : null}
              {saveState === "saving" ? (
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{t.claims.saving}</p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                {flowStep === "type" ? (
                  <button
                    type="button"
                    className="nidhi-btn-primary"
                    disabled={!canMovePastEligibility}
                    onClick={() => setFlowStep("employer")}
                  >
                    {t.common.continue}
                  </button>
                ) : null}
                {flowStep === "employer" ? (
                  <>
                    <button
                      type="button"
                      className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
                      onClick={() => setFlowStep("type")}
                    >
                      {t.common.back}
                    </button>
                    <button
                      type="button"
                      className="nidhi-btn-primary"
                      disabled={!form.selectedEmploymentMemberId}
                      onClick={() => setFlowStep("details")}
                    >
                      {t.common.continue}
                    </button>
                  </>
                ) : null}
                {flowStep === "details" ? (
                  <>
                    <button
                      type="button"
                      className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
                      onClick={() => setFlowStep("employer")}
                    >
                      {t.common.back}
                    </button>
                    <button
                      type="button"
                      className="nidhi-btn-primary"
                      disabled={saveState === "saving"}
                      onClick={() => void saveDraft(false, false)}
                    >
                      {t.claims.saveDraft}
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-teal-600 px-4 py-2 text-sm font-medium text-teal-700 disabled:opacity-50 dark:text-teal-300"
                      disabled={form.bankVerificationState !== "verified" || saveState === "saving"}
                      onClick={() => void saveDraft(true, false)}
                    >
                      {t.claims.reviewClaim}
                    </button>
                  </>
                ) : null}
                {flowStep === "review" ? (
                  <>
                    <button
                      type="button"
                      className="nidhi-btn-primary"
                      onClick={() => setFlowStep("details")}
                    >
                      {t.claims.editDetails}
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-700 disabled:opacity-50 dark:text-emerald-300"
                      disabled={!confirmed || saveState === "saving"}
                      onClick={() => void submitClaim()}
                    >
                      {t.claims.confirmAndSubmit}
                    </button>
                  </>
                ) : null}
                {flowStep === "done" ? (
                  <button type="button" className="nidhi-btn-primary" onClick={closeModal}>
                    {t.claims.closePopup}
                  </button>
                ) : null}
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}
