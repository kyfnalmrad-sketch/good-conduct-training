import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Database, FileDown, Languages, List, Printer, Save, Trash2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import bwipjs from "@bwip-js/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { deleteWorkLetter, draftKey, listWorkLetters, saveWorkLetter, type WorkLetterData, type WorkLetterRecord } from "./db";

export type Language = "ar" | "en";

type Company = { id: string; nameAr: string; nameEn: string; short: string };
const COMPANIES: Company[] = [
  { id: "astar", nameAr: "شركة أستار غاز يمن", nameEn: "Aster Gas Yemen Company", short: "ASTAR" },
  { id: "master", nameAr: "شركة ماستر بلاتينيوم لاستيراد الأجهزة والمستلزمات الطبية والإلكترونية", nameEn: "Master Platinum for Importing Medical and Electronic Equipment and Supplies", short: "MASTER" },
];

export const INITIAL: WorkLetterData = {
  companyId: "astar", employeeName: "محمد علي أحمد", jobTitle: "مدير المشتريات", salary: "1500",
  passportNo: "", identityNo: "",
  birthPlace: "صنعاء، اليمن", birthDate: "18/04/1992", joiningDate: "12/01/2020", issueDate: "23/09/2026",
  reference: "ASTAR-HR-041-2026", internalNo: "ASTAR-INT-041-2026", issuerName: "أحمد محمد، مدير الموارد البشرية",
};
export const EN_INITIAL: WorkLetterData = {
  ...INITIAL,
  employeeName: "Mohammed Ali Ahmed",
  jobTitle: "Procurement Manager",
  birthPlace: "Sana'a, Yemen",
  issuerName: "Ahmed Mohammed, Human Resources Manager",
};

function companyFor(id: string) { return COMPANIES.find(company => company.id === id) ?? COMPANIES[0]; }
export function demoFor(companyId: string, language: Language): WorkLetterData {
  const company = companyFor(companyId);
  const base = language === "en" ? EN_INITIAL : INITIAL;
  return { ...base, companyId: company.id, reference: `${company.short}-HR-041-2026`, internalNo: `${company.short}-INT-041-2026` };
}
function arabicDate(value: string) { return value ? `${value.replace(/[0-9]/g, digit => "٠١٢٣٤٥٦٧٨٩"[Number(digit)])}م` : value; }
function dateForEnglish(value: string) { const [day, month, year] = value.split("/"); return `${day} ${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][Number(month) - 1]} ${year}`; }
function salaryForArabic(value: string) {
  const numeric = Number(value.replace(/,/g, ""));
  return ` ${Number.isFinite(numeric) ? numeric.toLocaleString("en-US") : value} دولار أمريكي`;
}
function salaryForEnglish(value: string) {
  const numeric = Number(value.replace(/,/g, ""));
  if (numeric === 1500) return "USD 1,500 (one thousand five hundred US dollars)";
  return `USD ${Number.isFinite(numeric) ? numeric.toLocaleString("en-US") : value}`;
}
function codePayload(data: WorkLetterData, language: Language) {
  if (language === "ar") {
    return [
      `اسم الموظف: ${data.employeeName}`,
      `المسمى الوظيفي: ${data.jobTitle}`,
      `الراتب الشهري:${salaryForArabic(data.salary)}`,
      `مكان الميلاد: ${data.birthPlace}`,
      `تاريخ الميلاد: ${arabicDate(data.birthDate)}`,
      `تاريخ الالتحاق: ${arabicDate(data.joiningDate)}`,
      ...(data.passportNo ? [`رقم الجواز: ${data.passportNo}`] : []),
      ...(data.identityNo ? [`رقم الهوية: ${data.identityNo}`] : []),
    ].join("\n");
  }
  return [
    `Employee name: ${data.employeeName}`,
    `Job title: ${data.jobTitle}`,
    `Salary: ${salaryForEnglish(data.salary)}`,
    `Place of birth: ${data.birthPlace}`,
    `Date of birth: ${dateForEnglish(data.birthDate)}`,
    `Date of joining: ${dateForEnglish(data.joiningDate)}`,
    ...(data.passportNo ? [`Passport number: ${data.passportNo}`] : []),
    ...(data.identityNo ? [`Identity number: ${data.identityNo}`] : []),
  ].join("\n");
}
function brandColor(companyId: string) { return companyId === "master" ? "17375e" : "8b3f35"; }
function barcodeSvg(data: WorkLetterData, companyId: string) {
  const payload = [
    `Reference: ${data.reference}`,
    `Internal number: ${data.internalNo}`,
    `Issue date: ${data.issueDate}`,
  ].join("\n");
  try { return bwipjs.toSVG({ bcid: "pdf417", text: payload, barcolor: brandColor(companyId), scale: 2, columns: 5, rows: 8, includetext: false, paddingwidth: 2, paddingheight: 2 } as any); } catch { return ""; }
}

