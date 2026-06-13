"use client";
import { useState } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { ArrowLeft, Mail, Lock, Send, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const locale = useLocale();
  const [step, setStep] = useState<"email" | "code" | "reset">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const isZh = locale === "zh" || locale === "zht" || locale === "yue";

  async function sendCode() {
    if (!email) return;
    setLoading(true); setMsg("");
    const res = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const data = await res.json();
    if (data.success) { setStep("code"); setMsg(isZh ? "验证码已发送（开发模式请查看终端）" : "Code sent! (Check terminal in dev mode)"); }
    else setMsg(data.error);
    setLoading(false);
  }

  async function resetPassword() {
    if (!code || !password) return;
    setLoading(true); setMsg("");
    const res = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, code, password }) });
    const data = await res.json();
    if (data.success) { setStep("reset"); setMsg(isZh ? "密码重置成功！" : "Password reset successfully!"); }
    else setMsg(data.error);
    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <Link href={`/${locale}/login`} className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent mb-6"><ArrowLeft size={16} /> {isZh ? "返回登录" : "Back to Login"}</Link>
      <h1 className="text-2xl font-extrabold mb-6">{isZh ? "忘记密码" : "Forgot Password"}</h1>

      {step === "email" && (
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">{isZh ? "输入注册邮箱，我们将发送验证码。" : "Enter your registered email. We'll send you a verification code."}</p>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-3 rounded-xl border" />
          <button onClick={sendCode} disabled={loading} className="w-full py-3 bg-accent text-white font-semibold rounded-xl flex items-center justify-center gap-2"><Send size={16} /> {isZh ? "发送验证码" : "Send Code"}</button>
        </div>
      )}

      {step === "code" && (
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">{isZh ? "输入验证码和新密码" : "Enter the code and your new password."}</p>
          <input type="text" value={code} onChange={e => setCode(e.target.value)} placeholder={isZh ? "6位验证码" : "6-digit code"} maxLength={6} className="w-full px-4 py-3 rounded-xl border" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={isZh ? "新密码（至少8位）" : "New password (min 8 chars)"} className="w-full px-4 py-3 rounded-xl border" />
          <button onClick={resetPassword} disabled={loading} className="w-full py-3 bg-accent text-white font-semibold rounded-xl flex items-center justify-center gap-2"><Lock size={16} /> {isZh ? "重置密码" : "Reset Password"}</button>
        </div>
      )}

      {step === "reset" && (
        <div className="text-center space-y-4">
          <CheckCircle size={48} className="mx-auto text-success" />
          <p className="text-text-primary font-semibold">{msg}</p>
          <Link href={`/${locale}/login`} className="inline-block px-6 py-3 bg-accent text-white font-semibold rounded-xl">{isZh ? "去登录" : "Go to Login"}</Link>
        </div>
      )}

      {msg && <p className="text-sm text-center mt-4 text-text-muted">{msg}</p>}
    </div>
  );
}
