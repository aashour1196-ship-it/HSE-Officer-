import { WorkPermit } from '../types';
import { getPermitExpiryInfo } from '../components/PermitsModule';
import { playPermitExpiryAlertSound } from './soundAlerts';

export type NotificationSystemStatus = 
  | 'granted' 
  | 'default' 
  | 'denied' 
  | 'unsupported';

/**
 * Check if the browser environment supports the Web Notification API
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current browser notification permission
 */
export function getNotificationPermission(): NotificationSystemStatus {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return window.Notification.permission;
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<NotificationSystemStatus> {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }

  try {
    const permission = await window.Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('Failed to request notification permission:', err);
    return window.Notification.permission || 'denied';
  }
}

/**
 * Find work permits (PTW) that expire within a specific threshold (e.g. 12 hours)
 */
export function getExpiringPermits(permits: WorkPermit[], maxHours: number = 12): {
  expiring: { permit: WorkPermit; hoursRemaining: number; timeRemainingText: string }[];
  expired: { permit: WorkPermit; timeRemainingText: string }[];
} {
  const expiring: { permit: WorkPermit; hoursRemaining: number; timeRemainingText: string }[] = [];
  const expired: { permit: WorkPermit; timeRemainingText: string }[] = [];

  for (const permit of permits) {
    // Only check active or approved or requested permits
    if (permit.status === 'closed' || permit.status === 'cancelled') {
      continue;
    }

    const info = getPermitExpiryInfo(permit);

    if (info.isExpired) {
      expired.push({
        permit,
        timeRemainingText: info.timeRemainingFormatted,
      });
    } else if (info.hoursRemaining > 0 && info.hoursRemaining <= maxHours) {
      expiring.push({
        permit,
        hoursRemaining: info.hoursRemaining,
        timeRemainingText: info.timeRemainingFormatted,
      });
    }
  }

  return { expiring, expired };
}

// Keep track of dispatched notifications to avoid noisy duplicate popups within the same session
const notifiedPermitTimestamps = new Map<string, number>();

/**
 * Trigger native browser notifications for expiring PTW permits
 */
