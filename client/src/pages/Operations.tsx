import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BarChart3, CalendarDays, ClipboardList, FileCheck2, Layers3, RefreshCw, ShieldCheck, Users } from "lucide-react";
import { useLocation } from "wouter";
import type { FormState } from "./Home";

type RecordItem = { id: string; savedAt: string; data: FormState };
const recordsKey = "good-conduct-records";

function personKey(data: FormState) {
  return [data.fullNameAr, data.fullNameEn, data.idNumberAr || data.idNumberEn, data.birthDate].map(value => value.trim().toLocaleLowerCase("ar")).filter(Boolean).join("|");
}

function monthLabel(date: Date) {
  return date.toLocaleDateString("ar-YE", { month: "short" });
}

export default function Operations() {
  const [, setLocation] = useLocation();
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const refresh = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(recordsKey) || "[]");
      setRecords(Array.isArray(parsed) ? parsed.filter(item => item?.data && item?.savedAt) : []);
      setLastUpdated(new Date());
    } catch {
      setRecords([]);
    }
  };
  useEffect(() => { refresh(); }, []);
  const uniquePeople = useMemo(() => new Set(records.map(record => personKey(record.data))).size, [records]);
  const readyCount = records.filter(record => record.data.issueNo && (record.data.fullNameAr || record.data.fullNameEn)).length;
  const recent = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, index) => {
      const month = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const count = records.filter(record => {
        const date = new Date(record.savedAt);
        return date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth();
      }).length;
      return { label: monthLabel(month), count };
    });
  }, [records]);
  const max = Math.max(...recent.map(item => item.count), 1);
  return <main className="operations-page noor-shell" dir="rtl">
    <header className="operations-header">
      <div className="standalone-brand"><div className="brand-mark"><ShieldCheck size={20} /></div><div><span>GOOD CONDUCT / OPERATIONS</span><strong>لوحة العمليات</strong></div></div>
      <div className="operations-header-actions"><span>آخر تحديث {lastUpdated.toLocaleTimeString("ar-YE", { hour: "2-digit", minute: "2-digit" })}</span><button type="button" onClick={refresh}><RefreshCw size={15} /> تحديث</button><button type="button" onClick={() => setLocation("/editor")}><ArrowRight size={15} /> العودة للإدخال</button></div>
    </header>
    <section className="operations-content">
      <div className="operations-title"><div><span className="eyebrow"><BarChart3 size={14} /> مؤشرات النظام</span><h1>صورة واضحة عن حركة الإصدار</h1><p>تجميع محلي للسجلات المحفوظة، مع احتساب الأشخاص مرة واحدة حسب الاسم والهوية وتاريخ الميلاد متى توفرت.</p></div><div className="operations-period"><CalendarDays size={16} /> آخر 6 أشهر</div></div>
      <div className="operations-metrics"><article><span><FileCheck2 size={18} /></span><small>إجمالي الإصدارات</small><strong>{records.length}</strong><em>سجل محفوظ</em></article><article><span><Users size={18} /></span><small>أشخاص دون تكرار</small><strong>{uniquePeople}</strong><em>حسب الاسم والبيانات التعريفية</em></article><article><span><ClipboardList size={18} /></span><small>سجلات جاهزة</small><strong>{readyCount}</strong><em>تحتاج متابعة فقط عند وجود نقص</em></article><article><span><Layers3 size={18} /></span><small>نسبة التكرار</small><strong>{records.length ? Math.max(0, records.length - uniquePeople) : 0}</strong><em>نسخة مكررة تم تجميعها</em></article></div>
      <div className="operations-grid"><section className="operations-chart"><div className="operations-section-head"><div><h2>نشاط الإصدارات</h2><p>عدد السجلات حسب شهر الحفظ</p></div><span className="chart-legend"><i /> إصدارات</span></div><div className="operations-bars">{recent.map(item => <div className="operation-bar" key={item.label}><strong>{item.count}</strong><i style={{ height: `${Math.max(7, (item.count / max) * 100)}%` }} /><small>{item.label}</small></div>)}</div></section><section className="operations-people"><div className="operations-section-head"><div><h2>الأشخاص الفريدون</h2><p>آخر الأسماء المسجلة دون تكرار</p></div><Users size={17} /></div><div className="people-list">{Array.from(new Map(records.map(record => [personKey(record.data), record])).values()).slice(0, 5).map(record => <div className="person-row" key={record.id}><span>{(record.data.fullNameAr || record.data.fullNameEn || "؟").charAt(0)}</span><div><strong>{record.data.fullNameAr || record.data.fullNameEn || "بدون اسم"}</strong><small>{record.data.referenceNo || record.data.issueNo || "—"}</small></div><b>{record.data.issueDate || "—"}</b></div>)}{!records.length && <p className="operations-empty">لا توجد سجلات محفوظة بعد.</p>}</div></section></div>
      <div className="operations-note"><ShieldCheck size={17} /><span>هذه المؤشرات تخص السجلات المحلية فقط. لا تغيّر هذه الصفحة تصميم الوثيقة الرسمية ولا تنفذ طباعة أو تصدير PDF.</span></div>
    </section>
  </main>;
}
