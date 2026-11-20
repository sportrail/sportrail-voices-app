import { FONTS_INLINE_STYLE } from "./fonts-inline";

export type FrameKind = "A" | "B" | "C";
export type FrameFormat = "9x16" | "1x1" | "16x9";
export type FrameLanguage = "pt" | "en";

export type FrameDimensions = { width: number; height: number };

export const FRAME_DIMENSIONS: Record<FrameFormat, FrameDimensions> = {
  "9x16": { width: 1080, height: 1920 },
  "1x1": { width: 1080, height: 1080 },
  "16x9": { width: 1920, height: 1080 },
};

export type FrameContent = {
  name: string;
  role: string;
  affiliation?: string;
};

export type FrameBuildArgs = {
  kind: FrameKind;
  format: FrameFormat;
  language: FrameLanguage;
  content: FrameContent;
  logoB64: string;
};

const RED = "#E8121B";
const RED_TEXT = "#F04248";

const TAGS: Record<FrameKind, Record<FrameLanguage, string>> = {
  A: { pt: "10 Anos · 2016—2026", en: "10 Years · 2016—2026" },
  B: { pt: "Testemunho · 10 Anos", en: "Testimonial · 10 Years" },
  C: { pt: "10 Anos · 2016—2026", en: "10 Years · 2016—2026" },
};

// Average Bebas Neue advance for real names, measured at 100px with 2px tracking.
const BEBAS_EM_PER_CHAR = 0.42;
const MIN_NAME_SCALE = 0.55;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function fitNameSize(name: string, base: number, available: number): number {
  const chars = Math.max(name.length, 1);
  const fit = Math.floor(available / (chars * BEBAS_EM_PER_CHAR));
  return Math.max(Math.round(base * MIN_NAME_SCALE), Math.min(base, fit));
}

type Text = { name: string; nameRaw: string; roleLine: string; tag: string };

function textFor(args: FrameBuildArgs): Text {
  const name = args.content.name.trim();
  const role = args.content.role.trim();
  const affiliation = (args.content.affiliation ?? "").trim();
  return {
    name: escapeHtml(name),
    nameRaw: name,
    roleLine: escapeHtml(affiliation ? `${role} · ${affiliation}` : role),
    tag: escapeHtml(TAGS[args.kind][args.language]),
  };
}

