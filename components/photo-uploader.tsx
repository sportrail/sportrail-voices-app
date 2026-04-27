"use client";

import { useCallback, useEffect, useState } from "react";

type Props = {
  value: File | undefined;
  onChange: (file: File | undefined) => void;
  error?: string;
};

const ACCEPT = "image/jpeg,image/jpg,image/png";

export function PhotoUploader({ value, onChange, error }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      onChange(files[0]);
    },
    [onChange],
  );

  return (
    <div className="space-y-2">
      <label
        htmlFor="photo-input"
        onDragEnter={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-sr border-2 border-dashed px-6 py-8 text-center transition ${
          dragActive
            ? "border-sr-red bg-sr-card/40"
            : "border-sr-border bg-sr-card/20 hover:border-sr-grey-dim"
        }`}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Pré-visualização da foto"
            className="mb-4 h-40 w-40 rounded-sr object-cover"
          />
        ) : (
          <div className="mb-3 font-bebas text-3xl tracking-wider text-sr-cream">
            Foto do testemunho
          </div>
        )}
        <p className="text-sm text-sr-grey">
          {value
            ? value.name
            : "Arrasta uma imagem para aqui ou clica para escolher"}
        </p>
        <p className="mt-1 text-xs text-sr-grey-dim">JPG, JPEG ou PNG · máx. 10MB</p>
        <input
          id="photo-input"
          type="file"
          accept={ACCEPT}
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>
      {value && (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="text-xs uppercase tracking-widest text-sr-grey hover:text-sr-red"
        >
          Remover foto
        </button>
      )}
      {error && <p className="text-sm text-sr-red">{error}</p>}
    </div>
  );
}
