"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_LABELS,
  testimonialFormSchema,
  type TestimonialFormValues,
} from "@/lib/validation";
import { PhotoUploader } from "./photo-uploader";

type Props = {
  onSubmit: (values: TestimonialFormValues) => Promise<void> | void;
  submitting: boolean;
  onValuesChange?: (values: {
    name: string;
    role: string;
    affiliation: string;
    quote_pt: string;
    quote_en: string;
  }) => void;
};

const FIELD_LABEL_CLASS =
  "block font-sans text-xs font-bold uppercase tracking-[0.25em] text-sr-grey";
const INPUT_CLASS =
  "mt-2 block w-full rounded-sr border border-sr-border bg-sr-black px-4 py-3 text-sr-cream placeholder:text-sr-grey-dim focus:border-sr-red focus:outline-none focus:ring-1 focus:ring-sr-red";

export function TestimonialForm({ onSubmit, submitting, onValuesChange }: Props) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      role: "",
      affiliation: "",
      quote_pt: "",
      quote_en: "",
      label_top_pt: DEFAULT_LABELS.pt.label_top,
      label_top_en: DEFAULT_LABELS.en.label_top,
      label_bottom_pt: DEFAULT_LABELS.pt.label_bottom,
      label_bottom_en: DEFAULT_LABELS.en.label_bottom,
      photo: undefined as unknown as File,
    },
  });

  const [internalSubmitting, setInternalSubmitting] = useState(false);
  const isBusy = submitting || internalSubmitting;

  const quotePt = useWatch({ control, name: "quote_pt" }) ?? "";
  const quoteEn = useWatch({ control, name: "quote_en" }) ?? "";
  const nameValue = useWatch({ control, name: "name" }) ?? "";
  const roleValue = useWatch({ control, name: "role" }) ?? "";
  const affiliationValue = useWatch({ control, name: "affiliation" }) ?? "";

  const onValuesChangeRef = useRef(onValuesChange);
  useEffect(() => {
    onValuesChangeRef.current = onValuesChange;
  }, [onValuesChange]);

  useEffect(() => {
    onValuesChangeRef.current?.({
      name: nameValue,
      role: roleValue,
      affiliation: affiliationValue,
      quote_pt: quotePt,
      quote_en: quoteEn,
    });
  }, [nameValue, roleValue, affiliationValue, quotePt, quoteEn]);

  function quoteHint(text: string): { label: string; tone: string } {
    const len = text.replace(/\s+/g, " ").trim().length;
    if (len === 0) return { label: "0 / 250", tone: "text-sr-grey-dim" };
    if (len <= 140) return { label: `${len} / 250 · tamanho cheio`, tone: "text-sr-grey" };
    if (len <= 200)
      return {
        label: `${len} / 250 · vai renderizar em tamanho médio`,
        tone: "text-sr-grey",
      };
    if (len <= 250)
      return {
        label: `${len} / 250 · vai renderizar em tamanho compacto`,
        tone: "text-sr-grey",
      };
    return { label: `${len} / 250 · excede o limite`, tone: "text-sr-red" };
  }
  const ptHint = quoteHint(quotePt);
  const enHint = quoteHint(quoteEn);

  const submit = handleSubmit(async (values) => {
    setInternalSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setInternalSubmitting(false);
    }
  });

  return (
    <form onSubmit={submit} className="space-y-10">
      <fieldset className="space-y-6">
        <legend className="font-bebas text-3xl tracking-wider text-sr-cream">
          Dados do testemunho
        </legend>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="name" className={FIELD_LABEL_CLASS}>
              Nome completo
            </label>
            <input
              id="name"
              type="text"
              autoComplete="off"
              className={INPUT_CLASS}
              placeholder="Pedro Ferreira"
              {...register("name")}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-sr-red">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="role" className={FIELD_LABEL_CLASS}>
              Cargo / função
            </label>
            <input
              id="role"
              type="text"
              autoComplete="off"
              className={INPUT_CLASS}
              placeholder="Head of Recruitment"
              {...register("role")}
            />
            {errors.role && (
              <p className="mt-1 text-sm text-sr-red">{errors.role.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="affiliation" className={FIELD_LABEL_CLASS}>
              Afiliação / organização
            </label>
            <input
              id="affiliation"
              type="text"
              autoComplete="off"
              className={INPUT_CLASS}
              placeholder="Nottingham Forest"
              {...register("affiliation")}
            />
            {errors.affiliation && (
              <p className="mt-1 text-sm text-sr-red">
                {errors.affiliation.message}
              </p>
            )}
          </div>
        </div>

        <Controller
          control={control}
          name="photo"
          render={({ field, fieldState }) => (
            <PhotoUploader
              value={field.value as File | undefined}
              onChange={(f) => field.onChange(f)}
              error={fieldState.error?.message}
            />
          )}
        />
      </fieldset>

      <fieldset className="space-y-6">
        <legend className="font-bebas text-3xl tracking-wider text-sr-cream">
          Conteúdo bilingue
        </legend>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <p className="font-bebas text-xl tracking-widest text-sr-red">
              Português
            </p>
            <div>
              <label htmlFor="quote_pt" className={FIELD_LABEL_CLASS}>
                Quote
              </label>
              <textarea
                id="quote_pt"
                rows={5}
                className={INPUT_CLASS}
                placeholder="Formação séria e com impacto…"
                {...register("quote_pt")}
              />
              <p className={`mt-1 text-xs ${ptHint.tone}`}>{ptHint.label}</p>
              {errors.quote_pt && (
                <p className="mt-1 text-sm text-sr-red">
                  {errors.quote_pt.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="label_top_pt" className={FIELD_LABEL_CLASS}>
                Label superior
              </label>
              <input
                id="label_top_pt"
                type="text"
                className={INPUT_CLASS}
                {...register("label_top_pt")}
              />
              {errors.label_top_pt && (
                <p className="mt-1 text-sm text-sr-red">
                  {errors.label_top_pt.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="label_bottom_pt" className={FIELD_LABEL_CLASS}>
                Label inferior
              </label>
              <input
                id="label_bottom_pt"
                type="text"
                className={INPUT_CLASS}
                {...register("label_bottom_pt")}
              />
              {errors.label_bottom_pt && (
                <p className="mt-1 text-sm text-sr-red">
                  {errors.label_bottom_pt.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <p className="font-bebas text-xl tracking-widest text-sr-red">
              English
            </p>
            <div>
              <label htmlFor="quote_en" className={FIELD_LABEL_CLASS}>
                Quote
              </label>
              <textarea
                id="quote_en"
                rows={5}
                className={INPUT_CLASS}
                placeholder="Serious training with real impact…"
                {...register("quote_en")}
              />
              <p className={`mt-1 text-xs ${enHint.tone}`}>{enHint.label}</p>
              {errors.quote_en && (
                <p className="mt-1 text-sm text-sr-red">
                  {errors.quote_en.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="label_top_en" className={FIELD_LABEL_CLASS}>
                Label top
              </label>
              <input
                id="label_top_en"
                type="text"
                className={INPUT_CLASS}
                {...register("label_top_en")}
              />
              {errors.label_top_en && (
                <p className="mt-1 text-sm text-sr-red">
                  {errors.label_top_en.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="label_bottom_en" className={FIELD_LABEL_CLASS}>
                Label bottom
              </label>
              <input
                id="label_bottom_en"
                type="text"
                className={INPUT_CLASS}
                {...register("label_bottom_en")}
              />
              {errors.label_bottom_en && (
                <p className="mt-1 text-sm text-sr-red">
                  {errors.label_bottom_en.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={!isValid || isBusy}
        className="w-full rounded-sr bg-sr-red px-6 py-4 font-bebas text-2xl tracking-widest text-sr-cream transition hover:bg-sr-red-hover disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isBusy ? "A gerar…" : "Gerar os 4 posts"}
      </button>
    </form>
  );
}
