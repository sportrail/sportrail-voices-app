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

const KEY_LABEL: Record<string, string> = {
  A_9x16_pt: "Moldura A · 9:16 · PT",
  A_9x16_en: "Moldura A · 9:16 · EN",
  A_1x1_pt: "Moldura A · 1:1 · PT",
  A_1x1_en: "Moldura A · 1:1 · EN",
  A_16x9_pt: "Moldura A · 16:9 · PT",
  A_16x9_en: "Moldura A · 16:9 · EN",
  B_9x16_pt: "Moldura B · 9:16 · PT",
  B_9x16_en: "Moldura B · 9:16 · EN",
  B_1x1_pt: "Moldura B · 1:1 · PT",
  B_1x1_en: "Moldura B · 1:1 · EN",
  B_16x9_pt: "Moldura B · 16:9 · PT",
  B_16x9_en: "Moldura B · 16:9 · EN",
  C_9x16_pt: "Moldura C · 9:16 · PT",
  C_9x16_en: "Moldura C · 9:16 · EN",
};

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
                {KEY_LABEL[frame.key] ?? frame.key}
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
