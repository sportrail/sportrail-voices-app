# Sportrail Voices App

Gerador interno de posts de testemunho para a campanha 10 Anos da Sportrail.
Substitui o toolkit Python (`generate_posts.py`) por uma interface web.

## Stack

- Next.js 15 (App Router) + TypeScript strict
- Tailwind CSS com design tokens Sportrail
- React Hook Form + Zod para validação
- Playwright Core + `@sparticuz/chromium-min` para rendering serverless
- JSZip para download em lote

## Desenvolvimento local

Requer Node 20+ e Google Chrome instalado (o Playwright local usa o canal
`chrome` por defeito).

```bash
npm install
npm run dev
```

Para usar um Chromium custom local: `PLAYWRIGHT_CHROMIUM_PATH=/path/to/chrome npm run dev`.

## Deployment

Vercel (plano Hobby). A função `app/api/generate/route.ts` está configurada
para `maxDuration: 60`, `memory: 1024` (ver `vercel.json`).
