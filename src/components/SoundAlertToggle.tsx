import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Bell, AlertTriangle, ShieldCheck, Play } from 'lucide-react';
import {
  isSoundAlertsEnabled,
  setSoundAlertsEnabled,
  playIncidentAlertSound,
  playPermitExpiryAlertSound,
  playTestBeepSound,
} from '../utils/soundAlerts';

interface SoundAlertToggleProps {
  compact?: boolean;
  className?: string;
}

export const SoundAlertToggle: React.FC<SoundAlertToggleProps> = ({
  compact = false,
  className = '',
}) => {
  const [enabled, setEnabled] = useState<boolean>(true);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);

  useEffect(() => {
    setEnabled(isSoundAlertsEnabled());
  }, []);

  const toggleSound = () => {
    const next = !enabled;
    setEnabled(next);
    setSoundAlertsEnabled(next);
    if (next) {
      playTestBeepSound();
    }
  };

  const handleTestIncidentSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPlayingPreview('incident');
    playIncidentAlertSound();
    setTimeout(() => setPlayingPreview(null), 800);
  };

  const handleTestPermitSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPlayingPreview('permit');
    playPermitExpiryAlertSound();
    setTimeout(() => setPlayingPreview(null), 800);
  };

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          title={enabled ? 'التنبيهات الصوتية الميدانية: مفعلة' : 'التنبيهات الصوتية: مكتومة'}
          className={`relative p-2 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 ${
            enabled
              ? 'bg-slate-800/90 text-amber-400 border-amber-500/40 hover:bg-slate-750'
              : 'bg-slate-850 text-slate-400 border-slate-700 hover:text-slate-300'
          }`}
        >
          {enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          <span className="hidden sm:inline text-[11px] font-bold">
            {enabled ? 'الصوت: نشط' : 'الصوت: صامت'}
          </span>
        </button>

        {showDropdown && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowDropdown(false)}
            />
            <div className="absolute left-0 mt-2 w-72 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-4 z-50 text-right space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${enabled ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                    {enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">التنبيه الصوتي الميداني</div>
                    <div className="text-[10px] text-slate-400">نغمة إنذار عند الحوادث والتصاريح</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleSound}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                    enabled
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {enabled ? 'تعطيل' : 'تفعيل'}
                </button>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-400">تجربة نغمات التحذير الميدانية:</div>

                {/* Test Incident Sound */}
                <button
                  type="button"
                  onClick={handleTestIncidentSound}
                  className={`w-full p-2 rounded-xl border text-right flex items-center justify-between text-xs transition-colors ${
                    playingPreview === 'incident'
                      ? 'bg-rose-600/30 border-rose-500 text-rose-200'
                      : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>إنذار تسجيل حادث جديد</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/30">
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>تشغيل</span>
                  </div>
                </button>

                {/* Test Permit Sound */}
                <button
                  type="button"
                  onClick={handleTestPermitSound}
                  className={`w-full p-2 rounded-xl border text-right flex items-center justify-between text-xs transition-colors ${
                    playingPreview === 'permit'
                      ? 'bg-sky-600/30 border-sky-500 text-sky-200'
                      : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Bell className="w-3.5 h-3.5 text-sky-400" />
                    <span>رنين انتهاء تصريح عمل (&lt; 12 س)</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/30">
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>تشغيل</span>
                  </div>
                </button>
              </div>

              <div className="text-[10px] text-slate-400 border-t border-slate-800/80 pt-2 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>يعمل محلياً وفورياً داخل المتصفح لتعزيز الانتباه الميداني</span>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Full dashboard inline card presentation
  return (
    <div className={`p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${enabled ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-slate-850 border-slate-700 text-slate-400'}`}>
            {enabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>التنبيهات الصوتية الميدانية</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${enabled ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                {enabled ? 'نشطة' : 'صامتة'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              تشغيل صفارة إنذار عند إدخال حادث جديد ورنين نبه عند اقتراب انتهاء صلاحية تصاريح العمل
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTestIncidentSound}
            title="تجربة صفارة إنذار الحوادث"
            className="px-2.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all flex items-center gap-1 active:scale-95"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>تجربة الإنذار</span>
          </button>

          <button
            type="button"
            onClick={toggleSound}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              enabled
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750 border border-slate-700'
            }`}
          >
            {enabled ? 'كتم الصوت' : 'تفعيل الصوت'}
          </button>
        </div>
      </div>
    </div>
  );
};
