# BRIEFING: Sportrail Dashboard, vídeos de testemunho com moldura

> Para uma sessão Claude Code no repo do **Sportrail-dashboard** (Next.js na
> Vercel, `dashboard.sportrail.pt`). Cola este documento como primeira
> mensagem. O contrato da API das molduras está em
> [`dashboard-api.md`](./dashboard-api.md), no repo `sportrail-voices-app`.

---

## O que se quer

Uma página no dashboard onde quem usa:

1. escolhe o vídeo do testemunho (ficheiro no computador);
2. preenche nome, função e organização, e escolhe a moldura (Cinematic,
   Editorial ou Glass card), o formato (9:16, 1:1 ou 16:9) e a língua (PT ou EN);
3. carrega em **Montar vídeo**: o browser sobrepõe a moldura ao vídeo e gera
   um MP4;
4. o MP4 vai para uma pasta do Google Drive da Sportrail. Também o pode
   descarregar.

## Decisões já tomadas (não reabrir)

- **A montagem é feita no browser**, com WebCodecs através da biblioteca
  Mediabunny. Nenhum servidor processa nem guarda vídeo. Custo zero.
- **O vídeo original nunca sai do computador.** Só o MP4 final é enviado, e
  diretamente para o Drive.
- **O envio para o Drive usa o login Google de quem está no dashboard**
  (OAuth no browser). Não há conta de serviço.
- **As molduras vêm da app Sportrail Voices** (PNG transparente), chamada a
  partir do servidor do dashboard com Basic auth.
- **Alvo: Chrome ou Edge num computador.** Telemóvel fica fora de âmbito.

## Pré-requisitos

### Na Voices

O contrato novo das molduras (A Cinematic, B Editorial, C Glass card; nome e
função obrigatórios) entra com o PR #16 do `sportrail-voices-app`. Confirma que
está em produção antes de integrar: com o contrato antigo, a Voices responde
`400`.

### No Google Cloud (feito pelo Bruno, sem faturação)

No projeto `oceanic-trail-439012-e0`:

1. Ativar a **Google Drive API** e a **Google Picker API**.
2. Configurar o ecrã de consentimento OAuth com o nome "Sportrail Dashboard".
   Se aparecer a opção **Interno**, usar essa.
3. Criar um **ID de cliente OAuth** do tipo "Aplicação Web", com origens
   JavaScript autorizadas `https://dashboard.sportrail.pt` e
   `http://localhost:3000`.
4. Criar uma **chave de API** restrita à Google Picker API e aos referrers
   `https://dashboard.sportrail.pt/*` e `http://localhost:3000/*`.
5. Anotar o **número do projeto** (Project number, só dígitos), na página
   inicial da consola.

O login Google só funciona nas origens autorizadas no passo 3. Nos previews da
Vercel (URLs que mudam a cada deploy) não funciona, a não ser que se
acrescentem. Testa em `localhost` e em produção.

### Variáveis de ambiente do dashboard

| Variável | Valor | Lado |
| --- | --- | --- |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | ID de cliente OAuth | browser |
| `NEXT_PUBLIC_GOOGLE_API_KEY` | chave de API do Picker | browser |
| `NEXT_PUBLIC_GOOGLE_APP_ID` | número do projeto | browser |
| `VOICES_URL` | `https://sportrail-voices-app.vercel.app` | servidor |
| `VOICES_USERNAME`, `VOICES_PASSWORD` | Basic auth da Voices | servidor, secretas |

As três `NEXT_PUBLIC_` ficam visíveis no browser e não são segredos: estão
limitadas às origens e referrers configurados.

---

## Fluxo técnico

### 1. Moldura (servidor do dashboard)

Route handler `app/api/frames/route.ts` (`POST`, runtime `nodejs`,
`maxDuration = 60`), atrás da autenticação que o dashboard já tem.

- Recebe `{ name, role, affiliation, moldura: "A"|"B"|"C", formato: "9x16"|"1x1"|"16x9", lingua: "pt"|"en", etiqueta: "10anos"|"testemunho"|"nenhuma" }`
  e valida como a Voices: `name` 2 a 60 caracteres, `role` 2 a 80,
  `affiliation` até 80.
- Chama `POST ${VOICES_URL}/api/generate-frames` **sem** `?as=zip`, com
  `Authorization: Basic …` e o corpo
  `{ "testemunho": { name, role, affiliation }, "selecoes": { moldura, "formatos": [formato], etiqueta } }`.
  O que cada `etiqueta` mostra está em `dashboard-api.md`; `"10anos"` é o
  valor por omissão.
- A resposta traz `{ "frames": { "<moldura>_<formato>_<lingua>": { filename, base64 } } }`.
  Devolve ao browser só o PNG pedido, com `Content-Type: image/png`.
