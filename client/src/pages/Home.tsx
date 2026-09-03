/* Design reminder: match the supplied Arabic/English certificate reference. Keep the document preview symmetrical, bilingual, A4-like, and visually restrained; generated training assets never alter the official document template. */
import { useMemo, useState } from "react";
import { Download, FileCheck2, ImagePlus, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const wordTemplate = "/manus-storage/word-template-page_b02f86d6.png";
const wordTemplateSource = "/manus-storage/official-training-template_dd7d4bd9.docx";

type FormState = {
  issueNo: string; referenceNo: string; internalNo: string; issueDate: string; fullNameAr: string; fullNameEn: string; surnameAr: string; surnameEn: string;
  birthPlaceAr: string; birthPlaceEn: string; birthDate: string; idTypeAr: string; idTypeEn: string;
  idNumberAr: string; idNumberEn: string; passportAr: string; passportEn: string; nationalityAr: string; nationalityEn: string;
  occupationAr: string; occupationEn: string; idIssueDateAr: string; idIssueDateEn: string; idIssuePlaceAr: string; idIssuePlaceEn: string;
  departmentAr: string; departmentEn: string; expiryAr: string; expiryEn: string; notesAr: string; notesEn: string;
};

const initial: FormState = {
  issueNo: "20059", referenceNo: "REF-ADN-2025-20059", internalNo: "INT-00020059", issueDate: "11/12/2025", fullNameAr: "جميل جبر أحمد", fullNameEn: "Jameel Jabr Ahmed", surnameAr: "الرملي", surnameEn: "Al-Ramli",
  birthPlaceAr: "السعودية، جدة", birthPlaceEn: "Jeddah, Saudi Arabia", birthDate: "16/02/1995", idTypeAr: "بطاقة شخصية", idTypeEn: "ID Card",
  idNumberAr: "10878313", idNumberEn: "10878313", passportAr: "جواز سفر", passportEn: "Passport", nationalityAr: "اليمن", nationalityEn: "Yemen",
  occupationAr: "منسوب مبيعات", occupationEn: "Sales Representative", idIssueDateAr: "01/03/2023", idIssueDateEn: "01/03/2023", idIssuePlaceAr: "معين", idIssuePlaceEn: "Ma'in",
  departmentAr: "سفارة عمان", departmentEn: "Embassy of Oman", expiryAr: "11/03/2026", expiryEn: "11/03/2026", notesAr: "تم التحقق من سجلاتنا، ولم يتم العثور على أي سوابق جنائية بحق المذكور.", notesEn: "OUR RECORDS HAVE BEEN VERIFIED AND NO CRIMINAL RECORDS HAVE BEEN FOUND AGAINST THE AFOREMENTIONED",
};

function Field({ label, value, onChange, dir = "rtl" }: { label: string; value: string; onChange: (v: string) => void; dir?: "rtl" | "ltr" }) {
  return <div className="field"><Label>{label}</Label><Input dir={dir} value={value} onChange={(e) => onChange(e.target.value)} /></div>;
}

function DocumentPreview({ data, photo }: { data: FormState; photo: string }) {
  const rows = [
    [["Full Name / Surname", `${data.fullNameEn} — ${data.surnameEn}`], ["الاسم واللقب", `${data.fullNameAr} — ${data.surnameAr}`]],
    [["Birth Place", data.birthPlaceEn], ["BirthDate", data.birthDate], ["تاريخ الميلاد", data.birthDate], ["محل الميلاد", data.birthPlaceAr]],
    [["Card Type", data.idTypeEn], ["ID Number", data.idNumberEn], ["رقم الهوية", data.idNumberAr], ["نوع الهوية", data.idTypeAr]],
    [["Passport", data.passportEn], ["Nationality", data.nationalityEn], ["الجنسية", data.nationalityAr], ["جواز سفر", data.passportAr]],
    [["Occupation", data.occupationEn], ["ID Issue Date", data.idIssueDateEn], ["تاريخ إصدار الهوية", data.idIssueDateAr], ["المهنة", data.occupationAr]],
    [["ID Issue Place", data.idIssuePlaceEn], ["Department Requested", data.departmentEn], ["جهة إصدار الهوية", data.idIssuePlaceAr], ["الجهة الطالبة", data.departmentAr]],
  ];
  return <div className="document-wrap"><article className="document" id="print-document"><div className="word-template-bg" style={{ backgroundImage: `url(${wordTemplate})` }} />
    <div className="doc-top"><img className="doc-photo" src={photo} alt="الصورة الشخصية" /><div className="doc-meta"><div><small>Issue Date | تاريخ الإصدار</small><b>{data.issueDate}</b></div><div><small>No. | رقم القيد</small><b>{data.issueNo}</b></div><div><small>Reference | المرجعي</small><b>{data.referenceNo}</b></div><div><small>Internal | الداخلي</small><b>{data.internalNo}</b></div></div><div className="qr-box"><QRCodeSVG value={`${data.referenceNo}|${data.internalNo}|${data.issueNo}|${data.fullNameEn}|${data.idNumberEn}`} size={64} level="M" includeMargin /><span>QR</span></div></div>
    <div className="doc-table" aria-label="جدول البيانات ثنائي اللغة">{rows.map((row, i) => i === 0 ? <div className="doc-row name-row" key={i}><div className="doc-cell english name-cell"><span>{row[0][0]}</span><b dir="ltr">{row[0][1]}</b></div><div className="doc-cell arabic name-cell"><span>{row[1][0]}</span><b dir="rtl">{row[1][1]}</b></div></div> : <div className="doc-row" key={i}><div className="doc-language english-side">{row.slice(0, 2).map(([label, value]) => <div className="doc-cell english" key={label}><span>{label}</span><b dir="ltr">{value}</b></div>)}</div><div className="doc-language arabic-side">{row.slice(2).map(([label, value]) => <div className="doc-cell arabic" key={label}><span>{label}</span><b dir="rtl">{value}</b></div>)}</div></div>)}</div>
    <div className="doc-statement"><div>{data.notesEn}</div><div dir="rtl">{data.notesAr}</div></div>
    <div className="doc-notes"><div><p>Any scratch or modification of the information provided in this certificate, maker it found</p><p>Date of expired {data.expiryEn}</p></div><div dir="rtl"><p>أي محو أو تعديل أو شطب في هذه البيانات يعتبر هذه الوثيقة لاغية</p><p>تاريخ الانتهاء {data.expiryAr}</p></div></div>
    <div className="doc-signatures"><span dir="rtl">مدير الأدلة الجنائية / عدن</span><span dir="rtl">الحاسب الآلي / عدن</span></div>
  </article></div>;
}

export default function Home() {
  const [data, setData] = useState(initial); const [photo, setPhoto] = useState("/manus-storage/dummy-training-photo_9abb6110.png");
  const [generated, setGenerated] = useState(false);
  const update = (key: keyof FormState) => (value: string) => setData((d) => ({ ...d, [key]: value }));
  const fields = useMemo(() => [
    ["fullNameAr", "الاسم الكامل", "rtl"], ["fullNameEn", "Full Name", "ltr"], ["surnameAr", "اللقب", "rtl"], ["surnameEn", "Surname", "ltr"],
    ["birthPlaceAr", "محل الميلاد", "rtl"], ["birthPlaceEn", "Birth Place", "ltr"], ["birthDate", "تاريخ الميلاد / Birth Date", "ltr"], ["idTypeAr", "نوع الهوية", "rtl"],
    ["idTypeEn", "ID Type", "ltr"], ["idNumberAr", "رقم الهوية", "ltr"], ["idNumberEn", "ID Number", "ltr"], ["passportAr", "جواز السفر", "rtl"], ["passportEn", "Passport", "ltr"],
    ["nationalityAr", "الجنسية", "rtl"], ["nationalityEn", "Nationality", "ltr"], ["occupationAr", "المهنة", "rtl"], ["occupationEn", "Occupation", "ltr"],
    ["idIssueDateAr", "تاريخ إصدار الهوية", "ltr"], ["idIssueDateEn", "ID Issue Date", "ltr"], ["idIssuePlaceAr", "جهة إصدار الهوية", "rtl"], ["idIssuePlaceEn", "ID Issue Place", "ltr"],
    ["departmentAr", "الجهة الطالبة", "rtl"], ["departmentEn", "Department Requested", "ltr"], ["expiryAr", "تاريخ الانتهاء", "ltr"], ["expiryEn", "Expiry Date", "ltr"],
  ] as const, []);
  const onPhoto = (file?: File) => { if (!file) return; const reader = new FileReader(); reader.onload = () => setPhoto(String(reader.result)); reader.readAsDataURL(file); };
  const generate = () => { setGenerated(true); toast.success("تم تحديث المعاينة بالبيانات الوهمية"); document.getElementById("print-document")?.scrollIntoView({ behavior: "smooth", block: "center" }); };
  const reset = () => { setData(initial); setGenerated(false); toast.info("تمت استعادة البيانات التجريبية"); };
  return <main className="app-shell"><aside className="control-panel"><div className="brand"><div className="brand-mark"><ShieldCheck size={21} /></div><div><p>CRIMINAL EVIDENCE</p><h1>إصدار حسن السيرة</h1></div></div><div className="panel-intro"><span className="eyebrow"><Sparkles size={14} /> تدريب محلي</span><h2>أدخل البيانات.<br /><em>راجع الناتج.</em></h2><p>واجهة تجريبية ببيانات وهمية. القالب الرسمي ثابت، والمتغيرات تنعكس مباشرة على معاينة الوثيقة.</p></div><section className="form-section"><div className="section-heading"><span>01</span><div><h3>بيانات الإصدار</h3><p>البيانات الظاهرة أعلى الوثيقة</p></div></div><div className="form-grid"><Field label="رقم القيد / Issue No." value={data.issueNo} onChange={update("issueNo")} dir="ltr" /><Field label="الرقم المرجعي / Reference No." value={data.referenceNo} onChange={update("referenceNo")} dir="ltr" /><Field label="الرقم الداخلي / Internal No." value={data.internalNo} onChange={update("internalNo")} dir="ltr" /><Field label="تاريخ الإصدار / Issue Date" value={data.issueDate} onChange={update("issueDate")} dir="ltr" /></div></section><section className="form-section"><div className="section-heading"><span>02</span><div><h3>بيانات صاحب الطلب</h3><p>تظهر متناظرة بالعربية والإنجليزية</p></div></div><div className="form-grid">{fields.map(([key,label,dir]) => <Field key={key} label={label} value={data[key]} onChange={update(key)} dir={dir} />)}</div><label className="upload-zone"><ImagePlus size={18} /><span>رفع الصورة الشخصية</span><small>JPG أو PNG · بيانات وهمية فقط</small><input type="file" accept="image/*" onChange={(e) => onPhoto(e.target.files?.[0])} /></label></section><section className="form-section"><div className="section-heading"><span>03</span><div><h3>الملاحظات</h3><p>النصوص العربية والإنجليزية أسفل الجدول</p></div></div><div className="stack"><Textarea dir="rtl" value={data.notesAr} onChange={(e) => setData((d) => ({ ...d, notesAr: e.target.value }))} /><Textarea value={data.notesEn} onChange={(e) => setData((d) => ({ ...d, notesEn: e.target.value }))} /></div></section><div className="actions"><Button onClick={generate}><FileCheck2 size={17} /> توليد المعاينة</Button><Button variant="outline" onClick={reset}><RotateCcw size={16} /> إعادة ضبط</Button></div></aside><section className="preview-panel"><div className="preview-top"><div><span className="eyebrow">LIVE DOCUMENT PREVIEW</span><h2>معاينة الناتج النهائي</h2></div><div className="preview-actions"><span className={generated ? "status ready" : "status"}><i /> {generated ? "تم التحديث" : "بيانات تجريبية"}</span><a className="template-link" href={wordTemplateSource} download>قالب Word</a><Button variant="outline" onClick={() => window.print()}><Download size={16} /> PDF / طباعة</Button></div></div><div className="preview-note"><ShieldCheck size={16} /><span>هذه المعاينة محلية ببيانات وهمية للمراجعة فقط. القالب الرسمي لا يُعدّل من داخل الواجهة.</span></div><DocumentPreview data={data} photo={photo} /></section></main>;
}
