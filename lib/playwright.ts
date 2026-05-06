import { existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium as playwrightChromium } from "playwright-core";
import type { Browser } from "playwright-core";

function isServerless(): boolean {
  return Boolean(
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.VERCEL ||
      process.env.AWS_EXECUTION_ENV,
  );
}

// @sparticuz/chromium's executablePath() short-circuits as soon as
// /tmp/chromium exists and does not re-verify that /tmp/al2023/lib is intact.
// Warm Vercel invocations where the binary persisted but the libs were evicted
// then launch chromium with LD_LIBRARY_PATH pointing at a missing dir, which
// surfaces as "error while loading shared libraries: libnss3.so". Detect the
// half-extracted state and force a clean re-inflate.
function ensureChromiumExtractionIsHealthy(): void {
  const tmp = tmpdir();
  if (existsSync(join(tmp, "al2023", "lib", "libnss3.so"))) return;
  rmSync(join(tmp, "chromium"), { force: true });
  rmSync(join(tmp, "al2023"), { recursive: true, force: true });
}

// Strip every GPU/swiftshader-related flag from the args sparticuz returns.
// `chromium.setGraphicsMode = false` was supposed to do this but in v147 the
// launched Chromium still receives --enable-unsafe-swiftshader and friends,
// and under --single-process the renderer crashes mid-render with
// "Target page, context or browser has been closed". We render plain HTML
// with no canvas/WebGL/SVG-filters, so the entire GPU stack is dead weight.
function stripGpuArgs(args: string[]): string[] {
  const banned = [
    "--enable-unsafe-swiftshader",
    "--ignore-gpu-blocklist",
    "--in-process-gpu",
    "--use-gl=swiftshader",
    "--use-angle=swiftshader",
  ];
  const cleaned = args.filter((a) => !banned.some((b) => a.startsWith(b)));
  // Force GPU off, even if a future sparticuz release adds new flags.
  if (!cleaned.includes("--disable-gpu")) cleaned.push("--disable-gpu");
  return cleaned;
}

async function launchBrowser(): Promise<Browser> {
  if (isServerless()) {
    ensureChromiumExtractionIsHealthy();
    const { default: chromium } = await import("@sparticuz/chromium");
    chromium.setGraphicsMode = false;
    return playwrightChromium.launch({
      args: stripGpuArgs(chromium.args),
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  const localExecutable =
    process.env.PLAYWRIGHT_CHROMIUM_PATH || process.env.CHROME_PATH;
  if (localExecutable) {
    return playwrightChromium.launch({
      headless: true,
      executablePath: localExecutable,
    });
  }
  return playwrightChromium.launch({ headless: true, channel: "chrome" });
}

export type RenderJob = {
  html: string;
  width: number;
  height: number;
  transparent?: boolean;
};

async function renderOne(job: RenderJob): Promise<Buffer> {
  // Fresh browser per job. Single-process Chromium on Lambda has been
  // crashing the renderer between jobs (the second `newPage` throws
  // "Target page, context or browser has been closed"). Starting clean
  // for each job isolates a crash to that one render and trades ~1-2s of
  // launch time for reliability — the binary is already extracted in /tmp
  // so subsequent launches are warm.
  const browser = await launchBrowser();
  try {
    const context = await browser.newContext({
      viewport: { width: job.width, height: job.height },
      // Render at 2x so a 1080x1920 frame outputs at 2160x3840 pixels.
      // Editors like Clideo/CapCut/Veed re-sample the overlay during preview
      // and export; at 1x the small text in the footer band turns soft.
      // Memory cost is contained because we already launch a fresh browser
      // per job (no parallel contexts), so peak is one 2x backing buffer.
      deviceScaleFactor: 2,
    });
    try {
      const page = await context.newPage();
      await page.setContent(job.html, { waitUntil: "load", timeout: 20_000 });
      await page
        .evaluate(() => document.fonts.ready)
        .catch(() => undefined);
      return await page.screenshot({
        fullPage: false,
        omitBackground: job.transparent ?? false,
      });
    } finally {
      await context.close().catch(() => undefined);
    }
  } finally {
    await browser.close().catch(() => undefined);
  }
}

export async function renderHtmlBatch(jobs: RenderJob[]): Promise<Buffer[]> {
  if (jobs.length === 0) return [];
  const results: Buffer[] = [];
  for (const job of jobs) {
    results.push(await renderOne(job));
  }
  return results;
}
