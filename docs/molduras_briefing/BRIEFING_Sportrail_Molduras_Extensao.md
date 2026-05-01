# BRIEFING — Sportrail Voices App: Extensão para Molduras de Vídeo

> Briefing para **Claude Code**. Cola este documento como primeira mensagem
> numa nova conversa, com a pasta da app actual aberta. O Claude Code vai
> estender a app existente para gerar PNGs de moldura, mantendo
> intacta a funcionalidade de geração de posts estáticos.

---

## Contexto

A Sportrail Voices App actual (Next.js no Vercel, plano Hobby) gera posts
estáticos de testemunhos a partir de dados (quote, nome, função, foto).
Devolve 4 PNGs (4:5 PT, 4:5 EN, 9:16 PT, 9:16 EN).

Esta extensão adiciona uma **segunda funcionalidade independente**: gerar
PNGs de **moldura** para vídeos. Estes PNGs são overlays transparentes que
o utilizador depois sobrepõe ao vídeo no editor de vídeo (Veed.io, CapCut,
etc.). A app **não processa vídeo** — apenas gera as molduras visuais.

Esta separação é deliberada e crítica:
- Mantém a app dentro dos limites do Vercel Hobby (sem timeouts, sem
  uploads grandes, sem FFmpeg em serverless)
- Não toca na funcionalidade existente (zero risco de regressão)
- Funciona para qualquer vídeo, qualquer duração, qualquer formato

---

## O que é uma "moldura" no contexto desta app

Uma moldura é um **PNG transparente do tamanho do canvas final** (ex: 1080×1920
para 9:16). A área central está em alpha (transparente) e nas zonas das
margens estão pintadas as zonas de identidade visual Sportrail (header,
footer, name bar, etc.).

Quando o utilizador sobrepõe esta moldura ao vídeo no editor, o vídeo fica
visível na área transparente e a identidade Sportrail aparece nas margens.

Conceptualmente é como o lower-third do template CapCut existente, mas
maior e com mais elementos visuais.

---

## Especificação completa: 3 molduras × 3 formatos × 2 variantes

### As 3 molduras

**Moldura A — Simétrica** (sempre genérica, sem texto de testemunho)
- Header: barra preta com label "TESTIMONIAL" + aspa decorativa vermelha
- Footer: logo Sportrail + "10 ANOS · 2016—2026"
- Disponível em: 9:16, 1:1, 16:9

**Moldura B — Com nome+função permanente**
- Header: barra preta fina com label "TESTIMONIAL · SPORTRAIL 10 YEARS"
- Footer: barra com nome + função (do testemunho actual) + barra com logo
- Disponível em: 9:16, 1:1, 16:9
- **Variantes:** com nome+função (do testemunho) ou genérica (placeholders "— NOME —")

**Moldura C — Vídeo + Quote**
- Header: barra preta fina com label
- Vídeo na metade superior (~45%)
- Quote escrita na metade inferior (~43%) — funciona sem som
- Disponível em: **APENAS 9:16** (não funciona em formatos horizontais)
- **Variantes:** com quote+nome (do testemunho) ou genérica (placeholders)

### Os 3 formatos

| Formato | Dimensões | Uso |
|---------|-----------|-----|
| 9:16    | 1080×1920 | Reels, Stories, TikTok, vertical |
| 1:1     | 1080×1080 | Posts quadrados Instagram/Facebook |
| 16:9    | 1920×1080 | YouTube, vídeo horizontal, web |

### Combinações disponíveis (7 ao todo)

| Moldura | 9:16 | 1:1 | 16:9 |
|---------|------|-----|------|
| A       | ✓    | ✓   | ✓    |
| B       | ✓    | ✓   | ✓    |
| C       | ✓    | ✗   | ✗    |

---

## O que precisas de adicionar à app

### 1. Nova rota da API: `/api/generate-frames`

Análoga à rota actual mas dedicada às molduras. Recebe:

```typescript
{
  testemunho: {
    name: string,
    role: string,
    affiliation: string,
    quote_pt?: string,    // opcional — só usado em Moldura C
    quote_en?: string,    // opcional — só usado em Moldura C
  },
  selecoes: {
    moldura: 'A' | 'B' | 'C',
    formatos: ('9x16' | '1x1' | '16x9')[],
    generic: boolean,         // se true, gera versão sem texto
  }
}
```

Devolve um JSON com PNGs em base64:

