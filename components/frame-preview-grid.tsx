"use client";

import { useEffect, useState } from "react";

export type GeneratedFrame = {
  key: string;
  filename: string;
  url: string; // object URL pointing at the PNG blob
};

export type GeneratedFrames = GeneratedFrame[];

type Props = {
  frames: GeneratedFrames;
  zipBlob: Blob;
  onReset: () => void;
};

const DESIGN_LABEL: Record<string, string> = {
  A: "Cinematic",
  B: "Editorial",
  C: "Glass card",
};

function frameLabel(key: string): string {
  const [kind, format, lang] = key.split("_");
  const design = DESIGN_LABEL[kind];
  if (!design || !format || !lang) return key;
  return `${design} · ${format.replace("x", ":")} · ${lang.toUpperCase()}`;
}

function downloadUrl(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function FramePreviewGrid({ frames, zipBlob, onReset }: Props) {
  const [downloading, setDownloading] = useState(false);

  // Cleanup all blob URLs on unmount or when frames change
  useEffect(() => {
    return () => {
      frames.forEach((f) => URL.revokeObjectURL(f.url));
    };
  }, [frames]);

  function handleDownloadAll() {
    setDownloading(true);
    try {
      const url = URL.createObjectURL(zipBlob);
      downloadUrl(url, "Sportrail_Molduras.zip");
      // Revoke after a tick so the browser had time to start the download
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-bebas text-3xl tracking-wider text-sr-cream">
          Molduras geradas
        </h3>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onReset}
            className="rounded-sr border border-sr-border px-4 py-2 font-sans text-xs font-bold uppercase tracking-widest text-sr-grey hover:border-sr-grey-dim hover:text-sr-cream"
          >
            Gerar outra
          </button>
          <button
            type="button"
            onClick={handleDownloadAll}
            disabled={downloading}
            className="rounded-sr bg-sr-red px-4 py-2 font-sans text-xs font-bold uppercase tracking-widest text-sr-cream hover:bg-sr-red-hover disabled:opacity-40"
          >
            {downloading ? "A preparar ZIP…" : "Download all (ZIP)"}
          </button>
        </div>
      </div>

      <p className="text-xs text-sr-grey-dim">
        Os PNGs têm fundo transparente — sobrepõe-nos ao vídeo no editor (Veed,
        CapCut, etc.). Pré-visualização mostra fundo aos quadrados para
        evidenciar a transparência.
      </p>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {frames.map((frame) => (
          <figure
            key={frame.key}
            className="overflow-hidden rounded-sr border border-sr-border bg-sr-card"
          >
            <div className="flex items-center justify-between gap-2 border-b border-sr-border px-4 py-3">
              <figcaption className="font-sans text-xs font-bold uppercase tracking-widest text-sr-grey">
                {frameLabel(frame.key)}
              </figcaption>
              <button
                type="button"
                onClick={() => downloadUrl(frame.url, frame.filename)}
                className="font-sans text-xs font-bold uppercase tracking-widest text-sr-red hover:text-sr-red-hover"
              >
                Download
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={frame.url}
              alt={frame.filename}
              className="block h-auto w-full"
              style={{
                backgroundImage:
                  "linear-gradient(45deg, #1a1924 25%, transparent 25%), linear-gradient(-45deg, #1a1924 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a1924 75%), linear-gradient(-45deg, transparent 75%, #1a1924 75%)",
                backgroundSize: "32px 32px",
                backgroundPosition: "0 0, 0 16px, 16px -16px, -16px 0px",
                backgroundColor: "#0B0A0F",
              }}
            />
          </figure>
        ))}
      </div>
    </div>
  );
}
