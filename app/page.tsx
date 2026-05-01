"use client";

import { useState } from "react";
import { TestimonialForm } from "@/components/testimonial-form";
import JSZip from "jszip";
import {
  PreviewGrid,
  type GeneratedPosts,
} from "@/components/preview-grid";
import { FrameSection } from "@/components/frame-section";
import type { TestimonialFormValues } from "@/lib/validation";

type State =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; posts: GeneratedPosts; zipBlob: Blob; zipFilename: string }
  | { kind: "error"; message: string };

type SharedTestimonial = {
  name: string;
  role: string;
  affiliation: string;
  quote_pt: string;
  quote_en: string;
};

const EMPTY_TESTIMONIAL: SharedTestimonial = {
  name: "",
  role: "",
  affiliation: "",
  quote_pt: "",
  quote_en: "",
};

export default function HomePage() {
  const [state, setState] = useState<State>({ kind: "idle" });
  const [shared, setShared] = useState<SharedTestimonial>(EMPTY_TESTIMONIAL);

  async function handleSubmit(values: TestimonialFormValues) {
    setState({ kind: "submitting" });

    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("role", values.role);
    formData.append("affiliation", values.affiliation);
    formData.append("quote_pt", values.quote_pt);
    formData.append("quote_en", values.quote_en);
    formData.append("label_top_pt", values.label_top_pt);
    formData.append("label_top_en", values.label_top_en);
    formData.append("label_bottom_pt", values.label_bottom_pt);
    formData.append("label_bottom_en", values.label_bottom_en);
    formData.append("photo", values.photo);

    try {
      const response = await fetch("/api/generate?as=zip", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const detail = await response.json().catch(() => ({}));
        const message =
          detail.error ?? `Erro ${response.status} ao gerar os posts.`;
        setState({ kind: "error", message });
        return;
      }

      // Server returned application/zip with all 4 PNGs.
      const zipBlob = await response.blob();
      const manifestHeader = response.headers.get("X-Post-Manifest");
      type ManifestEntry = { key: keyof GeneratedPosts; filename: string };
      const manifest: ManifestEntry[] = manifestHeader
        ? (JSON.parse(manifestHeader) as ManifestEntry[])
        : [];
      const disposition = response.headers.get("Content-Disposition") ?? "";
      const fnameMatch = disposition.match(/filename="?([^";]+)"?/);
      const zipFilename = fnameMatch?.[1] ?? "Sportrail_Testemunho.zip";

      const zip = await JSZip.loadAsync(zipBlob);
      const partial: Partial<GeneratedPosts> = {};
      for (const entry of manifest) {
        const file = zip.file(entry.filename);
        if (!file) continue;
        const pngBlob = await file.async("blob");
        const url = URL.createObjectURL(
          new Blob([pngBlob], { type: "image/png" }),
        );
        partial[entry.key] = { filename: entry.filename, url };
      }
      const posts = partial as GeneratedPosts;
      setState({ kind: "success", posts, zipBlob, zipFilename });
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

  function reset() {
    setState({ kind: "idle" });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-16">
      <header className="mb-10">
        <p className="font-sans text-xs font-bold uppercase tracking-[0.3em] text-sr-red">
          Sportrail · Interno
        </p>
        <h1 className="mt-3 font-bebas text-5xl leading-none tracking-wide text-sr-black md:text-6xl">
          Gerador de Posts — Campanha 10 Anos
        </h1>
        <p className="mt-4 max-w-2xl text-base text-sr-grey-dim md:text-lg">
          Preenche os dados do testemunho, escolhe a foto, e em 25 segundos tens
          os 4 posts prontos para publicar.
        </p>
      </header>

      <section className="rounded-sr bg-sr-black p-8 text-sr-cream shadow-lg md:p-10">
        {state.kind === "success" ? (
          <PreviewGrid
            posts={state.posts}
            zipBlob={state.zipBlob}
            zipFilename={state.zipFilename}
            onReset={reset}
          />
        ) : (
          <>
            <TestimonialForm
              onSubmit={handleSubmit}
              submitting={state.kind === "submitting"}
              onValuesChange={setShared}
            />

            {state.kind === "submitting" && (
              <div className="mt-6 rounded-sr border border-sr-border bg-sr-card p-4 text-sm text-sr-grey">
                A gerar os 4 posts… isto demora cerca de 25 segundos. Não fechar
                esta página.
              </div>
            )}

            {state.kind === "error" && (
              <div className="mt-6 space-y-3 rounded-sr border border-sr-red bg-sr-card p-4 text-sm text-sr-cream">
                <p>{state.message}</p>
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-sr bg-sr-red px-4 py-2 font-sans text-xs font-bold uppercase tracking-widest text-sr-cream hover:bg-sr-red-hover"
                >
                  Tentar de novo
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <section className="mt-10 rounded-sr bg-sr-black p-8 text-sr-cream shadow-lg md:p-10">
        <FrameSection testimonial={shared} />
      </section>

      <footer className="mt-10 text-center text-xs uppercase tracking-[0.25em] text-sr-grey-dim">
        Sportrail · 10 Anos · 2016—2026
      </footer>
    </main>
  );
}
