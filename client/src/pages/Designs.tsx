import {
  ArrowLeft,
  ArrowUpLeft,
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronLeft,
  ClipboardList,
  Clock3,
  FileCheck2,
  FilePenLine,
  Fingerprint,
  LayoutDashboard,
  LockKeyhole,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Upload,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

type Design = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  className: string;
  accent: string;
};

const designs: Design[] = [
  {
    id: "atlas",
    name: "01 — أطلس رسمي",
    tagline: "هيبة مؤسسية / وضوح يومي",
    description: "لوحة داكنة متزنة، تناسب بيئة إصدار رسمية وتُظهر الأرقام التشغيلية دون ازدحام.",
    className: "design-atlas",
    accent: "كحلي + ذهبي",
  },
  {
    id: "linen",
    name: "02 — ورق حكومي",
    tagline: "هادئ / موثوق / قريب من المستند",
    description: "اتجاه فاتح مستلهم من الورق الرسمي مع بطاقات خفيفة ومساحات تنفس واسعة.",
    className: "design-linen",
    accent: "عاجي + أخضر",
  },
  {
    id: "signal",
    name: "03 — إشارة تشغيل",
    tagline: "تحليلي / سريع / مركز",
    description: "نظام عملي يضع المؤشرات والإجراءات المهمة في الواجهة مع جدول سجلات واضح.",
    className: "design-signal",
    accent: "فحمي + ليموني",
  },
  {
    id: "noor",
    name: "04 — نور هادئ",
    tagline: "عصري / إنساني / عربي",
    description: "تجربة أكثر دفئًا، تجمع بين مدخل بسيط ولوحة عمل لطيفة مع إبقاء الطابع الرسمي.",
    className: "design-noor",
    accent: "نيلي + خوخي",
  },
];

const records = [
  { name: "أحمد محمد العتيبي", id: "GC-2026-0148", date: "06 سبتمبر 2026", status: "جاهز" },
  { name: "سارة خالد القحطاني", id: "GC-2026-0147", date: "06 سبتمبر 2026", status: "مسودة" },
  { name: "Omar Hassan Ali", id: "GC-2026-0146", date: "05 سبتمبر 2026", status: "جاهز" },
];

function Metric({ icon: Icon, label, value, delta }: { icon: typeof FileCheck2; label: string; value: string; delta: string }) {
  return (
    <div className="concept-metric">
      <span className="concept-metric-icon"><Icon size={16} /></span>
      <div><small>{label}</small><strong>{value}</strong><em><TrendingUp size={11} /> {delta}</em></div>
    </div>
  );
}

function LoginMini({ design }: { design: Design }) {
  return (
    <div className="concept-login">
      <div className="concept-login-art"><div className="concept-seal"><ShieldCheck size={19} /></div><span>GOOD CONDUCT</span><strong>إصدار موثوق<br />من أول مرة</strong><small>بيئة تدريبية • 2026</small></div>
      <div className="concept-login-form">
        <div className="concept-brand"><span><ShieldCheck size={15} /></span><b>بوابة حسن السيرة</b></div>
        <span className="concept-kicker"><Sparkles size={12} /> مرحبًا بك مجددًا</span>
        <h4>دخول آمن إلى<br /><i>مساحة الإصدار</i></h4>
        <p>استخدم بيانات الدخول للوصول إلى السجلات وإصدار وثيقة جديدة.</p>
        <label>كلمة المرور <span>••••••••</span><LockKeyhole size={13} /></label>
        <button>فتح البوابة <ArrowLeft size={14} /></button>
        <small>جلسة مؤقتة · لا تحفظ كلمات المرور</small>
      </div>
    </div>
  );
}

function DashboardMini({ design }: { design: Design }) {
  return (
    <div className="concept-dashboard">
      <aside className="concept-sidebar">
        <div className="concept-brand"><span><ShieldCheck size={15} /></span><b>حسن السيرة</b></div>
        <small className="concept-side-label">مساحة العمل</small>
        <a className="active"><LayoutDashboard size={14} />نظرة عامة</a>
        <a><ClipboardList size={14} />السجلات</a>
        <a><FilePenLine size={14} />إصدار جديد</a>
        <a><BarChart3 size={14} />التقارير</a>
        <div className="concept-side-user"><span>م</span><div><b>مدير النظام</b><small>متصل الآن</small></div></div>
      </aside>
      <div className="concept-main">
        <header className="concept-top"><div><span className="concept-kicker">نظرة عامة / سبتمبر 2026</span><h4>صباح الخير، مدير النظام</h4></div><div className="concept-top-actions"><button><Bell size={15} /></button><button className="concept-avatar">م</button></div></header>
        <div className="concept-metrics"><Metric icon={FileCheck2} label="إصدارات هذا الشهر" value="148" delta="18%" /><Metric icon={ClipboardList} label="إجمالي السجلات" value="1,284" delta="12%" /><Metric icon={Clock3} label="مسودات معلقة" value="06" delta="مراجعة" /></div>
        <div className="concept-work-grid"><section className="concept-chart"><div className="concept-section-head"><div><b>نشاط الإصدار</b><small>آخر 30 يومًا</small></div><button>هذا الشهر <ChevronLeft size={13} /></button></div><div className="fake-chart"><div className="fake-chart-line" /><div className="fake-bars"><i style={{ height: "42%" }} /><i style={{ height: "65%" }} /><i style={{ height: "52%" }} /><i style={{ height: "82%" }} /><i style={{ height: "58%" }} /><i style={{ height: "92%" }} /><i style={{ height: "72%" }} /><i style={{ height: "100%" }} /></div><div className="fake-chart-labels"><span>01</span><span>07</span><span>14</span><span>21</span><span>30</span></div></div></section><section className="concept-quick"><div className="concept-section-head"><b>إجراء سريع</b><MoreHorizontal size={15} /></div><button><span className="quick-icon"><Plus size={15} /></span><span><b>إصدار وثيقة جديدة</b><small>أدخل البيانات وابدأ المعاينة</small></span><ArrowUpLeft size={14} /></button><button><span className="quick-icon"><Upload size={15} /></span><span><b>استيراد سجلات</b><small>رفع ملف Excel للمعالجة</small></span><ArrowUpLeft size={14} /></button></section></div>
        <section className="concept-table"><div className="concept-section-head"><div><b>آخر السجلات</b><small>تحديث مباشر من مساحة العمل</small></div><button>عرض الكل <ChevronLeft size={13} /></button></div><div className="mini-table"><div className="mini-row mini-head"><span>اسم المستفيد</span><span>المرجع</span><span>الحالة</span><span>التاريخ</span></div>{records.map((record) => <div className="mini-row" key={record.id}><span><i className="row-avatar">{record.name.charAt(0)}</i>{record.name}</span><span className="mono">{record.id}</span><span><em className={record.status === "جاهز" ? "ready" : "draft"}>{record.status}</em></span><span>{record.date}</span></div>)}</div></section>
      </div>
    </div>
  );
}

