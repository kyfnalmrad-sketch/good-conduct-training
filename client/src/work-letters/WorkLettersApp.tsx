import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, Copy, Database, FileDown, FileText, Languages, List, Printer, Save, Trash2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import bwipjs from "@bwip-js/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { deleteWorkLetter, draftKey, listWorkLetters, saveWorkLetter, type WorkLetterData, type WorkLetterRecord } from "./db";

type Language = "ar" | "en";

type Company = { id: string; nameAr: string; nameEn: string; short: string };
const COMPANIES: Company[] = [
  { id: "astar", nameAr: "شركة أستار غاز يمن", nameEn: "Aster Gas Yemen Company", short: "ASTAR" },
  { id: "master", nameAr: "شركة ماستر بلاتينيوم لاستيراد الأجهزة والمستلزمات الطبية والإلكترونية", nameEn: "Master Platinum for Importing Medical and Electronic Equipment and Supplies", short: "MASTER" },
];

const INITIAL: WorkLetterData = {
  companyId: "astar", employeeName: "محمد علي أحمد", jobTitle: "مدير المشتريات", salary: "1500",
  birthPlace: "صنعاء، اليمن", birthDate: "18/04/1992", joiningDate: "12/01/2020", issueDate: "23/09/2026",
  reference: "ASTAR-HR-041-2026", internalNo: "ASTAR-INT-041-2026",
};
const EN_INITIAL: WorkLetterData = {
  ...INITIAL,
  employeeName: "Mohammed Ali Ahmed",
  jobTitle: "Procurement Manager",
  birthPlace: "Sana'a, Yemen",
};

function companyFor(id: string) { return COMPANIES.find(company => company.id === id) ?? COMPANIES[0]; }
function arabicDate(value: string) { return value.replace(/[0-9]/g, digit => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]); }
function dateForEnglish(value: string) { const [day, month, year] = value.split("/"); return `${day} ${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][Number(month) - 1]} ${year}`; }
function codePayload(data: WorkLetterData, language: Language) {
  const company = companyFor(data.companyId);
  return JSON.stringify({ company: company.nameEn, reference: data.reference, internalNo: data.internalNo, issueDate: data.issueDate.split("/").reverse().join("-"), employeeName: data.employeeName, jobTitle: data.jobTitle, salary: data.salary, language });
}
function barcodeSvg(data: WorkLetterData) {
  try { return bwipjs.toSVG({ bcid: "code128", text: `${data.reference}|${data.internalNo}|${data.issueDate}`, scale: 2, height: 9, includetext: false, paddingwidth: 2, paddingheight: 2 }); } catch { return ""; }
}

function LetterPreview({ data, language }: { data: WorkLetterData; language: Language }) {
  const company = companyFor(data.companyId);
  const qr = codePayload(data, language);
  const barcode = useMemo(() => barcodeSvg(data), [data]);
  const english = language === "en";
  return <article className={`work-letter-paper ${english ? "is-english" : "is-arabic"}`} dir={english ? "ltr" : "rtl"}>
    <div className="letter-topline"><span>{english ? "English preview" : "نسخة عربية"}</span><b>{english ? "A4 · Official work letter" : "A4 · خطاب رسمي"}</b></div>
    <header className="letter-header"><div className="letter-company-mark">{company.short.slice(0, 1)}</div><div><h2>{english ? company.nameEn : company.nameAr}</h2><p>{english ? "Human Resources Department" : "إدارة الموارد البشرية"}</p></div></header>
    <div className="letter-rule" />
    <div className="letter-meta"><div><span>{english ? "Internal No." : "الرقم الداخلي"}</span><b>{data.internalNo}</b></div><div><span>{english ? "Reference" : "المرجع"}</span><b>{data.reference}</b></div><div><span>{english ? "Date" : "التاريخ"}</span><b>{english ? dateForEnglish(data.issueDate) : arabicDate(data.issueDate)}</b></div></div>
    <div className="letter-main">
      <div className="letter-qr"><QRCodeSVG value={qr} size={116} level="M" fgColor="#2f5262" /></div>
      <h1>{english ? "To Whom It May Concern" : "إلى من يهمه الأمر"}</h1>
      {english ? <p className="letter-copy">{company.nameEn} presents its compliments. This is to certify that <strong>{data.employeeName}</strong> is employed by our company as <strong>{data.jobTitle}</strong>, with a monthly salary of <strong>USD {data.salary}</strong>. Place of birth: <strong>{data.birthPlace}</strong>; date of birth: <strong>{data.birthDate}</strong>; date of joining: <strong>{data.joiningDate}</strong>.<br />This certificate is issued at his request without any responsibility or obligation on the company.</p> : <p className="letter-copy">تهديكم <strong>{company.nameAr}</strong> أطيب تحياتها، ونفيدكم بأن الأخ <strong>{data.employeeName}</strong> يعمل لدى شركتنا بوظيفة <strong>{data.jobTitle}</strong>، ويتقاضى راتباً شهرياً قدره <strong>{data.salary}$</strong>. كما نود الإشارة إلى أن مكان ميلاده <strong>{data.birthPlace}</strong>، وتاريخ ميلاده <strong>{arabicDate(data.birthDate)}</strong>، وقد التحق بالعمل لدينا بتاريخ <strong>{arabicDate(data.joiningDate)}</strong>.<br />وقد أُصدرت له هذه الإفادة بناءً على طلبه، دون أدنى مسؤولية أو التزام على الشركة تجاه أي طرف آخر.</p>}
      <p className="letter-closing">{english ? "Yours faithfully," : "وتفضلوا بقبول خالص الاحترام والتقدير،،،"}</p>
    </div>
    <div className="letter-signature"><strong>{english ? "Human Resources Department" : "إدارة الموارد البشرية"}</strong><span>{english ? "Issued by: Ahmed Mohammed, Human Resources Manager" : "صادر من: أحمد محمد، مدير الموارد البشرية"}</span></div>
    <div className="letter-barcode" dangerouslySetInnerHTML={{ __html: barcode }} />
    <footer className="letter-footer">{english ? "Official document · A4 portrait · verify using QR and barcode" : "وثيقة رسمية · مقاس A4 عمودي · تحقق باستخدام QR والباركود"}</footer>
  </article>;
}

