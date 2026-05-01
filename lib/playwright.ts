import { chromium as playwrightChromium } from "playwright-core";
import type { Browser } from "playwright-core";

const REMOTE_CHROMIUM_PACK =
  process.env.CHROMIUM_PACK_URL ??
  "https://github.com/Sparticuz/chromium/releases/download/v147.0.2/chromium-v147.0.2-pack.x64.tar";

function isServerless(): boolean {
  return Boolean(
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.VERCEL ||
      process.env.AWS_EXECUTION_ENV,
  );
}

async function launchBrowser(): Promise<Browser> {
  if (isServerless()) {
    const chromiumModule = await import("@sparticuz/chromium-min");
    const chromium = chromiumModule.default;
    return playwrightChromium.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(REMOTE_CHROMIUM_PACK),
      headless: true,
    });
  }

  const localExecutable =
    process.env.PLAYWRIGHT_CHROMIUM_PATH || process.env.CHROME_PATH;
  return playwrightChromium.launch({
    headless: true,
    ...(localExecutable ? { executablePath: localExecutable } : {}),
    channel: localExecutable ? undefined : "chrome",
  });
}

export type RenderHtmlOptions = {
  transparent?: boolean;
};

export type RenderJob = {
  html: string;
  width: number;
  height: number;
  transparent?: boolean;
};

const SET_CONTENT_TIMEOUT_MS = 20_000;

async function renderJob(
  browser: Browser,
  job: RenderJob,
): Promise<Buffer> {
  const context = await browser.newContext({
    viewport: { width: job.width, height: job.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  try {
    await page.setContent(job.html, {
      waitUntil: "networkidle",
      timeout: SET_CONTENT_TIMEOUT_MS,
    });
    // Wait for fonts to be ready (more deterministic than fixed timeout)
    await page
      .evaluate(
        () =>
          (document as unknown as { fonts?: { ready?: Promise<unknown> } })
            .fonts?.ready,
      )
      .catch(() => undefined);
    return await page.screenshot({
      fullPage: false,
      omitBackground: job.transparent === true,
    });
  } finally {
    await context.close();
  }
}

/**
 * Render multiple HTML jobs to PNG buffers using a SINGLE shared browser.
 * Each job gets its own context + page so viewports don't conflict.
 *
 * This replaces the previous pattern of `Promise.all(jobs.map(renderHtmlToPng))`
 * which launched one browser per job — six parallel chromium-min instances
 * would OOM on Vercel and contend for /tmp during the chromium pack unpack.
 */
export async function renderHtmlBatch(
  jobs: RenderJob[],
): Promise<Buffer[]> {
  if (jobs.length === 0) return [];
  const browser = await launchBrowser();
  try {
    return await Promise.all(jobs.map((job) => renderJob(browser, job)));
  } finally {
    await browser.close();
  }
}

/**
 * Render a single HTML to PNG. Kept for backward compatibility.
 * Prefer `renderHtmlBatch` when rendering more than one image.
 */
export async function renderHtmlToPng(
  html: string,
  width: number,
  height: number,
  options: RenderHtmlOptions = {},
): Promise<Buffer> {
  const [buffer] = await renderHtmlBatch([
    { html, width, height, transparent: options.transparent },
  ]);
  return buffer;
}
