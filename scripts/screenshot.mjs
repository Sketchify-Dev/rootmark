/**
 * Capture the console at desktop and phone widths for a visual check.
 *
 * Usage: node scripts/screenshot.mjs [baseUrl] [outDir]
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const base = process.argv[2] ?? "http://127.0.0.1:3000";
const outDir = process.argv[3] ?? "/tmp/shots";
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const routes = [
  ["/", "console"],
  ["/anchors", "anchors"],
  ["/contracts", "contracts"],
];

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "phone", width: 360, height: 800 },
  { name: "narrow", width: 320, height: 700 },
];

const consoleErrors = [];

for (const viewport of viewports) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(`[${viewport.name}] ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => {
    consoleErrors.push(`[${viewport.name}] pageerror: ${error.message}`);
  });

  for (const [path, name] of routes) {
    await page.goto(`${base}${path}`, { waitUntil: "networkidle", timeout: 30_000 });
    await page.waitForTimeout(800);
    const file = `${outDir}/${name}-${viewport.name}.png`;
    await page.screenshot({ path: file, fullPage: true });

    // On the console, exercise the verification flow and capture the panel.
    if (name === "console") {
      const verify = page.getByRole("button", { name: /^Verify record/ }).first();
      if (await verify.count()) {
        await verify.click();
        await page.waitForTimeout(1200);
        await page.screenshot({ path: `${outDir}/verify-${viewport.name}.png`, fullPage: true });
        console.log(`${outDir}/verify-${viewport.name}.png`);
      } else {
        console.log(`no verify button on ${name}-${viewport.name}`);
      }
    }
    // Report horizontal overflow, which the brief forbids at 320 and 360.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    if (overflow > 0) {
      consoleErrors.push(`[${viewport.name}] ${path} overflows horizontally by ${overflow}px`);
    }
    console.log(`${file}  overflow=${overflow}px`);
  }
  await context.close();
}

await browser.close();
if (consoleErrors.length > 0) {
  console.log("\nconsole and layout problems:");
  for (const entry of consoleErrors) console.log(`  ${entry}`);
} else {
  console.log("\nno console errors, no horizontal overflow");
}
