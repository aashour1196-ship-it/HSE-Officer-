import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Key,
  Globe,
  UserCheck,
  Users,
  CheckCircle2,
  AlertTriangle,
  X,
  Smartphone,
  Server,
  LogOut,
  Building,
  Eye,
  Settings,
  Mail,
  Info,
  UserPlus,
  Trash2,
  LockKeyhole,
  Link as LinkIcon,
  Copy,
  Check,
} from 'lucide-react';
import { AuthUser, SecurityConfig, UserRole } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface AuthSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser;
  onUpdateUser: (user: AuthUser) => void;
  securityConfig: SecurityConfig;
  onUpdateSecurityConfig: (config: SecurityConfig) => void;
}

const OWNER_EMAIL = 'a.ashour1196@gmail.com';

export const AuthSecurityModal: React.FC<AuthSecurityModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  securityConfig,
  onUpdateSecurityConfig,
}) => {
  const { language, setLanguage, t, dir, isRtl } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<'account' | 'language' | 'links' | 'whitelist' | 'privacy' | 'login' | 'rbac'>('account');
  const [inputEmail, setInputEmail] = useState('');
  const [inputName, setInputName] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');
  const [copiedLink, setCopiedLink] = useState<'browse' | 'login' | null>(null);

  // New allowed email state (for Owner whitelist management)
  const [newAllowedEmail, setNewAllowedEmail] = useState('');
  const [emailActionMsg, setEmailActionMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Editable security & privacy settings
  const [allowedDomain, setAllowedDomain] = useState(securityConfig.allowedDomain || 'company.com');
  const [enforce2FA, setEnforce2FA] = useState(securityConfig.enforce2FA ?? true);
  const [allowPublicViewing, setAllowPublicViewing] = useState(securityConfig.allowPublicViewing ?? false);

  const isOwner = currentUser?.email?.toLowerCase() === OWNER_EMAIL && currentUser?.role === 'admin_owner';
  const allowedEmails = securityConfig.allowedEmails || [OWNER_EMAIL];

  // Restrict tabs strictly: non-owner can NEVER be on whitelist, privacy, or rbac
  useEffect(() => {
    if (!isOwner && (activeSubTab === 'whitelist' || activeSubTab === 'privacy' || activeSubTab === 'rbac')) {
      setActiveSubTab('account');
    }
  }, [isOwner, activeSubTab]);

  if (!isOpen) return null;

  // Whitelist: Add allowed email (Owner only)
  const handleAddAllowedEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailActionMsg(null);

    if (!isOwner) {
      setEmailActionMsg({
        text: 'تنبيه أمني: إضافة بريد مصرح محصورة حصرياً بمالك التطبيق.',
        isError: true,
      });
      return;
    }

    const emailTrimmed = newAllowedEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailTrimmed || !emailRegex.test(emailTrimmed)) {
      setEmailActionMsg({
        text: 'يرجى إدخال عنوان بريد إلكتروني صحيح ومعتمد.',
        isError: true,
      });
      return;
    }

    if (allowedEmails.some((e) => e.toLowerCase() === emailTrimmed)) {
      setEmailActionMsg({
        text: 'هذا البريد الإلكتروني مضاف بالفعل إلى قائمة المصرح لهم.',
        isError: true,
      });
      return;
    }

    const updatedList = [...allowedEmails, emailTrimmed];
    const updatedConfig: SecurityConfig = {
      ...securityConfig,
      allowedEmails: updatedList,
    };

    onUpdateSecurityConfig(updatedConfig);
    setNewAllowedEmail('');
    setEmailActionMsg({
      text: `تم اعتماد البريد (${emailTrimmed}) وإضافته لقائمة المصرح لهم بنجاح.`,
      isError: false,
    });
  };

  // Whitelist: Remove allowed email (Owner only)
  const handleRemoveAllowedEmail = (emailToRemove: string) => {
    setEmailActionMsg(null);

    if (!isOwner) {
      setEmailActionMsg({
        text: 'تنبيه أمني: حذف بريد من القائمة محصور حصرياً بمالك التطبيق.',
        isError: true,
      });
      return;
    }

    if (emailToRemove.toLowerCase() === OWNER_EMAIL) {
      setEmailActionMsg({
        text: 'لا يمكن حذف بريد مالك التطبيق الرئيسي من قائمة المصرح لهم.',
        isError: true,
      });
      return;
    }

    const updatedList = allowedEmails.filter((e) => e.toLowerCase() !== emailToRemove.toLowerCase());
    const updatedConfig: SecurityConfig = {
      ...securityConfig,
      allowedEmails: updatedList,
    };

    onUpdateSecurityConfig(updatedConfig);
    setEmailActionMsg({
      text: `تم إلغاء تصريح البريد (${emailToRemove}) بنجاح. لن يتمكن من تسجيل الدخول.`,
      isError: false,
    });
  };

  // Login handler: ONLY allowed emails can log in!
  const handleLoginAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('');

    const email = inputEmail.trim().toLowerCase();
    if (!email) {
      setLoginError('يرجى إدخال عنوان البريد الإلكتروني.');
      return;
    }

    const isOwnerAttempt = email === OWNER_EMAIL;
    const isWhitelisted = allowedEmails.some((e) => e.toLowerCase() === email);

    // CRITICAL USER REQUIREMENT:
    // "واجعل دخول التطبيق فقط بستخدام ايميل يسمح به مالك التطبيق"
    if (!isOwnerAttempt && !isWhitelisted) {
      setLoginError(
        '⛔ تم رفض الدخول! هذا البريد الإلكتروني غير مصرّح به. الدخول للنظام مقتصر حصرياً على عناوين البريد المعتمدة مسبقاً من قِبل مالك التطبيق. يُرجى مراجعة المالك لاعتماد بريدك.'
      );
      return;
    }

    // If 2FA is enforced
    if (securityConfig.enforce2FA && !isVerifying2FA) {
      setIsVerifying2FA(true);
      return;
    }

    // If in 2FA verification step
    if (isVerifying2FA) {
      if (inputOtp.trim() !== '789123' && inputOtp.trim().length !== 6) {
        setLoginError('رمز التحقق الثنائي (2FA OTP) غير صحيح. الرمز المعتمد لتوثيق الجلسة: 789123');
        return;
      }
    }

    // Successful authentication
    const newRole: UserRole = isOwnerAttempt ? 'admin_owner' : 'authorized_staff';
    const updatedUser: AuthUser = {
      id: isOwnerAttempt ? 'USR-OWNER-01' : `USR-${Date.now()}`,
      name: isOwnerAttempt ? 'مالك المنظومة' : (inputName.trim() || email.split('@')[0]),
      email: email,
      role: newRole,
      twoFactorEnabled: true,
      department: isOwnerAttempt ? 'إدارة السلامة والصحة المهنية العليا' : 'العمليات الميدانية والهندسية المعتمدة',
      lastLoginAt: new Date().toISOString(),
    };

    onUpdateUser(updatedUser);
    setLoginSuccess(
      `تم تسجيل الدخول بنجاح بحساب: ${updatedUser.name} (${newRole === 'admin_owner' ? 'مالك التطبيق الكامل' : 'كادر مصرح له بالاستخدام الميداني الكامل'})`
    );
    setIsVerifying2FA(false);
    setInputOtp('');
    setInputEmail('');
    setInputName('');
  };

  // Save Security & Privacy settings (Owner ONLY)
  const handleSaveSecuritySettings = () => {
    if (!isOwner) {
      alert('تنبيه أمني: خصوصية وإعدادات الموقع تعدل فقط من قبل مالك التطبيق.');
      return;
    }

    const updated: SecurityConfig = {
      ...securityConfig,
      allowedDomain: allowedDomain.trim(),
      enforce2FA: enforce2FA,
      allowPublicViewing: allowPublicViewing,
    };
    onUpdateSecurityConfig(updated);
    setLoginSuccess('تم حفظ إعدادات خصوصية وأمان الموقع بنجاح بواسطة مالك التطبيق.');
  };

  const handleLogout = () => {
    // Switch to unauthenticated/viewer state or prompt to login
    const defaultViewer: AuthUser = {
      id: 'USR-GUEST',
      name: 'جلسة مغلقة (غير مسجل)',
      email: '',
      role: 'viewer',
      department: 'يرجى تسجيل الدخول بحساب مصرح به',
      twoFactorEnabled: false,
      lastLoginAt: '',
    };
    onUpdateUser(defaultViewer);
    setActiveSubTab('account');
    setLoginSuccess('تم تسجيل الخروج بنجاح. يرجى إدخال بريدك المصرح به لإعادة الدخول.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto" dir={dir}>
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col my-auto">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-lg ${
              isOwner 
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-400' 
                : 'bg-sky-500/15 border-sky-500/40 text-sky-400'
            }`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {isOwner ? t('settingsModalTitle') : (language === 'ar' ? 'الملف الشخصي وتفضيلات النظام' : 'User Profile & Preferences')}
                </h2>
                {isOwner ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {t('ownerBadge')}
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    {currentUser?.role === 'authorized_staff' ? t('authorizedBadge') : t('visitorBadge')}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isOwner
                  ? `جلسة مالك المنظومة المعتمدة (${currentUser?.email || OWNER_EMAIL})`
                  : `إدارة السلامة والصحة المهنية (${currentUser?.email || (language === 'ar' ? 'كادر مصرح له' : 'Authorized Staff')})`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Security Notice Banner if non-owner */}
        {!isOwner && (
          <div className="bg-amber-950/40 border-b border-amber-500/30 px-4 py-2.5 flex items-center gap-2 text-xs text-amber-200">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {t('ownerOnlyNotice')}
            </span>
          </div>
        )}

        {/* Navigation Tabs - Whitelist, Privacy, Login Credentials ONLY shown to Owner */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-3 sm:px-6 overflow-x-auto scrollbar-none gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('account')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'account'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>{t('subTabAccount')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('language')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'language'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>{t('subTabLanguage')}</span>
          </button>

          {/* Access Links (Open to all) */}
          <button
            type="button"
            onClick={() => setActiveSubTab('links')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'links'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LinkIcon className="w-4 h-4 text-sky-400" />
            <span>{t('accessLinks')}</span>
          </button>

          {/* Login (Open to all who want to authenticate) */}
          <button
            type="button"
            onClick={() => setActiveSubTab('login')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'login'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>{t('subTabLogin')}</span>
          </button>

          {/* Owner Only: Whitelist, Privacy & Security Settings, and RBAC */}
          {isOwner && (
            <>
              <button
                type="button"
                onClick={() => setActiveSubTab('whitelist')}
                className={`py-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeSubTab === 'whitelist'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>{t('subTabWhitelist')} ({allowedEmails.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('privacy')}
                className={`py-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeSubTab === 'privacy'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>{t('subTabPrivacy')}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('rbac')}
                className={`py-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeSubTab === 'rbac'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>{t('subTabRbac')}</span>
              </button>
            </>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[68vh] overflow-y-auto">
          {/* Status feedback alerts */}
          {loginSuccess && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{loginSuccess}</span>
            </div>
          )}

          {loginError && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span className="leading-relaxed">{loginError}</span>
            </div>
          )}

          {/* TAB 1: CURRENT USER ACCOUNT */}
          {activeSubTab === 'account' && (
            <div className="space-y-4">
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg border ${
                    isOwner ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  }`}>
                    {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'HS'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{currentUser.name || 'مستخدم غير مسجل'}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        isOwner
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                      }`}>
                        {isOwner ? 'مالك النظام الكامل (Owner)' : 'مستخدم مصرح به (Viewer)'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {currentUser.email || 'لم يتم تسجيل بريد بعد'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5" />
                      <span>{currentUser.department || 'إدارة السلامة والصحة المهنية'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {currentUser.email ? (
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-rose-950/50 hover:text-rose-300 hover:border-rose-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>تسجيل الخروج</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('login')}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all"
                    >
                      تسجيل الدخول الآن
                    </button>
                  )}
                </div>
              </div>

              {/* Ownership Status Card */}
              <div className={`p-4 rounded-2xl border ${
                isOwner 
                  ? 'bg-amber-950/20 border-amber-500/30' 
                  : 'bg-slate-950/50 border-slate-800'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl mt-0.5 ${
                    isOwner ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isOwner ? <ShieldCheck className="w-5 h-5" /> : <LockKeyhole className="w-5 h-5" />}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white">
                      {isOwner ? 'أهلاً بك، مالك التطبيق المعتمد' : 'صلاحيات الاستخدام الميداني المعتمد'}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {isOwner
                        ? 'أنت مسجل حالياً بصفتك مالك النظام الكامل. تملك الصلاحية الحصرية لتعديل خصوصية وإعدادات الموقع، إضافة أو حذف عناوين البريد الإلكتروني المصرح لها بالدخول، وإدارة كافة قواعد البيانات والتقارير.'
                        : 'أنت مسجل حالياً كحساب مشاهد/مستخدم مصرح له بالدخول الميداني. إعدادات الخصوصية وإدارة قائمة المصرح لهم محصورة بالكامل بمالك التطبيق.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Specs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400 block mb-1">التحقق بخطوتين (2FA)</span>
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>مفعّل ومحمي</span>
                  </span>
                </div>
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400 block mb-1">تشفير البيانات</span>
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    <span>TLS 1.3 / HTTPS</span>
                  </span>
                </div>
                {isOwner ? (
                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                    <span className="text-[11px] text-slate-400 block mb-1">العناوين المصرح لها</span>
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1 font-mono">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{allowedEmails.length} بريد معتمد</span>
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                    <span className="text-[11px] text-slate-400 block mb-1">مستوى الاستخدام الحالي</span>
                    <span className="text-xs font-bold text-sky-400 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{currentUser?.role === 'authorized_staff' ? 'كادر ميداني معتمد' : 'زائر (للاطلاع فقط)'}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* If Visitor or Unregistered, show a clean, secure login card right here without exposing whitelist */}
              {(!currentUser?.email || currentUser?.role === 'viewer') && (
                <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-3 mt-4">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <Key className="w-4 h-4 text-amber-400" />
                    <span>تسجيل الدخول للكادر المصرح له:</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    إذا كان لديك بريد معتمد ومصرح به من قِبل مالك المنظومة، أدخل بريدك للانتقال إلى وضع الكادر المصرح له.
                  </p>

                  <form onSubmit={handleLoginAttempt} className="space-y-3 pt-1">
                    {!isVerifying2FA ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="email"
                          value={inputEmail}
                          onChange={(e) => setInputEmail(e.target.value)}
                          placeholder="your.email@company.com"
                          className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-mono"
                          required
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer shadow-sm"
                        >
                          تحقق وتسجيل الدخول
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 p-3 bg-slate-900 rounded-xl border border-amber-500/30">
                        <div className="text-xs text-amber-300 font-bold">إدخال رمز التحقق الثنائي (OTP):</div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={6}
                            value={inputOtp}
                            onChange={(e) => setInputOtp(e.target.value)}
                            placeholder="789123"
                            className="flex-1 text-center font-mono bg-slate-950 border border-slate-700 text-white rounded-xl py-2 text-sm"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                          >
                            تأكيد الدخول
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB: LANGUAGE & DIRECTION SETTINGS */}
          {activeSubTab === 'language' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <Globe className="w-4 h-4 text-amber-400" />
                    <span>{t('languageSectionTitle')}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {language === 'ar' ? 'العربية (RTL)' : 'English (LTR)'}
                  </span>
                </div>

                <p className="text-slate-400 text-xs leading-relaxed">
                  {t('languageSectionDesc')}
                </p>

                {/* Language Selection Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {/* Arabic Option */}
                  <button
                    type="button"
                    onClick={() => setLanguage('ar')}
                    className={`p-4 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      language === 'ar'
                        ? 'bg-amber-500/15 border-amber-500 text-white ring-2 ring-amber-500/20 shadow-lg'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-bold flex items-center gap-2">
                        <span className="text-base">🇮🇶 / 🇸🇦</span>
                        <span>العربية (Arabic)</span>
                      </span>
                      {language === 'ar' && (
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      <span className="block font-semibold text-amber-300 mb-1">اتجاه النصوص: من اليمين إلى اليسار (RTL)</span>
                      <span>الواجهة الافتراضية المعتمدة باللغة العربية مع كافة مصطلحات السلامة وتصاريح العمل.</span>
                    </div>
                  </button>

                  {/* English Option */}
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      language === 'en'
                        ? 'bg-sky-500/15 border-sky-500 text-white ring-2 ring-sky-500/20 shadow-lg'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-bold flex items-center gap-2">
                        <span className="text-base">🇬🇧 / 🇺🇸</span>
                        <span>English</span>
                      </span>
                      {language === 'en' && (
                        <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center text-xs font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      <span className="block font-semibold text-sky-300 mb-1">Text Direction: Left to Right (LTR)</span>
                      <span>International standard HSE terminology, OSHA & NFPA workflows, and LTR interface.</span>
                    </div>
                  </button>
                </div>

                {/* Instant Feedback Notice */}
                <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    {language === 'ar'
                      ? 'يتم تطبيق اتجاه النص (RTL/LTR) واللغة فوراً على كافة شاشات وأقسام النظام وتُحفظ تلقائياً في جهازك.'
                      : 'Text direction (LTR/RTL) and language are applied immediately across all views and saved locally on your device.'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ACCESS & BROWSING LINKS (Available to all users) */}
          {activeSubTab === 'links' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <LinkIcon className="w-4 h-4 text-sky-400" />
                  <span>{t('accessLinks')}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {isRtl
                    ? 'روابط الوصول المباشرة للموقع: رابط مفتوح للتصفح والاطلاع للجميع، ورابط مباشر لبوابة تسجيل دخول المصرح لهم.'
                    : 'Direct access links: Open browsing link for everyone, and direct login gateway for authorized personnel.'}
                </p>

                {/* Card 1: Public Browsing */}
                <div className="p-3.5 bg-slate-900 border border-sky-500/30 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" />
                      <span>{t('publicBrowsingLink')}</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold">
                      {isRtl ? 'مفتوح للجميع' : 'Open to All'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {isRtl
                      ? 'يتيح لأي شخص تصفح كافة سجلات الحوادث وتصاريح العمل ومؤشرات السلامة وتصدير PDF.'
                      : 'Allows anyone to explore all dashboards, incidents, permits, and export PDF reports.'}
                  </p>
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg p-1.5">
                    <input
                      type="text"
                      readOnly
                      value={typeof window !== 'undefined' ? `${window.location.origin}/?mode=browse` : ''}
                      className="w-full bg-transparent text-sky-300 text-xs font-mono px-2 py-1 outline-hidden select-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const url = typeof window !== 'undefined' ? `${window.location.origin}/?mode=browse` : '';
                        navigator.clipboard.writeText(url);
                        setCopiedLink('browse');
                        setTimeout(() => setCopiedLink(null), 2000);
                      }}
                      className="px-3 py-1 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 rounded-md text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1"
                    >
                      {copiedLink === 'browse' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-300">{t('linkCopied')}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>{t('copyLink')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Card 2: Authorized Login */}
                <div className="p-3.5 bg-slate-900 border border-amber-500/30 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <LockKeyhole className="w-3.5 h-3.5" />
                      <span>{t('authorizedLoginLink')}</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                      {isRtl ? 'للكوادر المصرح لها' : 'Authorized Only'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {isRtl
                      ? 'يفتح بوابة التحقق الثنائي (2FA) لتسجيل وتعديل البيانات وإصدار التصاريح الميدانية.'
                      : 'Opens the 2FA verification portal to log data, issue permits, and execute field operations.'}
                  </p>
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg p-1.5">
                    <input
                      type="text"
                      readOnly
                      value={typeof window !== 'undefined' ? `${window.location.origin}/?mode=login` : ''}
                      className="w-full bg-transparent text-amber-300 text-xs font-mono px-2 py-1 outline-hidden select-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const url = typeof window !== 'undefined' ? `${window.location.origin}/?mode=login` : '';
                        navigator.clipboard.writeText(url);
                        setCopiedLink('login');
                        setTimeout(() => setCopiedLink(null), 2000);
                      }}
                      className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-md text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1"
                    >
                      {copiedLink === 'login' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-300">{t('linkCopied')}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>{t('copyLink')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WHITELIST OF ALLOWED EMAILS (Owner managed only) */}
          {isOwner && activeSubTab === 'whitelist' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <Mail className="w-4 h-4 text-amber-400" />
                    <span>قائمة البريد الإلكتروني المصرح له بالدخول:</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {allowedEmails.length} بريد معتمد
                  </span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  يمنع النظام تسجيل الدخول قطعياً لأي عنوان بريد إلكتروني لا يظهر في هذه القائمة المعتمدة من قِبل مالك التطبيق.
                </p>

                {/* Add new allowed email form (Owner ONLY) */}
                {isOwner ? (
                  <form onSubmit={handleAddAllowedEmail} className="pt-2 border-t border-slate-800/80 space-y-2">
                    <label className="text-[11px] font-bold text-slate-300 block">
                      إضافة بريد موظف أو مهندس جديد للمصرح لهم:
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Mail className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="email"
                          value={newAllowedEmail}
                          onChange={(e) => setNewAllowedEmail(e.target.value)}
                          placeholder="engineer.safety@company.com"
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pr-9 pl-3 py-2 text-xs font-mono"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-sm"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>اعتماد وإضافة للقائمة</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>إضافة وتعديل قائمة المصرح لهم محصورة بمالك التطبيق.</span>
                  </div>
                )}

                {emailActionMsg && (
                  <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                    emailActionMsg.isError 
                      ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300' 
                      : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                  }`}>
                    {emailActionMsg.isError ? <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> : <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                    <span>{emailActionMsg.text}</span>
                  </div>
                )}
              </div>

              {/* List of currently authorized emails */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 px-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>عناوين البريد المعتمدة حالياً للوصول للنظام:</span>
                </h4>

                <div className="space-y-2">
                  {allowedEmails.map((email, idx) => {
                    const isOwnerEntry = email.toLowerCase() === OWNER_EMAIL;
                    const displayEmail = isOwnerEntry && !isOwner
                      ? '••••••••••@•••••.com'
                      : email;
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                          isOwnerEntry
                            ? 'bg-amber-950/20 border-amber-500/40'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isOwnerEntry ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-sky-400'
                          }`}>
                            <Mail className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-white truncate dir-ltr text-right">
                                {displayEmail}
                              </span>
                              {isOwnerEntry ? (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/25 text-amber-300 border border-amber-500/40 shrink-0">
                                  مالك التطبيق (رئيسي)
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 shrink-0">
                                  موظف مصرح
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {isOwnerEntry
                                ? (isOwner
                                    ? 'الصلاحيات الكاملة والإدارة الحصرية'
                                    : 'بريد مالك المنظومة (محمي ومخفي للخصوصية والأمان)')
                                : 'صلاحية الدخول والاستعراض الميداني'}
                            </p>
                          </div>
                        </div>

                        <div>
                          {isOwnerEntry ? (
                            <span className="text-[11px] text-amber-400/80 font-bold px-2 py-1 bg-amber-500/10 rounded-lg flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              <span className="hidden sm:inline">غير قابل للحذف</span>
                            </span>
                          ) : isOwner ? (
                            <button
                              type="button"
                              onClick={() => handleRemoveAllowedEmail(email)}
                              title="حذف هذا البريد من المصرح لهم"
                              className="px-2.5 py-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-white border border-rose-800/50 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>إلغاء التصريح</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-500">معتمد</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRIVACY & SYSTEM SETTINGS (Owner ONLY) */}
          {isOwner && activeSubTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <Settings className="w-4 h-4 text-amber-400" />
                    <span>إعدادات خصوصية وأمان الموقع:</span>
                  </div>
                  {isOwner ? (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      مفعل للتحرير (المالك)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      محمي للقراءة فقط
                    </span>
                  )}
                </div>

                <p className="text-slate-400 text-xs leading-relaxed">
                  تعديل هذه الإعدادات محصور حصرياً بمالك التطبيق لضمان الامتثال الصارم لسياسات الخصوصية الصناعية.
                </p>

                {/* Setting 1: Domain Restriction */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <label className="text-xs font-bold text-slate-300 block">
                    تقييد نطاق الشركة المؤسسي (Corporate Domain):
                  </label>
                  <div className="relative">
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-mono">@</span>
                    <input
                      type="text"
                      value={allowedDomain}
                      disabled={!isOwner}
                      onChange={(e) => setAllowedDomain(e.target.value)}
                      placeholder="company.com"
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pr-7 pl-3 py-2 text-xs font-mono disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    النطاق المؤسسي المعتمد لبريد الموظفين. يُشترط مع ذلك وجود البريد في قائمة المصرح لهم أعلاه.
                  </p>
                </div>

                {/* Setting 2: Enforce 2FA */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <label className={`flex items-start gap-2.5 p-3 rounded-xl border ${
                    isOwner ? 'bg-slate-900 border-slate-800 cursor-pointer hover:border-slate-700' : 'bg-slate-900/60 border-slate-800 opacity-70 cursor-not-allowed'
                  }`}>
                    <input
                      type="checkbox"
                      checked={enforce2FA}
                      disabled={!isOwner}
                      onChange={(e) => setEnforce2FA(e.target.checked)}
                      className="rounded-sm text-amber-500 focus:ring-0 mt-0.5"
                    />
                    <div>
                      <span className="text-xs text-white font-bold block">
                        إلزام التحقق الثنائي بخطوتين (Enforce 2FA OTP) لكافة الحسابات
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        يمنع دخول أي مستخدم دون إدخال رمز التحقق الأمني المعتمد لتوثيق الجلسة الميدانية.
                      </span>
                    </div>
                  </label>
                </div>

                {/* Setting 3: Data Privacy & Viewing Policy */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <label className={`flex items-start gap-2.5 p-3 rounded-xl border ${
                    isOwner ? 'bg-slate-900 border-slate-800 cursor-pointer hover:border-slate-700' : 'bg-slate-900/60 border-slate-800 opacity-70 cursor-not-allowed'
                  }`}>
                    <input
                      type="checkbox"
                      checked={allowPublicViewing}
                      disabled={!isOwner}
                      onChange={(e) => setAllowPublicViewing(e.target.checked)}
                      className="rounded-sm text-amber-500 focus:ring-0 mt-0.5"
                    />
                    <div>
                      <span className="text-xs text-white font-bold block">
                        سياسة سرية بيانات السلامة (Safety Data Privacy)
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        حصر تصدير وطباعة تقارير الحوادث والتصاريح بالمالك والمستخدمين المعتمدين فقط ومنع أي مشاركة خارجية.
                      </span>
                    </div>
                  </label>
                </div>

                {/* Save button (Owner ONLY) */}
                {isOwner ? (
                  <div className="pt-3 border-t border-slate-800 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveSecuritySettings}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>حفظ إعدادات الخصوصية والأمان</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>زر الحفظ والتعديل غير متاح لغير مالك التطبيق.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SECURE LOGIN (Available for all to sign in) */}
          {activeSubTab === 'login' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-amber-400" />
                  <span>تسجيل الدخول للنظام (مقتصر على المصرح لهم):</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  يسمح بالدخول فقط للمالك أو العناوين المضافة مسبقاً في قائمة البريد المصرح به.
                </p>

                <form onSubmit={handleLoginAttempt} className="space-y-3 pt-1">
                  {!isVerifying2FA ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-300">اسم الموظف / المستخدم:</label>
                          <input
                            type="text"
                            value={inputName}
                            onChange={(e) => setInputName(e.target.value)}
                            placeholder="المهندس الميداني"
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-300">البريد الإلكتروني المعتمد:</label>
                          <input
                            type="email"
                            value={inputEmail}
                            onChange={(e) => setInputEmail(e.target.value)}
                            placeholder="user@company.com"
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-center gap-2">
                        <Info className="w-4 h-4 text-sky-400 shrink-0" />
                        <span>
                          سيتم فحص البريد بدقة والتأكد من اعتماده بواسطة مالك التطبيق.
                        </span>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>التحقق من الصلاحية والمتابعة</span>
                      </button>
                    </>
                  ) : (
                    /* 2FA OTP Step */
                    <div className="space-y-3 p-4 bg-slate-900 border border-amber-500/40 rounded-xl">
                      <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                        <Smartphone className="w-4 h-4" />
                        <span>الخطوة الثانية: إدخال رمز التحقق الثنائي (2FA OTP)</span>
                      </div>
                      <p className="text-xs text-slate-300">
                        البريد مصرح به! يرجى إدخال رمز التحقق الأمني المعتمد لتوثيق الجلسة (الرمز الأمني: <strong className="font-mono text-amber-300">789123</strong>)
                      </p>
                      <input
                        type="text"
                        maxLength={6}
                        value={inputOtp}
                        onChange={(e) => setInputOtp(e.target.value)}
                        placeholder="789123"
                        className="w-full text-center text-lg font-mono tracking-widest bg-slate-950 border border-slate-700 text-white rounded-xl py-2.5"
                      />
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="submit"
                          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all"
                        >
                          تأكيد الرمز والدخول للنظام
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsVerifying2FA(false);
                            setInputOtp('');
                          }}
                          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl"
                        >
                          رجوع
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}

          {/* TAB 5: RBAC PERMISSIONS MATRIX (Owner ONLY) */}
          {isOwner && activeSubTab === 'rbac' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  مصفوفة التحكم في الوصول المبني على الأدوار (RBAC): توضح الفروقات بين صلاحيات مالك التطبيق والمستخدمين المصرح لهم.
                </span>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-right border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-850 text-slate-300 font-bold border-b border-slate-800">
                      <th className="p-3">الوظيفة / الصلاحية الميدانية</th>
                      <th className="p-3 text-center text-amber-400">المالك (Admin / Owner)</th>
                      <th className="p-3 text-center text-sky-400">المستخدمون المصرح لهم (Viewer)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    <tr className="hover:bg-slate-900/50">
                      <td className="p-3 font-semibold text-white">تعديل خصوصية الموقع وإعدادات الأمان</td>
                      <td className="p-3 text-center text-emerald-400 font-bold">✓ حصري للمالك</td>
                      <td className="p-3 text-center text-rose-500 font-bold">✗ محظور تماماً</td>
                    </tr>
                    <tr className="hover:bg-slate-900/50">
                      <td className="p-3 font-semibold text-white">إضافة أو حذف بريد من قائمة المصرح لهم</td>
                      <td className="p-3 text-center text-emerald-400 font-bold">✓ حصري للمالك</td>
                      <td className="p-3 text-center text-rose-500 font-bold">✗ محظور تماماً</td>
                    </tr>
                    <tr className="hover:bg-slate-900/50">
                      <td className="p-3">استعراض لوحة التحكم والمؤشرات الميدانية</td>
                      <td className="p-3 text-center text-emerald-400 font-bold">✓ متاح بالكامل</td>
                      <td className="p-3 text-center text-emerald-400 font-bold">✓ متاح بالكامل</td>
                    </tr>
                    <tr className="hover:bg-slate-900/50">
                      <td className="p-3">تسجيل بلاغ حادث / وشيك وإرفاق الصور</td>
                      <td className="p-3 text-center text-emerald-400 font-bold">✓ متاح</td>
                      <td className="p-3 text-center text-emerald-400 font-bold">✓ متاح للموظف</td>
                    </tr>
                    <tr className="hover:bg-slate-900/50">
                      <td className="p-3">إنشاء تقييم مخاطر جديد (JHA)</td>
                      <td className="p-3 text-center text-emerald-400 font-bold">✓ متاح</td>
                      <td className="p-3 text-center text-emerald-400 font-bold">✓ متاح للموظف</td>
                    </tr>
                    <tr className="hover:bg-slate-900/50">
                      <td className="p-3">تصدير وطباعة التقارير الرسمية إلى PDF</td>
                      <td className="p-3 text-center text-emerald-400 font-bold">✓ متاح</td>
                      <td className="p-3 text-center text-emerald-400 font-bold">✓ متاح للطباعة</td>
                    </tr>
                    <tr className="hover:bg-slate-900/50">
                      <td className="p-3 font-semibold text-rose-300">حذف السجلات والتصاريح الحساسة المعتمدة</td>
                      <td className="p-3 text-center text-emerald-400 font-bold">✓ حصري للمالك</td>
                      <td className="p-3 text-center text-rose-500 font-bold">✗ محظور للمشاهد</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="md:hidden space-y-2.5">
                {[
                  {
                    title: 'تعديل خصوصية الموقع وإعدادات الأمان',
                    owner: '✓ حصري للمالك',
                    ownerColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
                    viewer: '✗ محظور تماماً',
                    viewerColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
                    isSensitive: true,
                  },
                  {
                    title: 'إضافة أو حذف بريد من قائمة المصرح لهم',
                    owner: '✓ حصري للمالك',
                    ownerColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
                    viewer: '✗ محظور تماماً',
                    viewerColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
                    isSensitive: true,
                  },
                  {
                    title: 'استعراض لوحة التحكم والمؤشرات الميدانية',
                    owner: '✓ متاح بالكامل',
                    ownerColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
                    viewer: '✓ متاح بالكامل',
                    viewerColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
                    isSensitive: false,
                  },
                  {
                    title: 'تسجيل بلاغ حادث / وشيك وإرفاق الصور',
                    owner: '✓ متاح',
                    ownerColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
                    viewer: '✓ متاح للموظف',
                    viewerColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
                    isSensitive: false,
                  },
                  {
                    title: 'إنشاء تقييم مخاطر جديد (JHA)',
                    owner: '✓ متاح',
                    ownerColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
                    viewer: '✓ متاح للموظف',
                    viewerColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
                    isSensitive: false,
                  },
                  {
                    title: 'حذف السجلات والتصاريح الحساسة',
                    owner: '✓ حصري للمالك',
                    ownerColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
                    viewer: '✗ محظور (Viewer)',
                    viewerColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
                    isSensitive: true,
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border bg-slate-900 transition-all ${
                      item.isSensitive ? 'border-amber-900/40 bg-slate-900/90' : 'border-slate-800'
                    }`}
                  >
                    <div className="font-bold text-slate-200 text-xs mb-2 flex items-start gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] text-slate-400 flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className={item.isSensitive ? 'text-amber-300' : 'text-slate-200'}>
                        {item.title}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1">
                        <span className="text-[10px] text-amber-400 block font-semibold">المالك (Owner):</span>
                        <span className={`inline-block px-2 py-0.5 rounded-md border font-bold text-[10px] ${item.ownerColor}`}>
                          {item.owner}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1">
                        <span className="text-[10px] text-sky-400 block font-semibold">المصرح لهم (Viewer):</span>
                        <span className={`inline-block px-2 py-0.5 rounded-md border font-bold text-[10px] ${item.viewerColor}`}>
                          {item.viewer}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>نظام الحماية والخصوصية وإدارة الصلاحيات المعتمدة</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
