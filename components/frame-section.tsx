"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FramePreviewGrid,
  type GeneratedFrames,
} from "./frame-preview-grid";

type FrameKind = "A" | "B" | "C";
type FrameFormat = "9x16" | "1x1" | "16x9";

type State =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; frames: GeneratedFrames }
  | { kind: "error"; message: string };

type FrameTestimonialContent = {
  name?: string;
  role?: string;
  affiliation?: string;
  quote_pt?: string;
  quote_en?: string;
};

type Props = {
  testimonial: FrameTestimonialContent;
};

const FRAME_OPTIONS: Array<{
  value: FrameKind;
  title: string;
  description: string;
}> = [
  {
    value: "A",
    title: "A — Simétrica",
    description:
      "Header com label e aspa decorativa, footer com logo. Sempre genérica.",
  },
  {
    value: "B",
    title: "B — Com nome + função",
    description:
      "Header fino, footer com banda de nome/função e logo Sportrail.",
  },
  {
    value: "C",
    title: "C — Vídeo + quote (só 9:16)",
    description:
      "Vídeo na metade superior, quote escrita na metade inferior — funciona sem som.",
  },
];

const FORMAT_OPTIONS: Array<{ value: FrameFormat; label: string }> = [
  { value: "9x16", label: "9:16" },
  { value: "1x1", label: "1:1" },
  { value: "16x9", label: "16:9" },
];

const SECTION_LEGEND = "font-bebas text-3xl tracking-wider text-sr-cream";
const FIELD_LABEL =
  "block font-sans text-xs font-bold uppercase tracking-[0.25em] text-sr-grey";

