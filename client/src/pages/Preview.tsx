import { ArrowRight, Download, FilePenLine, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { DocumentPreview, initial, type FormState } from "./Home";
import { useEffect, useState } from "react";

const savedDataKey = "good-conduct-form-data";
const savedPhotoKey = "good-conduct-form-photo";

export default function Preview() {
  const [, setLocation] = useLocation();
  const [data, setData] = useState<FormState>(initial);
  const [photo, setPhoto] = useState("/assets/training-photo.svg");

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(savedDataKey);
      const storedPhoto = localStorage.getItem(savedPhotoKey);
      if (storedData) setData({ ...initial, ...JSON.parse(storedData) });
      if (storedPhoto) setPhoto(storedPhoto);
    } catch {
      // Keep the training defaults if saved data is unavailable.
    }
  }, []);

  return (
    <main className="preview-page" dir="rtl">
      <header className="standalone-toolbar">
        <div className="standalone-brand">
          <div className="brand-mark">
            <ShieldCheck size={20} />
          </div>
          <div>
            <span>CRIMINAL EVIDENCE</span>
            <strong>معاينة الورقة الرسمية</strong>
          </div>
        </div>
        <div className="standalone-actions">
          <Button variant="outline" onClick={() => setLocation("/editor")}>
            <FilePenLine size={16} /> تعديل البيانات
          </Button>
          <Button onClick={() => window.print()}>
            <Download size={16} /> تصدير PDF
          </Button>
        </div>
      </header>
      <section className="standalone-preview-heading">
        <div>
          <span className="eyebrow">
            <ShieldCheck size={14} /> Official document preview
          </span>
          <h1>المعاينة النهائية</h1>
          <p>
            هذه الصفحة مخصصة للمعاينة والطباعة فقط. عند اختيار تصدير PDF سيظهر
            المستند بصيغة A4 الرسمية.
          </p>
        </div>
        <Button variant="ghost" onClick={() => setLocation("/editor")}>
          <ArrowRight size={16} /> العودة للمحرر
        </Button>
      </section>
      <DocumentPreview data={data} photo={photo} />
    </main>
  );
}
