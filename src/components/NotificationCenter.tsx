import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  BellRing,
  AlertTriangle,
  Clock,
  ExternalLink,
  CheckCircle2,
  X,
  Volume2,
  ShieldAlert
} from 'lucide-react';
import { WorkPermit } from '../types';
import {
  getExpiringPermits,
  getNotificationPermission,
  requestNotificationPermission,
  checkAndNotifyExpiringPermits,
  NotificationSystemStatus,
} from '../utils/notificationService';

interface NotificationCenterProps {
  permits: WorkPermit[];
  onNavigateToPermits: (permitId?: string) => void;
  onRefreshPermits?: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  permits,
  onNavigateToPermits,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [permission, setPermission] = useState<NotificationSystemStatus>(() =>
    getNotificationPermission()
  );
  const [testNotificationFeedback, setTestNotificationFeedback] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { expiring, expired } = getExpiringPermits(permits, 12);
  const totalAlertCount = expiring.length + expired.length;

  useEffect(() => {
    setPermission(getNotificationPermission());
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setPermission(res);
    if (res === 'granted') {
      setTestNotificationFeedback('تم منح إذن إشعارات المتصفح بنجاح! سيتم تنبيهك عند اقتراب انتهاء التصاريح.');
      // trigger immediate check
      checkAndNotifyExpiringPermits(permits, {
        triggerSource: 'manual',
        force: true,
        onNotificationClick: () => onNavigateToPermits(),
      });
    } else if (res === 'denied') {
      setTestNotificationFeedback('تم رفض الإذن من إعدادات المتصفح. يمكنك تفعيله يدوياً عبر أيقونة القفل بجانب شريط العنوان.');
    }
    setTimeout(() => setTestNotificationFeedback(''), 5000);
  };

  const handleSendTestNotification = async () => {
    const res = await checkAndNotifyExpiringPermits(permits, {
      triggerSource: 'manual',
      force: true,
      onNotificationClick: () => onNavigateToPermits(),
    });

    setTestNotificationFeedback(res.message);
    setPermission(res.permissionStatus);
    setTimeout(() => setTestNotificationFeedback(''), 5000);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="تنبيهات انتهاء تصاريح العمل (PTW)"
        className={`relative p-2 rounded-xl transition-all border ${
          totalAlertCount > 0
            ? 'bg-rose-500/15 text-rose-300 border-rose-500/40 hover:bg-rose-500/25 animate-pulse'
            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750 hover:text-white'
        }`}
      >
        {totalAlertCount > 0 ? (
          <BellRing className="w-4 h-4 text-rose-400" />
        ) : (
          <Bell className="w-4 h-4" />
        )}

        {totalAlertCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-600 text-white rounded-full text-[10px] font-black flex items-center justify-center border-2 border-slate-900 shadow-md">
            {totalAlertCount}
          </span>
        )}
      </button>

      {/* Flyout Panel */}
      {isOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl z-50 overflow-hidden text-right font-['Cairo',sans-serif] animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-3.5 bg-slate-850 border-b border-slate-750 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">إشعارات انتهاء تصاريح العمل (PTW)</h3>
                <p className="text-[10px] text-slate-400">نظام المراقبة والتنبيه المبكر (أقل من 12 ساعة)</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Browser Notification API Status Bar */}
          <div className="p-3 bg-slate-950/60 border-b border-slate-800 text-[11px] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">إشعارات المتصفح (Notification API):</span>
              <span
                className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${
                  permission === 'granted'
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : permission === 'denied'
                    ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                }`}
              >
                {permission === 'granted'
                  ? 'مفعلة (Granted) ✓'
                  : permission === 'denied'
                  ? 'محظورة بالمتصفح (Blocked)'
                  : 'بانتظار الموافقة (Default)'}
              </span>
            </div>

            {permission !== 'granted' && (
              <button
                type="button"
                onClick={handleRequestPermission}
                className="w-full py-1.5 px-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>طلب تفعيل إشعارات المتصفح الآن</span>
              </button>
            )}

            {permission === 'granted' && (
              <button
                type="button"
                onClick={handleSendTestNotification}
                className="w-full py-1 px-2 bg-slate-800 hover:bg-slate-750 text-amber-300 rounded-lg text-[11px] font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-1"
              >
                <BellRing className="w-3 h-3 text-amber-400" />
                <span>إرسال فحص وتنبيه تجريبي للمتصفح الآن</span>
              </button>
            )}

            {testNotificationFeedback && (
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-[10px] text-amber-300">
                {testNotificationFeedback}
              </div>
            )}
          </div>

          {/* List of Expiring & Expired Permits */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-800 p-2 space-y-1.5">
            {totalAlertCount === 0 ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto opacity-70" />
                <p className="text-xs text-slate-300 font-bold">كافة التصاريح سارية ومستوفية للمدة</p>
                <p className="text-[11px] text-slate-500">لا توجد تصاريح عمل تنتهي خلال أقل من 12 ساعة حالياً.</p>
              </div>
            ) : (
              <>
                {/* Expiring Soon (< 12 hours) */}
                {expiring.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="px-2 py-1 text-[10px] font-bold text-amber-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>تصاريح تنتهي خلال أقل من 12 ساعة ({expiring.length}):</span>
                    </div>

                    {expiring.map(({ permit, timeRemainingText }) => (
                      <div
                        key={permit.id}
                        onClick={() => {
                          onNavigateToPermits(permit.id);
                          setIsOpen(false);
                        }}
                        className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 cursor-pointer transition-colors space-y-1 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-bold text-amber-300">
                            {permit.permitNumber}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40">
                            {timeRemainingText}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-200 line-clamp-1 group-hover:text-white">
                          {permit.title}
                        </p>
                        <div className="text-[10px] text-slate-400 flex items-center justify-between">
                          <span>الموقع: {permit.location}</span>
                          <span className="text-amber-400 flex items-center gap-0.5 group-hover:underline">
                            <span>عرض التصريح</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Already Expired */}
                {expired.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <div className="px-2 py-1 text-[10px] font-bold text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>تصاريح متجاوزة موعد الصلاحية ({expired.length}):</span>
                    </div>

                    {expired.map(({ permit, timeRemainingText }) => (
                      <div
                        key={permit.id}
                        onClick={() => {
                          onNavigateToPermits(permit.id);
                          setIsOpen(false);
                        }}
                        className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 cursor-pointer transition-colors space-y-1 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-bold text-rose-300">
                            {permit.permitNumber}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/40">
                            {timeRemainingText}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-200 line-clamp-1 group-hover:text-white">
                          {permit.title}
                        </p>
                        <div className="text-[10px] text-slate-400 flex items-center justify-between">
                          <span>الموقع: {permit.location}</span>
                          <span className="text-rose-400 flex items-center gap-0.5 group-hover:underline">
                            <span>إغلاق / تمديد</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Action */}
          <div className="p-2.5 bg-slate-850 border-t border-slate-750 text-center">
            <button
              type="button"
              onClick={() => {
                onNavigateToPermits();
                setIsOpen(false);
              }}
              className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>انتقال إلى سجل تصاريح العمل (PTW)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
