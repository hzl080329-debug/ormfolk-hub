"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import {
  Heart,
  ArrowLeft,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  Loader2,
} from "lucide-react";

export default function LoginPage() {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customCountry, setCustomCountry] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    username: "",
    country: "",
    city: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signup") {
        // Register first
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
            username: form.username,
            country: form.country === "__other__" ? customCountry : form.country,
            city: form.city,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Registration failed");
        }
      }

      // Sign in
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setError(
          locale === "zh"
            ? "邮箱或密码不正确"
            : locale === "th"
            ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
            : "Invalid email or password",
        );
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    await signIn("google", { callbackUrl: `/${locale}` });
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          {tc("back")}
        </Link>

        <div className="bg-white rounded-2xl border border-border shadow-sm p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4 shadow-md">
              <Heart size={28} className="text-white" fill="white" />
            </div>
            <h1 className="text-2xl font-extrabold text-text-primary mb-1">
              {mode === "login" ? t("login_title") : t("signup_title")}
            </h1>
            <p className="text-sm text-text-muted">
              {mode === "login"
                ? locale === "zh"
                  ? "欢迎回来 💜"
                  : locale === "th"
                  ? "ยินดีต้อนรับกลับมา 💜"
                  : "Welcome back 💜"
                : locale === "zh"
                ? "加入全球 ORMFOLK 社区"
                : locale === "th"
                ? "เข้าร่วมชุมชน ORMFOLK ระดับโลก"
                : "Join the global ORMFOLK community"}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-xl text-error text-sm text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1.5">
                  {t("username")}
                </label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
                  placeholder="OrmFolkFan"
                  required
                />
              </div>
            )}
            {mode === "signup" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1.5">
                    {locale === "zh" || locale === "zht" || locale === "yue" ? "国家/地区" : locale === "th" ? "ประเทศ" : "Country"}
                  </label>
                  <select
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    className="w-full px-3 py-3 rounded-xl border border-border bg-background text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
                  >
                    <option value="">{locale === "zh" || locale === "zht" || locale === "yue" ? "选择..." : "Select..."}</option>
                    <option value="China">🇨🇳 China 中国</option>
                    <option value="Thailand">🇹🇭 Thailand ไทย</option>
                    <option value="Japan">🇯🇵 Japan 日本</option>
                    <option value="South Korea">🇰🇷 South Korea</option>
                    <option value="Hong Kong, China">🇭🇰 Hong Kong, China 中国香港</option>
                    <option value="Singapore">🇸🇬 Singapore</option>
                    <option value="Malaysia">🇲🇾 Malaysia</option>
                    <option value="Indonesia">🇮🇩 Indonesia</option>
                    <option value="Philippines">🇵🇭 Philippines</option>
                    <option value="Vietnam">🇻🇳 Vietnam</option>
                    <option value="India">🇮🇳 India</option>
                    <option value="USA">🇺🇸 USA</option>
                    <option value="UK">🇬🇧 UK</option>
                    <option value="France">🇫🇷 France</option>
                    <option value="Germany">🇩🇪 Germany</option>
                    <option value="Brazil">🇧🇷 Brazil</option>
                    <option value="Australia">🇦🇺 Australia</option>
                    <option value="__other__">🌍 Other</option>
                  </select>
                  {form.country === "__other__" && (
                    <input
                      type="text"
                      value={customCountry}
                      onChange={(e) => { setCustomCountry(e.target.value); }}
                      placeholder={locale === "zh" || locale === "zht" || locale === "yue" ? "输入国家名..." : "Type country..."}
                      className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-light"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1.5">
                    {locale === "zh" || locale === "zht" || locale === "yue" ? "城市" : locale === "th" ? "เมือง" : "City"}
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full px-3 py-3 rounded-xl border border-border bg-background text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
                    placeholder={locale === "zh" || locale === "zht" || locale === "yue" ? "例：上海" : "e.g. Bangkok"}
                  />
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">
                {t("email")}
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
                  placeholder="you@email.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">
                {t("password")}
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-accent hover:bg-primary-dark text-white font-semibold rounded-xl shadow-md shadow-accent/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Sparkles size={18} />
              )}
              {mode === "login" ? t("login_btn") : t("signup_btn")}
            </button>
          </form>

          {mode === "login" && (
            <div className="text-center mt-2">
              <Link href={`/${locale}/auth/forgot-password`} className="text-xs text-text-muted hover:text-accent">
                {locale === "zh" || locale === "zht" || locale === "yue" ? "忘记密码？" : locale === "th" ? "ลืมรหัสผ่าน?" : "Forgot Password?"}
              </Link>
            </div>
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-xs text-text-muted">
                {t("or_continue")}
              </span>
            </div>
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 bg-white hover:bg-background text-text-primary font-semibold rounded-xl border border-border shadow-sm transition-all flex items-center justify-center gap-3 disabled:opacity-60"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {t("google_login")}
          </button>

          {/* Toggle mode */}
          <p className="text-center text-sm text-text-muted mt-6">
            {mode === "login" ? (
              <>
                {t("no_account")}{" "}
                <button
                  type="button"
                  onClick={() => { setMode("signup"); setError(""); }}
                  className="text-accent font-semibold hover:text-primary-dark transition-colors"
                >
                  {t("signup_btn")}
                </button>
              </>
            ) : (
              <>
                {t("has_account")}{" "}
                <button
                  type="button"
                  onClick={() => { setMode("login"); setError(""); }}
                  className="text-accent font-semibold hover:text-primary-dark transition-colors"
                >
                  {t("login_btn")}
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
