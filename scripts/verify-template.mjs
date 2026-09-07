import { readFileSync } from "node:fs";
import * as XLSX from "xlsx";

const workbook = XLSX.read(readFileSync("Good Conduct Data Template.xlsx"), { type: "buffer" });
const requiredSheets = ["Good Conduct", "Instructions", "Field Guide"];
for (const sheet of requiredSheets) {
  if (!workbook.SheetNames.includes(sheet)) throw new Error(`Missing sheet: ${sheet}`);
}
const rows = XLSX.utils.sheet_to_json(workbook.Sheets["Good Conduct"], { header: 1 });
const headers = rows[0].map(String);
const forbidden = ["issueNo", "referenceNo", "internalNo", "issuanceNo", "passportNoAr", "passportNoEn"];
for (const key of forbidden) {
  if (headers.includes(key)) throw new Error(`System identifier leaked into import sheet: ${key}`);
}
if (!headers.includes("fullNameAr") || !headers.includes("departmentAr") || !headers.includes("departmentEn")) {
  throw new Error("Required bilingual fields are missing");
}
console.log(JSON.stringify({ sheets: workbook.SheetNames, headerCount: headers.length, forbiddenPresent: false }));
