# Integração — chamar o Sportrail Voices a partir do Sportrail-dashboard

Este documento é o **contrato HTTP** da app Sportrail Voices. O dashboard
(Next.js na Vercel, `dashboard.sportrail.pt`) chama estes endpoints a partir
do servidor (route handlers), nunca do browser: assim as credenciais ficam no
servidor e não há CORS. A Voices gera os PNG e devolve-os.

A montagem de vídeo com estas molduras está descrita em
[`dashboard-video-montage.md`](./dashboard-video-montage.md).

- **Base URL (produção):** `https://sportrail-voices-app.vercel.app`
- **Runtime:** serverless, `maxDuration` 60 s. Os renders correm em
  sequência (browser por job), portanto um pedido demora ~8-40 s consoante
  o número de imagens. Põe o timeout do cliente em pelo menos 60 s.

---

## Autenticação

A app tem um gate de **HTTP Basic Auth** activado quando a env var
`APP_PASSWORD` está definida no projeto Vercel `sportrail-voices-app`.
Confirma com o Bruno se está definida e quais são as credenciais.

- Username: valor de `APP_USERNAME` (default `sportrail`)
- Password: valor de `APP_PASSWORD`

Envia o header `Authorization: Basic base64(user:pass)` em **todos** os
pedidos. Sem credenciais válidas a resposta é `401` com header
`WWW-Authenticate`. (Se `APP_PASSWORD` não estiver definida, o gate é
no-op e não é preciso autenticação — mas em produção assume que é
preciso.)

---

## Endpoint 1 — Posts estáticos de testemunho

`POST /api/generate`

Gera 4 JPEG prontos a publicar, a 1080 px de largura: PT 4:5 (1080×1350),
PT 9:16 (1080×1920), EN 4:5 e EN 9:16. O ZIP com os quatro fica perto de
0,8 MB.

> **Depende do PR #17 da Voices.** Antes dele os posts saíam em PNG a 2× e
> o ZIP passava os 4,5 MB que a Vercel aceita por resposta. O mesmo limite
> vale para o pedido: reduz a foto antes de a enviar (o gerador da Voices
> usa 2160 px no lado maior, JPEG 0,9).

### Pedido

`Content-Type: multipart/form-data` com os campos:

| Campo             | Tipo   | Regras                                  |
| ----------------- | ------ | --------------------------------------- |
| `name`            | texto  | 2–60 caracteres                         |
| `role`            | texto  | 2–80                                    |
| `affiliation`     | texto  | 2–80                                    |
| `quote_pt`        | texto  | 20–250                                  |
| `quote_en`        | texto  | 20–250                                  |
| `label_top_pt`    | texto  | 1–40                                    |
| `label_top_en`    | texto  | 1–40                                    |
| `label_bottom_pt` | texto  | 1–80                                    |
| `label_bottom_en` | texto  | 1–80                                    |
| `photo`           | ficheiro | `image/jpeg`, `image/jpg` ou `image/png`, ≤ 10 MB; o pedido inteiro tem de ficar abaixo de 4,5 MB |

### Resposta

Duas formas, escolhidas pela query string:

**`POST /api/generate?as=zip`** — recomendado para integração

- `200`, `Content-Type: application/zip` (corpo = ZIP binário com os 4 JPEG)
- `Content-Disposition: attachment; filename="Sportrail_Testemunho_<slug>.zip"`
- Header `X-Post-Manifest`: JSON com a lista de ficheiros, ex:
  ```json
  [{"key":"pt_4x5","filename":"Sportrail_Testemunho_joao_4x5_pt.jpg"},
   {"key":"pt_9x16","filename":"..."},
   {"key":"en_4x5","filename":"..."},
   {"key":"en_9x16","filename":"..."}]
  ```

**`POST /api/generate`** (sem query) — JSON com base64

```json
{
  "posts": {
    "pt_4x5":  { "filename": "...jpg", "base64": "/9j/4AAQ..." },
    "pt_9x16": { "filename": "...jpg", "base64": "..." },
    "en_4x5":  { "filename": "...jpg", "base64": "..." },
    "en_9x16": { "filename": "...jpg", "base64": "..." }
  }
}
```

---

## Endpoint 2 — Molduras para vídeo

`POST /api/generate-frames`

Gera PNGs **transparentes** para sobrepor ao vídeo, renderizados a 2×.
Para cada formato pedido gera sempre a versão **PT e EN**.

> Este contrato entra com o PR #16 da Voices. Antes disso a API ainda
> espera os campos antigos (`generic`, quotes).

| `moldura` | Desenho |
| --- | --- |
| `"A"` | Cinematic: gradiente suave, filete vermelho, nome em baixo à esquerda |
| `"B"` | Editorial: contorno fino, bloco centrado, tag "Testemunho · 10 Anos" |
| `"C"` | Glass card: cartão translúcido com barra vermelha |

| `formato` | PNG devolvido |
| --- | --- |
| `"9x16"` | 2160×3840 |
| `"1x1"` | 2160×2160 |
| `"16x9"` | 3840×2160 |

### Pedido

`Content-Type: application/json`:

