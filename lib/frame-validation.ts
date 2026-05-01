import { z } from "zod";

export const FRAME_KINDS = ["A", "B", "C"] as const;
export const FRAME_FORMATS = ["9x16", "1x1", "16x9"] as const;

export type FrameKindLiteral = (typeof FRAME_KINDS)[number];
export type FrameFormatLiteral = (typeof FRAME_FORMATS)[number];

export const frameTestimonialSchema = z.object({
  name: z.string().trim().max(60).optional().default(""),
  role: z.string().trim().max(80).optional().default(""),
  affiliation: z.string().trim().max(80).optional().default(""),
  quote_pt: z.string().trim().max(250).optional().default(""),
  quote_en: z.string().trim().max(250).optional().default(""),
});

export const frameSelectionsSchema = z.object({
  moldura: z.enum(FRAME_KINDS),
  formatos: z.array(z.enum(FRAME_FORMATS)).min(1, "Escolhe pelo menos um formato."),
  generic: z.boolean(),
});

export const frameRequestSchema = z
  .object({
    testemunho: frameTestimonialSchema,
    selecoes: frameSelectionsSchema,
  })
  .superRefine((value, ctx) => {
    const { moldura, formatos, generic } = value.selecoes;

    if (moldura === "C") {
      const invalid = formatos.filter((f) => f !== "9x16");
      if (invalid.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["selecoes", "formatos"],
          message: "A moldura C só está disponível em 9:16.",
        });
      }
    }

    if (moldura === "A" && !generic) {
      // Frame A is always generic; force the flag to be ignored, no error needed.
    }

    if (!generic) {
      const t = value.testemunho;
      if (moldura === "B") {
        if (!t.name || !t.role) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["testemunho", "name"],
            message:
              "Para a variante com dados, preenche pelo menos nome e função.",
          });
        }
      }
      if (moldura === "C") {
        if (!t.quote_pt && !t.quote_en) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["testemunho", "quote_pt"],
            message:
              "Para a variante com dados, preenche pelo menos uma das quotes.",
          });
        }
      }
    }
  });

export type FrameRequest = z.infer<typeof frameRequestSchema>;
