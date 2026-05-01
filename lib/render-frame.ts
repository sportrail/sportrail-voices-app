export type FrameKind = "A" | "B" | "C";
export type FrameFormat = "9x16" | "1x1" | "16x9";

export type FrameDimensions = { width: number; height: number };

export const FRAME_DIMENSIONS: Record<FrameFormat, FrameDimensions> = {
  "9x16": { width: 1080, height: 1920 },
  "1x1": { width: 1080, height: 1080 },
  "16x9": { width: 1920, height: 1080 },
};

export type FrameContent = {
  name?: string;
  role?: string;
  affiliation?: string;
  quote_pt?: string;
  quote_en?: string;
};

export type FrameBuildArgs = {
  kind: FrameKind;
  format: FrameFormat;
  generic: boolean;
  content: FrameContent;
  language: "pt" | "en";
  logoB64: string;
};

const PLACEHOLDER_NAME = "— NOME —";
const PLACEHOLDER_ROLE = "— FUNÇÃO —";
const PLACEHOLDER_AFFILIATION = "— ORGANIZAÇÃO —";
const PLACEHOLDER_QUOTE_PT =
  "— A frase do testemunho aparece aqui quando preencheres o formulário. —";
const PLACEHOLDER_QUOTE_EN =
  "— The testimonial quote appears here once you fill out the form. —";

const LABEL_TOP = {
  pt: "TESTEMUNHO",
  en: "TESTIMONIAL",
};

const LABEL_TOP_LONG = {
  pt: "TESTEMUNHO · SPORTRAIL 10 ANOS",
  en: "TESTIMONIAL · SPORTRAIL 10 YEARS",
};

