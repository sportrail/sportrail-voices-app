import { z } from "zod";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"] as const;
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

export const DEFAULT_LABELS = {
  pt: {
    label_top: "TESTEMUNHO",
    label_bottom: "SPORTRAIL · 10 ANOS · 2016—2026",
  },
  en: {
    label_top: "TESTIMONIAL",
    label_bottom: "SPORTRAIL · 10 YEARS · 2016—2026",
  },
} as const;

const photoFileSchema = z
  .instanceof(File, { message: "A foto é obrigatória." })
  .refine((f) => f.size > 0, { message: "A foto é obrigatória." })
  .refine((f) => f.size <= MAX_PHOTO_BYTES, {
    message: "A foto não pode exceder 10MB.",
  })
  .refine(
    (f) =>
      (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(f.type.toLowerCase()),
    { message: "A foto deve ser .jpg, .jpeg ou .png." },
  );

export const testimonialFormSchema = z.object({
  name: z.string().trim().min(2, "Mínimo 2 caracteres.").max(60, "Máximo 60 caracteres."),
  role: z.string().trim().min(2, "Mínimo 2 caracteres.").max(80, "Máximo 80 caracteres."),
  affiliation: z.string().trim().min(2, "Mínimo 2 caracteres.").max(80, "Máximo 80 caracteres."),
  quote_pt: z.string().trim().min(20, "Mínimo 20 caracteres.").max(250, "Máximo 250 caracteres."),
  quote_en: z.string().trim().min(20, "Mínimo 20 caracteres.").max(250, "Máximo 250 caracteres."),
  label_top_pt: z.string().trim().min(1, "Obrigatório.").max(40, "Máximo 40 caracteres."),
  label_top_en: z.string().trim().min(1, "Obrigatório.").max(40, "Máximo 40 caracteres."),
  label_bottom_pt: z.string().trim().min(1, "Obrigatório.").max(80, "Máximo 80 caracteres."),
  label_bottom_en: z.string().trim().min(1, "Obrigatório.").max(80, "Máximo 80 caracteres."),
  photo: photoFileSchema,
});

export type TestimonialFormValues = z.infer<typeof testimonialFormSchema>;

export const apiTestimonialSchema = testimonialFormSchema.omit({ photo: true });
export type ApiTestimonialValues = z.infer<typeof apiTestimonialSchema>;

export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}
