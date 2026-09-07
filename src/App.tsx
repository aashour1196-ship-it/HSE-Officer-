import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  FileCheck,
  ClipboardCheck,
  PhoneCall,
  Activity,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  Layers,
  ChevronRight,
  HardHat,
  Flame,
  Clock,
  ExternalLink,
  Info,
  ShieldCheck,
  Printer,
  FileText,
  UserCheck,
  Lock,
  Camera,
  CheckSquare,
  LogOut,
  Globe,
  Eye,
  Wifi,
  WifiOff,
  Database,
  LogIn,
  Compass,
} from 'lucide-react';
import {
  RiskAssessmentItem,
  WorkPermit,
  SafetyObservation,
  IncidentReport,
  InspectionChecklist,
  PermitStatus,
  AuthUser,
  SecurityConfig,
  DailyTask,
  OfflineQueueItem,
} from './types';
import { useLanguage } from './context/LanguageContext';
import { RiskAssessmentModule } from './components/RiskAssessmentModule';
import { PermitsModule, getPermitExpiryInfo } from './components/PermitsModule';
import { IncidentsLogModule } from './components/IncidentsLogModule';
import { ChecklistsModule } from './components/ChecklistsModule';
import { EmergencyModal } from './components/EmergencyModal';
import { ReportPdfExportModal } from './components/ReportPdfExportModal';
import { AuthSecurityModal } from './components/AuthSecurityModal';
import { DailyTaskBoardModal } from './components/DailyTaskBoardModal';
import { NotificationCenter } from './components/NotificationCenter';
import { PermitExpiryAlertBanner } from './components/PermitExpiryAlertBanner';
import { FieldOverviewDashboard } from './components/FieldOverviewDashboard';
import { SoundAlertToggle } from './components/SoundAlertToggle';
import { AuthGateScreen } from './components/AuthGateScreen';
import { OfflineSyncBar } from './components/OfflineSyncBar';
import { GuestNoticeBanner } from './components/GuestNoticeBanner';
import { RestrictedActionModal } from './components/RestrictedActionModal';
import { GuidedTour } from './components/GuidedTour';
import { checkAndNotifyExpiringPermits } from './utils/notificationService';
import { playIncidentAlertSound } from './utils/soundAlerts';
import {
  openHseDatabase,
  enqueueOfflineReport,
  getPendingOfflineReports,
  resolveOfflineReport,
  cacheAllIncidents,
  getCachedIncidents,
  saveToStore,
  STORES,
} from './utils/indexedDBService';

export const GUEST_USER: AuthUser = {
  id: 'USR-GUEST-VIEWER',
  name: 'زائر (للاطلاع العام)',
  email: 'guest@hse-visitor.local',
  role: 'viewer',
  department: 'استعراض واطلاع عام',
  twoFactorEnabled: false,
  lastLoginAt: new Date().toISOString(),
};