const LABEL_BOTTOM = {
  pt: "10 ANOS · 2016—2026",
  en: "10 YEARS · 2016—2026",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normaliseQuote(value: string): string {
  return value.replace(/\s*\r?\n\s*/g, " ").replace(/[ \t]+/g, " ").trim();
}

const FONTS_LINK = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">`;

const BASE_RESET = `* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { background: transparent; font-family: 'DM Sans', sans-serif; }`;

type FrameAGeometry = {
  bandTop: number;
  bandBottom: number;
  labelSize: number;
  labelLetter: number;
  logoWidth: number;
  anniversarySize: number;
  anniversaryLetter: number;
  paddingX: number;
  quoteMarkSize: number;
  quoteMarkRight: number;
  quoteMarkTop: number;
};

const FRAME_A_GEOM: Record<FrameFormat, FrameAGeometry> = {
  "9x16": {
    bandTop: 200,
    bandBottom: 240,
    labelSize: 22,
    labelLetter: 7,
    logoWidth: 320,
    anniversarySize: 16,
    anniversaryLetter: 4,
    paddingX: 80,
    quoteMarkSize: 240,
    quoteMarkRight: 80,
    quoteMarkTop: 30,
  },
  "1x1": {
    bandTop: 150,
    bandBottom: 170,
    labelSize: 20,
    labelLetter: 6,
    logoWidth: 260,
    anniversarySize: 14,
    anniversaryLetter: 3,
    paddingX: 70,
    quoteMarkSize: 180,
    quoteMarkRight: 70,
    quoteMarkTop: 20,
  },
  "16x9": {
    bandTop: 130,
    bandBottom: 150,
    labelSize: 20,
    labelLetter: 6,
    logoWidth: 260,
    anniversarySize: 14,
    anniversaryLetter: 3,
    paddingX: 90,
    quoteMarkSize: 160,
    quoteMarkRight: 90,
    quoteMarkTop: 20,
  },
};

function buildFrameA(args: FrameBuildArgs): string {
  const { width, height } = FRAME_DIMENSIONS[args.format];
  const g = FRAME_A_GEOM[args.format];
  const labelTop = escapeHtml(LABEL_TOP[args.language]);
  const labelBottom = escapeHtml(LABEL_BOTTOM[args.language]);

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
${FONTS_LINK}
<style>
  ${BASE_RESET}
  html, body { width: ${width}px; height: ${height}px; overflow: hidden; }
  .frame {
    width: ${width}px;
    height: ${height}px;
    position: relative;
  }
  .band {
    position: absolute;
    left: 0;
    right: 0;
    background: #0B0A0F;
    color: #FAF8F5;
    display: flex;
    align-items: center;
    padding: 0 ${g.paddingX}px;
    overflow: hidden;
  }
  .band-top {
    top: 0;
    height: ${g.bandTop}px;
    border-bottom: 4px solid #ED1C24;
  }
  .band-bottom {
    bottom: 0;
    height: ${g.bandBottom}px;
    border-top: 4px solid #ED1C24;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  .label-top {
    font-family: 'DM Sans', sans-serif;
    font-size: ${g.labelSize}px;
    font-weight: 700;
    letter-spacing: ${g.labelLetter}px;
    color: #FAF8F5;
    text-transform: uppercase;
    position: relative;
    z-index: 2;
  }
  .quote-mark {
    font-family: 'Bebas Neue', sans-serif;
    font-size: ${g.quoteMarkSize}px;
    line-height: 0.7;
    color: #ED1C24;
    opacity: 0.55;
    position: absolute;
    right: ${g.quoteMarkRight}px;
    top: ${g.quoteMarkTop}px;
    pointer-events: none;
    z-index: 1;
  }
  .brand-logo {
    width: ${g.logoWidth}px;
    height: auto;
    display: block;
  }
  .brand-anniversary {
    font-family: 'DM Sans', sans-serif;
    font-size: ${g.anniversarySize}px;
    font-weight: 400;
    letter-spacing: ${g.anniversaryLetter}px;
    color: #AAAAAA;
    margin-top: 14px;
    text-transform: uppercase;
  }
</style>
</head>
<body>
  <div class="frame">
    <div class="band band-top">
      <div class="label-top">${labelTop}</div>
      <div class="quote-mark">"</div>
    </div>
    <div class="band band-bottom">
      <img src="${args.logoB64}" alt="Sportrail" class="brand-logo">
      <div class="brand-anniversary">${labelBottom}</div>
    </div>
  </div>
</body>
</html>`;
}

type FrameBGeometry = {
  bandTop: number;
  nameBand: number;
  logoBand: number;
  paddingX: number;
  labelSize: number;
  labelLetter: number;
  nameSize: number;
  roleSize: number;
  logoWidth: number;
  anniversarySize: number;
  anniversaryLetter: number;
};

const FRAME_B_GEOM: Record<FrameFormat, FrameBGeometry> = {
  "9x16": {
    bandTop: 110,
    nameBand: 180,
    logoBand: 150,
    paddingX: 80,
    labelSize: 20,
    labelLetter: 6,
    nameSize: 56,
    roleSize: 22,
    logoWidth: 260,
    anniversarySize: 14,
    anniversaryLetter: 3,
  },
  "1x1": {
    bandTop: 90,
    nameBand: 140,
    logoBand: 120,
    paddingX: 70,
    labelSize: 18,
    labelLetter: 5,
    nameSize: 44,
    roleSize: 18,
    logoWidth: 220,
    anniversarySize: 12,
    anniversaryLetter: 3,
  },
  "16x9": {
    bandTop: 80,
    nameBand: 130,
    logoBand: 110,
    paddingX: 100,
    labelSize: 18,
    labelLetter: 5,
    nameSize: 44,
    roleSize: 18,
    logoWidth: 220,
    anniversarySize: 12,
    anniversaryLetter: 3,
  },
};

function buildFrameB(args: FrameBuildArgs): string {
  const { width, height } = FRAME_DIMENSIONS[args.format];
  const g = FRAME_B_GEOM[args.format];
  const labelTop = escapeHtml(LABEL_TOP_LONG[args.language]);
  const labelBottom = escapeHtml(LABEL_BOTTOM[args.language]);

  const name = args.generic
    ? PLACEHOLDER_NAME
    : escapeHtml(args.content.name ?? "");
  const role = args.generic
    ? PLACEHOLDER_ROLE
    : escapeHtml(args.content.role ?? "");
  const affiliation = args.generic
    ? PLACEHOLDER_AFFILIATION
    : escapeHtml(args.content.affiliation ?? "");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
${FONTS_LINK}
<style>
  ${BASE_RESET}
  html, body { width: ${width}px; height: ${height}px; overflow: hidden; }
  .frame {
    width: ${width}px;
    height: ${height}px;
    position: relative;
  }
  .band-top {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: ${g.bandTop}px;
    background: #0B0A0F;
    border-bottom: 3px solid #ED1C24;
    display: flex;
    align-items: center;
    padding: 0 ${g.paddingX}px;
  }
  .label-top {
    font-family: 'DM Sans', sans-serif;
    font-size: ${g.labelSize}px;
    font-weight: 700;
    letter-spacing: ${g.labelLetter}px;
    color: #FAF8F5;
    text-transform: uppercase;
  }
  .name-band {
    position: absolute;
    left: 0;
    right: 0;
    bottom: ${g.logoBand}px;
    height: ${g.nameBand}px;
    background: #0B0A0F;
    padding: 0 ${g.paddingX}px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-left: 6px solid #ED1C24;
  }
  .name {
    font-family: 'Bebas Neue', sans-serif;
    font-size: ${g.nameSize}px;
    line-height: 1;
    color: #FAF8F5;
    letter-spacing: 1px;
  }
  .role {
    font-family: 'DM Sans', sans-serif;
    font-size: ${g.roleSize}px;
    font-weight: 400;
    color: #AAAAAA;
    margin-top: 10px;
    line-height: 1.4;
  }
  .logo-band {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: ${g.logoBand}px;
    background: #ED1C24;
    padding: 0 ${g.paddingX}px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .brand-logo {
    width: ${g.logoWidth}px;
    height: auto;
    display: block;
  }
  .brand-anniversary {
    font-family: 'DM Sans', sans-serif;
    font-size: ${g.anniversarySize}px;
    font-weight: 700;
    letter-spacing: ${g.anniversaryLetter}px;
    color: #FAF8F5;
    text-transform: uppercase;
  }
</style>
</head>
<body>
  <div class="frame">
    <div class="band-top">
      <div class="label-top">${labelTop}</div>
    </div>
    <div class="name-band">
      <div class="name">${name}</div>
      <div class="role">${role}${affiliation ? ` &middot; ${affiliation}` : ""}</div>
    </div>
    <div class="logo-band">
      <img src="${args.logoB64}" alt="Sportrail" class="brand-logo">
      <div class="brand-anniversary">${labelBottom}</div>
    </div>
  </div>
</body>
</html>`;
}

type QuoteScale = { fontSize: number; lineHeight: number };

function quoteScaleFrameC(quote: string): QuoteScale {
  const len = normaliseQuote(quote).length;
  if (len <= 140) return { fontSize: 54, lineHeight: 1.25 };
  if (len <= 200) return { fontSize: 44, lineHeight: 1.28 };
  return { fontSize: 36, lineHeight: 1.3 };
}

function buildFrameC(args: FrameBuildArgs): string {
  if (args.format !== "9x16") {
    throw new Error("Frame C is only available in 9:16.");
  }
  const { width, height } = FRAME_DIMENSIONS[args.format];

  const labelTop = escapeHtml(LABEL_TOP_LONG[args.language]);
  const labelBottom = escapeHtml(LABEL_BOTTOM[args.language]);

  const placeholderQuote =
    args.language === "pt" ? PLACEHOLDER_QUOTE_PT : PLACEHOLDER_QUOTE_EN;
  const quoteRaw = args.generic
    ? placeholderQuote
    : (args.language === "pt"
        ? args.content.quote_pt
        : args.content.quote_en) ?? placeholderQuote;
  const quote = escapeHtml(normaliseQuote(quoteRaw));
  const scale = quoteScaleFrameC(quoteRaw);

  const name = args.generic
    ? PLACEHOLDER_NAME
    : escapeHtml(args.content.name ?? PLACEHOLDER_NAME);
  const role = args.generic
    ? PLACEHOLDER_ROLE
    : escapeHtml(args.content.role ?? PLACEHOLDER_ROLE);
  const affiliation = args.generic
    ? ""
    : escapeHtml(args.content.affiliation ?? "");

  const headerHeight = 110;
  const videoArea = 870;
  const textBlockHeight = height - headerHeight - videoArea;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
${FONTS_LINK}
<style>
  ${BASE_RESET}
  html, body { width: ${width}px; height: ${height}px; overflow: hidden; }
  .frame {
    width: ${width}px;
    height: ${height}px;
    position: relative;
  }
  .band-top {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: ${headerHeight}px;
    background: #0B0A0F;
    border-bottom: 3px solid #ED1C24;
    display: flex;
    align-items: center;
    padding: 0 80px;
  }
  .label-top {
    font-family: 'DM Sans', sans-serif;
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 6px;
    color: #FAF8F5;
    text-transform: uppercase;
  }
  .text-block {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: ${textBlockHeight}px;
    background: #0B0A0F;
    padding: 70px 80px 60px 80px;
    border-top: 4px solid #ED1C24;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .quote-mark {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 240px;
    line-height: 0.7;
    color: #ED1C24;
    opacity: 0.18;
    position: absolute;
    top: 30px;
    right: 60px;
    pointer-events: none;
    z-index: 1;
  }
  .quote {
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    font-size: ${scale.fontSize}px;
    line-height: ${scale.lineHeight};
    color: #FAF8F5;
    letter-spacing: -0.3px;
    position: relative;
    z-index: 2;
  }
  .divider {
    width: 60px;
    height: 2px;
    background: #ED1C24;
    margin: 30px 0 20px 0;
  }
  .name {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 48px;
    line-height: 1;
    color: #FAF8F5;
    letter-spacing: 1px;
  }
  .role {
    font-family: 'DM Sans', sans-serif;
    font-size: 20px;
    font-weight: 400;
    color: #AAAAAA;
    margin-top: 8px;
    line-height: 1.4;
  }
  .footer-line {
    margin-top: 28px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 4px;
    color: #ED1C24;
    text-transform: uppercase;
  }
</style>
</head>
<body>
  <div class="frame">
    <div class="band-top">
      <div class="label-top">${labelTop}</div>
    </div>
    <div class="text-block">
      <div class="quote-mark">"</div>
      <div>
        <div class="quote">${quote}</div>
      </div>
      <div>
        <div class="divider"></div>
        <div class="name">${name}</div>
        <div class="role">${role}${affiliation ? ` &middot; ${affiliation}` : ""}</div>
        <div class="footer-line">${labelBottom}</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function buildFrameHtml(args: FrameBuildArgs): string {
  switch (args.kind) {
    case "A":
      return buildFrameA(args);
    case "B":
      return buildFrameB(args);
    case "C":
      return buildFrameC(args);
  }
}