export async function checkAndNotifyExpiringPermits(
  permits: WorkPermit[],
  options: {
    triggerSource?: 'startup' | 'login' | 'manual' | 'interval';
    onNotificationClick?: (permitId?: string) => void;
    force?: boolean;
  } = {}
): Promise<{
  success: boolean;
  expiringCount: number;
  expiredCount: number;
  permissionStatus: NotificationSystemStatus;
  message: string;
}> {
  const { triggerSource = 'startup', onNotificationClick, force = false } = options;
  const permissionStatus = getNotificationPermission();

  const { expiring, expired } = getExpiringPermits(permits, 12);
  const totalAlertCount = expiring.length + expired.length;

  if (permissionStatus === 'unsupported') {
    return {
      success: false,
      expiringCount: expiring.length,
      expiredCount: expired.length,
      permissionStatus: 'unsupported',
      message: 'المتصفح الحالي لا يدعم ميزة إشعارات الويب (Notification API).',
    };
  }

  // If user hasn't chosen yet and this is an explicit manual trigger or login, try requesting permission
  let currentPermission: NotificationSystemStatus = permissionStatus;
  if (currentPermission === 'default' && (triggerSource === 'manual' || triggerSource === 'login')) {
    currentPermission = await requestNotificationPermission();
  }

  if (currentPermission !== 'granted') {
    return {
      success: false,
      expiringCount: expiring.length,
      expiredCount: expired.length,
      permissionStatus: currentPermission,
      message: currentPermission === 'denied' 
        ? 'تم رفض إذن إشعارات المتصفح. يمكنك تفعيلها من إعدادات الموقع بالمتصفح.'
        : 'إذن إشعارات المتصفح يحتاج موافقة المستخدم.',
    };
  }

  if (totalAlertCount === 0) {
    if (triggerSource === 'manual') {
      try {
        const notif = new window.Notification('نظام إدارة السلامة HSE - تصاريح العمل', {
          body: 'جميع تصاريح العمل (PTW) الحالية سارية ومستوفية للمدة الزمنية (لا توجد تصاريح تنتهي خلال أقل من 12 ساعة).',
          icon: '/hse_logo.png',
          badge: '/favicon.png',
          tag: 'ptw-check-ok',
        });
        notif.onclick = () => {
          window.focus();
          onNotificationClick?.();
        };
      } catch (err) {
        console.warn('Failed to display test notification:', err);
      }
    }
    return {
      success: true,
      expiringCount: 0,
      expiredCount: 0,
      permissionStatus: 'granted',
      message: 'لا توجد تصاريح عمل تنتهي خلال 12 ساعة.',
    };
  }

  // Now create the notification
  const now = Date.now();
  const MIN_RENOTIFY_INTERVAL = 30 * 60 * 1000; // 30 minutes throttle unless forced

  let notificationsDispatched = 0;

  // Single or multiple notification strategy
  if (expiring.length === 1 && expired.length === 0) {
    const item = expiring[0];
    const lastNotified = notifiedPermitTimestamps.get(item.permit.id) || 0;

    if (force || now - lastNotified > MIN_RENOTIFY_INTERVAL) {
      try {
        const notif = new window.Notification(`⚠️ تنبيه تصريح عمل PTW ينتهي قريباً`, {
          body: `تصريح: ${item.permit.permitNumber} - ${item.permit.title}\nالموقع: ${item.permit.location}\nالوقت المتبقي: ${item.timeRemainingText}!`,
          icon: '/hse_logo.png',
          badge: '/favicon.png',
          tag: `ptw-expiring-${item.permit.id}`,
          requireInteraction: true,
        });

        notifiedPermitTimestamps.set(item.permit.id, now);
        notificationsDispatched++;
        playPermitExpiryAlertSound();

        notif.onclick = () => {
          window.focus();
          onNotificationClick?.(item.permit.id);
        };
      } catch (e) {
        console.warn('Error showing permit notification:', e);
      }
    }
  } else {
    // Multi-permit summary notification
    const cacheKey = 'multi-ptw-summary';
    const lastNotified = notifiedPermitTimestamps.get(cacheKey) || 0;

    if (force || now - lastNotified > MIN_RENOTIFY_INTERVAL) {
      try {
        const lines: string[] = [];
        if (expiring.length > 0) {
          lines.push(`يوجد (${expiring.length}) تصريح عمل ينتهي خلال أقل من 12 ساعة.`);
          // list top 2
          expiring.slice(0, 2).forEach(it => {
            lines.push(`• ${it.permit.permitNumber}: ${it.timeRemainingText}`);
          });
        }
        if (expired.length > 0) {
          lines.push(`يوجد (${expired.length}) تصريح عمل تجاوز موعد الانتهاء.`);
        }

        const notif = new window.Notification(`⚠️ تنبيه فوري: تصاريح عمل (PTW) تتطلب الإجراء`, {
          body: lines.join('\n'),
          icon: '/hse_logo.png',
          badge: '/favicon.png',
          tag: 'ptw-multi-summary',
          requireInteraction: true,
        });

        notifiedPermitTimestamps.set(cacheKey, now);
        notificationsDispatched++;
        playPermitExpiryAlertSound();

        notif.onclick = () => {
          window.focus();
          onNotificationClick?.();
        };
      } catch (e) {
        console.warn('Error showing multi-permit notification:', e);
      }
    }
  }

  return {
    success: true,
    expiringCount: expiring.length,
    expiredCount: expired.length,
    permissionStatus: 'granted',
    message: `تم إطلاق إشعار المتصفح لـ (${totalAlertCount}) تصريح عمل تتطلب التدخل والمراجعة.`,
  };
}
