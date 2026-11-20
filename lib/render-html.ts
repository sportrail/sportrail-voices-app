import { FONTS_INLINE_STYLE } from "./fonts-inline";
import {
  COLOR,
  FONT,
  SAFE_9X16,
  isPullQuote,
  kickerCss,
  logoClearSpace,
  sideBarCss,
  socialBarWidth,
  stripQuoteMarks,
  technicalGridCss,
} from "./brand";

export type TestimonialLangData = {
  quote: string;
  name: string;
  role: string;
  affiliation: string;
  label_top: string;
  label_bottom: string;
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
  return stripQuoteMarks(
    value.replace(/\s*\r?\n\s*/g, " ").replace(/[ \t]+/g, " ").trim(),
  );
}

function e(data: TestimonialLangData) {
  return {
    quote: escapeHtml(normaliseQuote(data.quote)),
    name: escapeHtml(data.name),
    role: escapeHtml(data.role),
    affiliation: escapeHtml(data.affiliation),
    label_top: escapeHtml(data.label_top),
    label_bottom: data.label_bottom
      .split(" · ")
      .map((part) => `<span class="seg">${escapeHtml(part)}</span>`)
      .join(" &middot; "),
  };
}

type QuoteScale = { fontSize: number; lineHeight: number };

function bodyQuoteScale4x5(len: number): QuoteScale {
  if (len <= 200) return { fontSize: 31, lineHeight: 1.3 };
  return { fontSize: 28, lineHeight: 1.32 };
}

function bodyQuoteScale9x16(len: number): QuoteScale {
  if (len <= 200) return { fontSize: 44, lineHeight: 1.28 };
  return { fontSize: 38, lineHeight: 1.3 };
}

function postHead(width: number, height: number, css: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
${FONTS_INLINE_STYLE}
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: ${width}px;
    height: ${height}px;
    overflow: hidden;
    background: ${COLOR.ground};
    font-family: ${FONT.sans};
  }
  .canvas { width: ${width}px; height: ${height}px; position: relative; }
  ${css}
</style>
</head>`;
}

function textCss(pullSize: number, body: QuoteScale): string {
  return `.quote { color: ${COLOR.ink}; }
  .quote.pull {
    font-family: ${FONT.display};
    font-weight: 400;
    font-size: ${pullSize}px;
    line-height: 1.05;
    border-top: 5px solid ${COLOR.red};
    border-bottom: 2px solid ${COLOR.border};
    padding: 28px 0;
  }
  .quote.body {
    font-family: ${FONT.sans};
    font-weight: 500;
    font-size: ${body.fontSize}px;
    line-height: ${body.lineHeight};
    letter-spacing: -0.3px;
  }
  .rule { width: 60px; height: 4px; background: ${COLOR.red}; }
  .name {
    font-family: ${FONT.display};
    font-weight: 400;
    line-height: 1;
    letter-spacing: 0.01em;
    color: ${COLOR.ink};
  }
  .role {
    font-family: ${FONT.sans};
    font-weight: 400;
    line-height: 1.4;
    color: ${COLOR.inkMuted};
  }
  .meta {
    font-family: ${FONT.sans};
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: ${COLOR.inkFaint};
    background: ${COLOR.ground};
  }
  .meta .seg { white-space: nowrap; }`;
}

// The ground outline keeps the grid out of the logo's clear space without
// moving the logo.
function logoCss(width: number, clear: number): string {
  return `.logo {
    width: ${width}px;
    height: auto;
    display: block;
    background: ${COLOR.ground};
    outline: ${clear}px solid ${COLOR.ground};
  }`;
}

function quoteHtml(quote: string, pull: boolean): string {
  return `<div class="quote ${pull ? "pull" : "body"}">&ldquo;${quote}&rdquo;</div>`;
}

export function buildHtml4x5(
  data: TestimonialLangData,
  photoB64: string,
  logoB64: string,
): string {
  const width = 1080;
  const height = 1350;
  const d = e(data);
  const quoteText = normaliseQuote(data.quote);
  const pull = isPullQuote(quoteText);
  const bar = socialBarWidth(width);
  const photoWidth = 460;
  const logoWidth = 240;
  const clear = logoClearSpace(logoWidth);

  const css = `${sideBarCss(bar)}
  ${kickerCss(24)}
  ${textCss(54, bodyQuoteScale4x5(quoteText.length))}
  ${logoCss(logoWidth, clear)}
  .text-col {
    position: absolute;
    left: ${bar}px;
    top: 0;
    bottom: 0;
    width: ${width - bar - photoWidth}px;
    padding: 72px 56px 64px 64px;
    display: flex;
    flex-direction: column;
    ${technicalGridCss(54)}
  }
  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: ${clear}px 0 32px;
  }
  .main .quote { margin-top: 36px; }
  .main .rule { margin-top: 40px; }
  .main .quote.pull + .name { margin-top: 36px; }
  .main .rule + .name { margin-top: 24px; }
  .name { font-size: 52px; }
  .role { font-size: 24px; margin-top: 10px; }
  .meta { font-size: 20px; align-self: flex-start; }
  .photo-col {
    position: absolute;
    right: 0;
    top: 0;
    width: ${photoWidth}px;
    height: ${height}px;
    overflow: hidden;
  }
  .photo-col img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 50% 40%;
    display: block;
  }`;

  return `${postHead(width, height, css)}
