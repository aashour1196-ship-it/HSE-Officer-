import React, { useState } from 'react';
import { AlertTriangle, Clock, ChevronLeft, X, Bell } from 'lucide-react';
import { WorkPermit } from '../types';
import {
  getExpiringPermits,
  getNotificationPermission,
  requestNotificationPermission,
  checkAndNotifyExpiringPermits,
} from '../utils/notificationService';

interface PermitExpiryAlertBannerProps {
  permits: WorkPermit[];
  onViewPermits: () => void;
}

export const PermitExpiryAlertBanner: React.FC<PermitExpiryAlertBannerProps> = ({
  permits,
  onViewPermits,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const { expiring, expired } = getExpiringPermits(permits, 12);
  const totalCount = expiring.length + expired.length;

  if (isDismissed || totalCount === 0) {
    return null;
  }

  const handleEnableNotifications = async () => {
    const res = await requestNotificationPermission();
    if (res === 'granted') {
      checkAndNotifyExpiringPermits(permits, {
        triggerSource: 'manual',
        force: true,
        onNotificationClick: onViewPermits,
      });
    }
  };

  const permission = getNotificationPermission();

  return (
    <div className="bg-gradient-to-r from-rose-950/80 via-amber-950/70 to-slate-900 border-y sm:border sm:rounded-2xl border-amber-500/40 p-3 sm:p-4 text-slate-200 shadow-lg relative animate-in fade-in duration-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5 sm:mt-0 animate-pulse">
            <Clock className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-white">
                تنبيه انتهاء تصاريح العمل (PTW):
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black">
                {totalCount} تصريح يتطلب المتابعة
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-amber-200/90 leading-relaxed">
              {expiring.length > 0 && (
                <span>
                  يوجد <strong>{expiring.length}</strong> تصريح عمل ستنتهي صلاحيتها خلال <strong>أقل من 12 ساعة</strong>.{' '}
                </span>
              )}
              {expired.length > 0 && (
                <span className="text-rose-300 font-semibold">
                  ويوجد <strong>{expired.length}</strong> تصريح متجاوز موعد الانتهاء يجب إغلاقه أو تمديده فوراً.
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0">
          {permission !== 'granted' && (
            <button
              type="button"
              onClick={handleEnableNotifications}
              className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
              title="تفعيل إشعارات المتصفح Notification API"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>تفعيل إشعارات المتصفح</span>
            </button>
          )}

          <button
            type="button"
            onClick={onViewPermits}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-sm flex items-center gap-1 active:scale-95"
          >
            <span>مراجعة التصاريح الآن</span>
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="إخفاء التنبيه مؤقتاً"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
