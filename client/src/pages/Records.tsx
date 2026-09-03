import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  FilePenLine,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { initial, type FormState } from "./Home";

type RecordItem = {
  id: string;
  savedAt: string;
  data: FormState;
  photo: string;
};
const recordsKey = "good-conduct-records";

export default function Records() {
  const [, setLocation] = useLocation();
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [query, setQuery] = useState("");
  useEffect(() => {
    try {
      setRecords(JSON.parse(localStorage.getItem(recordsKey) || "[]"));
    } catch {
      setRecords([]);
    }
  }, []);
  const filtered = useMemo(
    () =>
      records.filter(r =>
        `${r.data.issueNo} ${r.data.fullNameAr} ${r.data.fullNameEn} ${r.data.referenceNo}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [records, query]
  );
  const edit = (record: RecordItem) => {
    localStorage.setItem("good-conduct-form-data", JSON.stringify(record.data));
    localStorage.setItem("good-conduct-form-photo", record.photo);
    setLocation("/editor");
  };
  const remove = (id: string) => {
    const next = records.filter(r => r.id !== id);
    setRecords(next);
    localStorage.setItem(recordsKey, JSON.stringify(next));
  };
  return (
    <main className="records-page" dir="rtl">
      <header className="records-header">
        <div className="standalone-brand">
          <div className="brand-mark">
            <ShieldCheck size={20} />
          </div>
          <div>
            <span>CRIMINAL EVIDENCE</span>
            <strong>سجلات الوثائق</strong>
          </div>
        </div>
        <Button variant="outline" onClick={() => setLocation("/editor")}>
          <ArrowRight size={16} /> العودة للمحرر
        </Button>
      </header>
      <section className="records-content">
        <div className="records-title">
          <div>
            <span className="eyebrow">LOCAL RECORDS · نسخة أولى</span>
            <h1>سجلات حسن السيرة</h1>
            <p>
              تحفظ هذه النسخة السجلات داخل هذا المتصفح مؤقتًا حتى ربط قاعدة
              البيانات.
            </p>
          </div>
          <strong>{records.length} سجل</strong>
        </div>
        <label className="records-search">
          <Search size={17} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="ابحث بالاسم أو رقم القيد أو الرقم المرجعي"
          />
        </label>
        <div className="records-list">
          {filtered.length ? (
            filtered.map(record => (
              <article className="record-card" key={record.id}>
                <div>
                  <span>
                    {record.data.issueNo} · {record.data.referenceNo}
                  </span>
                  <h2>{record.data.fullNameAr || record.data.fullNameEn}</h2>
                  <p>
                    {record.data.fullNameEn} · تاريخ الإصدار{" "}
                    {record.data.issueDate}
                  </p>
                  <small>
                    حُفظ في {new Date(record.savedAt).toLocaleString("ar-YE")}
                  </small>
                </div>
                <div className="record-actions">
                  <Button onClick={() => edit(record)}>
                    <FilePenLine size={16} /> تعديل
                  </Button>
                  <Button variant="outline" onClick={() => remove(record.id)}>
                    <Trash2 size={16} /> حذف
                  </Button>
                </div>
              </article>
            ))
          ) : (
            <div className="records-empty">
              <ShieldCheck size={28} />
              <h2>{query ? "لا توجد نتائج" : "لا توجد سجلات محفوظة"}</h2>
              <p>احفظ أول وثيقة من صفحة المعاينة لتظهر هنا.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
