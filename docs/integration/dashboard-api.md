# Integração — chamar o Sportrail Voices a partir do Sportrail-dashboard

Este documento é o **contrato HTTP** da app Sportrail Voices. O dashboard
(seja qual for a linguagem) integra-se chamando estes endpoints por HTTP.
Não é preciso copiar código JavaScript — a app gera os PNGs e devolve-os.

- **Base URL (produção):** `https://sportrail-voices-app.vercel.app`
- **Runtime:** serverless, `maxDuration` 60 s. Os renders correm em
  sequência (browser por job), portanto um pedido demora ~8-40 s consoante
  o número de imagens. Põe o timeout do cliente em pelo menos 60 s.

---

## Autenticação

A app tem um gate de **HTTP Basic Auth** activado quando a env var
`APP_PASSWORD` está definida no Vercel (está, em produção).

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

Gera 4 PNGs opacos (post pronto a publicar): PT 4:5, PT 9:16, EN 4:5,
EN 9:16.

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
| `photo`           | ficheiro | `image/jpeg`, `image/jpg` ou `image/png`, ≤ 10 MB |

### Resposta

Duas formas, escolhidas pela query string:

**`POST /api/generate?as=zip`** — recomendado para integração

- `200`, `Content-Type: application/zip` (corpo = ZIP binário com os 4 PNGs)
- `Content-Disposition: attachment; filename="Sportrail_Testemunho_<slug>.zip"`
- Header `X-Post-Manifest`: JSON com a lista de ficheiros, ex:
  ```json
  [{"key":"pt_4x5","filename":"Sportrail_Testemunho_joao_4x5_pt.png"},
   {"key":"pt_9x16","filename":"..."},
   {"key":"en_4x5","filename":"..."},
   {"key":"en_9x16","filename":"..."}]
  ```

**`POST /api/generate`** (sem query) — JSON com base64

```json
{
  "posts": {
    "pt_4x5":  { "filename": "...png", "base64": "iVBORw0KGgo..." },
    "pt_9x16": { "filename": "...png", "base64": "..." },
    "en_4x5":  { "filename": "...png", "base64": "..." },
    "en_9x16": { "filename": "...png", "base64": "..." }
  }
}
```

---

## Endpoint 2 — Molduras para vídeo

`POST /api/generate-frames`

Gera PNGs **transparentes** (overlay para sobrepor a vídeo no editor).
Para cada formato pedido gera sempre versão **PT e EN**.

### Pedido

`Content-Type: application/json`:

```json
{
  "testemunho": {
    "name": "João Silva",
    "role": "Sports Director",
    "affiliation": "Alliance FC",
    "quote_pt": "...",
    "quote_en": "..."
  },
  "selecoes": {
    "moldura": "A",
    "formatos": ["9x16", "1x1", "16x9"],
    "generic": false
  }
}
```

Regras de validação:

- `moldura`: `"A"` | `"B"` | `"C"`
- `formatos`: array não vazio de `"9x16"` | `"1x1"` | `"16x9"`
- `generic`: boolean
- **Moldura C só existe em `9x16`** — pedir C com `1x1`/`16x9` → `400`
- **Moldura A é sempre genérica** — o flag `generic` é ignorado (forçado a `true`)
- Se `generic=false` e `moldura="B"` → `testemunho.name` e `testemunho.role` obrigatórios
- Se `generic=false` e `moldura="C"` → pelo menos um de `quote_pt`/`quote_en`
- Limites de texto: `name` ≤ 60, `role` ≤ 80, `affiliation` ≤ 80,
  `quote_pt`/`quote_en` ≤ 250. Todos os campos de `testemunho` são
  opcionais (default `""`).

### Resposta

**`POST /api/generate-frames?as=zip`** — recomendado

- `200`, `application/zip`, `Content-Disposition: ... filename="Sportrail_Molduras.zip"`
- Header `X-Frame-Manifest`: JSON `[{"key":"A_9x16_pt","filename":"..."}, ...]`

**`POST /api/generate-frames`** (sem query) — JSON base64

```json
{
  "frames": {
    "A_9x16_pt": { "filename": "Sportrail_Frame_A_9x16_pt_generic.png", "base64": "..." },
    "A_9x16_en": { "filename": "...", "base64": "..." }
  }
}
```

Formato da `key`: `<moldura>_<formato>_<lang>` →
ex. `B_1x1_en`, `C_9x16_pt`.

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
        "selecoes": { "moldura": "B", "formatos": ["9x16"], "generic": false }
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

Exemplo equivalente em Python (qualquer backend não-JS faz o mesmo):

```python
import requests

r = requests.post(
    "https://sportrail-voices-app.vercel.app/api/generate-frames?as=zip",
    auth=("sportrail", APP_PASSWORD),
    json={
        "testemunho": {"name": "João Silva", "role": "Sports Director",
                        "affiliation": "Alliance FC"},
        "selecoes": {"moldura": "B", "formatos": ["9x16"], "generic": False},
    },
    timeout=90,
)
r.raise_for_status()
open("Sportrail_Molduras.zip", "wb").write(r.content)
```

---

## Notas de integração

- **Usa sempre `?as=zip`.** Evita os JSON gigantes em base64 e dá o
  ficheiro pronto a guardar/servir.
- **Timeout ≥ 60 s** no cliente (render serverless é sequencial).
- A app não processa vídeo nem guarda estado — cada pedido é
  independente. O dashboard pode chamar on-demand e cachear o ZIP do
  seu lado se quiser.
- Se quiseres servir as imagens individuais a partir do dashboard,
  abre o ZIP e usa os nomes do `X-Post-Manifest` / `X-Frame-Manifest`.
- CORS: hoje os endpoints são chamados same-origin pela própria app. Se
  o dashboard chamar do **browser** (cross-origin) é preciso adicionar
  headers CORS na app Voices — diz se for esse o caso. Se a chamada for
  **server-to-server** (backend do dashboard → Voices) não há problema
  de CORS.
