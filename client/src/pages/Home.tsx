import { useEffect, useMemo, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import {
  Download,
  FileCheck2,
  Link2,
  Unlink2,
  ClipboardList,
  ImagePlus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import bwipjs from "@bwip-js/browser";
import { useLocation } from "wouter";

const officialTemplate = "/assets/official-good-conduct-template.png";
const defaultPhoto = "/assets/training-photo.svg";

function formatDate(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  }
  return value;
}

function toArabicDigits(value: string) {
  return value.replace(/[0-9]/g, digit => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]);
}

function formatArabicDate(value: string) {
  return toArabicDigits(formatDate(value));
}

function toInputDate(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : "";
}

function cleanEnglish(value: string) {
  return value.replace(/[^\x20-\x7E]/g, " ").replace(/\s+/g, " ").trim();
}

export function migrateData(saved: Partial<FormState>) {
  const merged = { ...initial, ...saved };
  const idDate = toInputDate(merged.idIssueDateEn || merged.idIssueDateAr);
  const expiryDate = toInputDate(merged.expiryEn || merged.expiryAr);
  const passportExpiryDate = toInputDate(merged.passportEn || merged.passportAr);
  return {
    ...merged,
    issueDate: toInputDate(merged.issueDate) || initial.issueDate,
    idIssueDateAr: idDate || initial.idIssueDateAr,
    idIssueDateEn: idDate || initial.idIssueDateEn,
    expiryAr: expiryDate || initial.expiryAr,
    expiryEn: expiryDate || initial.expiryEn,
    passportAr: passportExpiryDate || initial.passportAr,
    passportEn: passportExpiryDate || initial.passportEn,
  };
}

const NATIONALITIES = [
  { ar: "اليمن", en: "Yemen" },
  { ar: "السعودية", en: "Saudi Arabia" },
  { ar: "عُمان", en: "Oman" },
  { ar: "الإمارات العربية المتحدة", en: "United Arab Emirates" },
  { ar: "مصر", en: "Egypt" },
  { ar: "الأردن", en: "Jordan" },
];

function randomDigits(length: number) {
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);
  return Array.from(values, value => String(value % 10)).join("");
}

function englishInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part.replace(/[^A-Za-z]/g, "").charAt(0).toUpperCase())
    .join("");
  return initials || "USR";
}

function generateInternalNo(name: string) {
  return `${englishInitials(name)}-${randomDigits(5)}`;
}

function generateReferenceNo() {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `REF-${stamp}-${randomDigits(6)}`;
}

function generateIssuanceNo() {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `ISS-${stamp}-${randomDigits(4)}`;
}

export type FormState = {
  issueNo: string;
  referenceNo: string;
  internalNo: string;
  issuanceNo: string;
  issueDate: string;
  fullNameAr: string;
  fullNameEn: string;
  surnameAr: string;
  surnameEn: string;
  birthPlaceAr: string;
  birthPlaceEn: string;
  birthDate: string;
  idTypeAr: string;
  idTypeEn: string;
  idNumberAr: string;
  idNumberEn: string;
  passportAr: string;
  passportEn: string;
  nationalityAr: string;
  nationalityEn: string;
  occupationAr: string;
  occupationEn: string;
  idIssueDateAr: string;
  idIssueDateEn: string;
  idIssuePlaceAr: string;
  idIssuePlaceEn: string;
  departmentAr: string;
  departmentEn: string;
  expiryAr: string;
  expiryEn: string;
  notesAr: string;
  notesEn: string;
};

