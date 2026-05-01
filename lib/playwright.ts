import { chromium as playwrightChromium } from "playwright-core";
import type { Browser } from "playwright-core";

const REMOTE_CHROMIUM_PACK =
  "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar";

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

export async function renderHtmlToPng(
  html: string,
  width: number,
  height: number,
  options: RenderHtmlOptions = {},
): Promise<Buffer> {
  const browser = await launchBrowser();
  try {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    const buffer = await page.screenshot({
      fullPage: false,
      omitBackground: options.transparent === true,
    });
    return buffer;
  } finally {
    await browser.close();
  }
}