```json
{
  "testemunho": {
    "name": "João Silva",
    "role": "Sports Director",
    "affiliation": "Alliance FC"
  },
  "selecoes": {
    "moldura": "A",
    "formatos": ["9x16"]
  }
}
```

Regras de validação:

- `moldura`: `"A"` | `"B"` | `"C"`. As três existem nos três formatos.
- `formatos`: array não vazio de `"9x16"` | `"1x1"` | `"16x9"`.
- `testemunho.name`: obrigatório, 2 a 60 caracteres.
- `testemunho.role`: obrigatório, 2 a 80 caracteres.
- `testemunho.affiliation`: opcional, até 80 caracteres. Aparece como
  "função · organização".
- Campos a mais (por exemplo `generic` de clientes antigos) são ignorados.

### Resposta

**`POST /api/generate-frames?as=zip`** — recomendado

- `200`, `application/zip`, `Content-Disposition: ... filename="Sportrail_Molduras.zip"`
- Header `X-Frame-Manifest`: JSON `[{"key":"A_9x16_pt","filename":"..."}, ...]`

**`POST /api/generate-frames`** (sem query) — JSON base64

```json
{
  "frames": {
    "A_9x16_pt": { "filename": "Sportrail_Frame_A_9x16_pt_joao_silva.png", "base64": "..." },
    "A_9x16_en": { "filename": "...", "base64": "..." }
  }
}
```

Formato da `key`: `<moldura>_<formato>_<lang>`, por exemplo `B_1x1_en` ou
`C_9x16_pt`.

Para a montagem de vídeo no dashboard usa a resposta JSON: pede um só
formato e fica com a `key` da língua escolhida.

---

## Erros

| Status | Corpo                                                            | Quando |
| ------ | ---------------------------------------------------------------- | ------ |
| `400`  | `{ "error": "...", "issues": {...}, "formErrors": [...] }`        | Validação falhou / JSON em falta |
| `401`  | corpo de texto + header `WWW-Authenticate`                        | Basic auth em falta/errada |
| `500`  | `{ "error": "Falha ao gerar...", "detail": "<mensagem real>" }`   | Erro de render no servidor |

Em `500`, o campo `detail` traz a mensagem real do erro — usa-o para
diagnóstico.

---

## Exemplos (curl — qualquer linguagem serve, é só HTTP)

Molduras, recebendo o ZIP directamente:

```bash
curl -u "sportrail:$APP_PASSWORD" \
  -X POST "https://sportrail-voices-app.vercel.app/api/generate-frames?as=zip" \
  -H "Content-Type: application/json" \
  -d '{
        "testemunho": { "name": "João Silva", "role": "Sports Director", "affiliation": "Alliance FC" },
        "selecoes": { "moldura": "B", "formatos": ["9x16"] }
      }' \
  --output Sportrail_Molduras.zip
```

Posts estáticos:

```bash
curl -u "sportrail:$APP_PASSWORD" \
  -X POST "https://sportrail-voices-app.vercel.app/api/generate?as=zip" \
  -F "name=João Silva" \
  -F "role=Sports Director" \
  -F "affiliation=Alliance FC" \
  -F "quote_pt=Uma frase com pelo menos vinte caracteres." \
  -F "quote_en=A quote with at least twenty characters." \
  -F "label_top_pt=TESTEMUNHO" -F "label_top_en=TESTIMONIAL" \
  -F "label_bottom_pt=10 ANOS · 2016—2026" -F "label_bottom_en=10 YEARS · 2016—2026" \
  -F "photo=@/caminho/para/foto.jpg;type=image/jpeg" \
  --output Sportrail_Testemunho.zip
```

No dashboard (route handler Next.js), pedindo uma só moldura em JSON:

```ts
const auth = Buffer.from(`${process.env.VOICES_USERNAME}:${process.env.VOICES_PASSWORD}`).toString("base64");
const res = await fetch(`${process.env.VOICES_URL}/api/generate-frames`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Basic ${auth}` },
  body: JSON.stringify({
    testemunho: { name: "João Silva", role: "Sports Director", affiliation: "Alliance FC" },
    selecoes: { moldura: "B", formatos: ["9x16"] },
  }),
  signal: AbortSignal.timeout(60_000),
});
const { frames } = await res.json();
const png = Buffer.from(frames["B_9x16_pt"].base64, "base64");
```

---

## Notas de integração

- **`?as=zip` quando queres vários ficheiros** para guardar; **JSON
  quando queres um PNG** para usar logo (caso da montagem de vídeo).
- **Timeout ≥ 60 s** no cliente (render serverless é sequencial).
- A app não processa vídeo nem guarda estado — cada pedido é
  independente. O dashboard pode chamar on-demand e cachear o ZIP do
  seu lado se quiser.
- Se quiseres servir as imagens individuais a partir do dashboard,
  abre o ZIP e usa os nomes do `X-Post-Manifest` / `X-Frame-Manifest`.
- **Sempre a partir do servidor do dashboard.** A Voices não tem CORS
  para outros domínios e as credenciais Basic não podem ir para o browser.