function EditorMini() {
  return <div className="concept-editor"><div className="editor-head"><div><span className="concept-kicker">إصدار جديد / خطوة 01</span><h4>بيانات الوثيقة</h4></div><span className="draft-pill"><Clock3 size={12} /> مسودة محفوظة</span></div><div className="editor-steps"><span className="done">01 <b>البيانات الأساسية</b></span><i /><span>02 <b>المعاينة</b></span><i /><span>03 <b>الإصدار</b></span></div><div className="editor-grid"><label>رقم القيد <span>GC-2026-0149</span></label><label>الاسم بالعربية <span>أحمد محمد العتيبي</span></label><label>الاسم بالإنجليزية <span>Ahmed Mohammed Alotaibi</span></label><label>تاريخ الإصدار <span>06 / 09 / 2026</span></label></div><div className="editor-actions"><button className="ghost">حفظ كمسودة</button><button>متابعة للمعاينة <ArrowLeft size={14} /></button></div></div>;
}

function DesignConcept({ design }: { design: Design }) {
  return <article className={`design-concept ${design.className}`}><div className="concept-title"><div><span className="concept-index">{design.name.split(" — ")[0]}</span><h2>{design.name.split(" — ")[1]}</h2><p>{design.tagline}</p></div><span className="concept-accent">{design.accent}</span></div><p className="concept-description">{design.description}</p><div className="concept-preview"><LoginMini design={design} /><DashboardMini design={design} /><EditorMini /></div></article>;
}

export default function Designs() {
  const [, setLocation] = useLocation();
  const [active, setActive] = useState(() => new URLSearchParams(window.location.search).get("design") || "all");
  const visible = active === "all" ? designs : designs.filter((item) => item.id === active);
  return <main className="design-gallery" dir="rtl"><header className="design-gallery-header"><div className="gallery-brand"><span><ShieldCheck size={18} /></span><div><small>GOOD CONDUCT / CONCEPT LAB</small><strong>مختبر الواجهات</strong></div></div><div className="gallery-header-actions"><span className="review-badge"><Fingerprint size={14} /> معاينة داخلية فقط</span><button onClick={() => setLocation("/editor")}><ArrowLeft size={15} /> العودة للمحرر</button></div></header><section className="gallery-hero"><div><span className="concept-kicker"><Sparkles size={13} /> أربع اتجاهات مقترحة</span><h1>نصمم المساحة،<br /><i>قبل أن نثبتها.</i></h1><p>مجموعة أولية لاستكشاف شكل واجهة الدخول، لوحة المؤشرات، السجلات، ومنطقة إدخال البيانات. لا تغيّر هذه المعاينة أي مسار أو حقل موجود في النظام.</p></div><div className="gallery-hero-note"><span>قرار التصميم</span><strong>اختر اتجاهًا واحدًا</strong><small>ثم نطوره على الواجهات الفعلية بعد موافقتك.</small><div className="hero-rule" /></div></section><nav className="design-filter" aria-label="اختيار التصميم"><button className={active === "all" ? "selected" : ""} onClick={() => setActive("all")}>كل الاتجاهات <span>04</span></button>{designs.map((item) => <button key={item.id} className={active === item.id ? "selected" : ""} onClick={() => setActive(item.id)}>{item.name.split(" — ")[1]} <span>↗</span></button>)}</nav><section className="design-list">{visible.map((design) => <DesignConcept design={design} key={design.id} />)}</section><footer className="gallery-footer"><CheckCircle2 size={16} /><span>هذه صفحة معاينة محلية. لم يتم النشر أو تعديل مسارات الحقول أو التسميات النهائية.</span></footer></main>;
}

void LayoutDashboard;
void Users;
void Search;