export function LetterPreview({ data, language }: { data: WorkLetterData; language: Language }) {
  const company = companyFor(data.companyId);
  const issuerName = data.issuerName || (language === "ar" ? "أحمد محمد، مدير الموارد البشرية" : "Ahmed Mohammed, Human Resources Manager");
  const qr = codePayload(data, language);
  const barcode = useMemo(() => barcodeSvg(data, company.id), [data, company.id]);
  const english = language === "en";
  const officialPaper = company.id === "master" || company.id === "astar";
  const optionalArabic = <>{data.passportNo ? <> ورقم الجواز <strong>{data.passportNo}</strong></> : null}{data.identityNo ? <> ورقم الهوية <strong>{data.identityNo}</strong></> : null}</>;
  const optionalEnglish = <>{data.passportNo ? <>; passport number: <strong>{data.passportNo}</strong></> : null}{data.identityNo ? <>; identity number: <strong>{data.identityNo}</strong></> : null}</>;
  return <article className={`work-letter-paper company-${company.id} ${officialPaper ? "is-official-paper" : ""} ${english ? "is-english" : "is-arabic"}`} dir={english ? "ltr" : "rtl"}>
    {officialPaper ? <img className="company-official-paper" src={`/assets/official-work-letter/${company.id}-official-paper.png`} alt="" /> : <img className="official-letter-header" src={`/assets/official-work-letter/${company.id}-header.png`} alt="" />}
    <div className="official-letter-content">
      <div className="letter-meta"><div><span>{english ? "Internal No." : "الرقم الداخلي"}</span><b>{data.internalNo}</b></div><div><span>{english ? "Reference" : "المرجع"}</span><b>{data.reference}</b></div><div><span>{english ? "Date" : "التاريخ"}</span><b>{english ? dateForEnglish(data.issueDate) : arabicDate(data.issueDate)}</b></div></div>
      <div className="letter-main">
        <div className="letter-qr"><QRCodeSVG value={qr} size={92} level="M" fgColor={`#${brandColor(company.id)}`} /></div>
        <h1>{english ? "To Whom It May Concern" : "إلى من يهمه الأمر"}</h1>
        {english ? <p className="letter-copy">{company.nameEn} presents its compliments. This is to certify that <strong>{data.employeeName}</strong> is employed by our company as <strong>{data.jobTitle}</strong>, with a monthly salary of <strong>{salaryForEnglish(data.salary)}</strong>. Place of birth: <strong>{data.birthPlace}</strong>; date of birth: <strong>{dateForEnglish(data.birthDate)}</strong>; date of joining: <strong>{dateForEnglish(data.joiningDate)}</strong>{optionalEnglish}.<br /><br />This certificate is issued at his request without any responsibility or obligation on the company.</p> : <p className="letter-copy">تهديكم <strong>{company.nameAr}</strong> أطيب تحياتها، ونفيدكم بأن الأخ <strong>{data.employeeName}</strong> يعمل لدى شركتنا بوظيفة <strong>{data.jobTitle}</strong>، ويتقاضى راتباً شهرياً قدره <strong>{salaryForArabic(data.salary)}</strong>. كما نود الإشارة إلى أن مكان ميلاده <strong>{data.birthPlace}</strong>، وتاريخ ميلاده <strong>{arabicDate(data.birthDate)}</strong>، وقد التحق بالعمل لدينا بتاريخ <strong>{arabicDate(data.joiningDate)}</strong>.{optionalArabic}<br /><br />وقد أُصدرت له هذه الإفادة بناءً على طلبه، دون أدنى مسؤولية أو التزام على الشركة تجاه أي طرف آخر.</p>}
        <p className="letter-closing">{english ? "Yours faithfully," : "وتفضلوا بقبول خالص الاحترام والتقدير،،،"}</p>
      </div>
    </div>
    <div className="letter-signature"><strong>{english ? "Human Resources Department" : "إدارة الموارد البشرية"}</strong><div className="signature-issuer"><span>{english ? "Issued by:" : "صادر من:"}</span><b>{issuerName}</b></div></div>
    <div className="letter-barcode" dangerouslySetInnerHTML={{ __html: barcode }} />
    {!officialPaper && <img className="official-letter-footer" src={`/assets/official-work-letter/${company.id}-footer.png`} alt="" />}
  </article>;
}