export const initial: FormState = {
  issueNo: "20059",
  referenceNo: "20260903-1811",
  internalNo: "INT-00020059",
  issuanceNo: "20260904-7318",
  issueDate: "2025-12-11",
  fullNameAr: "جميل جبر أحمد",
  fullNameEn: "Jameel Jabr Ahmed",
  surnameAr: "الرملي",
  surnameEn: "Al-Ramli",
  birthPlaceAr: "السعودية، جدة",
  birthPlaceEn: "Jeddah, Saudi Arabia",
  birthDate: "16/02/1995",
  idTypeAr: "بطاقة شخصية",
  idTypeEn: "ID Card",
  idNumberAr: "10878313",
  idNumberEn: "10878313",
  passportAr: "2026-03-11",
  passportEn: "2026-03-11",
  nationalityAr: "اليمن",
  nationalityEn: "Yemen",
  occupationAr: "منسوب مبيعات",
  occupationEn: "Sales Representative",
  idIssueDateAr: "2023-03-01",
  idIssueDateEn: "2023-03-01",
  idIssuePlaceAr: "معين",
  idIssuePlaceEn: "Ma'in",
  departmentAr: "سفارة عمان",
  departmentEn: "Embassy of Oman",
  expiryAr: "2026-03-11",
  expiryEn: "2026-03-11",
  notesAr:
    "تم التحقق من سجلاتنا، ولم يتم العثور على أي سوابق جنائية بحق المذكور.",
  notesEn:
    "OUR RECORDS HAVE BEEN VERIFIED AND NO CRIMINAL RECORDS HAVE BEEN FOUND AGAINST THE AFOREMENTIONED",
};

function Field({
  label,
  value,
  onChange,
  dir = "rtl",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  dir?: "rtl" | "ltr";
}) {
  return (
    <div className="field">
      <Label>{label}</Label>
      <Input
        dir={dir}
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={e => onChange(e.currentTarget.value.trim())}
      />
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="field">
      <Label>{label}</Label>
      <Input
        type="date"
        dir="ltr"
        value={toInputDate(value)}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

function DatePairField({
  label,
  arabicValue,
  englishValue,
  linked,
  onToggle,
  onChange,
}: {
  label: string;
  arabicValue: string;
  englishValue: string;
  linked: boolean;
  onToggle: () => void;
  onChange: (side: "ar" | "en", value: string) => void;
}) {
  const change = (side: "ar" | "en", value: string) => {
    onChange(side, value);
    if (linked) onChange(side === "ar" ? "en" : "ar", value);
  };
  return (
    <div className="date-pair-field">
      <div className="date-pair-heading">
        <Label>{label}</Label>
        <button type="button" className={`link-toggle${linked ? " active" : ""}`} onClick={onToggle}>
          {linked ? <Link2 size={13} /> : <Unlink2 size={13} />}
          {linked ? "مرتبط" : "مستقل"}
        </button>
      </div>
      <div className="date-pair-grid">
        <div className="field">
          <label>العربي</label>
          <Input type="date" dir="rtl" lang="ar" value={toInputDate(arabicValue)} onChange={e => change("ar", e.target.value)} />
        </div>
        <div className="field">
          <label>English</label>
          <Input type="date" dir="ltr" lang="en" value={toInputDate(englishValue)} onChange={e => change("en", e.target.value)} />
        </div>
      </div>
    </div>
  );
}

function NationalityField({
  data,
  onChange,
}: {
  data: FormState;
  onChange: (changes: Partial<FormState>) => void;
}) {
  const selected = NATIONALITIES.find(option => option.en === data.nationalityEn);
  const isCustom = !selected;
  return (
    <div className="field nationality-field">
      <Label>الجنسية / Nationality</Label>
      <select
        dir="ltr"
        value={isCustom ? "custom" : data.nationalityEn}
        onChange={e => {
          const option = NATIONALITIES.find(item => item.en === e.target.value);
          if (option) onChange({ nationalityAr: option.ar, nationalityEn: option.en });
          else if (e.target.value === "custom") onChange({ nationalityAr: "", nationalityEn: "" });
        }}
      >
        {NATIONALITIES.map(option => (
          <option key={option.en} value={option.en}>{option.en} / {option.ar}</option>
        ))}
        <option value="custom">Custom / حر</option>
      </select>
      {isCustom && (
        <div className="custom-nationality-grid">
          <Input dir="rtl" aria-label="الجنسية الحرة" value={data.nationalityAr} onChange={e => onChange({ nationalityAr: e.target.value })} placeholder="العربية" />
          <Input dir="ltr" aria-label="Custom nationality" value={data.nationalityEn} onChange={e => onChange({ nationalityEn: e.target.value })} placeholder="English" />
        </div>
      )}
    </div>
  );
}

function AutoButton({ onClick, label = "تلقائي" }: { onClick: () => void; label?: string }) {
  return (
    <Button type="button" variant="outline" className="auto-button" onClick={onClick}>
      {label}
    </Button>
  );
}
function AdvancedBarcode({
  value,
  bcid,
  className = "advanced-barcode",
}: {
  value: string;
  bcid: "pdf417" | "azteccode";
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (ref.current)
      bwipjs.toCanvas(ref.current, {
        bcid,
        text: value || "TRAINING",
        scale: 2,
        height: bcid === "pdf417" ? 10 : 14,
        includetext: false,
        padding: 0,
      });
  }, [value, bcid]);
  return (
    <canvas
      ref={ref}
      className={className}
      data-barcode-value={value}
      aria-label={bcid === "pdf417" ? "باركود PDF417" : "باركود Aztec"}
    />
  );
}
function Barcode({ value }: { value: string }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (ref.current)
      JsBarcode(ref.current, value || "TRAINING", {
        format: "CODE128",
        displayValue: false,
        margin: 0,
        width: 1.25,
        height: 24,
      });
  }, [value]);
  return <svg ref={ref} className="linear-barcode" aria-label="باركود شريطي" />;
}

