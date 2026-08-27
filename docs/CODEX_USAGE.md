# Codex / Cursor usage for Nidhi

This is a Next.js App Router app with a provider-backed EPF account and a left-rail assistant.

## Daily loop

```bash
cp .env.example .env.local
# add OPENAI_API_KEY; typed chat and transcribed voice both use OPENAI_MODEL=gpt-5.6
npm install
npm run dev
```

Sign in with **Enter Portal**. The assistant sits on the left. Without `OPENAI_API_KEY`, chat still works through a local intent router.

## Concrete tasks

### Ask member-specific questions
- Prompt: `How much EPF do I have?`
- Expected: balance/UAN from `MockEPFDataProvider`, not invented numbers.

### Navigate the UI
- Prompt: `Take me to claims`
- Expected: `navigate_ui` tool, router moves to `/claims`.

### Submit a medical advance
- Prompt: `Submit a medical advance of 25000 for illness treatment`
- Expected: draft is saved, confirmation card appears, claim is submitted only after **Confirm**.

### Raise a support ticket
- Prompt: `Raise a support ticket about June passbook`
- Expected: confirmation gate, then a ticket on `/help`.

### Voice
- Click the microphone, speak the same prompts.
- Transcription uses `OPENAI_TRANSCRIBE_MODEL` (default `whisper-1`), then the same `gpt-5.6` tool/action path as typed chat.

## Tests

```bash
npm test
npm run lint
```

Sensitive-action tests live in `src/features/assistant/assistant.test.ts`. Provider/claim tests live next to the modules they cover.
