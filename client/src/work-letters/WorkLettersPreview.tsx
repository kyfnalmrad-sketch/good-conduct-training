import { ArrowLeft, FilePenLine, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { draftKey } from "./db";
import { demoFor, LetterPreview, type Language } from "./WorkLettersApp";
import type { WorkLetterData } from "./db";

export default function WorkLettersPreview() {
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const companyId = params.get("company") || "astar";
  const language = (params.get("language") === "en" ? "en" : "ar") as Language;
  const [data, setData] = useState<WorkLetterData>(() => demoFor(companyId, language));
  const english = language === "en";

  useEffect(() => {
    const stored = localStorage.getItem(draftKey(companyId, language));
    if (!stored) { setData(demoFor(companyId, language)); return; }
    try { setData(JSON.parse(stored)); } catch { /* keep demo data */ }
  }, [companyId, language]);

  useEffect(() => {
    document.title = english ? "Official Work Letter · English" : "خطاب العمل الرسمي · عربي";
    return () => { document.title = "نظام إصدار حسن السيرة | معاينة تدريبية"; };
  }, [english]);

  const changeLanguage = (next: Language) => setLocation(`/work-letters/preview?company=${companyId}&language=${next}`);
  return <main className={`work-letter-preview-page ${english ? "preview-en" : "preview-ar"}`} dir={english ? "ltr" : "rtl"}>
    <header className="work-letter-preview-toolbar">
      <div><span>WORK-LETTERS</span><strong>{english ? "Official document preview" : "المعاينة الرسمية للخطاب"}</strong></div>
      <div className="work-letter-preview-actions">
        <Button variant="outline" onClick={() => changeLanguage(language === "en" ? "ar" : "en")}>{english ? "العربية" : "English"}</Button>
        <Button variant="outline" onClick={() => setLocation(`/work-letters?company=${companyId}&language=${language}`)}><FilePenLine size={16} /> {english ? "Edit data" : "تعديل البيانات"}</Button>
        <Button onClick={() => window.print()}><Printer size={16} /> {english ? "Print / PDF" : "طباعة / PDF"}</Button>
      </div>
    </header>
    <div className="work-letter-preview-notice"><ArrowLeft size={15} /> {english ? "Only the official A4 paper is printed; the form and controls are excluded." : "تتم طباعة الورقة الرسمية A4 فقط، ولا يظهر نموذج الإدخال أو أدوات الموقع."}</div>
    <section className="work-letter-preview-stage"><LetterPreview data={{ ...data, companyId }} language={language} /></section>
  </main>;
}