```typescript
{
  frames: {
    'A_9x16.png': 'base64string...',
    'A_1x1.png':  'base64string...',
    // etc.
  }
}
```

**Validação importante:** se `moldura === 'C'`, validar que `formatos` só
contém `'9x16'`. Se utilizador pediu C com 1:1 ou 16:9, devolver erro 400
explicativo.

### 2. Templates HTML

Os templates HTML/CSS dos 7 layouts estão prontos no ficheiro `templates_html.py`
deste briefing. Estes templates usam:
- Bebas Neue (Google Fonts) para títulos
- DM Sans (Google Fonts) para corpo de texto
- Cores Sportrail oficiais: vermelho `#ED1C24`, preto `#0B0A0F`, creme `#FAF8F5`

Portar estes templates para TypeScript no backend Next.js. A função recebe
dados do testemunho + selecções e devolve string HTML pronta a renderizar.

### 3. Renderização com Playwright (mesmo padrão da app actual)

Reutilizar a função existente `renderHtmlToPng()` do projecto, mas com um
parâmetro adicional para `omit_background=true` (para gerar PNG transparente).

```typescript
const png = await renderHtmlToPng(
  html,
  width,
  height,
  { transparent: true }  // ← novo parâmetro
);
```

Em Playwright, isto traduz-se em `page.screenshot({ omitBackground: true })`.

### 4. Interface da app (frontend)

Adicionar uma **nova secção** na página principal, abaixo da secção actual de
geração de posts estáticos. Esta secção é independente — pode ser usada com
ou sem ter gerado os posts primeiro.

Estrutura sugerida:

```
┌─ MOLDURAS PARA VÍDEO ─────────────────┐
│                                       │
│ Estilo de moldura:                    │
│ [○ A — Simétrica]                     │
│ [○ B — Com nome+função]               │
│ [○ C — Vídeo + quote (só 9:16)]       │
│                                       │
│ Formatos a gerar:                     │
│ [☑ 9:16]  [☐ 1:1]  [☐ 16:9]            │
│                                       │
│ Variante:                             │
│ [○ Com dados do testemunho]           │
│ [○ Genérica (sem nome/quote)]         │
│                                       │
│ [BOTÃO: Gerar molduras]               │
│                                       │
└───────────────────────────────────────┘
```

**Lógica de UI importante:**
- Se moldura A seleccionada → ocultar o seletor de "variante" (A é sempre genérica)
- Se moldura C seleccionada → desabilitar checkboxes 1:1 e 16:9 com tooltip explicativo
- Se variante "com dados" seleccionada → validar que os campos do testemunho estão preenchidos

### 5. Output: download dos PNGs

Mesma UX do output actual: previews das imagens geradas + botões de download
individuais + botão "Download all as ZIP".

---

## Stack técnica (não muda nada)

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Playwright Core + @sparticuz/chromium-min
- Plano Vercel Hobby

**Não adicionar dependências novas** a não ser que estritamente necessárias.

---

## Tempo estimado

- Estrutura da rota + lógica de validação: 1-2 horas
- Portar 7 templates HTML para TypeScript: 2-3 horas
- Construir interface (nova secção + lógica condicional): 2-3 horas
- Output e download: 1 hora
- Testes manuais e refinamento visual: 1-2 horas

**Total: ~8-12 horas** (1-1.5 dias com Claude Code).

---

## Validação visual antes de declarar feito

Antes de considerar pronto, gerar uma vez cada combinação e comparar
side-by-side com os previews em `previews/` deste briefing. Os outputs
devem ser **visualmente idênticos**. Se houver desvios, é problema de
porte do HTML — corrigir.

---

## Anexos neste briefing

- `templates_html.py` — Os 7 templates HTML/CSS de referência
- `previews/` — PNGs de exemplo de cada combinação para comparação visual
- `proporcoes.py` — Tabela de proporções de header/footer/etc. para cada
  combinação (caso o Claude Code precise de ajustar)

---

## Final note: o que NÃO está no scope

Este briefing é estritamente sobre **gerar PNGs de molduras**. Não inclui:

- Processamento de vídeo (deliberadamente fora — vai para Veed.io/CapCut)
- Upload de vídeo (não é necessário)
- Visualização do vídeo dentro da app (não é necessário)
- Templates de vídeo animado (já existe outro toolkit para isso)

Se o utilizador (Bruno) quiser estas features no futuro, terá briefing
separado. Esta extensão mantém-se focada e rápida de implementar.
