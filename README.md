# AI Deal Finder

A small AI-powered shopping assistant (in Danish) that helps you find the best PC hardware deal for your needs.

Describe what you're looking for in plain language — e.g. *"Jeg har et GTX 1080 og vil gerne have et nyt under 2000 kr, med 8GB vram"* — pick which webshops to search (Proshop, Komplett, Elgiganten), and choose an AI model (Google Gemini or Claude Haiku). The app then:

1. **Clarifies** — asks a couple of AI-generated multiple-choice follow-up questions to narrow down your requirements (`/api/clarify`).
2. **Evaluates** — sends your prompt, answers, and search results to the chosen AI model, which ranks a Top 5 list of products with a badge, price, performance estimate, and reasoning for each pick (`/api/evaluate`).
3. **Presents results** — shown in the UI, with an option to export the recommendations as a standalone HTML file.

Product search is currently backed by mock data; the AI ranking/reasoning step is real when API keys are configured.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + React + TypeScript
- [Anthropic SDK](https://www.npmjs.com/package/@anthropic-ai/sdk) (Claude Haiku) and [`@google/generative-ai`](https://www.npmjs.com/package/@google/generative-ai) (Gemini) for the AI calls
- Deployed to Cloudflare Workers via [OpenNext](https://opennext.js.org/cloudflare)

## Getting started

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

To get real AI responses (instead of mock data) set:

```
GOOGLE_GEMINI_API_KEY=your_key
ANTHROPIC_API_KEY=your_key
```

Without valid keys, both API routes fall back to mock questions/products so the app remains usable for local UI development.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run build:cf` | Build for Cloudflare Workers via OpenNext |
| `npm run preview` | Build and preview the Cloudflare Workers build locally |
| `npm run deploy` | Build and deploy to Cloudflare Workers |