export function DocumentPreview({
  data,
  photo,
}: {
  data: FormState;
  photo: string;
}) {
  const rows = [
    [
      ["Full Name", data.fullNameEn],
      ["SURNAME", data.surnameEn],
      ["اللقب", data.surnameAr],
      ["الاسم", data.fullNameAr],
    ],
      [
        ["Birth Place", data.birthPlaceEn],
        ["BirthDate", formatDate(data.birthDate)],
        ["تاريخ الميلاد", formatArabicDate(data.birthDate)],
        ["محل الميلاد", data.birthPlaceAr],
      ],
    [
      ["Card Type", data.idTypeEn],
      ["ID Number", data.idNumberEn],
        ["رقم الهوية", toArabicDigits(data.idNumberAr)],
      ["نوع الهوية", data.idTypeAr],
    ],
      [
        ["Passport Expiry Date", formatDate(data.passportEn)],
        ["Nationality", data.nationalityEn],
        ["الجنسية", data.nationalityAr],
        ["تاريخ انتهاء الجواز", formatArabicDate(data.passportAr)],
      ],
      [
        ["Occupation", data.occupationEn],
        ["ID Issue Date", formatDate(data.idIssueDateEn)],
        ["تاريخ إصدار الهوية", formatArabicDate(data.idIssueDateAr)],
        ["المهنة", data.occupationAr],
      ],
    [
      ["ID Issue Place", data.idIssuePlaceEn],
      ["Department Requested", data.departmentEn],
      ["جهة إصدار الهوية", data.idIssuePlaceAr],
      ["الجهة الطالبة", data.departmentAr],
    ],
  ];
  const qrPayload = [
    `NAME: ${cleanEnglish(data.fullNameEn)}`,
    `SURNAME: ${cleanEnglish(data.surnameEn)}`,
    `BIRTH DATE: ${formatDate(data.birthDate)}`,
    `ID NUMBER: ${data.idNumberEn}`,
    `NATIONALITY: ${cleanEnglish(data.nationalityEn)}`,
    `OCCUPATION: ${cleanEnglish(data.occupationEn)}`,
  ].join("\n");
  const barcodePayload = [
    `ISSUE NO: ${data.issueNo}`,
    `REFERENCE NO: ${data.referenceNo}`,
    `ISSUANCE NO: ${data.issuanceNo}`,
  ].join("\n");
  return (
    <div className="document-wrap">
      <article className="document" id="print-document">
        <img
          className="word-template-bg"
          src={officialTemplate}
          alt=""
          aria-hidden="true"
        />
        <div className="doc-top">
          <div className="photo-stack">
            <img className="doc-photo" src={photo} alt="الصورة الشخصية" />
            <AdvancedBarcode
              value={barcodePayload}
              bcid="pdf417"
              className="linear-barcode"
            />
          </div>
          <div className="doc-meta">
            <div>
              <small>No. | رقم القيد</small>
              <b>{data.issueNo}</b>
            </div>
            <div>
              <small>Issue No. | رقم الإصدار</small>
              <b>{data.issuanceNo}</b>
            </div>
            <div>
              <small>Issue Date | تاريخ الإصدار</small>
              <b>{formatDate(data.issueDate)}</b>
            </div>
          </div>
          <div className="qr-box">
            <div className="personal-code" data-qr-value={qrPayload}>
              <QRCodeSVG value={qrPayload} size={112} level="H" includeMargin />
              <img src="/assets/yemen-emblem.png" alt="" />
            </div>
            <span>{data.fullNameAr || data.fullNameEn}</span>
          </div>
        </div>
        <div className="doc-table" aria-label="جدول البيانات ثنائي اللغة">
          {rows.map((row, i) => (
            <div className="doc-row" key={i}>
              <div className="doc-language english-side">
                {row.slice(0, 2).map(([label, value]) => (
                  <div className="doc-cell english" key={label}>
                    <span>{label}</span>
                    <b dir="ltr">{value}</b>
                  </div>
                ))}
              </div>
              <div className="doc-language arabic-side">
                {row.slice(2).map(([label, value]) => (
                  <div className="doc-cell arabic" key={label}>
                    <span>{label}</span>
                    <b dir="rtl">{value}</b>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="doc-statement">
          <div>{data.notesEn}</div>
          <div dir="rtl">{data.notesAr}</div>
        </div>
        <div className="doc-notes">
          <div>
            <p>
              Any erasure, alteration, or amendment to the information provided
              in this certificate renders it null and void.
            </p>
            <p>Date of expired {formatDate(data.expiryEn)}</p>
          </div>
          <div dir="rtl">
            <p>
              أي محو أو تعديل أو شطب في هذه البيانات يعتبر هذه الوثيقة لاغية
            </p>
            <p>تاريخ الانتهاء {formatDate(data.expiryAr)}</p>
          </div>
        </div>
        <div className="doc-signatures">
          <div className="office-signature">
            <b dir="rtl">مدير الجنائية والبحث م/عدن</b>
          </div>
          <div className="office-signature">
            <b dir="rtl">الحاسب الآلي م/عدن</b>
          </div>
        </div>
      </article>
    </div>
  );
}

export default function Home() {
  const [, setLocation] = useLocation();
  const [data, setData] = useState(initial);
  const [photo, setPhoto] = useState(defaultPhoto);
  const [generated, setGenerated] = useState(false);
  const [linkedDates, setLinkedDates] = useState({ idIssue: true, expiry: true, passport: true });
  useEffect(() => {
    try {
      const saved = localStorage.getItem("good-conduct-form-data");
      const savedPhoto = localStorage.getItem("good-conduct-form-photo");
      if (saved) setData(migrateData(JSON.parse(saved)));
      if (savedPhoto) setPhoto(savedPhoto);
    } catch {
      /* keep defaults */
    }
  }, []);
  const update = (key: keyof FormState) => (value: string) =>
    setData(d => ({ ...d, [key]: value }));
  const fields = useMemo(
    () =>
      [
        ["fullNameAr", "الاسم الكامل", "rtl"],
        ["fullNameEn", "Full Name", "ltr"],
        ["surnameAr", "اللقب", "rtl"],
        ["surnameEn", "Surname", "ltr"],
        ["birthPlaceAr", "محل الميلاد", "rtl"],
        ["birthPlaceEn", "Birth Place", "ltr"],
        ["birthDate", "تاريخ الميلاد / Birth Date", "ltr"],
        ["idTypeAr", "نوع الهوية", "rtl"],
        ["idTypeEn", "ID Type", "ltr"],
        ["idNumberAr", "رقم الهوية", "rtl"],
        ["idNumberEn", "ID Number", "ltr"],
        ["occupationAr", "المهنة", "rtl"],
        ["occupationEn", "Occupation", "ltr"],
        ["idIssuePlaceAr", "جهة إصدار الهوية", "rtl"],
        ["idIssuePlaceEn", "ID Issue Place", "ltr"],
        ["departmentAr", "الجهة الطالبة", "rtl"],
        ["departmentEn", "Department Requested", "ltr"],
      ] as const,
    []
  );
  const onPhoto = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result));
    reader.readAsDataURL(file);
  };
  const generate = () => {
    if (
      !data.issueNo.trim() ||
      !(data.fullNameAr.trim() || data.fullNameEn.trim())
    ) {
      toast.error("أدخل رقم القيد واسم صاحب الطلب أولًا");
      return;
    }
    localStorage.setItem("good-conduct-form-data", JSON.stringify(data));
    localStorage.setItem("good-conduct-form-photo", photo);
    const records = JSON.parse(
      localStorage.getItem("good-conduct-records") || "[]"
    );
    const record = {
      id: data.internalNo || `${data.issueNo}-${Date.now()}`,
      savedAt: new Date().toISOString(),
      data,
      photo,
    };
    localStorage.setItem(
      "good-conduct-records",
      JSON.stringify([
        record,
        ...records.filter((r: { id: string }) => r.id !== record.id),
      ])
    );
    setGenerated(true);
    toast.success("تم تحديث المعاينة بالبيانات");
    setLocation("/preview");
  };
  const reset = () => {
    setData(initial);
    setPhoto(defaultPhoto);
    localStorage.removeItem("good-conduct-form-data");
    localStorage.removeItem("good-conduct-form-photo");
    setGenerated(false);
    toast.info("تمت استعادة البيانات التجريبية");
  };
  return (
    <main className="app-shell editor-page">
      <aside className="control-panel">
        <div className="brand">
          <div className="brand-mark">
            <ShieldCheck size={21} />
          </div>
          <div>
            <p>CRIMINAL EVIDENCE</p>
            <h1>إصدار حسن السيرة</h1>
          </div>
        </div>
        <div className="panel-intro">
          <span className="eyebrow">
            <Sparkles size={14} /> قالب رسمي ثابت
          </span>
          <h2>
            أدخل البيانات.
            <br />
            <em>راجع الناتج.</em>
          </h2>
          <p>
            الورقة الرسمية هي القالب الأساسي. الحقول أدناه تغيّر البيانات
            المتغيرة فقط داخل نفس التصميم.
          </p>
        </div>
        <section className="form-section">
          <div className="section-heading">
            <span>01</span>
            <div>
              <h3>بيانات الإصدار</h3>
              <p>البيانات الظاهرة أعلى الوثيقة والرموز</p>
            </div>
          </div>
          <div className="form-grid">
            <Field
              label="رقم القيد / Issue No."
              value={data.issueNo}
              onChange={update("issueNo")}
              dir="ltr"
            />
            <div className="field-with-action">
              <Field
                label="الرقم المرجعي / Reference No."
                value={data.referenceNo}
                onChange={update("referenceNo")}
                dir="ltr"
              />
              <AutoButton label="تلقائي للاثنين" onClick={() => setData(d => ({ ...d, referenceNo: generateReferenceNo(), issuanceNo: generateIssuanceNo() }))} />
            </div>
            <div className="field-with-action">
              <Field
                label="رقم الإصدار / Issuance No."
                value={data.issuanceNo}
                onChange={update("issuanceNo")}
                dir="ltr"
              />
              <AutoButton label="تلقائي للاثنين" onClick={() => setData(d => ({ ...d, referenceNo: generateReferenceNo(), issuanceNo: generateIssuanceNo() }))} />
            </div>
            <div className="field-with-action">
              <Field
                label="الرقم الداخلي / Internal No."
                value={data.internalNo}
                onChange={update("internalNo")}
                dir="ltr"
              />
              <AutoButton onClick={() => setData(d => ({ ...d, internalNo: generateInternalNo(d.fullNameEn) }))} />
            </div>
            <DateField
              label="تاريخ الإصدار / Issue Date"
              value={data.issueDate}
              onChange={update("issueDate")}
            />
          </div>
          <div className="symbol-tester">
            <div className="symbol-tester-head">
              <span>LIVE CHECK</span>
              <strong>QR والباركود</strong>
            </div>
            <p>QR لبيانات الشخص، والباركود لرقم القيد والمرجعي ورقم الإصدار.</p>
            <div className="test-payload">
              <span>Barcode</span>
              <code>
                ISSUE NO: {data.issueNo} | REFERENCE NO: {data.referenceNo} | ISSUANCE NO: {data.issuanceNo}
              </code>
              <b>يتحدث تلقائيًا</b>
            </div>
          </div>
        </section>
        <section className="form-section">
          <div className="section-heading">
            <span>02</span>
            <div>
              <h3>بيانات صاحب الطلب</h3>
              <p>تظهر في الجدول العربي والإنجليزي</p>
            </div>
          </div>
          <div className="form-grid">
            {fields.map(([key, label, dir]) => (
              <Field
                key={key}
                label={label}
                value={data[key]}
                onChange={update(key)}
                dir={dir}
              />
            ))}
            <NationalityField
              data={data}
              onChange={changes => setData(d => ({ ...d, ...changes }))}
            />
            <DatePairField
              label="تاريخ إصدار الهوية / ID Issue Date"
              arabicValue={data.idIssueDateAr}
              englishValue={data.idIssueDateEn}
              linked={linkedDates.idIssue}
              onToggle={() => setLinkedDates(d => ({ ...d, idIssue: !d.idIssue }))}
              onChange={(side, value) => setData(d => ({ ...d, [side === "ar" ? "idIssueDateAr" : "idIssueDateEn"]: value }))}
            />
            <DatePairField
              label="تاريخ انتهاء الهوية / الجواز / Passport Expiry Date"
              arabicValue={data.passportAr}
              englishValue={data.passportEn}
              linked={linkedDates.passport}
              onToggle={() => setLinkedDates(d => ({ ...d, passport: !d.passport }))}
              onChange={(side, value) => setData(d => ({ ...d, [side === "ar" ? "passportAr" : "passportEn"]: value }))}
            />
            <DatePairField
              label="تاريخ انتهاء الوثيقة / Document Expiry Date"
              arabicValue={data.expiryAr}
              englishValue={data.expiryEn}
              linked={linkedDates.expiry}
              onToggle={() => setLinkedDates(d => ({ ...d, expiry: !d.expiry }))}
              onChange={(side, value) => setData(d => ({ ...d, [side === "ar" ? "expiryAr" : "expiryEn"]: value }))}
            />
          </div>
          <label className="upload-zone">
            <ImagePlus size={18} />
            <span>رفع الصورة الشخصية</span>
            <small>بيانات وهمية فقط</small>
            <input
              type="file"
              accept="image/*"
              onChange={e => onPhoto(e.target.files?.[0])}
            />
          </label>
        </section>
        <section className="form-section">
          <div className="section-heading">
            <span>03</span>
            <div>
              <h3>النصوص الختامية</h3>
              <p>الملاحظة أسفل الجدول</p>
            </div>
          </div>
          <div className="stack">
            <Textarea
              aria-label="الملاحظة العربية"
              dir="rtl"
              value={data.notesAr}
              onChange={e => setData(d => ({ ...d, notesAr: e.target.value }))}
            />
            <Textarea
              aria-label="English note"
              value={data.notesEn}
              onChange={e => setData(d => ({ ...d, notesEn: e.target.value }))}
            />
          </div>
        </section>
        <div className="actions">
          <Button onClick={generate}>
            <FileCheck2 size={17} /> تحديث المعاينة
          </Button>
          <Button variant="outline" onClick={reset}>
            <RotateCcw size={16} /> إعادة ضبط
          </Button>
          <Button variant="outline" onClick={() => setLocation("/records")}>
            <ClipboardList size={16} /> السجلات
          </Button>
        </div>
      </aside>
      <section className="preview-panel">
        <div className="preview-top">
          <div>
            <span className="eyebrow">OFFICIAL TEMPLATE PREVIEW</span>
            <h2>معاينة الورقة الرسمية</h2>
          </div>
          <div className="preview-actions">
            <span className={generated ? "status ready" : "status"}>
              <i /> {generated ? "تم التحديث" : "بيانات تجريبية"}
            </span>
            <Button
              variant="outline"
              onClick={() => {
                localStorage.setItem(
                  "good-conduct-form-data",
                  JSON.stringify(data)
                );
                localStorage.setItem("good-conduct-form-photo", photo);
                setLocation("/preview");
              }}
            >
              <Download size={16} /> PDF / طباعة
            </Button>
          </div>
        </div>
        <div className="preview-note">
          <ShieldCheck size={16} />
          <span>
            القالب الرسمي ثابت، والمتغيرات فقط هي البيانات التي تدخلها في لوحة
            التحكم.
          </span>
        </div>
        <DocumentPreview data={data} photo={photo} />
      </section>
    </main>
  );
}