export default function App() {
  const { language, toggleLanguage, t, dir, isRtl } = useLanguage();

  // Navigation
  const [activeTab, setActiveTab] = useState<
    'overview' | 'risk_assessment' | 'permits' | 'incidents' | 'checklists'
  >('overview');

  // Modals & Public Access Controls
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [pdfExportModalOpen, setPdfExportModalOpen] = useState(false);
  const [pdfReportType, setPdfReportType] = useState<'incidents' | 'risk_assessment' | 'combined'>('combined');
  const [authSecurityModalOpen, setAuthSecurityModalOpen] = useState(false);
  const [initialOpenIncidentModal, setInitialOpenIncidentModal] = useState(false);
  const [dailyTaskBoardOpen, setDailyTaskBoardOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [restrictedActionModalOpen, setRestrictedActionModalOpen] = useState(false);

  // Check URL parameters for explicit access mode (?mode=login | ?mode=browse)
  const [showLoginGateway, setShowLoginGateway] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('mode') === 'login';
    }
    return false;
  });

  // Daily Tasks Auto-Open Preference (defaults to false so official dashboard appears upon entry)
  const [autoOpenDailyTasks, setAutoOpenDailyTasks] = useState<boolean>(() => {
    const saved = localStorage.getItem('hse_auto_open_tasks_v2');
    return saved !== null ? JSON.parse(saved) : false;
  });

  // Daily Safety and Field Tasks State (Initializes empty, no demo data)
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>(() => {
    const saved = localStorage.getItem('hse_daily_tasks_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [];
  });

  // Offline & IndexedDB Auto-Sync State
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [pendingOfflineQueue, setPendingOfflineQueue] = useState<OfflineQueueItem[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccessToast, setSyncSuccessToast] = useState<string | null>(null);

  // Authentication & RBAC State:
  // Defaults to Guest Viewer (الاطلاع من الجميع) so any direct visitor can browse immediately,
  // while authorized personnel can sign in with 2FA to manage and edit operations.
  const [currentUser, setCurrentUser] = useState<AuthUser>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'browse') {
        return GUEST_USER;
      }
    }
    const saved = localStorage.getItem('hse_auth_user_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) return parsed;
      } catch {
        // fallback
      }
    }
    return GUEST_USER;
  });

  const isGuestUser = currentUser?.role === 'viewer' || currentUser?.id === 'USR-GUEST-VIEWER';

  // Enterprise Security, Privacy & Whitelist Config (Controlled strictly by Owner)
  const [securityConfig, setSecurityConfig] = useState<SecurityConfig>(() => {
    const saved = localStorage.getItem('hse_sec_config_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.allowedEmails || !Array.isArray(parsed.allowedEmails)) {
          parsed.allowedEmails = ['a.ashour1196@gmail.com'];
        }
        return parsed;
      } catch {
        // fallback
      }
    }
    return {
      allowedDomain: 'company.com',
      allowedEmails: ['a.ashour1196@gmail.com'],
      enforce2FA: true,
      httpsEncrypted: true,
      wafProtected: true,
      backendApiProxy: true,
      allowPublicViewing: false,
    };
  });

  useEffect(() => {
    localStorage.setItem('hse_auth_user_v2', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('hse_sec_config_v2', JSON.stringify(securityConfig));
  }, [securityConfig]);

  // States initialized completely EMPTY (zeroed application as requested)
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessmentItem[]>(() => {
    const saved = localStorage.getItem('hse_risk_assessments_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [workPermits, setWorkPermits] = useState<WorkPermit[]>(() => {
    const saved = localStorage.getItem('hse_work_permits_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [safetyObservations, setSafetyObservations] = useState<SafetyObservation[]>(() => {
    const saved = localStorage.getItem('hse_safety_observations_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [incidents, setIncidents] = useState<IncidentReport[]>(() => {
    const saved = localStorage.getItem('hse_incidents_log_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [completedAudits, setCompletedAudits] = useState<InspectionChecklist[]>(() => {
    const saved = localStorage.getItem('hse_completed_audits_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  // LocalStorage sync
  useEffect(() => {
    localStorage.setItem('hse_risk_assessments_v2', JSON.stringify(riskAssessments));
  }, [riskAssessments]);

  useEffect(() => {
    localStorage.setItem('hse_work_permits_v2', JSON.stringify(workPermits));
  }, [workPermits]);

  useEffect(() => {
    localStorage.setItem('hse_safety_observations_v2', JSON.stringify(safetyObservations));
  }, [safetyObservations]);

  useEffect(() => {
    localStorage.setItem('hse_incidents_log_v2', JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    localStorage.setItem('hse_completed_audits_v2', JSON.stringify(completedAudits));
  }, [completedAudits]);

  useEffect(() => {
    localStorage.setItem('hse_daily_tasks_v2', JSON.stringify(dailyTasks));
  }, [dailyTasks]);

  useEffect(() => {
    localStorage.setItem('hse_auto_open_tasks_v2', JSON.stringify(autoOpenDailyTasks));
  }, [autoOpenDailyTasks]);

  // Automatic entry lands on the official site dashboard directly as requested by field staff

  // Automated PTW Expiry Monitoring via Browser Notification API (< 12 hours)
  useEffect(() => {
    // Check when opening the app / startup
    const timer = setTimeout(() => {
      checkAndNotifyExpiringPermits(workPermits, {
        triggerSource: 'startup',
        onNotificationClick: () => setActiveTab('permits'),
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, [workPermits]);

  // Check when user logs in / switches user
  useEffect(() => {
    if (currentUser?.lastLoginAt) {
      checkAndNotifyExpiringPermits(workPermits, {
        triggerSource: 'login',
        force: true,
        onNotificationClick: () => setActiveTab('permits'),
      });
    }
  }, [currentUser?.id, currentUser?.lastLoginAt]);

  // Network listeners & IndexedDB Offline Sync Initialization
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    openHseDatabase()
      .then(async () => {
        const pending = await getPendingOfflineReports();
        setPendingOfflineQueue(pending);

        // Auto-sync if online on initial startup
        if (navigator.onLine && pending.length > 0) {
          triggerAutoSync(pending);
        }

        // Cache existing incidents in background for offline resilience
        if (incidents.length > 0) {
          cacheAllIncidents(incidents).catch(() => {});
        } else {
          const cached = await getCachedIncidents();
          if (cached && cached.length > 0) {
            setIncidents(cached);
          }
        }
      })
      .catch((err) => console.warn('IndexedDB initial sync error:', err));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync incidents to IndexedDB whenever state updates
  useEffect(() => {
    if (incidents.length > 0) {
      cacheAllIncidents(incidents).catch(() => {});
    }
  }, [incidents]);

  // Trigger auto-sync whenever internet connectivity is restored
  const effectiveOnline = isOnline && !isSimulatedOffline;
  useEffect(() => {
    if (effectiveOnline && pendingOfflineQueue.length > 0 && !isSyncing) {
      triggerAutoSync(pendingOfflineQueue);
    }
  }, [effectiveOnline]);

  const triggerAutoSync = async (specificQueue?: OfflineQueueItem[]) => {
    const isConnOk = isOnline && !isSimulatedOffline;
    if (!isConnOk) {
      alert(
        isRtl
          ? 'لا يمكن إتمام المزامنة: التطبيق في وضع عدم الاتصال حالياً. ستتم المزامنة التلقائية فور استعادة الاتصال بالإنترنت.'
          : 'Cannot sync: Application is currently offline. Auto-sync will run automatically when reconnected.'
      );
      return;
    }

    const items = specificQueue || (await getPendingOfflineReports());
    if (items.length === 0) return;

    setIsSyncing(true);
    try {
      for (const item of items) {
        if (item.type === 'incident') {
          await saveToStore(STORES.INCIDENTS, item.payload);
          await resolveOfflineReport(item.id);
        }
      }

      const remaining = await getPendingOfflineReports();
      setPendingOfflineQueue(remaining);

      setSyncSuccessToast(
        isRtl
          ? `✅ تم استعادة الاتصال بالإنترنت! تمت المزامنة التلقائية لعدد (${items.length}) من البلاغات بنجاح مع السجل المركزي.`
          : `✅ Connection restored! Auto-synced (${items.length}) offline reports successfully with central log.`
      );

      setTimeout(() => {
        setSyncSuccessToast(null);
      }, 7000);
    } catch (err) {
      console.error('Offline sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Permission Check for Operational Actions (Allowed staff & Owner can use the site, Guest is read-only)
  const checkCanPerformAction = () => {
    if (isGuestUser) {
      setRestrictedActionModalOpen(true);
      return false;
    }
    const isOwner = currentUser.email?.trim().toLowerCase() === 'a.ashour1196@gmail.com';
    const isWhitelisted = (securityConfig.allowedEmails || []).some(
      (e) => e.trim().toLowerCase() === currentUser.email?.trim().toLowerCase()
    );
    if (!isOwner && !isWhitelisted) {
      setRestrictedActionModalOpen(true);
      return false;
    }
    return true;
  };

  // Site Privacy and Security settings handler: Strictly editable by Owner ONLY
  const handleUpdateSecurityConfig = (newConfig: SecurityConfig) => {
    if (currentUser?.email?.toLowerCase() !== 'a.ashour1196@gmail.com' || currentUser?.role !== 'admin_owner') {
      alert('تنبيه أمني: خصوصية وإعدادات الموقع تعدل فقط من قبل مالك التطبيق.');
      return;
    }
    setSecurityConfig(newConfig);
  };

  // Quick Report Incident Handler from Overview Dashboard
  const handleQuickReportIncident = () => {
    if (!checkCanPerformAction()) return;
    setActiveTab('incidents');
    setInitialOpenIncidentModal(true);
    setTimeout(() => {
      setInitialOpenIncidentModal(false);
    }, 400);
  };

  // Risk Assessment CRUD
  const handleSaveAssessment = (item: RiskAssessmentItem) => {
    if (!checkCanPerformAction()) return;
    setRiskAssessments([item, ...riskAssessments]);
  };
  const handleDeleteAssessment = (id: string) => {
    if (!checkCanPerformAction()) return;
    setRiskAssessments(riskAssessments.filter((a) => a.id !== id));
  };

  // Permits CRUD
  const handleSavePermit = (permit: WorkPermit) => {
    if (!checkCanPerformAction()) return;
    setWorkPermits([permit, ...workPermits]);
  };
  const handleUpdatePermitStatus = (id: string, status: PermitStatus) => {
    if (!checkCanPerformAction()) return;
    setWorkPermits(
      workPermits.map((p) =>
        p.id === id
          ? {
              ...p,
              status,
              closedAt: status === 'closed' ? new Date().toISOString() : p.closedAt,
            }
          : p
      )
    );
  };
  const handleDeletePermit = (id: string) => {
    if (!checkCanPerformAction()) return;
    setWorkPermits(workPermits.filter((p) => p.id !== id));
  };

  // Safety Observations CRUD
  const handleSaveObservation = (obs: SafetyObservation) => {
    if (!checkCanPerformAction()) return;
    setSafetyObservations([obs, ...safetyObservations]);
  };
  const handleDeleteObservation = (id: string) => {
    if (!checkCanPerformAction()) return;
    setSafetyObservations(safetyObservations.filter((o) => o.id !== id));
  };

  // Incidents CRUD with IndexedDB Offline Caching & Queue
  const handleSaveIncident = async (incident: IncidentReport) => {
    if (isGuestUser) {
      alert(
        isRtl
          ? 'تنبيه: وضع الزائر مخصص للاطلاع وتصفح النظام فقط. لتسجيل البلاغات يرجى تسجيل الدخول ككادر مصرح له.'
          : 'Notice: Visitor mode is read-only. Please sign in as authorized staff to file reports.'
      );
      return;
    }

    const isConnOk = isOnline && !isSimulatedOffline;

    if (!isConnOk) {
      // Offline mode: Enqueue to IndexedDB offline queue
      const queueItem: OfflineQueueItem = {
        id: incident.id,
        type: 'incident',
        title: incident.title,
        payload: incident,
        queuedAt: new Date().toISOString(),
        status: 'pending_sync',
      };

      try {
        await enqueueOfflineReport(queueItem);
        await saveToStore(STORES.INCIDENTS, incident);
        setPendingOfflineQueue((prev) => [queueItem, ...prev.filter((p) => p.id !== queueItem.id)]);
      } catch (err) {
        console.error('Error saving to IndexedDB offline queue:', err);
      }

      setIncidents((prev) => [incident, ...prev]);
      playIncidentAlertSound();

      setSyncSuccessToast(
        isRtl
          ? `📡 تم حفظ البلاغ محلياً بنجاح في IndexedDB! التطبيق في وضع عدم الاتصال. سيتم المزامنة التلقائية فور عودة الاتصال.`
          : `📡 Report cached locally in IndexedDB! App is offline. Auto-sync will process when reconnected.`
      );
    } else {
      setIncidents((prev) => [incident, ...prev]);
      playIncidentAlertSound();
      try {
        await saveToStore(STORES.INCIDENTS, incident);
      } catch (e) {
        // non-blocking
      }
    }
  };
  const handleUpdateIncidentStatus = (id: string, status: 'investigating' | 'action_pending' | 'closed') => {
    if (!checkCanPerformAction()) return;
    setIncidents(incidents.map((i) => (i.id === id ? { ...i, status } : i)));
  };
  const handleToggleActionDone = (incidentId: string, actionId: string) => {
    if (!checkCanPerformAction()) return;
    setIncidents(
      incidents.map((inc) => {
        if (inc.id === incidentId) {
          const updatedActions = inc.correctiveActions.map((act) =>
            act.id === actionId ? { ...act, isCompleted: !act.isCompleted } : act
          );
          return { ...inc, correctiveActions: updatedActions };
        }
        return inc;
      })
    );
  };
  const handleDeleteIncident = (id: string) => {
    if (!checkCanPerformAction()) return;
    setIncidents(incidents.filter((i) => i.id !== id));
  };

  // Checklists CRUD
  const handleSaveAudit = (audit: InspectionChecklist) => {
    if (!checkCanPerformAction()) return;
    setCompletedAudits([audit, ...completedAudits]);
  };
  const handleDeleteAudit = (id: string) => {
    if (!checkCanPerformAction()) return;
    setCompletedAudits(completedAudits.filter((a) => a.id !== id));
  };

  // Daily Tasks Handlers
  const handleSaveDailyTask = (task: DailyTask) => {
    if (!checkCanPerformAction()) return;
    setDailyTasks((prev) => [task, ...prev]);
  };
  const handleToggleDailyTask = (id: string) => {
    if (!checkCanPerformAction()) return;
    setDailyTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              isCompleted: !t.isCompleted,
              completedAt: !t.isCompleted ? new Date().toISOString() : undefined,
            }
          : t
      )
    );
  };
  const handleDeleteDailyTask = (id: string) => {
    if (!checkCanPerformAction()) return;
    setDailyTasks((prev) => prev.filter((t) => t.id !== id));
  };
  const handleClearCompletedDailyTasks = () => {
    if (!checkCanPerformAction()) return;
    setDailyTasks((prev) => prev.filter((t) => !t.isCompleted));
  };

  // Overview calculations
  const pendingDailyTasksCount = dailyTasks.filter((t) => !t.isCompleted).length;
  const activePermitsCount = workPermits.filter((p) => p.status === 'active').length;
  const expiringPermitsCount = workPermits.filter((p) => getPermitExpiryInfo(p).isExpiringSoon).length;
  const openIncidentsCount = incidents.filter((i) => i.status !== 'closed').length;
  const nearMissCount = incidents.filter((i) => i.type === 'near_miss').length;
  const totalRecords =
    riskAssessments.length +
    workPermits.length +
    safetyObservations.length +
    incidents.length +
    completedAudits.length;

  // Strict Access Gate:
  // Check if current visitor has an authorized active session or is exploring in guest read-only mode:
  const isSessionAuthorized = Boolean(
    currentUser &&
    currentUser.email &&
    (currentUser.email.trim().toLowerCase() === 'a.ashour1196@gmail.com' ||
      (securityConfig.allowedEmails || []).some(
        (e) => e.trim().toLowerCase() === currentUser.email.trim().toLowerCase()
      ))
  );

  // If explicit login gateway is opened or user session is locked out without guest browsing mode:
  if (showLoginGateway || (!isSessionAuthorized && !isGuestUser)) {
    return (
      <AuthGateScreen
        securityConfig={securityConfig}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setShowLoginGateway(false);
          if (typeof window !== 'undefined' && window.history.replaceState) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Cairo',sans-serif] w-full max-w-full overflow-x-hidden" dir={dir}>
      {/* Top Application Header - Compact, Balanced & Streamlined (Without owner name in header) */}
      <header className="bg-slate-900/95 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-3">
          {/* Brand & System Title */}
          <div id="top-header-brand" className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-amber-500/40 bg-slate-900 shadow-md flex items-center justify-center p-0.5 shrink-0 ring-1 ring-amber-500/20">
              <img
                src="/hse_logo.png"
                alt="HSE Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="font-extrabold text-sm sm:text-base text-white tracking-tight truncate">
                  {t('appName')}
                </h1>
                <span className="text-[10px] bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/30 font-bold hidden lg:inline">
                  {t('standards')}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block truncate">
                {t('appSubtitle')}
              </p>
            </div>
          </div>

          {/* Action Clusters - Harmonious, Easy-to-use & Cohesive */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Cluster 1: Field Operations & Alerts */}
            <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
              {/* Audio Field Alerts Toggle */}
              <SoundAlertToggle compact />

              {/* Browser PTW Notification Center */}
              <NotificationCenter
                permits={workPermits}
                onNavigateToPermits={() => setActiveTab('permits')}
              />

              {/* Daily Task Board Button */}
              <button
                type="button"
                onClick={() => setDailyTaskBoardOpen(true)}
                title={t('dailyTasks')}
                className="relative flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 active:scale-95 text-amber-300 hover:text-amber-200 rounded-lg text-xs font-bold transition-all border border-amber-500/30 cursor-pointer"
              >
                <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">{t('dailyTasks')}</span>
                {pendingDailyTasksCount > 0 ? (
                  <span className="bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-black font-mono animate-pulse">
                    {pendingDailyTasksCount}
                  </span>
                ) : (
                  <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded-full text-[10px] font-mono hidden md:inline">
                    ✓
                  </span>
                )}
              </button>
            </div>

            {/* Cluster 2: Emergency & Reports */}
            <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
              {/* Quick Export PDF */}
              <button
                type="button"
                onClick={() => {
                  setPdfReportType('combined');
                  setPdfExportModalOpen(true);
                }}
                title={t('exportPdf')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-amber-400 rounded-lg text-xs font-bold transition-all border border-slate-750 cursor-pointer active:scale-95"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">PDF</span>
              </button>

              {/* Iraq 911 Emergency Calling */}
              <a
                href="tel:911"
                id="emergency-call-btn"
                title={t('emergency911')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white rounded-lg text-xs font-bold transition-all border border-rose-500 shadow-xs"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">911</span>
              </a>

              {/* Emergency Guide Modal */}
              <button
                type="button"
                onClick={() => setShowEmergencyModal(true)}
                title={t('emergency')}
                className="p-1.5 text-slate-300 hover:text-amber-400 bg-slate-900 hover:bg-slate-800 active:scale-95 rounded-lg text-xs transition-colors border border-slate-750 cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>

            {/* Cluster 3: User Identity, Guided Tour & Language */}
            <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
              {/* Guided Tour Trigger Button */}
              <button
                type="button"
                id="header-guided-tour-btn"
                onClick={() => setIsTourOpen(true)}
                title={t('guidedTour')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 active:scale-95 text-amber-300 hover:text-amber-200 rounded-lg text-xs font-bold transition-all border border-amber-500/30 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">{t('guidedTour')}</span>
              </button>

              {/* Language Switcher */}
              <button
                type="button"
                onClick={toggleLanguage}
                title={t('switchLanguage')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-amber-400 rounded-lg text-xs font-bold transition-all border border-slate-750 cursor-pointer active:scale-95"
              >
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold">{language === 'ar' ? 'English' : 'العربية'}</span>
              </button>

              {/* Role & Access Actions */}
              {isGuestUser ? (
                <>
                  <div
                    title={t('guestNoticeDescription')}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-bold border bg-sky-500/15 border-sky-500/40 text-sky-300 select-none"
                  >
                    <Eye className="w-3.5 h-3.5 text-sky-400" />
                    <span className="hidden sm:inline">{t('visitorBadge')}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowLoginGateway(true)}
                    title={t('authorizedLoginLink')}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-black border transition-all cursor-pointer bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-95 shadow-xs"
                  >
                    <LogIn className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                    <span className="hidden sm:inline">{t('signInAuthorized')}</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setAuthSecurityModalOpen(true)}
                    title={currentUser?.role === 'admin_owner' ? 'إعدادات الأمان والخصوصية (المالك)' : 'الملف الشخصي وتفضيلات الحساب'}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer active:scale-95 shadow-xs ${
                      currentUser?.role === 'admin_owner'
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                        : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">
                      {currentUser?.role === 'admin_owner' ? t('ownerBadge') : t('authorizedBadge')}
                    </span>
                  </button>

                  {/* Quick Preview as Visitor Mode */}
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentUser(GUEST_USER);
                      localStorage.setItem('hse_auth_user_v2', JSON.stringify(GUEST_USER));
                    }}
                    title={isRtl ? 'معاينة الموقع كزائر (للاطلاع العام)' : 'Preview as Public Visitor'}
                    className="flex items-center gap-1.5 px-2 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-sky-300 rounded-lg text-xs transition-all border border-slate-750 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-sky-400" />
                    <span className="hidden xl:inline">{isRtl ? 'معاينة كزائر' : 'Visitor Mode'}</span>
                  </button>

                  {/* Direct Logout Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentUser(GUEST_USER);
                      localStorage.setItem('hse_auth_user_v2', JSON.stringify(GUEST_USER));
                    }}
                    title={t('signOut')}
                    className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-900 hover:bg-rose-950/40 active:scale-95 rounded-lg text-xs transition-colors border border-slate-750 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Navigation Tabs - Ergonomic, Distinct & Sleek */}
        <div className="border-t border-slate-800/80 bg-slate-900/95 backdrop-blur-md shadow-inner">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 flex overflow-x-auto text-xs font-semibold scrollbar-none gap-1.5 py-1.5">
            <button
              type="button"
              id="nav-tab-overview"
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-3 rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer font-bold ${
                activeTab === 'overview'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('tabOverview')}</span>
            </button>

            <button
              type="button"
              id="nav-tab-risk-assessment"
              onClick={() => setActiveTab('risk_assessment')}
              className={`py-2 px-3 rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer font-bold ${
                activeTab === 'risk_assessment'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('tabRiskAssessment')}</span>
              {riskAssessments.length > 0 && (
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded-full font-mono">
                  {riskAssessments.length}
                </span>
              )}
            </button>

            <button
              type="button"
              id="nav-tab-permits"
              onClick={() => setActiveTab('permits')}
              className={`py-2 px-3 rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer font-bold ${
                activeTab === 'permits'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('tabPermits')}</span>
              {expiringPermitsCount > 0 ? (
                <span
                  title={`${expiringPermitsCount} ${language === 'ar' ? 'تصاريح قاربت على الانتهاء' : 'permits expiring soon'}`}
                  className="text-[10px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs animate-pulse"
                >
                  <AlertTriangle className="w-2.5 h-2.5" />
                  <span>{expiringPermitsCount}</span>
                </span>
              ) : workPermits.length > 0 ? (
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded-full font-mono">
                  {workPermits.length}
                </span>
              ) : null}
            </button>

            <button
              type="button"
              id="nav-tab-incidents"
              onClick={() => setActiveTab('incidents')}
              className={`py-2 px-3 rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer font-bold ${
                activeTab === 'incidents'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('tabIncidents')}</span>
              {incidents.length > 0 && (
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded-full font-mono">
                  {incidents.length}
                </span>
              )}
            </button>

            <button
              type="button"
              id="nav-tab-checklists"
              onClick={() => setActiveTab('checklists')}
              className={`py-2 px-3 rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer font-bold ${
                activeTab === 'checklists'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('tabChecklists')}</span>
              {completedAudits.length > 0 && (
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded-full font-mono">
                  {completedAudits.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6 overflow-x-hidden">
        {/* Offline IndexedDB Auto-Sync Status & Simulation Control */}
        <OfflineSyncBar
          isOnline={isOnline}
          isSimulatedOffline={isSimulatedOffline}
          onToggleSimulateOffline={() => setIsSimulatedOffline(!isSimulatedOffline)}
          pendingQueue={pendingOfflineQueue}
          isSyncing={isSyncing}
          onSyncNow={() => triggerAutoSync()}
          syncSuccessMessage={syncSuccessToast}
          onDismissSyncSuccess={() => setSyncSuccessToast(null)}
        />

        {/* Guest Read-Only Notice Banner */}
        {isGuestUser && (
          <GuestNoticeBanner
            onOpenLogin={() => setShowLoginGateway(true)}
          />
        )}

        {/* Persistent Browser PTW Expiry Alert Banner (< 12 hours) */}
        <PermitExpiryAlertBanner
          permits={workPermits}
          onViewPermits={() => setActiveTab('permits')}
        />

        {/* TAB 1: OVERVIEW & FIELD COMMAND DASHBOARD */}
        {activeTab === 'overview' && (
          <FieldOverviewDashboard
            riskAssessments={riskAssessments}
            workPermits={workPermits}
            safetyObservations={safetyObservations}
            incidents={incidents}
            completedAudits={completedAudits}
            dailyTasks={dailyTasks}
            onOpenDailyTasks={() => setDailyTaskBoardOpen(true)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onQuickReportIncident={handleQuickReportIncident}
            onOpenPdfModal={(type) => {
              setPdfReportType(type);
              setPdfExportModalOpen(true);
            }}
            isAuthorized={!isGuestUser}
            onStartTour={() => setIsTourOpen(true)}
          />
        )}

        {/* TAB 2: RISK ASSESSMENT */}
        {activeTab === 'risk_assessment' && (
          <RiskAssessmentModule
            assessments={riskAssessments}
            onSaveAssessment={handleSaveAssessment}
            onDeleteAssessment={handleDeleteAssessment}
            onExportPdf={() => {
              setPdfReportType('risk_assessment');
              setPdfExportModalOpen(true);
            }}
          />
        )}

        {/* TAB 3: WORK PERMITS & BBS */}
        {activeTab === 'permits' && (
          <PermitsModule
            permits={workPermits}
            observations={safetyObservations}
            onSavePermit={handleSavePermit}
            onUpdatePermitStatus={handleUpdatePermitStatus}
            onDeletePermit={handleDeletePermit}
            onSaveObservation={handleSaveObservation}
            onDeleteObservation={handleDeleteObservation}
          />
        )}

        {/* TAB 4: INCIDENTS LOG */}
        {activeTab === 'incidents' && (
          <IncidentsLogModule
            incidents={incidents}
            onSaveIncident={handleSaveIncident}
            onUpdateIncidentStatus={handleUpdateIncidentStatus}
            onToggleActionDone={handleToggleActionDone}
            onDeleteIncident={handleDeleteIncident}
            onExportPdf={() => {
              setPdfReportType('incidents');
              setPdfExportModalOpen(true);
            }}
            initialOpenCreateModal={initialOpenIncidentModal}
            isGuest={isGuestUser}
            isOnline={effectiveOnline}
            pendingOfflineIds={pendingOfflineQueue.map((p) => p.id)}
          />
        )}

        {/* TAB 5: CHECKLISTS */}
        {activeTab === 'checklists' && (
          <ChecklistsModule
            completedAudits={completedAudits}
            onSaveAudit={handleSaveAudit}
            onDeleteAudit={handleDeleteAudit}
          />
        )}
      </main>

      {/* Emergency Modal */}
      <EmergencyModal
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
      />

      {/* PDF Export & Print Modal */}
      <ReportPdfExportModal
        isOpen={pdfExportModalOpen}
        onClose={() => setPdfExportModalOpen(false)}
        incidents={incidents}
        assessments={riskAssessments}
        defaultReportType={pdfReportType}
      />

      {/* RBAC, SSO & Security Settings Modal */}
      <AuthSecurityModal
        isOpen={authSecurityModalOpen}
        onClose={() => setAuthSecurityModalOpen(false)}
        currentUser={currentUser}
        securityConfig={securityConfig}
        onUpdateUser={setCurrentUser}
        onUpdateSecurityConfig={handleUpdateSecurityConfig}
      />

      {/* Daily Task Board Modal (قائمة المهام اليومية الميدانية) */}
      <DailyTaskBoardModal
        isOpen={dailyTaskBoardOpen}
        onClose={() => setDailyTaskBoardOpen(false)}
        tasks={dailyTasks}
        onSaveTask={handleSaveDailyTask}
        onToggleTask={handleToggleDailyTask}
        onDeleteTask={handleDeleteDailyTask}
        onClearCompleted={handleClearCompletedDailyTasks}
        autoOpenOnLogin={autoOpenDailyTasks}
        onToggleAutoOpen={setAutoOpenDailyTasks}
      />

      {/* Restricted Operation Action Guidance Modal (For public guests attempting write operations) */}
      <RestrictedActionModal
        isOpen={restrictedActionModalOpen}
        onClose={() => setRestrictedActionModalOpen(false)}
        onOpenLogin={() => {
          setRestrictedActionModalOpen(false);
          setShowLoginGateway(true);
        }}
      />

      {/* Guided Tour Interactive Tooltips */}
      <GuidedTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* Footer - Keeping Owner Name Exclusively */}
      <footer className="border-t border-slate-850 bg-slate-950 py-4 px-3 text-center text-xs text-slate-500 w-full overflow-hidden">
        <p>
          {t('footerText')} • <strong className="text-amber-400/90 font-mono font-bold">ABDULLAH AL-ASHOUR</strong>
        </p>
      </footer>
    </div>
  );
}
