import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, locale: "ar-YE" });
const errors = [];
page.on("pageerror", error => errors.push(error.message));
await page.goto("http://127.0.0.1:4173/work-letters", { waitUntil: "networkidle" });
await page.screenshot({ path: "artifacts/work-letters-ar.png", fullPage: true });
await page.getByRole("button", { name: /حفظ السجل/ }).click();
await page.getByRole("button", { name: /السجلات/ }).click();
await page.getByText(/سجلات IndexedDB المستقلة/).waitFor();
await page.getByRole("button", { name: "English" }).click();
await page.getByText("To Whom It May Concern").waitFor();
await page.screenshot({ path: "artifacts/work-letters-en.png", fullPage: true });
await page.emulateMedia({ media: "print" });
await page.pdf({ path: "artifacts/work-letters-a4.pdf", format: "A4", printBackground: true, margin: { top: "0", right: "0", bottom: "0", left: "0" } });
if (errors.length) throw new Error(`Browser errors: ${errors.join("; ")}`);
console.log("BROWSER_OK", JSON.stringify({ title: await page.title(), arPreview: true, enPreview: true, savedRecord: true, pdf: "artifacts/work-letters-a4.pdf" }));
await browser.close();