export default function WorkLettersApp() {
  const [, setLocation] = useLocation();
  const routeParams = new URLSearchParams(window.location.search);
  const routeLanguage = routeParams.get("language") === "en" ? "en" : "ar";
  const routeCompany = routeParams.get("company") || "astar";
  const [language, setLanguage] = useState<Language>(routeLanguage);
  const [data, setData] = useState<WorkLetterData>(() => demoFor(routeCompany, routeLanguage));
  const [records, setRecords] = useState<WorkLetterRecord[]>([]);
  const [showRecords, setShowRecords] = useState(false);
  const company = companyFor(data.companyId);
  const english = language === "en";

  useEffect(() => {
    const saved = localStorage.getItem(draftKey(data.companyId, language));
    if (saved) try { setData(JSON.parse(saved)); } catch { /* use defaults */ }
    else setData(current => demoFor(current.companyId, language));
    listWorkLetters(data.companyId, language).then(setRecords).catch(() => toast.error(english ? "Database unavailable" : "تعذر قراءة قاعدة البيانات"));
  }, [data.companyId, language]);
  useEffect(() => { localStorage.setItem(draftKey(data.companyId, language), JSON.stringify(data)); }, [data, language]);

  function update(key: keyof WorkLetterData, value: string) { setData(current => ({ ...current, [key]: value })); }
  function navigateLetter(companyId: string, nextLanguage: Language) {
    const saved = localStorage.getItem(draftKey(companyId, nextLanguage));
    let nextData = demoFor(companyId, nextLanguage);
    if (saved) try { nextData = { ...nextData, ...JSON.parse(saved), companyId }; } catch { /* use demo data */ }
    setData(nextData);
    setLanguage(nextLanguage);
    window.history.replaceState({}, "", `/work-letters?company=${companyId}&language=${nextLanguage}`);
  }
  function changeCompany(companyId: string) { navigateLetter(companyId, language); }
  async function save() { await saveWorkLetter(data, language); setRecords(await listWorkLetters(data.companyId, language)); toast.success(english ? "Saved in the independent database" : "تم الحفظ في قاعدة البيانات المستقلة"); }
  async function remove(id: string) { await deleteWorkLetter(id); setRecords(await listWorkLetters(data.companyId, language)); }
  const labels = english ? { title: "Work Letters", subtitle: "Independent Arabic / English document workspace", data: "Document data", preview: "Live A4 preview", save: "Save record", print: "Print / PDF", records: "Records", company: "Company", employee: "Employee full name", job: "Job title", salary: "Monthly salary", birthPlace: "Place of birth", birthDate: "Date of birth", joiningDate: "Date of joining", issueDate: "Issue date", reference: "Reference", internal: "Internal number", passport: "Passport number (optional)", identity: "Identity number (optional)", issuer: "Issued by" } : { title: "خطابات العمل", subtitle: "مسار مستقل للوثائق العربية والإنجليزية", data: "بيانات الوثيقة", preview: "معاينة A4 مباشرة", save: "حفظ السجل", print: "طباعة / PDF", records: "السجلات", company: "الشركة", employee: "اسم الموظف الكامل", job: "المسمى الوظيفي", salary: "الراتب الشهري", birthPlace: "مكان الميلاد", birthDate: "تاريخ الميلاد", joiningDate: "تاريخ الالتحاق", issueDate: "تاريخ الإصدار", reference: "المرجع", internal: "الرقم الداخلي", passport: "رقم الجواز (اختياري)", identity: "رقم الهوية (اختياري)", issuer: "صادر من" };
  return <main className="work-letters-app" dir={english ? "ltr" : "rtl"}>
    <aside className="work-sidebar"><div className="work-brand"><div className="work-brand-mark">WL</div><div><b>{labels.title}</b><span>{labels.subtitle}</span></div></div><div className="work-language"><Languages size={17} /><button className={language === "ar" ? "active" : ""} onClick={() => navigateLetter(data.companyId, "ar")}>العربية</button><button className={language === "en" ? "active" : ""} onClick={() => navigateLetter(data.companyId, "en")}>English</button></div><div className="company-language-launchers">{COMPANIES.map(item => <div className="company-language-row" key={item.id}><b>{english ? item.nameEn : item.nameAr}</b><span><button onClick={() => navigateLetter(item.id, "ar")}>عربي</button><button onClick={() => navigateLetter(item.id, "en")}>English</button></span></div>)}</div><div className="work-steps"><span>01 · {english ? "Independent path" : "مسار مستقل"}</span><span>02 · {english ? "Separate records" : "سجلات منفصلة"}</span><span>03 · {english ? "A4 output" : "إخراج A4"}</span></div><div className="work-storage-note"><Database size={17} /><div><b>{english ? "IndexedDB active" : "قاعدة IndexedDB فعالة"}</b><span>{english ? "Records are isolated from the original app." : "السجلات معزولة عن النظام الأصلي."}</span></div></div>    </aside>
    <section className="work-workspace"><header className="work-toolbar"><div><span className="work-eyebrow">WORK-LETTERS / {company.short}</span><h1>{labels.data}</h1></div><div className="work-actions"><Button variant="outline" onClick={() => setShowRecords(value => !value)}><List size={16} /> {labels.records} ({records.length})</Button><Button variant="outline" onClick={() => setLocation(`/work-letters/preview?company=${data.companyId}&language=${language}`)}><FileDown size={16} /> {english ? "Official preview / PDF" : "المعاينة الرسمية / PDF"}</Button><Button onClick={save}><Save size={16} /> {labels.save}</Button></div></header><div className="visible-company-language-controls"><strong>{english ? "Choose company and language" : "اختر الشركة والنسخة"}</strong>{COMPANIES.map(item => <div className="visible-company-row" key={item.id}><span>{english ? item.nameEn : item.nameAr}</span><Button variant={data.companyId === item.id && language === "ar" ? "default" : "outline"} onClick={() => navigateLetter(item.id, "ar")}>عربي</Button><Button variant={data.companyId === item.id && language === "en" ? "default" : "outline"} onClick={() => navigateLetter(item.id, "en")}>English</Button></div>)}</div><div className="work-grid"><div className="work-form-card"><label>{labels.company}<select value={data.companyId} onChange={event => changeCompany(event.target.value)}>{COMPANIES.map(item => <option key={item.id} value={item.id}>{english ? item.nameEn : item.nameAr}</option>)}</select></label><label>{labels.employee}<Input value={data.employeeName} onChange={event => update("employeeName", event.target.value)} /></label><div className="work-form-row"><label>{labels.job}<Input value={data.jobTitle} onChange={event => update("jobTitle", event.target.value)} /></label><label>{labels.salary}<Input value={data.salary} onChange={event => update("salary", event.target.value)} /></label></div><label>{labels.birthPlace}<Input value={data.birthPlace} onChange={event => update("birthPlace", event.target.value)} /></label><div className="work-form-row"><label>{labels.passport}<Input value={data.passportNo || ""} onChange={event => update("passportNo", event.target.value)} placeholder={english ? "Optional" : "اختياري"} /></label><label>{labels.identity}<Input value={data.identityNo || ""} onChange={event => update("identityNo", event.target.value)} placeholder={english ? "Optional" : "اختياري"} /></label></div><div className="work-form-row"><label>{labels.birthDate}<Input value={data.birthDate} onChange={event => update("birthDate", event.target.value)} placeholder="DD/MM/YYYY" /></label><label>{labels.joiningDate}<Input value={data.joiningDate} onChange={event => update("joiningDate", event.target.value)} placeholder="DD/MM/YYYY" /></label></div><div className="work-form-row"><label>{labels.issueDate}<Input value={data.issueDate} onChange={event => update("issueDate", event.target.value)} placeholder="DD/MM/YYYY" /></label><label>{labels.reference}<Input value={data.reference} onChange={event => update("reference", event.target.value)} /></label></div><label>{labels.internal}<Input value={data.internalNo} onChange={event => update("internalNo", event.target.value)} /></label><label>{labels.issuer}<Input value={data.issuerName || (english ? "Ahmed Mohammed, Human Resources Manager" : "أحمد محمد، مدير الموارد البشرية")} onChange={event => update("issuerName", event.target.value)} /></label><div className="work-form-footer"><Button onClick={() => navigator.clipboard?.writeText(JSON.stringify(data))}><Copy size={15} /> {english ? "Copy data" : "نسخ البيانات"}</Button><span><Check size={14} /> {english ? "Auto-saved draft" : "مسودة محفوظة تلقائياً"}</span></div></div><div className="work-preview-card"><div className="work-preview-heading"><span>{labels.preview}</span><small>{english ? "QR + PDF417 · Portrait" : "QR + PDF417 · عمودي"}</small></div><LetterPreview data={data} language={language} /></div></div>{showRecords && <section className="work-records"><div className="work-records-title"><h2>{labels.records}</h2><span>{english ? "Independent IndexedDB records" : "سجلات IndexedDB المستقلة"}</span></div>{records.length === 0 ? <p>{english ? "No records saved for this company yet." : "لا توجد سجلات محفوظة لهذه الشركة بعد."}</p> : records.map(record => <div className="work-record" key={record.id}><div><b>{record.data.employeeName}</b><span>{record.data.reference} · {new Date(record.savedAt).toLocaleString(english ? "en-US" : "ar-YE")}</span></div><Button variant="outline" onClick={() => remove(record.id)}><Trash2 size={15} /> {english ? "Delete" : "حذف"}</Button></div>)}</section>}</section>
  </main>;
}
