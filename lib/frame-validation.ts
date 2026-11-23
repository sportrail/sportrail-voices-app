import { z } from "zod";

export const FRAME_KINDS = ["A", "B", "C"] as const;
export const FRAME_FORMATS = ["9x16", "1x1", "16x9"] as const;

export type FrameKindLiteral = (typeof FRAME_KINDS)[number];
export type FrameFormatLiteral = (typeof FRAME_FORMATS)[number];

export const frameTestimonialSchema = z.object({
  name: z.string().trim().min(2, "Mínimo 2 caracteres.").max(60, "Máximo 60 caracteres."),
  role: z.string().trim().min(2, "Mínimo 2 caracteres.").max(80, "Máximo 80 caracteres."),
  affiliation: z.string().trim().max(80, "Máximo 80 caracteres.").optional().default(""),
});

export const frameSelectionsSchema = z.object({
  moldura: z.enum(FRAME_KINDS),
  formatos: z.array(z.enum(FRAME_FORMATS)).min(1, "Escolhe pelo menos um formato."),
});

export const frameRequestSchema = z.object({
  testemunho: frameTestimonialSchema,
  selecoes: frameSelectionsSchema,
});

export type FrameRequest = z.infer<typeof frameRequestSchema>;