- A Voices gera sempre PT e EN, por isso demora 10 a 25 s. Mostra o estado
  "A preparar a moldura".
- O PNG vem a 2×: 2160×3840 (9:16), 2160×2160 (1:1), 3840×2160 (16:9). É
  desenhado à escala do vídeo final.

### 2. Montagem (browser)

Dependência: `mediabunny@1.65.2` (versão fixa).

| Formato | Vídeo final |
| --- | --- |
| 9:16 | 1080×1920 |
| 1:1 | 1080×1080 |
| 16:9 | 1920×1080 |

O vídeo é escalado e cortado ao centro para encher o formato (`fit: "cover"`),
como o `ffmpeg … scale=…:force_original_aspect_ratio=increase,crop=…` do
pacote de molduras original. A moldura é desenhada por cima de cada frame.

Esboço com os nomes confirmados nos tipos da 1.65.2:

```ts
import {
  ALL_FORMATS, BlobSource, BufferTarget, Conversion, Input,
  Mp4OutputFormat, Output, Quality, canEncodeVideo,
} from "mediabunny";

const SIZES = { "9x16": [1080, 1920], "1x1": [1080, 1080], "16x9": [1920, 1080] } as const;

export async function montarVideo(
  file: File,
  molduraPng: Blob,
  formato: keyof typeof SIZES,
  onProgress: (fracao: number) => void,
): Promise<Blob> {
  const [width, height] = SIZES[formato];
  if (typeof VideoEncoder === "undefined" || !(await canEncodeVideo("avc", { width, height }))) {
    throw new Error("Este browser não consegue gerar vídeo. Usa o Chrome ou o Edge num computador.");
  }

  const moldura = await createImageBitmap(molduraPng);
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d")!;

  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
  const output = new Output({
    format: new Mp4OutputFormat({ fastStart: "in-memory" }),
    target: new BufferTarget(),
  });

  const conversion = await Conversion.init({
    input,
    output,
    video: {
      width,
      height,
      fit: "cover",
      allowTransformationMetadata: false, // roda já os frames de telemóvel antes do process
      codec: "avc",
      quality: new Quality("high"),
      processedWidth: width,
      processedHeight: height,
      process: (sample) => {
        ctx.clearRect(0, 0, width, height);
        sample.draw(ctx, 0, 0, width, height);
        ctx.drawImage(moldura, 0, 0, width, height);
        return canvas;
      },
    },
    // Sem opções de áudio: o AAC do telemóvel é copiado tal como está.
  });

  if (!conversion.isValid) {
    throw new Error(`Não foi possível ler este vídeo (${conversion.discardedTracks.map((t) => t.reason).join(", ")}).`);
  }
  conversion.onProgress = (p) => onProgress(p);
  await conversion.execute();
  return new Blob([output.target.buffer!], { type: "video/mp4" });
}
```

Regras:

- **Vídeos do iPhone em HEVC** ("Alta eficiência"): se o computador não os
  conseguir ler, a conversão fica inválida. Mostra uma mensagem clara: "Este
  vídeo está em HEVC. No iPhone, ativa Definições › Câmara › Formatos › Mais
  compatível, ou exporta o vídeo em H.264."
- Se o áudio aparecer em `discardedTracks`, avisa que o vídeo vai sair sem som
  e pede confirmação.
- Botão **Cancelar** → `conversion.cancel()`.
- Durante a montagem e o envio, avisa antes de fechar o separador
  (`beforeunload`).
- Limite recomendado: 10 minutos de vídeo, porque o MP4 final fica em memória.
- De preferência, corre a montagem num Web Worker para a página não congelar:
  WebCodecs e `OffscreenCanvas` existem em workers. Se der problemas, corre na
  página.
- Confirma nos testes que reutilizar o mesmo `canvas` em todos os frames não
  causa frames repetidos. Se causar, devolve `new VideoSample(canvas, …)` com o
  `timestamp` e a `duration` do `sample`.

### 3. Envio para o Drive (browser)

**Login:** Google Identity Services (`https://accounts.google.com/gsi/client`),
`google.accounts.oauth2.initTokenClient` com
`scope: "https://www.googleapis.com/auth/drive.file"`. O token dura cerca de
1 hora: se expirar, pede-o outra vez sem perder o vídeo já montado.

**Pasta de destino:** com o âmbito `drive.file`, a app só escreve em pastas
escolhidas no Google Picker. Por isso o destino escolhe-se no Picker (uma vez)
e não se cola um ID:

```ts
const view = new google.picker.DocsView(google.picker.ViewId.FOLDERS)
  .setSelectFolderEnabled(true)
  .setIncludeFolders(true)
  .setEnableDrives(true);

new google.picker.PickerBuilder()
  .addView(view)
  .enableFeature(google.picker.Feature.SUPPORT_DRIVES)
  .setOAuthToken(token)
  .setDeveloperKey(process.env.NEXT_PUBLIC_GOOGLE_API_KEY!)
  .setAppId(process.env.NEXT_PUBLIC_GOOGLE_APP_ID!) // obrigatório com drive.file
  .setCallback(onPicked)
  .build()
  .setVisible(true);
```