export default function WorkLettersApp() {
  const [language, setLanguage] = useState<Language>("ar");
  const [data, setData] = useState<WorkLetterData>(INITIAL);
  const [records, setRecords] = useState<WorkLetterRecord[]>([]);
  const [showRecords, setShowRecords] = useState(false);
  const company = companyFor(data.companyId);
  const english = language === "en";

  useEffect(() => {
    const saved = localStorage.getItem(draftKey(data.companyId, language));
    if (saved) try { setData(JSON.parse(saved)); } catch { /* use defaults */ }
    else setData(current => ({ ...(language === "en" ? EN_INITIAL : INITIAL), companyId: current.companyId, reference: current.reference, internalNo: current.internalNo }));
    listWorkLetters(data.companyId, language).then(setRecords).catch(() => toast.error(english ? "Database unavailable" : "تعذر قراءة قاعدة البيانات"));
  }, [data.companyId, language]);
  useEffect(() => { localStorage.setItem(draftKey(data.companyId, language), JSON.stringify(data)); }, [data, language]);

  function update(key: keyof WorkLetterData, value: string) { setData(current => ({ ...current, [key]: value })); }
  function changeCompany(companyId: string) { const next = companyFor(companyId); setData(current => ({ ...current, companyId, reference: `${next.short}-HR-041-2026`, internalNo: `${next.short}-INT-041-2026` })); }
  async function save() { await saveWorkLetter(data, language); setRecords(await listWorkLetters(data.companyId, language)); toast.success(english ? "Saved in the independent database" : "تم الحفظ في قاعدة البيانات المستقلة"); }
  async function remove(id: string) { await deleteWorkLetter(id); setRecords(await listWorkLetters(data.companyId, language)); }
  const labels = english ? { title: "Work Letters", subtitle: "Independent Arabic / English document workspace", data: "Document data", preview: "Live A4 preview", save: "Save record", print: "Print / PDF", records: "Records", company: "Company", employee: "Employee full name", job: "Job title", salary: "Monthly salary", birthPlace: "Place of birth", birthDate: "Date of birth", joiningDate: "Date of joining", issueDate: "Issue date", reference: "Reference", internal: "Internal number" } : { title: "خطابات العمل", subtitle: "مسار مستقل للوثائق العربية والإنجليزية", data: "بيانات الوثيقة", preview: "معاينة A4 مباشرة", save: "حفظ السجل", print: "طباعة / PDF", records: "السجلات", company: "الشركة", employee: "اسم الموظف الكامل", job: "المسمى الوظيفي", salary: "الراتب الشهري", birthPlace: "مكان الميلاد", birthDate: "تاريخ الميلاد", joiningDate: "تاريخ الالتحاق", issueDate: "تاريخ الإصدار", reference: "المرجع", internal: "الرقم الداخلي" };
  return <main className="work-letters-app" dir={english ? "ltr" : "rtl"}>
    <aside className="work-sidebar"><div className="work-brand"><div className="work-brand-mark">WL</div><div><b>{labels.title}</b><span>{labels.subtitle}</span></div></div><div className="work-language"><Languages size={17} /><button className={language === "ar" ? "active" : ""} onClick={() => setLanguage("ar")}>العربية</button><button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>English</button></div><div className="work-steps"><span>01 · {english ? "Independent path" : "مسار مستقل"}</span><span>02 · {english ? "Separate records" : "سجلات منفصلة"}</span><span>03 · {english ? "A4 output" : "إخراج A4"}</span></div><div className="work-storage-note"><Database size={17} /><div><b>{english ? "IndexedDB active" : "قاعدة IndexedDB فعالة"}</b><span>{english ? "Records are isolated from the original app." : "السجلات معزولة عن النظام الأصلي."}</span></div></div></aside>
    <section className="work-workspace"><header className="work-toolbar"><div><span className="work-eyebrow">WORK-LETTERS / {company.short}</span><h1>{labels.data}</h1></div><div className="work-actions"><Button variant="outline" onClick={() => setShowRecords(value => !value)}><List size={16} /> {labels.records} ({records.length})</Button><Button variant="outline" onClick={() => window.print()}><Printer size={16} /> {labels.print}</Button><Button onClick={save}><Save size={16} /> {labels.save}</Button></div></header><div className="work-grid"><div className="work-form-card"><label>{labels.company}<select value={data.companyId} onChange={event => changeCompany(event.target.value)}>{COMPANIES.map(item => <option key={item.id} value={item.id}>{english ? item.nameEn : item.nameAr}</option>)}</select></label><label>{labels.employee}<Input value={data.employeeName} onChange={event => update("employeeName", event.target.value)} /></label><div className="work-form-row"><label>{labels.job}<Input value={data.jobTitle} onChange={event => update("jobTitle", event.target.value)} /></label><label>{labels.salary}<Input value={data.salary} onChange={event => update("salary", event.target.value)} /></label></div><label>{labels.birthPlace}<Input value={data.birthPlace} onChange={event => update("birthPlace", event.target.value)} /></label><div className="work-form-row"><label>{labels.birthDate}<Input value={data.birthDate} onChange={event => update("birthDate", event.target.value)} placeholder="DD/MM/YYYY" /></label><label>{labels.joiningDate}<Input value={data.joiningDate} onChange={event => update("joiningDate", event.target.value)} placeholder="DD/MM/YYYY" /></label></div><div className="work-form-row"><label>{labels.issueDate}<Input value={data.issueDate} onChange={event => update("issueDate", event.target.value)} placeholder="DD/MM/YYYY" /></label><label>{labels.reference}<Input value={data.reference} onChange={event => update("reference", event.target.value)} /></label></div><label>{labels.internal}<Input value={data.internalNo} onChange={event => update("internalNo", event.target.value)} /></label><div className="work-form-footer"><Button onClick={() => navigator.clipboard?.writeText(JSON.stringify(data))}><Copy size={15} /> {english ? "Copy data" : "نسخ البيانات"}</Button><span><Check size={14} /> {english ? "Auto-saved draft" : "مسودة محفوظة تلقائياً"}</span></div></div><div className="work-preview-card"><div className="work-preview-heading"><span>{labels.preview}</span><small>{english ? "QR + Code128 · Portrait" : "QR + Code128 · عمودي"}</small></div><LetterPreview data={data} language={language} /></div></div>{showRecords && <section className="work-records"><div className="work-records-title"><h2>{labels.records}</h2><span>{english ? "Independent IndexedDB records" : "سجلات IndexedDB المستقلة"}</span></div>{records.length === 0 ? <p>{english ? "No records saved for this company yet." : "لا توجد سجلات محفوظة لهذه الشركة بعد."}</p> : records.map(record => <div className="work-record" key={record.id}><div><b>{record.data.employeeName}</b><span>{record.data.reference} · {new Date(record.savedAt).toLocaleString(english ? "en-US" : "ar-YE")}</span></div><Button variant="outline" onClick={() => remove(record.id)}><Trash2 size={15} /> {english ? "Delete" : "حذف"}</Button></div>)}</section>}</section>
  </main>;
}
