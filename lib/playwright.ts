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

async function launchBrowser(): Promise<Browser> {
  if (isServerless()) {
    ensureChromiumExtractionIsHealthy();
    const { default: chromium } = await import("@sparticuz/chromium");
    return playwrightChromium.launch({
      args: chromium.args,
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

async function renderJob(browser: Browser, job: RenderJob): Promise<Buffer> {
  const context = await browser.newContext({
    viewport: { width: job.width, height: job.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  try {
    await page.setContent(job.html, { waitUntil: "load", timeout: 20_000 });
    await page
      .evaluate(() => document.fonts.ready)
      .catch(() => undefined);
    return await page.screenshot({
      fullPage: false,
      omitBackground: job.transparent ?? false,
    });
  } finally {
    await context.close();
  }
}

export async function renderHtmlBatch(jobs: RenderJob[]): Promise<Buffer[]> {
  if (jobs.length === 0) return [];
  const browser = await launchBrowser();
  try {
    return await Promise.all(jobs.map((job) => renderJob(browser, job)));
  } finally {
    await browser.close();
  }
}
