import {
  ArrowLeft,
  FileCheck2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Login() {
  const [, setLocation] = useLocation();

  return (
    <main className="login-page" dir="rtl">
      <div className="login-decoration login-decoration-one" />
      <div className="login-decoration login-decoration-two" />
      <section className="login-card">
        <div className="login-brand">
          <div className="brand-mark">
            <ShieldCheck size={23} />
          </div>
          <div>
            <span>CRIMINAL EVIDENCE</span>
            <strong>إصدار حسن السيرة</strong>
          </div>
        </div>
        <div className="login-icon">
          <LockKeyhole size={25} />
        </div>
        <span className="eyebrow">
          <Sparkles size={14} /> بوابة الإصدار الرسمية
        </span>
        <h1>
          مرحبًا بك في
          <br />
          <em>منشئ الوثائق</em>
        </h1>
        <p className="login-copy">
          أنشئ ورقة حسن سيرة رسمية، راجعها في صفحة مستقلة، ثم صدّرها بصيغة PDF
          جاهزة للطباعة.
        </p>
        <Button className="login-button" onClick={() => setLocation("/editor")}>
          <FileCheck2 size={18} /> الدخول إلى لوحة الإصدار{" "}
          <ArrowLeft size={17} />
        </Button>
        <p className="login-footnote">بيئة تدريبية — استخدم بيانات وهمية فقط</p>
      </section>
    </main>
  );
}
