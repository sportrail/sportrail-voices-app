import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { renderHtmlBatch } from "@/lib/playwright";
import {
  FRAME_DIMENSIONS,
  buildFrameHtml,
  type FrameFormat,
  type FrameKind,
} from "@/lib/render-frame";
import { frameRequestSchema } from "@/lib/frame-validation";
import { slugify } from "@/lib/validation";

export const runtime = "nodejs";
export const maxDuration = 60;

type GeneratedFrame = {
  filename: string;
  base64: string;
};

const LANGS = ["pt", "en"] as const;
type Lang = (typeof LANGS)[number];

function frameKey(kind: FrameKind, format: FrameFormat, lang: Lang): string {
  return `${kind}_${format}_${lang}`;
}

function frameFilename(
  kind: FrameKind,
  format: FrameFormat,
  lang: Lang,
  generic: boolean,
  slug: string,
): string {
  const variant = generic ? "generic" : slug;
  return `Sportrail_Frame_${kind}_${format}_${lang}_${variant}.png`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "Pedido inválido (JSON em falta)." },
        { status: 400 },
      );
    }

    const parsed = frameRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validação falhou.",
          issues: parsed.error.flatten().fieldErrors,
          formErrors: parsed.error.flatten().formErrors,
        },
        { status: 400 },
      );
    }
    const { testemunho, selecoes } = parsed.data;

    // Frame A is always generic regardless of the flag
    const generic = selecoes.moldura === "A" ? true : selecoes.generic;

    const logoPath = path.join(
      process.cwd(),
      "public",
      "assets",
      "sportrail_logo_white.png",
    );
    const logoBuffer = await readFile(logoPath);
    const logoB64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;

    const slug = generic
      ? "generic"
      : slugify(testemunho.name ?? "") || "testemunho";

    const renderJobs = selecoes.formatos.flatMap((format) =>
      LANGS.map((lang) => ({
        key: frameKey(selecoes.moldura, format, lang),
        filename: frameFilename(
          selecoes.moldura,
          format,
          lang,
          generic,
          slug,
        ),
        html: buildFrameHtml({
          kind: selecoes.moldura,
          format,
          generic,
          content: testemunho,
          language: lang,
          logoB64,
        }),
        ...FRAME_DIMENSIONS[format],
      })),
    );

    const buffers = await renderHtmlBatch(
      renderJobs.map((job) => ({
        html: job.html,
        width: job.width,
        height: job.height,
        transparent: true,
      })),
    );

    const frames: Record<string, GeneratedFrame> = {};
    renderJobs.forEach((job, idx) => {
      frames[job.key] = {
        filename: job.filename,
        base64: buffers[idx].toString("base64"),
      };
    });

    return NextResponse.json({ frames });
  } catch (error) {
    console.error("[/api/generate-frames] failed", error);
    const message =
      error instanceof Error ? error.message : "Erro desconhecido na geração.";
    return NextResponse.json(
      { error: "Falha ao gerar molduras.", detail: message },
      { status: 500 },
    );
  }
}
