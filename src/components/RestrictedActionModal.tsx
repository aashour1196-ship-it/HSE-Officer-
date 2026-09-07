import React from 'react';
import { ShieldAlert, LogIn, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface RestrictedActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

export const RestrictedActionModal: React.FC<RestrictedActionModalProps> = ({
  isOpen,
  onClose,
  onOpenLogin,
}) => {
  const { t, isRtl, dir } = useLanguage();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      dir={dir}
    >
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fadeIn text-center p-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-black text-white mb-2">
          {t('restrictedModalTitle')}
        </h3>

        <p className="text-xs text-slate-300 leading-relaxed mb-6 px-2">
          {t('restrictedModalDesc')}
        </p>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenLogin();
            }}
            className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-450 active:scale-95 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <LogIn className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            <span>{t('loginAsAuthorizedStaff')}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            {t('continueBrowsing')}
          </button>
        </div>
      </div>
    </div>
  );
};
