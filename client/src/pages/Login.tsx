import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  FileCheck2,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

type SessionState = "checking" | "locked" | "unlocked";

const features = [
  { icon: FileCheck2, title: "إصدار منظم", text: "مسارات إصدار قياسية وتحقق تلقائي" },
  { icon: Eye, title: "مراجعة واضحة", text: "عرض تفصيلي ودقيق قبل الاعتماد" },
  { icon: ArrowLeft, title: "تصدير جاهز", text: "تصدير آمن بصيغة جاهزة للمشاركة" },
];

export default function Login() {
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionState, setSessionState] = useState<SessionState>("checking");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/session")
      .then((response) => response.json())
      .then((data: { authenticated?: boolean }) => {
        if (cancelled) return;
        if (data.authenticated) {
          setSessionState("unlocked");
          setLocation("/editor");
        } else {
          setSessionState("locked");
        }
      })
      .catch(() => {
        if (!cancelled) setSessionState("locked");
      });

    return () => {
      cancelled = true;
    };
  }, [setLocation]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!password.trim() || isSubmitting) return;

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(data.message || "تعذر فتح البوابة. حاول مرة أخرى");
        return;
      }

      setSessionState("unlocked");
      const next = new URLSearchParams(window.location.search).get("next");
      setLocation(next && next.startsWith("/") ? next : "/editor");
    } catch {
      setError("تعذر الاتصال بالخادم. تحقق من الاتصال وحاول مرة أخرى");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isChecking = sessionState === "checking";

  return (
    <main className="login-page" dir="rtl">
      <div className="login-grid-lines" aria-hidden="true" />
      <div className="login-orbit login-orbit-one" aria-hidden="true" />
      <div className="login-orbit login-orbit-two" aria-hidden="true" />

      <section className="login-showcase" aria-label="مزايا البوابة">
        <div className="showcase-document" aria-hidden="true">
          <div className="document-corner" />
          <div className="document-seal">معتمد</div>
          <div className="document-lines">
            <span />
            <span />
            <span />
          </div>
          <div className="document-barcode">|||| ||| |||| | |||</div>
        </div>
        <div className="showcase-caption">
          <span className="showcase-caption-line" />
          <p>مساحة إصدار الوثائق التدريبية</p>
          <span className="showcase-caption-line" />
        </div>
        <div className="feature-list">
          {features.map(({ icon: Icon, title, text }) => (
            <div className="feature-item" key={title}>
              <span className="feature-icon"><Icon size={17} /></span>
              <span>
                <strong>{title}</strong>
                <small>{text}</small>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="login-card" aria-labelledby="login-title">
        <div className="login-brand">
          <div className="brand-mark login-brand-mark"><ShieldCheck size={23} /></div>
          <div>
            <span>GOOD CONDUCT / TRAINING PORTAL</span>
            <strong>بوابة حسن السيرة</strong>
          </div>
        </div>

        <div className="login-icon"><LockKeyhole size={25} /></div>
        <span className="eyebrow"><Sparkles size={14} /> بوابة الإصدار الآمنة</span>
        <h1 id="login-title">مرحبًا بك في <em>البوابة</em></h1>
        <p className="login-copy">أدخل كلمة المرور للمتابعة إلى بيئة الإصدار الآمنة وإعداد الوثائق التدريبية</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="password-field">
            <span className="sr-only">كلمة المرور</span>
            <KeyRound size={19} aria-hidden="true" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="كلمة المرور"
              autoComplete="current-password"
              autoFocus
              disabled={isChecking || isSubmitting}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "login-error" : undefined}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              disabled={isChecking || isSubmitting}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </label>

          {error && <p className="login-error" id="login-error" role="alert">{error}</p>}

          <Button className="login-button" type="submit" disabled={isChecking || isSubmitting || !password.trim()}>
            {isSubmitting ? "جارٍ التحقق..." : "فتح البوابة"}
            {!isSubmitting && <ArrowLeft size={18} />}
          </Button>
        </form>

        <div className="login-trust">
          <span><Check size={13} /> جلسة آمنة ومؤقتة</span>
          <span><Check size={13} /> لا تحفظ كلمات المرور</span>
        </div>
        <p className="login-footnote">بيئة تدريبية — استخدم بيانات وهمية فقط</p>
      </section>
    </main>
  );
}
