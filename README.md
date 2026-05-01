# Sportrail Voices App

Gerador interno de posts de testemunho para a campanha 10 Anos da Sportrail.
Substitui o toolkit Python (`generate_posts.py`) por uma interface web.

## Stack

- Next.js 15 (App Router) + TypeScript strict
- Tailwind CSS com design tokens Sportrail
- React Hook Form + Zod para validação
- Playwright Core + `@sparticuz/chromium-min` para rendering serverless
- JSZip para download em lote

## Funcionalidades

A app expõe duas funcionalidades independentes na mesma página:

1. **Posts de testemunho** (`/api/generate`) — gera 4 PNGs (4:5 PT/EN, 9:16 PT/EN)
   a partir de quote, nome, função e foto.
2. **Molduras para vídeo** (`/api/generate-frames`) — gera PNGs transparentes para
   sobrepor a vídeo no editor (Veed, CapCut). 3 estilos (A, B, C) × 3 formatos
   (9:16, 1:1, 16:9), com 7 combinações válidas. Ver
   [`docs/molduras_briefing/`](docs/molduras_briefing/) para o briefing
   completo, templates de referência e PNGs de validação visual.

## Desenvolvimento local

Requer Node 20+ e Google Chrome instalado (o Playwright local usa o canal
`chrome` por defeito).

```bash
npm install
npm run dev
```

Para usar um Chromium custom local: `PLAYWRIGHT_CHROMIUM_PATH=/path/to/chrome npm run dev`.

## Deployment

Vercel (plano Hobby). As funções `app/api/generate/route.ts` e
`app/api/generate-frames/route.ts` estão configuradas para `maxDuration: 60`,
`memory: 1024` (ver `vercel.json`).

## Documentação

- [`docs/molduras_briefing/`](docs/molduras_briefing/) — briefing original da
  extensão de molduras, templates Python de referência (`templates_html.py`,
  `templates_html_outros_formatos.py`), tabela de proporções e PNGs de validação
  visual em `previews/`.
