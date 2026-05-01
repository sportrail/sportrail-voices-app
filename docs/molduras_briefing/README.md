# Sportrail Molduras — Briefing de Extensão da App

Esta pasta contém o briefing original e os materiais de referência usados para
estender a Sportrail Voices App com a funcionalidade de geração de PNGs de
moldura para vídeos de testemunho.

> **Nota:** a extensão descrita no briefing **já foi implementada** no repo.
> Esta pasta fica versionada como referência histórica e para validação visual
> futura. Ver `app/api/generate-frames/route.ts`, `lib/render-frame.ts`,
> `lib/frame-validation.ts`, `components/frame-section.tsx` e
> `components/frame-preview-grid.tsx` para o código actual.

## Estrutura

```
docs/molduras_briefing/
├── BRIEFING_Sportrail_Molduras_Extensao.md  ← LER PRIMEIRO
├── README.md                                ← este ficheiro
├── templates_html.py                        ← Templates 9:16 (A, B, C) — Python original
├── templates_html_outros_formatos.py        ← Templates 1:1 e 16:9 (A, B) — Python original
├── proporcoes.py                            ← Tabela de proporções
├── sportrail_logo_white.png                 ← Logo Sportrail oficial
└── previews/                                ← PNG de exemplo de cada moldura
    ├── A_9x16_preview.png
    ├── A_9x16_moldura.png        (transparente)
    ├── A_1x1_preview.png
    ├── A_16x9_preview.png
    ├── B_9x16_preview_rui.png
    ├── B_9x16_moldura_rui.png    (transparente)
    ├── B_9x16_preview_generic.png
    ├── B_1x1_preview.png
    ├── B_16x9_preview.png
    ├── C_9x16_preview_rui.png
    └── C_9x16_preview_generic.png
```

## Onde está cada coisa no código

| Briefing → Código |
|------|
| Rota `/api/generate-frames` → `app/api/generate-frames/route.ts` |
| Templates HTML (port TypeScript) → `lib/render-frame.ts` |
| Validação Zod (C ⇒ só 9:16 etc.) → `lib/frame-validation.ts` |
| `renderHtmlToPng({transparent: true})` → `lib/playwright.ts` |
| Secção de UI "Molduras para vídeo" → `components/frame-section.tsx` |
| Output + ZIP → `components/frame-preview-grid.tsx` |
| Logo oficial usado em runtime → `public/assets/sportrail_logo_white.png` |

## Decisões de design já tomadas

- 3 molduras (A, B, C) com 7 combinações totais
- Moldura C limitada a 9:16 (não funciona em horizontal)
- Moldura A é sempre genérica (não tem texto de testemunho)
- B e C podem ser geradas com texto ou genéricas
- App não processa vídeo — só gera PNG overlay

## Validação visual

Quando se mexer nos templates de `lib/render-frame.ts`, gerar uma vez cada
combinação e comparar lado-a-lado com os PNGs em `previews/`. Os outputs
devem ser visualmente idênticos. Desvios são problema de porte HTML/CSS —
corrigir.