function page(width: number, height: number, css: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
${FONTS_INLINE_STYLE}
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; background: transparent; overflow: hidden; font-family: 'DM Sans', sans-serif; color: #fff; }
  .f { position: absolute; inset: 0; }
  .name { font-family: 'Bebas Neue', sans-serif; font-weight: 400; line-height: .9; letter-spacing: 2px; overflow-wrap: anywhere; }
  .role { font-weight: 400; color: rgba(255,255,255,.82); }
  .tag { font-weight: 700; text-transform: uppercase; white-space: nowrap; }
${css}
</style>
</head>
<body><div class="f">${body}</div></body>
</html>`;
}

type CinematicGeometry = {
  topScrim: number;
  bottomScrim: number;
  side: number;
  logoTop: number;
  logoHeight: number;
  tagTop: number;
  tagSize: number;
  tagTracking: number;
  blockBottom: number;
  blockMaxWidth: number;
  ruleWidth: number;
  ruleGap: number;
  name: number;
  role: number;
  roleGap: number;
};

const CINEMATIC: Record<FrameFormat, CinematicGeometry> = {
  "9x16": { topScrim: 300, bottomScrim: 820, side: 64, logoTop: 64, logoHeight: 52, tagTop: 80, tagSize: 20, tagTracking: 7, blockBottom: 350, blockMaxWidth: 952, ruleWidth: 72, ruleGap: 28, name: 132, role: 38, roleGap: 14 },
  "1x1": { topScrim: 240, bottomScrim: 540, side: 64, logoTop: 56, logoHeight: 50, tagTop: 70, tagSize: 18, tagTracking: 6, blockBottom: 72, blockMaxWidth: 952, ruleWidth: 64, ruleGap: 24, name: 112, role: 34, roleGap: 12 },
  "16x9": { topScrim: 220, bottomScrim: 520, side: 96, logoTop: 64, logoHeight: 52, tagTop: 80, tagSize: 20, tagTracking: 7, blockBottom: 88, blockMaxWidth: 1200, ruleWidth: 72, ruleGap: 26, name: 120, role: 36, roleGap: 12 },
};

function buildCinematic(args: FrameBuildArgs): string {
  const { width, height } = FRAME_DIMENSIONS[args.format];
  const g = CINEMATIC[args.format];
  const t = textFor(args);
  const blockWidth = Math.min(g.blockMaxWidth, width - 2 * g.side);
  const nameSize = fitNameSize(t.nameRaw, g.name, blockWidth);
  const css = `
  .top { position: absolute; inset: 0 0 auto 0; height: ${g.topScrim}px; background: linear-gradient(#000a, #0000); }
  .bot { position: absolute; inset: auto 0 0 0; height: ${g.bottomScrim}px; background: linear-gradient(#0000, #000c 55%, #000e); }
  .logo { position: absolute; top: ${g.logoTop}px; left: ${g.side}px; height: ${g.logoHeight}px; opacity: .95; }
  .tag { position: absolute; top: ${g.tagTop}px; right: ${g.side}px; font-size: ${g.tagSize}px; letter-spacing: ${g.tagTracking}px; color: rgba(255,255,255,.85); }
  .blk { position: absolute; left: ${g.side}px; bottom: ${g.blockBottom}px; width: ${blockWidth}px; }
  .rule { width: ${g.ruleWidth}px; height: 4px; background: ${RED}; margin-bottom: ${g.ruleGap}px; }
  .name { font-size: ${nameSize}px; }
  .role { font-size: ${g.role}px; margin-top: ${g.roleGap}px; }`;
  const body = `<div class="top"></div><div class="bot"></div>
<img class="logo" src="${args.logoB64}" alt="Sportrail">
<div class="tag">${t.tag}</div>
<div class="blk"><div class="rule"></div><div class="name">${t.name}</div><div class="role">${t.roleLine}</div></div>`;
  return page(width, height, css, body);
}

type EditorialGeometry = {
  bottomScrim: number;
  inset: number;
  logoTop: number;
  logoHeight: number;
  blockBottom: number;
  blockPadding: number;
  tagSize: number;
  tagTracking: number;
  tagGap: number;
  name: number;
  role: number;
  roleGap: number;
};

const EDITORIAL: Record<FrameFormat, EditorialGeometry> = {
  "9x16": { bottomScrim: 900, inset: 36, logoTop: 84, logoHeight: 50, blockBottom: 350, blockPadding: 80, tagSize: 21, tagTracking: 7, tagGap: 22, name: 120, role: 36, roleGap: 12 },
  "1x1": { bottomScrim: 600, inset: 32, logoTop: 72, logoHeight: 50, blockBottom: 96, blockPadding: 80, tagSize: 19, tagTracking: 6, tagGap: 18, name: 104, role: 32, roleGap: 10 },
  "16x9": { bottomScrim: 560, inset: 36, logoTop: 76, logoHeight: 50, blockBottom: 100, blockPadding: 200, tagSize: 20, tagTracking: 7, tagGap: 20, name: 112, role: 34, roleGap: 12 },
};

function buildEditorial(args: FrameBuildArgs): string {
  const { width, height } = FRAME_DIMENSIONS[args.format];
  const g = EDITORIAL[args.format];
  const t = textFor(args);
  const nameSize = fitNameSize(t.nameRaw, g.name, width - 2 * g.blockPadding);
  const css = `
  .bot { position: absolute; inset: auto 0 0 0; height: ${g.bottomScrim}px; background: linear-gradient(#0000, #000d 60%); }
  .bd { position: absolute; inset: ${g.inset}px; border: 2px solid rgba(255,255,255,.55); border-radius: 6px; }
  .ft { position: absolute; left: 0; right: 0; top: ${g.logoTop}px; text-align: center; }
  .ft img { height: ${g.logoHeight}px; }
  .blk { position: absolute; left: 0; right: 0; bottom: ${g.blockBottom}px; padding: 0 ${g.blockPadding}px; text-align: center; }
  .tag { color: ${RED_TEXT}; font-size: ${g.tagSize}px; letter-spacing: ${g.tagTracking}px; margin-bottom: ${g.tagGap}px; }
  .name { font-size: ${nameSize}px; }
  .role { font-size: ${g.role}px; margin-top: ${g.roleGap}px; }`;
  const body = `<div class="bot"></div><div class="bd"></div>
<div class="ft"><img src="${args.logoB64}" alt="Sportrail"></div>
<div class="blk"><div class="tag">${t.tag}</div><div class="name">${t.name}</div><div class="role">${t.roleLine}</div></div>`;
  return page(width, height, css, body);
}

type GlassGeometry = {
  topScrim: number;
  side: number;
  logoTop: number;
  logoHeight: number;
  tagTop: number;
  tagSize: number;
  tagTracking: number;
  cardLeft: number;
  // null = card hugs its content (lower third), capped at cardMaxWidth.
  cardRight: number | null;
  cardMaxWidth: number;
  cardMinWidth: number;
  cardBottom: number;
  padding: [number, number, number];
  radius: number;
  gap: number;
  name: number;
  role: number;
  roleGap: number;
};

const GLASS: Record<FrameFormat, GlassGeometry> = {
  "9x16": { topScrim: 260, side: 64, logoTop: 64, logoHeight: 50, tagTop: 79, tagSize: 20, tagTracking: 7, cardLeft: 56, cardRight: 56, cardMaxWidth: 968, cardMinWidth: 0, cardBottom: 350, padding: [38, 44, 40], radius: 28, gap: 36, name: 104, role: 34, roleGap: 10 },
  "1x1": { topScrim: 220, side: 64, logoTop: 56, logoHeight: 50, tagTop: 69, tagSize: 18, tagTracking: 6, cardLeft: 56, cardRight: 56, cardMaxWidth: 968, cardMinWidth: 0, cardBottom: 64, padding: [32, 40, 34], radius: 26, gap: 30, name: 92, role: 30, roleGap: 8 },
  "16x9": { topScrim: 220, side: 96, logoTop: 64, logoHeight: 50, tagTop: 79, tagSize: 20, tagTracking: 7, cardLeft: 88, cardRight: null, cardMaxWidth: 1100, cardMinWidth: 560, cardBottom: 80, padding: [34, 44, 36], radius: 28, gap: 32, name: 96, role: 32, roleGap: 8 },
};

function buildGlass(args: FrameBuildArgs): string {
  const { width, height } = FRAME_DIMENSIONS[args.format];
  const g = GLASS[args.format];
  const t = textFor(args);
  const [padTop, padX, padBottom] = g.padding;
  const cardWidth =
    g.cardRight === null ? g.cardMaxWidth : width - g.cardLeft - g.cardRight;
  const nameSize = fitNameSize(t.nameRaw, g.name, cardWidth - 2 * padX - 6 - g.gap - 3);
  const horizontal =
    g.cardRight === null
      ? `left: ${g.cardLeft}px; max-width: ${g.cardMaxWidth}px; min-width: ${g.cardMinWidth}px;`
      : `left: ${g.cardLeft}px; right: ${g.cardRight}px;`;
  const css = `
  .top { position: absolute; inset: 0 0 auto 0; height: ${g.topScrim}px; background: linear-gradient(#0009, #0000); }
  .logo { position: absolute; top: ${g.logoTop}px; left: ${g.side}px; height: ${g.logoHeight}px; }
  .tag { position: absolute; top: ${g.tagTop}px; right: ${g.side}px; font-size: ${g.tagSize}px; letter-spacing: ${g.tagTracking}px; color: rgba(255,255,255,.85); }
  .card { position: absolute; ${horizontal} bottom: ${g.cardBottom}px; padding: ${padTop}px ${padX}px ${padBottom}px; border-radius: ${g.radius}px; background: rgba(11,10,15,.62); border: 1.5px solid rgba(255,255,255,.16); box-shadow: 0 30px 80px rgba(0,0,0,.45); display: flex; align-items: center; gap: ${g.gap}px; }
  .bar { width: 6px; flex: none; align-self: stretch; border-radius: 3px; background: ${RED}; }
  .name { font-size: ${nameSize}px; }
  .role { font-size: ${g.role}px; margin-top: ${g.roleGap}px; }`;
  const body = `<div class="top"></div>
<img class="logo" src="${args.logoB64}" alt="Sportrail">
<div class="tag">${t.tag}</div>
<div class="card"><div class="bar"></div><div><div class="name">${t.name}</div><div class="role">${t.roleLine}</div></div></div>`;
  return page(width, height, css, body);
}

export function buildFrameHtml(args: FrameBuildArgs): string {
  switch (args.kind) {
    case "A":
      return buildCinematic(args);
    case "B":
      return buildEditorial(args);
    case "C":
      return buildGlass(args);
  }
}