<body>
  <div class="canvas">
    <div class="side-bar"></div>
    <div class="text-col">
      <img src="${logoB64}" alt="Sportrail" class="logo">
      <div class="main">
        <div class="kicker">${d.label_top}</div>
        ${quoteHtml(d.quote, pull)}
        ${pull ? "" : '<div class="rule"></div>'}
        <div class="name">${d.name}</div>
        <div class="role">${d.role}<br>${d.affiliation}</div>
      </div>
      <div class="meta">${d.label_bottom}</div>
    </div>
    <div class="photo-col">
      <img src="${photoB64}" alt="${d.name}">
    </div>
  </div>
</body>
</html>`;
}

export function buildHtml9x16(
  data: TestimonialLangData,
  photoB64: string,
  logoB64: string,
): string {
  const width = 1080;
  const height = 1920;
  const d = e(data);
  const quoteText = normaliseQuote(data.quote);
  const pull = isPullQuote(quoteText);
  const bar = socialBarWidth(width);
  const photoHeight = 800;
  const logoWidth = 240;
  const clear = logoClearSpace(logoWidth);

  // Text and logo stay inside Instagram's safe area; the bottom 350px only
  // carry the grid and the side bar.
  const css = `${sideBarCss(bar)}
  ${kickerCss(28)}
  ${textCss(64, bodyQuoteScale9x16(quoteText.length))}
  ${logoCss(logoWidth, clear)}
  .photo {
    position: absolute;
    left: 0;
    top: 0;
    width: ${width}px;
    height: ${photoHeight}px;
    overflow: hidden;
  }
  .photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 50% 28%;
    display: block;
  }
  .text-area {
    position: absolute;
    left: ${bar}px;
    right: 0;
    top: ${photoHeight}px;
    bottom: 0;
    padding: 64px 72px ${SAFE_9X16.bottom}px 64px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    ${technicalGridCss(54)}
  }
  .text-area .quote { margin-top: 36px; }
  .text-area .rule + .name { margin-top: 24px; }
  .name { font-size: 64px; }
  .role { font-size: 30px; margin-top: 10px; }
  .brand-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${clear}px;
    margin-top: ${clear}px;
  }
  .meta { font-size: 22px; }`;

  return `${postHead(width, height, css)}
<body>
  <div class="canvas">
    <div class="photo">
      <img src="${photoB64}" alt="${d.name}">
    </div>
    <div class="side-bar"></div>
    <div class="text-area">
      <div>
        <div class="kicker">${d.label_top}</div>
        ${quoteHtml(d.quote, pull)}
      </div>
      <div>
        ${pull ? "" : '<div class="rule"></div>'}
        <div class="name">${d.name}</div>
        <div class="role">${d.role}<br>${d.affiliation}</div>
        <div class="brand-row">
          <img src="${logoB64}" alt="Sportrail" class="logo">
          <div class="meta">${d.label_bottom}</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}
