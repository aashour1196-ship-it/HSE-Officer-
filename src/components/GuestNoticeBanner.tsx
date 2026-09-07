import React from 'react';
import { Eye, LogIn } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface GuestNoticeBannerProps {
  onOpenLogin: () => void;
}

export const GuestNoticeBanner: React.FC<GuestNoticeBannerProps> = ({ onOpenLogin }) => {
  const { t, isRtl } = useLanguage();

  return (
    <div className="bg-sky-950/60 border-b border-sky-500/30 px-3 sm:px-4 py-2.5 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-sky-200 leading-relaxed">
          <div className="p-1 rounded-md bg-sky-500/20 text-sky-400 shrink-0">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <strong className="text-white font-bold">{t('guestModeActiveBanner')}</strong>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                {t('readOnlyBadge')}
              </span>
            </div>
            <p className="text-slate-300 text-[11px] mt-0.5">
              {isRtl
                ? 'متاح لجميع الزوار استعراض كافة المؤشرات واللوحات الميدانية وتصدير تقارير PDF. استخدام النظام وتسجيل البلاغات مخصص للمصرح لهم.'
                : 'Everyone can freely browse all dashboards, indicators, and export PDFs. Submitting data and issuing permits is restricted to authorized personnel.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenLogin}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-400 active:scale-95 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <LogIn className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
            <span>{t('loginAsAuthorizedStaff')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
