"use client";

import { useEffect, useState } from "react";

export type GeneratedPost = {
  filename: string;
  url: string; // object URL pointing at the PNG blob
};

export type GeneratedPosts = {
  pt_4x5: GeneratedPost;
  pt_9x16: GeneratedPost;
  en_4x5: GeneratedPost;
  en_9x16: GeneratedPost;
};

type Props = {
  posts: GeneratedPosts;
  zipBlob: Blob;
  zipFilename: string;
  onReset: () => void;
};

const ORDER: Array<{ key: keyof GeneratedPosts; label: string }> = [
  { key: "pt_4x5", label: "PT · 4:5 (feed)" },
  { key: "pt_9x16", label: "PT · 9:16 (story)" },
  { key: "en_4x5", label: "EN · 4:5 (feed)" },
  { key: "en_9x16", label: "EN · 9:16 (story)" },
];

function downloadUrl(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function PreviewGrid({ posts, zipBlob, zipFilename, onReset }: Props) {
  const [downloading, setDownloading] = useState(false);

  // Cleanup blob URLs on unmount or when posts change
  useEffect(() => {
    const urls = ORDER.map(({ key }) => posts[key].url);
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [posts]);

  function handleDownloadAll() {
    setDownloading(true);
    try {
      const url = URL.createObjectURL(zipBlob);
      downloadUrl(url, zipFilename);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-bebas text-3xl tracking-wider text-sr-cream">
          Posts gerados
        </h2>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onReset}
            className="rounded-sr border border-sr-border px-4 py-2 font-sans text-xs font-bold uppercase tracking-widest text-sr-grey hover:border-sr-grey-dim hover:text-sr-cream"
          >
            Novo testemunho
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

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {ORDER.map(({ key, label }) => {
          const post = posts[key];
          return (
            <figure
              key={key}
              className="overflow-hidden rounded-sr border border-sr-border bg-sr-card"
            >
              <div className="flex items-center justify-between gap-2 border-b border-sr-border px-4 py-3">
                <figcaption className="font-sans text-xs font-bold uppercase tracking-widest text-sr-grey">
                  {label}
                </figcaption>
                <button
                  type="button"
                  onClick={() => downloadUrl(post.url, post.filename)}
                  className="font-sans text-xs font-bold uppercase tracking-widest text-sr-red hover:text-sr-red-hover"
                >
                  Download
                </button>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.url}
                alt={`${post.filename}`}
                className="block h-auto w-full bg-sr-black"
              />
            </figure>
          );
        })}
      </div>
    </div>
  );
}
