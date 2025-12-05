/**
 * PDF generation service using Puppeteer.
 * Renders HTML content to PDF using headless Chrome.
 */

import type { Browser, PDFOptions } from "puppeteer";

// Type for lazy-loaded puppeteer module
type PuppeteerModule = typeof import("puppeteer");

// Singleton browser instance for better performance
let browserInstance: Browser | null = null;
let puppeteerModule: PuppeteerModule | null = null;

/**
 * Get or create a Puppeteer browser instance.
 * Uses singleton pattern to avoid launching multiple browsers.
 */
async function getBrowser(): Promise<Browser> {
  if (browserInstance?.connected) {
    return browserInstance;
  }

  // Lazy load puppeteer
  if (!puppeteerModule) {
    puppeteerModule = await import("puppeteer");
  }

  // Filter out problematic environment variables that can break Puppeteer
  // (e.g., from Console Ninja or other dev tools)
  const cleanEnv = { ...process.env };
  for (const key of Object.keys(cleanEnv)) {
    if (
      key.startsWith("CONSOLE_NINJA") ||
      key.startsWith("NI_") ||
      key.includes("NODE_OPTIONS")
    ) {
      delete cleanEnv[key];
    }
  }

  browserInstance = await puppeteerModule.default.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-software-rasterizer",
      "--disable-extensions",
      "--single-process",
    ],
    env: cleanEnv,
  });

  return browserInstance;
}

/**
 * Close the browser instance.
 * Call this during graceful shutdown.
 */
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

export interface GeneratePDFOptions {
  /**
   * HTML content to render as PDF
   */
  html: string;

  /**
   * PDF format options
   */
  format?: "A4" | "Letter";

  /**
   * Print background colors and images
   */
  printBackground?: boolean;

  /**
   * Page margins in CSS units (e.g., "10mm")
   */
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };

  /**
   * Scale of the webpage rendering (1 = 100%)
   */
  scale?: number;
}

/**
 * Default PDF options for resume/CV generation
 */
const DEFAULT_PDF_OPTIONS: Partial<PDFOptions> = {
  format: "A4",
  printBackground: true,
  margin: {
    top: "0mm",
    right: "0mm",
    bottom: "0mm",
    left: "0mm",
  },
  scale: 1,
};

/**
 * Generate a PDF from HTML content using Puppeteer.
 *
 * @param options - PDF generation options
 * @returns PDF as a Buffer
 */
export async function generatePDF(
  options: GeneratePDFOptions
): Promise<Buffer> {
  const { html, format, printBackground, margin, scale } = options;

  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    // Set content and wait for rendering
    await page.setContent(html, {
      waitUntil: ["domcontentloaded", "networkidle0"],
      timeout: 30000,
    });

    // Wait a bit for fonts to load
    await page.evaluate(() => {
      return document.fonts.ready;
    });

    // Generate PDF
    const pdfOptions: PDFOptions = {
      ...DEFAULT_PDF_OPTIONS,
      format: format || DEFAULT_PDF_OPTIONS.format,
      printBackground: printBackground ?? DEFAULT_PDF_OPTIONS.printBackground,
      margin: margin || DEFAULT_PDF_OPTIONS.margin,
      scale: scale || DEFAULT_PDF_OPTIONS.scale,
    };

    const pdfBuffer = await page.pdf(pdfOptions);

    return Buffer.from(pdfBuffer);
  } finally {
    await page.close();
  }
}

/**
 * Generate a PDF and return as base64 string.
 * Convenience wrapper for API responses.
 *
 * @param options - PDF generation options
 * @returns PDF as base64 encoded string
 */
export async function generatePDFBase64(
  options: GeneratePDFOptions
): Promise<string> {
  const buffer = await generatePDF(options);
  return buffer.toString("base64");
}