O Picker carrega-se com `https://apis.google.com/js/api.js` e
`gapi.load("picker", …)`. Guarda o ID e o nome da pasta escolhida em
`localStorage` e mostra "Destino: <nome> · Alterar".

**Envio retomável** (confirma os detalhes nos docs da Drive API v3, "Upload
file data"):

1. `POST https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true`
   com `Authorization: Bearer <token>`, `X-Upload-Content-Type: video/mp4`,
   `X-Upload-Content-Length: <bytes>` e o corpo JSON
   `{ "name": "<ficheiro>", "mimeType": "video/mp4", "parents": ["<id da pasta>"] }`.
   O URI da sessão vem no header `Location`.
2. `PUT` para esse URI em blocos de 8 MiB (múltiplo de 256 KiB) com
   `Content-Range: bytes <início>-<fim>/<total>`. `308` significa "continua";
   `200` ou `201` traz o JSON do ficheiro com o `id`.
3. Mostra a barra de progresso do envio e, no fim, o link
   `https://drive.google.com/file/d/<id>/view`.

**Nome do ficheiro:**
`Sportrail_Testemunho_<nome-em-slug>_<Cinematic|Editorial|GlassCard>_<9x16|1x1|16x9>_<pt|en>.mp4`

O botão **Descarregar MP4** fica sempre disponível depois da montagem, e serve
também de alternativa se o envio para o Drive falhar.

---

## Interface e marca

Segue o Brand Guide v2.0, publicado como Design System Sportrail em
https://claude.ai/artifact/WHgGtmaXq3LM5WbnAHYYqV (lê `project/README.md` e
`project/tokens.json`). O essencial:

- **Cores:** fundo `#0B0A0F`, cards `#1A1920` com 14 px de raio, texto
  `#F0EFF4` e secundário `#B4B3BE`.
- **Contornos:** campos e botões outline com `#6F6D7A`.
- **Botão principal:** vermelho `#E8121B`, 5 px de raio, DM Sans 700 a 13 px,
  maiúsculas, tracking 0.14em.
- **Kickers:** traço vermelho curto e label em DM Sans 700, maiúsculas,
  tracking 0.22em. Nunca em Bebas Neue.
- **Acessibilidade:** foco visível com anel de 2 px em `#F0EFF4` afastado
  3 px; alvos de toque de 44 px no mínimo.
- **Texto:** PT-PT com "tu", sem travessões e sem "não é X, é Y".

Passos da página:

1. **Vídeo:** zona para largar o ficheiro, com pré-visualização, duração e
   resolução.
2. **Dados:** nome, função e organização.
3. **Moldura, formato, língua e etiqueta.** A etiqueta tem três opções:
   «10 Anos» (por omissão), «Testemunho» e «Sem etiqueta». Assim que houver
   PNG, mostra uma
   pré-visualização imediata: o `<video>` com `object-fit: cover` no formato
   escolhido e o PNG por cima.
4. **Montar vídeo**, com progresso em três fases: Moldura, Montagem (x %),
   Drive (x %).
5. **Resultado:** link do Drive e botão **Descarregar MP4**.

## Fora de âmbito

- Cortar ou editar o vídeo, legendas, música.
- Qualquer processamento ou armazenamento de vídeo em servidor (Cloud Run,
  buckets).
- Posts estáticos (`/api/generate` da Voices). Ficam para uma fase seguinte,
  já com o PR #17 da Voices (posts em JPEG a 1080 px).
- Telemóvel.

## Testes de aceitação

1. Vídeo vertical de iPhone (HEVC): sai direito, não deitado, com som
   sincronizado. Num computador que não lê HEVC, aparece a mensagem
   explicativa.
2. Vídeo vertical de Android (H.264).
3. Vídeo horizontal em 9:16: corte ao centro, sem barras pretas.
4. Formatos 1:1 e 16:9.
5. Nome longo ("Pedro Miguel Fernandes Rodrigues") não sai da moldura.
6. Moldura em PT e em EN.
7. Pasta num Drive partilhado: escolhida no Picker, o envio funciona e o link
   abre o vídeo.
8. Token expirado (mais de 1 hora): pede novo login sem perder o vídeo montado.
9. Cancelar a meio da montagem.
10. Tentar fechar o separador durante a montagem: aparece o aviso.
11. No MP4, a moldura está na mesma posição que no PNG da Voices, sem esticar.
12. As três etiquetas («10 Anos», «Testemunho», «Sem etiqueta») nas três
    molduras.
