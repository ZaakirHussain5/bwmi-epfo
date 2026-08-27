# Nidhi Implementation Plan

## Current Repository State (Aug 22, 2026)
- Stack: `Next.js 16` + `React 19` + `TypeScript` + `Tailwind 4` + OpenAI Chat Completions.
- Scope constraint: account data only, no live EPFO integrations.

## Delivery Strategy

### Phase 1 - Foundation (complete)
- [x] Scaffold application with modern stack.
- [x] Establish domain types for member summary, passbook, claims, profile, services.
- [x] Add `EPFDataProvider` interface and `MockEPFDataProvider` implementation.
- [x] Create coherent member account data (24+ month passbook, claims, profile, services).
- [x] Build sign-in flow (single account, no OTP/CAPTCHA).
- [x] Add protected app shell, top navigation, mobile bottom navigation.
- [x] Add disclosure banner.
- [x] Build dashboard baseline powered by provider abstraction.
- [x] Verify with lint + run app smoke test.

### Phase 2 - Core Portal (complete)
- [x] Build full `dashboard`, `passbook`, `claims`, `profile`, `services` baseline with shared provider data.
- [x] Add passbook filters/search/compare and claim timeline visualization.
- [x] Add profile edit flows (contact + nominee) against provider update boundary.
- [x] Add service catalogue with availability and navigation.
- [x] Evaluate UX4G UI pack (`ux4g-web-components`) integration and retain as optional dependency.
- [x] Expand Help experience with knowledge search, tickets, and assistant handoff.

### Phase 3 - Complete Claim Journey (complete)
- [x] Implement medical advance claim flow: start -> autosave draft -> resume -> review -> explicit confirm -> submit.
- [x] Ensure submitted claim appears in claims dashboard and timeline.
- [x] Allow resume via `/claims?start=1` or `/claims?draftId=...`, including assistant-driven submits.

### Phase 4 - AI Assistant (complete)
- [x] Left-rail chat UI across authenticated pages.
- [x] OpenAI tool-calling backend (`OPENAI_API_KEY`, `OPENAI_MODEL=gpt-5.6`) with local intent fallback.
- [x] Controlled tools: member summary, passbook, claims, profile, medical draft/submit, tickets, knowledge, navigation.
- [x] Retrieval-backed EPF knowledge base with guidance disclaimer.

### Phase 5 - Voice Agent (complete)
- [x] Microphone capture + Whisper transcription (`OPENAI_TRANSCRIBE_MODEL`).
- [x] Voice transcripts use the same approved tool/action architecture.
- [x] Real navigation and member-specific explanations.
- [x] Confirmation gates for claim submit and support tickets.

### Phase 6 - Polish + QA (complete)
- [x] Responsive/mobile UX refinements, loading skeletons, error states.
- [x] Accessibility: live region, labels, keyboard send, confirmation controls.
- [x] Tests for data provider, claim flow, voice routing, and sensitive-action safety.
- [x] `docs/CODEX_USAGE.md` with concrete development examples.

## Journey-First Priority
Focus on one complete, credible citizen journey before breadth:
1. Sign in with account credentials.
2. Understand balance and contribution context.
3. Track and interpret claim status.
4. Complete one claim end-to-end.
5. Ask Nidhi (text or voice) to explain, navigate, submit, or raise a ticket.
