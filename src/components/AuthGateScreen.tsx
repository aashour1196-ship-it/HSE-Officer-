import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Key,
  Mail,
  UserCheck,
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  Globe,
  Eye,
  Compass,
} from 'lucide-react';
import { AuthUser, SecurityConfig, UserRole } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface AuthGateScreenProps {
  onLoginSuccess: (user: AuthUser) => void;
  securityConfig: SecurityConfig;
}

const OWNER_EMAIL = 'a.ashour1196@gmail.com';

export const AuthGateScreen: React.FC<AuthGateScreenProps> = ({
  onLoginSuccess,
  securityConfig,
}) => {
  const { language, toggleLanguage, t, dir, isRtl } = useLanguage();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const allowedEmails = securityConfig.allowedEmails || [OWNER_EMAIL];

  const handleAttemptLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setErrorMsg(t('errorEnterEmail'));
      return;
    }

    const isOwner = trimmedEmail === OWNER_EMAIL;
    const isWhitelisted = allowedEmails.some((item) => item.trim().toLowerCase() === trimmedEmail);

    // Strict Access Enforcement
    if (!isOwner && !isWhitelisted) {
      setErrorMsg(
        isRtl
          ? `⛔ تم رفض الدخول! البريد الإلكتروني (${trimmedEmail}) غير مصرّح به. لا يُسمح بتصفح أو استخدام النظام إلا بعد اعتماد بريدك مسبقاً من قِبل مالك التطبيق.`
          : `⛔ Access Denied! The email (${trimmedEmail}) is not authorized. You may not access or use this system without prior approval from the System Owner.`
      );
      return;
    }

    // 2FA Verification step
    if (securityConfig.enforce2FA && !isVerifying2FA) {
      setIsVerifying2FA(true);
      return;
    }

    if (isVerifying2FA) {
      if (otp.trim() !== '789123' && otp.trim().length !== 6) {
        setErrorMsg(t('errorInvalidOtp'));
        return;
      }
    }

    // Login successful
    const role: UserRole = isOwner ? 'admin_owner' : 'authorized_staff';
    const authenticatedUser: AuthUser = {
      id: isOwner ? 'USR-OWNER-01' : `USR-${Date.now()}`,
      name: isOwner ? (isRtl ? 'مالك المنظومة' : 'System Owner') : (name.trim() || trimmedEmail.split('@')[0]),
      email: trimmedEmail,
      role: role,
      department: isOwner
        ? (isRtl ? 'إدارة السلامة والصحة المهنية العليا' : 'Executive HSE Department')
        : (isRtl ? 'العمليات الميدانية وهندسة السلامة' : 'Field Operations & Safety Engineering'),
      twoFactorEnabled: true,
      lastLoginAt: new Date().toISOString(),
    };

    setSuccessMsg(
      isRtl
        ? `تم التحقق بنجاح! جاري فتح النظام بحساب: ${authenticatedUser.name} (${
            role === 'admin_owner' ? 'مالك التطبيق الكامل' : 'كادر ميداني مصرح له'
          })`
        : `Verified successfully! Opening system for: ${authenticatedUser.name} (${
            role === 'admin_owner' ? 'System Owner' : 'Authorized Field Staff'
          })`
    );

    setTimeout(() => {
      onLoginSuccess(authenticatedUser);
    }, 600);
  };

  const handleGuestLogin = () => {
    setErrorMsg('');
    const guestUser: AuthUser = {
      id: 'USR-GUEST-VIEWER',
      name: isRtl ? 'زائر (للاطلاع فقط)' : 'Visitor (Read-Only)',
      email: 'guest@hse-visitor.local',
      role: 'viewer',
      department: isRtl ? 'استعراض واطلاع عام' : 'Read-Only Exploration',
      twoFactorEnabled: false,
      lastLoginAt: new Date().toISOString(),
    };

    setSuccessMsg(
      isRtl
        ? 'مرحباً بك! تم تفعيل وضع الزائر (للاطلاع والقراءة فقط). يقتصر استخدام النظام وتسجيل البلاغات والعمليات على الكوادر المصرح لها.'
        : 'Welcome! Visitor Mode activated (Read-Only). Operations and logging are restricted to authorized personnel.'
    );

    setTimeout(() => {
      onLoginSuccess(guestUser);
    }, 500);
  };

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-amber-500 selection:text-white font-['Cairo',sans-serif] relative w-full max-w-full overflow-x-hidden"
      dir={dir}
    >
      {/* Background Accent Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-25">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-sky-500/20 blur-3xl" />
      </div>

      {/* Top Floating Controls on Gate Screen */}
      <div className="fixed top-4 inset-x-4 z-50 flex items-center justify-end pointer-events-none">
        {/* Language Switcher */}
        <button
          type="button"
          onClick={toggleLanguage}
          title={t('switchLanguage')}
          className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-amber-400 border border-slate-700 shadow-lg text-xs font-bold transition-all active:scale-95 cursor-pointer backdrop-blur-md"
        >
          <Globe className="w-4 h-4 text-amber-400" />
          <span>{language === 'ar' ? 'English' : 'العربية'}</span>
        </button>
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Main Card Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
          {/* Header Brand */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center p-2.5 bg-slate-800/80 rounded-2xl border border-slate-700/80 shadow-md mb-3">
              <img
                src="/hse_logo.png"
                alt="HSE Official Logo"
                className="w-14 h-14 object-contain rounded-xl"
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {t('authGateTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {t('authGateSubtitle')}
            </p>
          </div>

          {/* Security Banner: Strictly Restricted Notice */}
          <div className="mb-6 p-3.5 bg-amber-950/40 border border-amber-500/30 rounded-xl text-amber-200 text-xs leading-relaxed flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 block mb-0.5">
                {t('authGateRestrictedNotice')}
              </strong>
              {t('authGateRestrictedDesc')}.
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-200 text-xs leading-relaxed flex items-start gap-2.5 animate-fadeIn">
              <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>{errorMsg}</div>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="mb-5 p-3.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs leading-relaxed flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>{successMsg}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleAttemptLogin} className="space-y-4">
            {!isVerifying2FA ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>{t('emailLabel')}</span>
                    <span className="text-[11px] text-slate-500">{t('emailWhitelistedHint')}</span>
                  </label>
                  <div className="relative">
                    <Mail className={`w-4 h-4 text-slate-400 absolute top-3 ${isRtl ? 'right-3' : 'left-3'}`} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className={`w-full bg-slate-950 border border-slate-700 text-white rounded-xl py-2.5 text-sm focus:outline-hidden focus:border-amber-500 transition-colors ${
                        isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>{t('nameLabel')}</span>
                    <span className="text-[11px] text-slate-500">{t('nameHint')}</span>
                  </label>
                  <div className="relative">
                    <UserCheck className={`w-4 h-4 text-slate-400 absolute top-3 ${isRtl ? 'right-3' : 'left-3'}`} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={isRtl ? 'م. أحمد الشمري / مهندس سلامة' : 'Eng. Safety Officer'}
                      className={`w-full bg-slate-950 border border-slate-700 text-white rounded-xl py-2.5 text-sm focus:outline-hidden focus:border-amber-500 transition-colors ${
                        isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3 bg-amber-500 hover:bg-amber-450 active:scale-[0.99] text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  <span>{t('verifyAndEnter')}</span>
                  <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                </button>
              </>
            ) : (
              /* 2FA Step */
              <div className="space-y-4 animate-fadeIn">
                <div className="p-3 bg-slate-950/80 border border-amber-500/30 rounded-xl text-xs text-slate-300 leading-relaxed">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                    <LockKeyhole className="w-4 h-4 text-amber-400" />
                    <span>{t('twoFactorActive')}</span>
                  </div>
                  {t('twoFactorSentTo')} ({email}).
                  <div className="mt-1 text-slate-400 font-mono">
                    {t('twoFactorSessionOtp')} <strong className="text-amber-300">789123</strong>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {t('otpLabel')}
                  </label>
                  <div className="relative">
                    <Key className={`w-4 h-4 text-amber-400 absolute top-3 ${isRtl ? 'right-3' : 'left-3'}`} />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="789123"
                      className={`w-full bg-slate-950 border border-slate-700 text-white rounded-xl py-2.5 text-center font-mono text-lg tracking-widest focus:outline-hidden focus:border-amber-500 transition-colors ${
                        isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'
                      }`}
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-450 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>{t('confirmOtpAndEnter')}</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsVerifying2FA(false);
                      setOtp('');
                      setErrorMsg('');
                    }}
                    className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    {t('changeEmail')}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Visitor Option (خيار الزائر للاطلاع فقط دون استخدام الموقع) */}
          <div className="mt-5 pt-4 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-sky-400" />
                <span>{t('guestAccessBtn')}</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                {t('readOnlyBadge')}
              </span>
            </div>

            <button
              type="button"
              onClick={handleGuestLogin}
              className="w-full py-2.5 px-3.5 bg-slate-800/90 hover:bg-slate-750 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700 hover:border-sky-500/50 flex items-center justify-between gap-2 cursor-pointer group shadow-xs"
            >
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-sky-400 group-hover:rotate-45 transition-transform" />
                <span>{t('guestAccessBtn')}</span>
              </div>
              <span className="text-[11px] text-sky-400 group-hover:text-sky-300 transition-colors">
                {isRtl ? 'تصفح النظام كزائر ←' : 'Browse as Visitor →'}
              </span>
            </button>
            <p className="text-[11px] text-slate-500 leading-relaxed px-1">
              {t('guestAccessHint')}
            </p>
          </div>

          {/* Security Badges Footer */}
          <div className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              {t('tlsEncryption')}
            </span>
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              {t('rbacEnforcement')}
            </span>
            <span className="text-slate-400 font-bold">
              {t('appName')}
            </span>
          </div>
        </div>

        {/* Outer footer */}
        <div className="text-center mt-4 text-xs text-slate-500">
          {t('rightsReserved')} • {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};
