"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { ArrowLeft, Shield, Lock, Eye, EyeOff, Baby, Save, Loader2, Check, Camera, Upload, X } from "lucide-react";
import { updatePrivacySettings, toggleMinorMode, setup2FA, verify2FA, disable2FA, updateProfile } from "@/lib/actions";

export default function SettingsPage() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [tab, setTab] = useState<"privacy" | "security" | "minor">("privacy");
  const [privacyLevel, setPrivacyLevel] = useState((session?.user as any)?.privacyLevel || "public");
  const [locationHidden, setLocationHidden] = useState((session?.user as any)?.locationHidden || false);
  const [twoFactorSecret, setTwoFactorSecret] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [minorMode, setMinorMode] = useState((session?.user as any)?.minorMode || false);
  const [profileImage, setProfileImage] = useState((session?.user as any)?.image || "");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const isZh = locale === "zh" || locale === "zht" || locale === "yue";
  const isTh = locale === "th";

  async function handlePrivacySave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg("");
    const fd = new FormData();
    fd.append("privacyLevel", privacyLevel);
    fd.append("locationHidden", String(locationHidden));
    try { await updatePrivacySettings(fd); await update(); setMsg(isZh ? "✅ 隐私设置已保存" : isTh ? "✅ บันทึกการตั้งค่าความเป็นส่วนตัวแล้ว" : "✅ Privacy settings saved"); }
    catch (err: any) { setMsg(isZh ? "❌ 保存失败" : "❌ Failed to save"); }
    finally { setLoading(false); }
  }

  async function handleSetup2FA() {
    setLoading(true);
    try { const result = await setup2FA(); setTwoFactorSecret(result.secret); setShow2FASetup(true); }
    catch (err: any) { setMsg(err.message); }
    finally { setLoading(false); }
  }

  // QR code URL for the secret
  const qrCodeUrl = twoFactorSecret
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`otpauth://totp/ORMFOLK+Hub:${(session?.user as any)?.email || 'user'}?secret=${twoFactorSecret}&issuer=ORMFOLK+Hub`)}`
    : "";

  async function handleVerify2FA(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg("");
    const fd = new FormData();
    fd.append("code", twoFactorCode);
    try { await verify2FA(fd); await update(); setShow2FASetup(false); setMsg(isZh ? "✅ 两步验证已启用" : "✅ 2FA enabled"); }
    catch (err: any) { setMsg(isZh ? "❌ 验证码错误" : "❌ Invalid code"); }
    finally { setLoading(false); }
  }

  async function handleDisable2FA() {
    if (!confirm(isZh ? "确定关闭两步验证？" : "Disable 2FA?")) return;
    setLoading(true);
    try { await disable2FA(); await update(); setMsg(isZh ? "两步验证已关闭" : "2FA disabled"); }
    catch (err: any) { setMsg(err.message); }
    finally { setLoading(false); }
  }

  async function handleMinorModeToggle(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg("");
    const fd = new FormData();
    fd.append("minorMode", String(minorMode));
    try { await toggleMinorMode(fd); await update(); setMsg(minorMode ? (isZh ? "✅ 未成年保护模式已开启" : "✅ Minor protection mode enabled") : (isZh ? "未成年保护模式已关闭" : "Minor protection mode disabled")); }
    catch (err: any) { setMsg(err.message); }
    finally { setLoading(false); }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true); setMsg("");
    const fd = new FormData();
    fd.append("files", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const url = data.files?.[0]?.url;
      if (url) {
        setProfileImage(url);
        const pFd = new FormData();
        pFd.append("image", url);
        await updateProfile(pFd);
        await update();
        setMsg(isZh ? "✅ 头像已更新！" : isTh ? "✅ อัปเดตรูปโปรไฟล์แล้ว!" : "✅ Profile photo updated!");
      }
    } catch (err: any) {
      setMsg(isZh ? "❌ 上传失败：" + err.message : "❌ Upload failed: " + err.message);
    }
    setUploadingPhoto(false);
  }

  async function handleRemovePhoto() {
    setProfileImage("");
    const fd = new FormData();
    fd.append("image", "");
    await updateProfile(fd);
    await update();
    setMsg(isZh ? "头像已移除" : isTh ? "ลบรูปโปรไฟล์แล้ว" : "Photo removed");
  }

  const tabs = [
    { key: "profile" as const, icon: Camera, label: isZh ? "头像" : isTh ? "รูปโปรไฟล์" : "Profile" },
    { key: "privacy" as const, icon: Eye, label: isZh ? "隐私" : isTh ? "ความเป็นส่วนตัว" : "Privacy" },
    { key: "security" as const, icon: Lock, label: isZh ? "安全" : isTh ? "ความปลอดภัย" : "Security" },
    { key: "minor" as const, icon: Baby, label: isZh ? "未成年保护" : isTh ? "การคุ้มครองเยาวชน" : "Minor Protection" },
  ];

  const has2FA = (session?.user as any)?.twoFactorEnabled;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link href={`/${locale}`} className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent transition-colors mb-6">
        <ArrowLeft size={16} /> {isZh ? "返回" : "Back"}
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-dark to-accent flex items-center justify-center"><Shield size={20} className="text-white" /></div>
        <h1 className="text-3xl font-extrabold text-text-primary">{isZh ? "设置" : isTh ? "การตั้งค่า" : "Settings"}</h1>
      </div>

      <div className="flex gap-2 mb-8">
        {tabs.map(({ key, icon: Icon, label }) => (
          <button key={key} onClick={() => setTab(key)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab === key ? "bg-accent text-white" : "bg-white border text-text-secondary"}`}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {msg && <div className="mb-4 p-3 bg-success/10 border border-success/30 rounded-xl text-success text-sm">{msg}</div>}

      {tab === "profile" && (
        <div className="bg-white rounded-2xl border p-6">
          <h2 className="text-lg font-bold mb-4">{isZh ? "头像照片" : isTh ? "รูปโปรไฟล์" : "Profile Photo"}</h2>
          <p className="text-sm text-text-muted mb-6">{isZh ? "上传照片或 GIF 作为你的头像。支持 JPG、PNG、GIF、WebP。" : isTh ? "อัปโหลดรูปภาพหรือ GIF เป็นรูปโปรไฟล์ รองรับ JPG, PNG, GIF, WebP" : "Upload a photo or GIF as your profile picture. Supports JPG, PNG, GIF, WebP."}</p>

          <div className="flex flex-col items-center gap-4">
            {/* Preview */}
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-border bg-background flex items-center justify-center">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <Camera size={40} className="text-text-muted" />
              )}
            </div>

            <div className="flex gap-3">
              <label className={`px-4 py-2 rounded-xl text-sm font-semibold text-white cursor-pointer transition-colors flex items-center gap-2 ${uploadingPhoto ? "bg-gray-400" : "bg-accent hover:bg-primary-dark"}`}>
                {uploadingPhoto ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {uploadingPhoto ? (isZh ? "上传中..." : "Uploading...") : (isZh ? "选择照片" : isTh ? "เลือกรูป" : "Choose Photo")}
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
              {profileImage && (
                <button onClick={handleRemovePhoto} className="px-4 py-2 bg-error/10 text-error text-sm font-semibold rounded-xl flex items-center gap-2 hover:bg-error/20 transition-colors">
                  <X size={16} /> {isZh ? "移除" : "Remove"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "privacy" && (
        <div className="bg-white rounded-2xl border p-6">
          <h2 className="text-lg font-bold mb-4">{isZh ? "隐私设置" : isTh ? "การตั้งค่าความเป็นส่วนตัว" : "Privacy Settings"}</h2>
          <form onSubmit={handlePrivacySave} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">{isZh ? "个人资料可见性" : isTh ? "การมองเห็นโปรไฟล์" : "Profile Visibility"}</label>
              <select value={privacyLevel} onChange={e => setPrivacyLevel(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm">
                <option value="public">{isZh ? "🌍 公开 - 所有人可见" : isTh ? "🌍 สาธารณะ - ทุกคนเห็น" : "🌍 Public - Everyone can see"}</option>
                <option value="followers">{isZh ? "👥 仅粉丝 - 关注者可见" : isTh ? "👥 ผู้ติดตาม - เฉพาะผู้ติดตาม" : "👥 Followers Only"}</option>
                <option value="private">{isZh ? "🔒 私密 - 仅自己可见" : isTh ? "🔒 ส่วนตัว - เฉพาะตัวเอง" : "🔒 Private - Only me"}</option>
              </select>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={locationHidden} onChange={e => setLocationHidden(e.target.checked)} className="w-5 h-5 rounded accent-accent" />
              <div>
                <div className="text-sm font-semibold text-text-primary">{isZh ? "隐藏我的位置" : isTh ? "ซ่อนตำแหน่งของฉัน" : "Hide My Location"}</div>
                <div className="text-xs text-text-muted">{isZh ? "在地图上不显示你的城市/国家" : "Don't show your city/country on the fan map"}</div>
              </div>
            </label>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white text-sm font-semibold rounded-xl disabled:opacity-50">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isZh ? "保存设置" : isTh ? "บันทึก" : "Save Settings"}
            </button>
          </form>
        </div>
      )}

      {tab === "security" && (
        <div className="bg-white rounded-2xl border p-6">
          <h2 className="text-lg font-bold mb-4">{isZh ? "安全设置" : isTh ? "การตั้งค่าความปลอดภัย" : "Security Settings"}</h2>

          <div className="mb-6 p-4 bg-background rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-sm font-semibold text-text-primary">{isZh ? "两步验证 (2FA)" : isTh ? "การยืนยันสองขั้นตอน" : "Two-Factor Authentication"}</div>
                <div className="text-xs text-text-muted">{isZh ? "为你的账户增加额外安全层" : "Add an extra security layer to your account"}</div>
              </div>
              {has2FA ? (
                <span className="flex items-center gap-1 text-xs text-success font-medium"><Check size={14} /> {isZh ? "已启用" : "Enabled"}</span>
              ) : (
                <span className="text-xs text-text-muted">{isZh ? "未启用" : "Not enabled"}</span>
              )}
            </div>
            {!show2FASetup && !has2FA && (
              <button onClick={handleSetup2FA} disabled={loading} className="px-4 py-2 bg-accent text-white text-sm rounded-xl">
                {loading ? <Loader2 size={14} className="animate-spin inline" /> : null} {isZh ? "设置两步验证" : "Set Up 2FA"}
              </button>
            )}
            {show2FASetup && !has2FA && (
              <div className="mt-3 p-4 bg-white rounded-lg border space-y-3">
                <div className="flex gap-4">
                  {qrCodeUrl && (
                    <img src={qrCodeUrl} alt="QR Code" className="w-[180px] h-[180px] rounded-lg border shrink-0" />
                  )}
                  <div className="flex-1 space-y-2">
                    <p className="text-xs font-semibold text-text-primary">{isZh ? "设置步骤：" : isTh ? "ขั้นตอน:" : "Setup Steps:"}</p>
                    <ol className="text-xs text-text-muted space-y-1 list-decimal list-inside">
                      <li>{isZh ? "打开 Google Authenticator 或任意 TOTP 认证应用" : isTh ? "เปิด Google Authenticator หรือแอป TOTP" : "Open Google Authenticator or any TOTP app"}</li>
                      <li>{isZh ? "扫描左侧二维码，或手动输入以下密钥：" : isTh ? "สแกน QR Code หรือกรอกรหัสด้วยตนเอง:" : "Scan the QR code or manually enter this key:"}</li>
                    </ol>
                    <code className="block text-xs font-mono bg-background p-2 rounded break-all select-all">{twoFactorSecret}</code>
                  </div>
                </div>
                <form onSubmit={handleVerify2FA} className="flex gap-2 pt-2 border-t">
                  <input type="text" value={twoFactorCode} onChange={e => setTwoFactorCode(e.target.value)} placeholder="000000" maxLength={6} className="flex-1 px-3 py-2 rounded-lg border text-sm text-center tracking-widest font-mono" required autoFocus />
                  <button type="submit" disabled={loading || twoFactorCode.length !== 6} className="px-4 py-2 bg-accent text-white text-sm rounded-lg disabled:opacity-50">
                    {loading ? <Loader2 size={14} className="animate-spin" /> : null} {isZh ? "验证并启用" : isTh ? "ยืนยัน" : "Verify & Enable"}
                  </button>
                </form>
              </div>
            )}
            {has2FA && (
              <button onClick={handleDisable2FA} disabled={loading} className="mt-2 px-4 py-2 bg-error/10 text-error text-sm rounded-xl">
                {isZh ? "关闭两步验证" : "Disable 2FA"}
              </button>
            )}
          </div>

          <div className="p-4 bg-background rounded-xl">
            <div className="text-sm font-semibold text-text-primary mb-1">{isZh ? "修改密码" : isTh ? "เปลี่ยนรหัสผ่าน" : "Change Password"}</div>
            <p className="text-xs text-text-muted mb-3">{isZh ? "如需修改密码，请使用忘记密码功能重新设置。" : "Use the forgot password feature to reset your password."}</p>
            <Link href={`/${locale}/auth/forgot-password`} className="text-sm text-accent hover:underline">
              {isZh ? "前往忘记密码 →" : isTh ? "ลืมรหัสผ่าน →" : "Forgot Password →"}
            </Link>
          </div>
        </div>
      )}

      {tab === "minor" && (
        <div className="bg-white rounded-2xl border p-6">
          <h2 className="text-lg font-bold mb-4">{isZh ? "未成年保护模式" : isTh ? "โหมดการคุ้มครองเยาวชน" : "Minor Protection Mode"}</h2>
          <p className="text-sm text-text-muted mb-6">{isZh ? "开启后，系统将自动隐藏敏感内容，限制私信功能，并过滤不当言论。此设置为自愿开启，建议18岁以下用户使用。" : isTh ? "เมื่อเปิดใช้งาน ระบบจะซ่อนเนื้อหาที่ละเอียดอ่อน จำกัดข้อความส่วนตัว และกรองคำพูดที่ไม่เหมาะสม" : "When enabled, sensitive content will be hidden, private messaging will be restricted, and inappropriate language will be filtered. Recommended for users under 18."}</p>
          <form onSubmit={handleMinorModeToggle}>
            <label className="flex items-center gap-3 cursor-pointer mb-4">
              <input type="checkbox" checked={minorMode} onChange={e => setMinorMode(e.target.checked)} className="w-5 h-5 rounded accent-accent" />
              <div>
                <div className="text-sm font-semibold text-text-primary">{isZh ? "开启未成年保护模式" : isTh ? "เปิดโหมดการคุ้มครองเยาวชน" : "Enable Minor Protection Mode"}</div>
                <div className="text-xs text-text-muted">{isZh ? "此设置可随时关闭" : "You can turn this off anytime"}</div>
              </div>
            </label>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white text-sm font-semibold rounded-xl disabled:opacity-50">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isZh ? "保存设置" : isTh ? "บันทึก" : "Save Settings"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
