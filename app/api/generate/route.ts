import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { renderHtmlBatch } from "@/lib/playwright";
import {
  buildHtml4x5,
  buildHtml9x16,
  type TestimonialLangData,
} from "@/lib/render-html";
import { apiTestimonialSchema, slugify } from "@/lib/validation";

export const runtime = "nodejs";
export const maxDuration = 60;

const ACCEPTED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png"]);
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

type GeneratedPost = {
  filename: string;
  base64: string;
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const photoEntry = formData.get("photo");
    if (!(photoEntry instanceof File) || photoEntry.size === 0) {
      return NextResponse.json(
        { error: "Foto em falta ou inválida." },
        { status: 400 },
      );
    }
    if (photoEntry.size > MAX_PHOTO_BYTES) {
      return NextResponse.json(
        { error: "A foto não pode exceder 10MB." },
        { status: 400 },
      );
    }
    if (!ACCEPTED_TYPES.has(photoEntry.type.toLowerCase())) {
      return NextResponse.json(
        { error: "Foto deve ser JPG, JPEG ou PNG." },
        { status: 400 },
      );
    }

    const rawValues = {
      name: formData.get("name"),
      role: formData.get("role"),
      affiliation: formData.get("affiliation"),
      quote_pt: formData.get("quote_pt"),
      quote_en: formData.get("quote_en"),
      label_top_pt: formData.get("label_top_pt"),
      label_top_en: formData.get("label_top_en"),
      label_bottom_pt: formData.get("label_bottom_pt"),
      label_bottom_en: formData.get("label_bottom_en"),
    };

    const parsed = apiTestimonialSchema.safeParse(rawValues);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validação falhou.",
          issues: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }
    const values = parsed.data;

    const photoBuffer = Buffer.from(await photoEntry.arrayBuffer());
    const photoMime = photoEntry.type.toLowerCase();
    const photoB64 = `data:${photoMime};base64,${photoBuffer.toString("base64")}`;

    const logoPath = path.join(
      process.cwd(),
      "public",
      "assets",
      "sportrail_logo_white.png",
    );
    const logoBuffer = await readFile(logoPath);
    const logoB64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;

    const slug = slugify(values.name) || "testemunho";

    const ptData: TestimonialLangData = {
      quote: values.quote_pt,
      name: values.name,
      role: values.role,
      affiliation: values.affiliation,
      label_top: values.label_top_pt,
      label_bottom: values.label_bottom_pt,
    };
    const enData: TestimonialLangData = {
      quote: values.quote_en,
      name: values.name,
      role: values.role,
      affiliation: values.affiliation,
      label_top: values.label_top_en,
      label_bottom: values.label_bottom_en,
    };

    const renderJobs = [
      {
        key: "pt_4x5",
        filename: `Sportrail_Testemunho_${slug}_4x5_pt.png`,
        html: buildHtml4x5(ptData, photoB64, logoB64),
        width: 1080,
        height: 1350,
      },
      {
        key: "pt_9x16",
        filename: `Sportrail_Testemunho_${slug}_9x16_pt.png`,
        html: buildHtml9x16(ptData, photoB64, logoB64),
        width: 1080,
        height: 1920,
      },
      {
        key: "en_4x5",
        filename: `Sportrail_Testemunho_${slug}_4x5_en.png`,
        html: buildHtml4x5(enData, photoB64, logoB64),
        width: 1080,
        height: 1350,
      },
      {
        key: "en_9x16",
        filename: `Sportrail_Testemunho_${slug}_9x16_en.png`,
        html: buildHtml9x16(enData, photoB64, logoB64),
        width: 1080,
        height: 1920,
      },
    ] as const;

    const buffers = await renderHtmlBatch(
      renderJobs.map((job) => ({
        html: job.html,
        width: job.width,
        height: job.height,
      })),
    );

    const posts: Record<string, GeneratedPost> = {};
    renderJobs.forEach((job, idx) => {
      posts[job.key] = {
        filename: job.filename,
        base64: buffers[idx].toString("base64"),
      };
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("[/api/generate] failed", error);
    const message =
      error instanceof Error ? error.message : "Erro desconhecido na geração.";
    return NextResponse.json(
      { error: "Falha ao gerar posts.", detail: message },
      { status: 500 },
    );
  }
}
