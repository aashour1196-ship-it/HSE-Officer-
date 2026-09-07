import React, { useState } from 'react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Database,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { OfflineQueueItem } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface OfflineSyncBarProps {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  onToggleSimulateOffline: () => void;
  pendingQueue: OfflineQueueItem[];
  isSyncing: boolean;
  onSyncNow: () => void;
  syncSuccessMessage: string | null;
  onDismissSyncSuccess: () => void;
}

export const OfflineSyncBar: React.FC<OfflineSyncBarProps> = ({
  isOnline,
  isSimulatedOffline,
  onToggleSimulateOffline,
  pendingQueue,
  isSyncing,
  onSyncNow,
  syncSuccessMessage,
  onDismissSyncSuccess,
}) => {
  const { t, isRtl } = useLanguage();
  const [showQueueDetails, setShowQueueDetails] = useState(false);

  const effectiveOnline = isOnline && !isSimulatedOffline;
  const pendingCount = pendingQueue.length;

  return (
    <div className="w-full">
      {/* Auto-Sync Success Toast Notification */}
      {syncSuccessMessage && (
        <div className="bg-emerald-950/90 border-b border-emerald-500/40 text-emerald-200 px-4 py-2.5 text-xs flex items-center justify-between gap-2 shadow-md animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{syncSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={onDismissSyncSuccess}
            className="p-1 text-emerald-400 hover:text-white rounded-md transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Offline Alert Strip (Only visible when offline OR when there are pending items) */}
      {(!effectiveOnline || pendingCount > 0) && (
        <div
          className={`border-b px-3 sm:px-4 py-2 text-xs transition-colors ${
            !effectiveOnline
              ? 'bg-amber-950/60 border-amber-500/40 text-amber-200'
              : 'bg-sky-950/50 border-sky-500/30 text-sky-200'
          }`}
        >
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            {/* Status Info */}
            <div className="flex items-center gap-2 flex-wrap">
              {!effectiveOnline ? (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 shrink-0">
                  <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>{t('offlineStatusOffline')}</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 shrink-0">
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t('offlineStatusOnline')}</span>
                </span>
              )}

              <span className="text-slate-300">
                {!effectiveOnline
                  ? isRtl
                    ? 'محرك IndexedDB نشط: يمكنك تسجيل البلاغات وملاحظات السلامة بأمان، وسيتم تخزينها محلياً ومزامنتها تلقائياً فور عودة الاتصال.'
                    : 'IndexedDB engine active: You can safely log incidents offline. They are cached locally and will auto-sync when connection is restored.'
                  : isRtl
                  ? 'تم استعادة الاتصال بالإنترنت.'
                  : 'Internet connection is active.'}
              </span>

              {pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-500 text-slate-950 flex items-center gap-1 shadow-xs">
                  <Database className="w-3 h-3" />
                  <span>
                    {pendingCount} {t('offlineQueuePending')}
                  </span>
                </span>
              )}
            </div>

            {/* Actions: Sync Now, View Queue, Simulation Toggle */}
            <div className="flex items-center gap-2 shrink-0">
              {pendingCount > 0 && (
                <>
                  <button
                    type="button"
                    onClick={onSyncNow}
                    disabled={isSyncing || !effectiveOnline}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500 hover:bg-amber-450 active:scale-95 disabled:opacity-50 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? t('syncingInProgress') : t('syncNow')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowQueueDetails(!showQueueDetails)}
                    className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors border border-slate-700 cursor-pointer"
                  >
                    <Layers className="w-3 h-3 text-amber-400" />
                    <span>{isRtl ? 'تفاصيل الطابور' : 'Queue Details'}</span>
                    {showQueueDetails ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                </>
              )}

              {/* Simulation switch button for field testing */}
              <button
                type="button"
                onClick={onToggleSimulateOffline}
                title={isSimulatedOffline ? t('simulateOnline') : t('simulateOffline')}
                className={`px-2 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                  isSimulatedOffline
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                {isSimulatedOffline ? t('simulateOnline') : t('simulateOffline')}
              </button>
            </div>
          </div>

          {/* Collapsible Pending Queue Details */}
          {showQueueDetails && pendingCount > 0 && (
            <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {pendingQueue.map((item) => (
                <div
                  key={item.id}
                  className="p-2 bg-slate-900/90 border border-slate-800 rounded-lg text-xs text-slate-300 space-y-1"
                >
                  <div className="flex items-center justify-between font-bold text-white text-[11px]">
                    <span className="truncate">{item.title}</span>
                    <span className="text-[10px] text-amber-400 font-mono">IndexedDB</span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {isRtl ? 'وقت التسجيل دون اتصال:' : 'Queued at:'}{' '}
                      {new Date(item.queuedAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