export function FrameSection({ testimonial }: Props) {
  const [kind, setKind] = useState<FrameKind>("A");
  const [formats, setFormats] = useState<Set<FrameFormat>>(
    () => new Set(["9x16"]),
  );
  const [generic, setGeneric] = useState(false);
  const [state, setState] = useState<State>({ kind: "idle" });

  const isC = kind === "C";
  const isA = kind === "A";
  const effectiveGeneric = isA ? true : generic;

  useEffect(() => {
    if (isC) {
      setFormats((prev) => {
        if (prev.size === 1 && prev.has("9x16")) return prev;
        return new Set(["9x16"]);
      });
    }
  }, [isC]);

  function toggleFormat(format: FrameFormat) {
    if (isC && format !== "9x16") return;
    setFormats((prev) => {
      const next = new Set(prev);
      if (next.has(format)) {
        if (next.size === 1) return prev;
        next.delete(format);
      } else {
        next.add(format);
      }
      return next;
    });
  }

  const validationError = useMemo(() => {
    if (effectiveGeneric) return null;
    if (kind === "B") {
      if (!testimonial.name?.trim() || !testimonial.role?.trim()) {
        return "Para a variante com dados, preenche pelo menos nome e função em cima.";
      }
    }
    if (kind === "C") {
      if (
        !testimonial.quote_pt?.trim() &&
        !testimonial.quote_en?.trim()
      ) {
        return "Para a variante com dados, preenche pelo menos uma quote em cima.";
      }
    }
    return null;
  }, [effectiveGeneric, kind, testimonial]);

  const canSubmit =
    !validationError && state.kind !== "submitting" && formats.size > 0;

  async function handleSubmit() {
    setState({ kind: "submitting" });
    try {
      const response = await fetch("/api/generate-frames", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testemunho: {
            name: testimonial.name ?? "",
            role: testimonial.role ?? "",
            affiliation: testimonial.affiliation ?? "",
            quote_pt: testimonial.quote_pt ?? "",
            quote_en: testimonial.quote_en ?? "",
          },
          selecoes: {
            moldura: kind,
            formatos: Array.from(formats),
            generic: effectiveGeneric,
          },
        }),
      });

      if (!response.ok) {
        const detail = await response.json().catch(() => ({}));
        const message =
          detail.error ?? `Erro ${response.status} ao gerar molduras.`;
        setState({ kind: "error", message });
        return;
      }

      const data = (await response.json()) as { frames: GeneratedFrames };
      setState({ kind: "success", frames: data.frames });
    } catch (error) {
      setState({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "Falha de rede ao contactar o servidor.",
      });
    }
  }

  if (state.kind === "success") {
    return (
      <FramePreviewGrid
        frames={state.frames}
        onReset={() => setState({ kind: "idle" })}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className={SECTION_LEGEND}>Molduras para vídeo</h2>
        <p className="mt-2 max-w-2xl text-sm text-sr-grey">
          PNGs transparentes para sobrepor a vídeo no editor (Veed, CapCut). A
          app gera só a moldura — o vídeo é montado fora.
        </p>
      </div>

      <fieldset className="space-y-3">
        <legend className={FIELD_LABEL}>Estilo de moldura</legend>
        <div className="grid gap-3 md:grid-cols-3">
          {FRAME_OPTIONS.map((opt) => {
            const selected = kind === opt.value;
            return (
              <label
                key={opt.value}
                className={`flex cursor-pointer flex-col gap-1 rounded-sr border p-4 transition ${
                  selected
                    ? "border-sr-red bg-sr-card"
                    : "border-sr-border bg-sr-card/40 hover:border-sr-grey-dim"
                }`}
              >
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="frame-kind"
                    value={opt.value}
                    checked={selected}
                    onChange={() => setKind(opt.value)}
                    className="accent-sr-red"
                  />
                  <span className="font-bebas text-xl tracking-widest text-sr-cream">
                    {opt.title}
                  </span>
                </span>
                <span className="text-xs text-sr-grey-dim">
                  {opt.description}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className={FIELD_LABEL}>Formatos a gerar</legend>
        <div className="flex flex-wrap gap-3">
          {FORMAT_OPTIONS.map((opt) => {
            const disabled = isC && opt.value !== "9x16";
            const checked = formats.has(opt.value);
            return (
              <label
                key={opt.value}
                title={
                  disabled
                    ? "A moldura C só está disponível em 9:16."
                    : undefined
                }
                className={`inline-flex items-center gap-2 rounded-sr border px-4 py-2 text-sm font-bold uppercase tracking-widest ${
                  disabled
                    ? "cursor-not-allowed border-sr-border bg-sr-card/30 text-sr-grey-dim opacity-50"
                    : checked
                      ? "cursor-pointer border-sr-red bg-sr-card text-sr-cream"
                      : "cursor-pointer border-sr-border bg-sr-card/40 text-sr-grey hover:border-sr-grey-dim"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggleFormat(opt.value)}
                  className="accent-sr-red"
                />
                {opt.label}
              </label>
            );
          })}
        </div>
        <p className="text-xs text-sr-grey-dim">
          Cada formato é gerado em PT e EN.
        </p>
      </fieldset>

      {!isA && (
        <fieldset className="space-y-3">
          <legend className={FIELD_LABEL}>Variante</legend>
          <div className="flex flex-wrap gap-3">
            <label
              className={`inline-flex cursor-pointer items-center gap-2 rounded-sr border px-4 py-2 text-sm font-bold uppercase tracking-widest ${
                !generic
                  ? "border-sr-red bg-sr-card text-sr-cream"
                  : "border-sr-border bg-sr-card/40 text-sr-grey hover:border-sr-grey-dim"
              }`}
            >
              <input
                type="radio"
                name="frame-variant"
                checked={!generic}
                onChange={() => setGeneric(false)}
                className="accent-sr-red"
              />
              Com dados do testemunho
            </label>
            <label
              className={`inline-flex cursor-pointer items-center gap-2 rounded-sr border px-4 py-2 text-sm font-bold uppercase tracking-widest ${
                generic
                  ? "border-sr-red bg-sr-card text-sr-cream"
                  : "border-sr-border bg-sr-card/40 text-sr-grey hover:border-sr-grey-dim"
              }`}
            >
              <input
                type="radio"
                name="frame-variant"
                checked={generic}
                onChange={() => setGeneric(true)}
                className="accent-sr-red"
              />
              Genérica (sem nome/quote)
            </label>
          </div>
        </fieldset>
      )}

      {validationError && (
        <div className="rounded-sr border border-sr-border bg-sr-card p-3 text-xs text-sr-grey">
          {validationError}
        </div>
      )}

      {state.kind === "error" && (
        <div className="rounded-sr border border-sr-red bg-sr-card p-3 text-sm text-sr-cream">
          {state.message}
        </div>
      )}

      {state.kind === "submitting" && (
        <div className="rounded-sr border border-sr-border bg-sr-card p-3 text-xs text-sr-grey">
          A gerar molduras… isto demora cerca de 15-25 segundos.
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full rounded-sr bg-sr-red px-6 py-4 font-bebas text-2xl tracking-widest text-sr-cream transition hover:bg-sr-red-hover disabled:cursor-not-allowed disabled:opacity-40"
      >
        {state.kind === "submitting" ? "A gerar…" : "Gerar molduras"}
      </button>
    </div>
  );
}
