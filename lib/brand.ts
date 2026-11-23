// Mirrors the Sportrail Design System v2.0 tokens.json (dark theme).
// When the brand changes, change it here, not in the templates.

export const COLOR = {
  red: "#E8121B",
  redText: "#F04248",
  redHover: "#C41920",
  ground: "#0B0A0F",
  card: "#1A1920",
  border: "#222130",
  borderStrong: "#6F6D7A",
  ink: "#F0EFF4",
  inkMuted: "#B4B3BE",
  inkFaint: "#9A99A6",
  gold: "#D4A843",
} as const;

export const RADIUS = { card: 14, button: 5 } as const;

export const FONT = {
  display: "'Bebas Neue', Impact, sans-serif",
  sans: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
} as const;

export const KICKER_TRACKING = "0.22em";

// Quotes up to this length render as a PullQuote (Bebas Neue).
export const PULL_QUOTE_MAX = 140;

// bar-social: ~3% of the canvas width (30px at 1080 in the guide).
export function socialBarWidth(canvasWidth: number): number {
  return Math.round(canvasWidth * 0.03);
}

// The logo's clear space equals the height of its circular icon, which is
// 414/1928 of the PNG's width (assets/Logos/logo-white.png).
export function logoClearSpace(logoWidth: number): number {
  return Math.ceil((logoWidth * 414) / 1928);
}

// Instagram stories/reels safe margins at 1080x1920.
export const SAFE_9X16 = { top: 200, bottom: 350 } as const;

export function sideBarCss(width: number): string {
  return `.side-bar {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: ${width}px;
    background: ${COLOR.red};
    z-index: 10;
  }`;
}

// DS Kicker (.spt-kicker) scaled for 1080px social canvases.
export function kickerCss(fontSize: number): string {
  const dash = Math.round(fontSize * 2);
  return `.kicker {
    position: relative;
    padding-left: ${Math.round(dash * 1.4)}px;
    font-family: ${FONT.sans};
    font-weight: 700;
    font-size: ${fontSize}px;
    line-height: 1.3;
    letter-spacing: ${KICKER_TRACKING};
    text-transform: uppercase;
    color: ${COLOR.ink};
  }
  .kicker::before {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    width: ${dash}px;
    height: ${Math.max(3, Math.round(fontSize / 6))}px;
    margin-top: -${Math.max(2, Math.round(fontSize / 12))}px;
    background: ${COLOR.red};
  }`;
}

// Faint technical grid for social posts, drawn with hard-stop lines.
export function technicalGridCss(step: number): string {
  return `background-image:
      linear-gradient(to right, ${COLOR.border} 1px, transparent 1px),
      linear-gradient(to bottom, ${COLOR.border} 1px, transparent 1px);
    background-size: ${step}px ${step}px;`;
}

export function isPullQuote(quote: string): boolean {
  return quote.length <= PULL_QUOTE_MAX;
}

// Strips quote marks the author may have typed so the template's own marks
// are never doubled.
export function stripQuoteMarks(value: string): string {
  return value.replace(/^["'“”«»\s]+|["'“”«»\s]+$/g, "");
}
