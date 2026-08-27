This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), enter the portal, and use the left-rail **Ask Nidhi** assistant.

### Environment variables

Copy `.env.example` to `.env.local`:

| Variable | Purpose | Default |
| --- | --- | --- |
| `OPENAI_API_KEY` | Server-only key for chat, tools, and voice | _(empty → local intent mode)_ |
| `OPENAI_MODEL` | Text and voice inference model | `gpt-5.6` |
| `OPENAI_TRANSCRIBE_MODEL` | Speech-to-text | `whisper-1` |
| `OPENAI_TTS_MODEL` | Optional speech synthesis | `gpt-4o-mini-tts` |
| `OPENAI_TTS_VOICE` | Optional TTS voice | `alloy` |

Never prefix the API key with `NEXT_PUBLIC_`. Status is exposed by `GET /api/assistant/status` without leaking the key.

```bash
npm test
npm run lint
```

See `docs/CODEX_USAGE.md` for assistant, claim, ticket, and voice examples.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
