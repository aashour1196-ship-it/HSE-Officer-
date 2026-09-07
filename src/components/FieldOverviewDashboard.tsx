import React, { useState } from 'react';
import {
  AlertTriangle,
  FileCheck,
  ShieldAlert,
  ClipboardCheck,
  Printer,
  PhoneCall,
  Flame,
  Layers,
  Sparkles,
  ChevronRight,
  Clock,
  CheckCircle2,
  Camera,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Radio,
  Calendar,
  Zap,
  Info,
  CheckSquare,
  Compass,
} from 'lucide-react';
import {
  RiskAssessmentItem,
  WorkPermit,
  SafetyObservation,
  IncidentReport,
  InspectionChecklist,
  DailyTask,
} from '../types';
import { SoundAlertToggle } from './SoundAlertToggle';
import { getPermitExpiryInfo } from './PermitsModule';
import { useLanguage } from '../context/LanguageContext';

interface FieldOverviewDashboardProps {
  riskAssessments: RiskAssessmentItem[];
  workPermits: WorkPermit[];
  safetyObservations: SafetyObservation[];
  incidents: IncidentReport[];
  completedAudits: InspectionChecklist[];
  dailyTasks?: DailyTask[];
  onOpenDailyTasks?: () => void;
  onNavigateTab: (tab: 'overview' | 'risk_assessment' | 'permits' | 'incidents' | 'checklists') => void;
  onQuickReportIncident: () => void;
  onOpenPdfModal: (type: 'incidents' | 'risk_assessment' | 'full_audit') => void;
  onLoadSampleData?: () => void;
  isAuthorized?: boolean;
  onStartTour?: () => void;
}

export const FieldOverviewDashboard: React.FC<FieldOverviewDashboardProps> = ({
  riskAssessments,
  workPermits,
  safetyObservations: _safetyObservations,
  incidents,
  completedAudits,
  dailyTasks = [],
  onOpenDailyTasks,
  onNavigateTab,
  onQuickReportIncident,
  onOpenPdfModal,
  onLoadSampleData: _onLoadSampleData,
  isAuthorized = true,
  onStartTour,
}) => {
  const { t, isRtl } = useLanguage();
  const [activeReferenceTab, setActiveReferenceTab] = useState<'emergency' | 'hierarchy' | 'rules'>('emergency');

  // Computed metrics
  const activePermits = workPermits.filter((p) => p.status === 'active');
  const expiringPermits = activePermits
    .map((p) => ({
      permit: p,
      info: getPermitExpiryInfo(p),
    }))
    .filter((item) => item.info.isExpiringSoon || item.info.isExpired);

  const openIncidents = incidents.filter((i) => i.status !== 'closed');
  const nearMisses = incidents.filter((i) => i.type === 'near_miss');
  const highRiskAssessments = riskAssessments.filter(
    (a) => a.riskMatrixLevel === 'high' || a.riskMatrixLevel === 'critical'
  );

  const pendingDailyTasksCount = dailyTasks.filter((t) => !t.isCompleted).length;

  const currentDateArabic = new Intl.DateTimeFormat('ar-IQ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  /* ================== RENDER SECTIONS ================== */

  // 1. HERO STATUS
  const renderHeroStatus = () => (
    <div
      id="dashboard-hero-status"
      className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-850 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-md relative overflow-hidden"
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          {/* Badges & Date */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>مركز القيادة والتحكم الميداني للسلامة (HSE Field Hub)</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-medium">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentDateArabic}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold font-mono">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              <span>نظام الرصد والمتابعة المباشر</span>
            </span>
          </div>

          {/* Title & Credential */}
          <div>
            <div className="text-xs text-slate-400 mb-1">
              إشراف وإدارة السلامة والصحة المهنية المعتمدة
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              لوحة التحكم الميداني وإدارة السلامة والصحة المهنية
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
              منظومة تشغيلية ذكية تجمع بين الرصد الصوتي الميداني الفوري، إنذارات انتهاء تصاريح العمل (PTW)، تحليل المهام (JHA 5×5)، وسجلات الحوادث مع التفتيش اليومي المعتمد.
            </p>
          </div>

          {/* Integrated Sound Bar & Quick Actions */}
          <div className="pt-1 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 p-1.5 px-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-slate-300 font-medium">حالة التنبيه الميداني:</span>
              <span className="text-amber-400 font-bold font-mono">الصوت والإشعارات جاهزة</span>
            </div>

            {onStartTour && (
              <button
                type="button"
                onClick={onStartTour}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 hover:text-amber-200 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-xs"
              >
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('startTour')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Official Site Logo Box */}
        <div className="flex items-center gap-4 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 shadow-xl shrink-0 self-stretch sm:self-auto justify-center">
          <div className="w-24 h-24 rounded-2xl overflow-hidden border border-amber-500/30 bg-slate-900 p-1 flex items-center justify-center">
            <img
              src="/hse_logo.png"
              alt="HSE Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-right space-y-1">
            <span className="text-xs font-mono font-bold text-amber-400 block tracking-wider">
              HSE MANAGEMENT
            </span>
            <div className="text-[11px] font-bold text-white">منظومة السلامة الميدانية</div>
            <div className="text-[10px] text-slate-400 font-mono">HSE Professional v2.0</div>
            <div className="pt-1">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                ميداني نشط 24/7
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 2. RAPID FIELD ACTION MATRIX
  const renderRapidActions = () => (
    <div id="dashboard-rapid-actions" className="space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-bold text-white">منصة الإجراءات السريعة الميدانية</h2>
          <span className="text-[11px] text-slate-400">(بنقرة واحدة للوصول الفوري)</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Action 1: Incident Quick Report (TARGET FOR TOUR) */}
        <button
          type="button"
          id="quick-report-incident-btn"
          onClick={onQuickReportIncident}
          className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-gradient-to-br from-rose-950/80 to-slate-900 border-2 border-rose-600/50 hover:border-rose-500 transition-all text-right group shadow-md hover:shadow-rose-950/40 active:scale-98 flex flex-col justify-between relative overflow-hidden cursor-pointer"
        >
          <div className="flex items-center justify-between w-full mb-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/40 animate-pulse">
              إنذار صوتي
            </span>
          </div>
          <div>
            <div className="text-xs font-black text-white group-hover:text-rose-300 transition-colors flex items-center gap-1">
              <span>إبلاغ عن حادث / وشيك</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              تسجيل فوري مع صورة وإنذار
            </div>
          </div>
        </button>

        {/* Action 2: New Work Permit */}
        <button
          type="button"
          onClick={() => onNavigateTab('permits')}
          className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500/50 transition-all text-right group shadow-sm active:scale-98 flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between w-full mb-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
              <FileCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-slate-400 font-mono">PTW</span>
          </div>
          <div>
            <div className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors flex items-center gap-1">
              <span>إصدار تصريح عمل</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 rotate-180" />
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              ساخن، محصور، كهرباء، حفر
            </div>
          </div>
        </button>

        {/* Action 3: New Risk Assessment */}
        <button
          type="button"
          onClick={() => onNavigateTab('risk_assessment')}
          className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all text-right group shadow-sm active:scale-98 flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between w-full mb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-slate-400 font-mono">JHA 5×5</span>
          </div>
          <div>
            <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-1">
              <span>تقييم مخاطر مهام</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 rotate-180" />
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              مصفوفة الاحتمالية والشدة
            </div>
          </div>
        </button>

        {/* Action 4: Start Site Audit */}
        <button
          type="button"
          onClick={() => onNavigateTab('checklists')}
          className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all text-right group shadow-sm active:scale-98 flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between w-full mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Audit</span>
          </div>
          <div>
            <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1">
              <span>تفتيش موقع ميداني</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 rotate-180" />
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              قوائم فحص السقالات والرافعات
            </div>
          </div>
        </button>

        {/* Action 5: Daily Task Board */}
        <button
          type="button"
          onClick={onOpenDailyTasks}
          className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all text-right group shadow-sm active:scale-98 flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between w-full mb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <CheckSquare className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-amber-300 font-mono font-bold bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/30">
              {pendingDailyTasksCount} متبقية
            </span>
          </div>
          <div>
            <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-1">
              <span>مهام اليوم الميدانية</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 rotate-180" />
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              لوحة التذكيرات والمهام
            </div>
          </div>
        </button>

        {/* Action 6: Print Official PDF Report */}
        <button
          type="button"
          onClick={() => onOpenPdfModal('full_audit')}
          className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-all text-right group shadow-sm active:scale-98 flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between w-full mb-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <Printer className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-slate-400 font-mono">PDF</span>
          </div>
          <div>
            <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors flex items-center gap-1">
              <span>تصدير تقرير معتمد</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 rotate-180" />
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              طباعة رسمية بالشعار والختم
            </div>
          </div>
        </button>
      </div>
    </div>
  );

  // 3. KPI METRICS
  const renderKpiMetrics = () => (
    <div id="dashboard-kpi-metrics" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Permits */}
      <div
        onClick={() => onNavigateTab('permits')}
        className="bg-slate-900 border border-slate-800 hover:border-sky-500/50 p-4.5 rounded-2xl cursor-pointer transition-all space-y-2 group shadow-xs"
      >
        <div className="flex items-center justify-between">
          <span className="p-2 bg-sky-500/10 text-sky-400 rounded-xl">
            <FileCheck className="w-5 h-5" />
          </span>
          <span className="text-[10px] text-slate-400 group-hover:text-sky-400 flex items-center gap-0.5">
            <span>عرض السجل</span>
            <ChevronRight className="w-3 h-3 rotate-180" />
          </span>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-white">{activePermits.length}</span>
            <span className="text-xs text-slate-400">ساري بالموقع</span>
          </div>
          <div className="text-xs font-bold text-slate-300 mt-1">تصاريح العمل (PTW)</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>الإجمالي: {workPermits.length}</span>
            {expiringPermits.length > 0 ? (
              <span className="text-rose-400 font-bold animate-pulse">
                {expiringPermits.length} يحتاج تجديد!
              </span>
            ) : (
              <span className="text-emerald-400 font-medium">كلها مستوفية</span>
            )}
          </div>
        </div>
      </div>

      {/* Card 2: Incidents */}
      <div
        onClick={() => onNavigateTab('incidents')}
        className="bg-slate-900 border border-slate-800 hover:border-rose-500/50 p-4.5 rounded-2xl cursor-pointer transition-all space-y-2 group shadow-xs"
      >
        <div className="flex items-center justify-between">
          <span className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </span>
          <span className="text-[10px] text-slate-400 group-hover:text-rose-400 flex items-center gap-0.5">
            <span>سجل التحقيق</span>
            <ChevronRight className="w-3 h-3 rotate-180" />
          </span>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-white">{incidents.length}</span>
            <span className="text-xs text-slate-400">واقعة مسجلة</span>
          </div>
          <div className="text-xs font-bold text-slate-300 mt-1">الحوادث وشبه الحوادث</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>{nearMisses.length} شبه حادث (وشيك)</span>
            {openIncidents.length > 0 ? (
              <span className="text-amber-400 font-bold">{openIncidents.length} قيد التحقيق</span>
            ) : (
              <span className="text-emerald-400 font-medium">مغلق بالكامل</span>
            )}
          </div>
        </div>
      </div>

      {/* Card 3: Risk Assessment */}
      <div
        onClick={() => onNavigateTab('risk_assessment')}
        className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-4.5 rounded-2xl cursor-pointer transition-all space-y-2 group shadow-xs"
      >
        <div className="flex items-center justify-between">
          <span className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
            <ShieldAlert className="w-5 h-5" />
          </span>
          <span className="text-[10px] text-slate-400 group-hover:text-amber-400 flex items-center gap-0.5">
            <span>المصفوفة</span>
            <ChevronRight className="w-3 h-3 rotate-180" />
          </span>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-white">{riskAssessments.length}</span>
            <span className="text-xs text-slate-400">تقييم معتمد</span>
          </div>
          <div className="text-xs font-bold text-slate-300 mt-1">تقييم وتحليل المخاطر JHA</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>مصفوفة 5×5 قياسية</span>
            {highRiskAssessments.length > 0 ? (
              <span className="text-rose-400 font-bold">{highRiskAssessments.length} مرتفع/حرج</span>
            ) : (
              <span className="text-emerald-400 font-medium">متحكم بها</span>
            )}
          </div>
        </div>
      </div>

      {/* Card 4: Audits & Checklists */}
      <div
        onClick={() => onNavigateTab('checklists')}
        className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-4.5 rounded-2xl cursor-pointer transition-all space-y-2 group shadow-xs"
      >
        <div className="flex items-center justify-between">
          <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <ClipboardCheck className="w-5 h-5" />
          </span>
          <span className="text-[10px] text-slate-400 group-hover:text-emerald-400 flex items-center gap-0.5">
            <span>القوائم</span>
            <ChevronRight className="w-3 h-3 rotate-180" />
          </span>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-white">{completedAudits.length}</span>
            <span className="text-xs text-slate-400">جولة تفتيش</span>
          </div>
          <div className="text-xs font-bold text-slate-300 mt-1">التدقيق والتفتيش الميداني</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>سقالات • حفر • رافعات</span>
            <span className="text-emerald-400 font-medium">توثيق بالصور</span>
          </div>
        </div>
      </div>
    </div>
  );

  // 4. LIVE PERMITS MONITOR
  const renderLivePermits = () => (
    <div id="dashboard-live-permits" className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 space-y-3.5 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/15 text-sky-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">تصاريح العمل السارية والمباشرة بالموقع</h3>
            <div className="text-[10px] text-slate-400">مراقبة حية لصلاحية الأعمال الساخنة والخطرة</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigateTab('permits')}
          className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 cursor-pointer"
        >
          <span>عرض الكل ({workPermits.length})</span>
          <ChevronRight className="w-3.5 h-3.5 rotate-180" />
        </button>
      </div>

      {activePermits.length === 0 ? (
        <div className="text-center py-8 text-slate-400 space-y-2">
          <FileCheck className="w-8 h-8 mx-auto text-slate-600" />
          <p className="text-xs">لا توجد تصاريح عمل نشطة حالياً في الموقع</p>
          <button
            type="button"
            onClick={() => onNavigateTab('permits')}
            className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
          >
            <span>إصدار تصريح عمل جديد</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {activePermits.slice(0, 4).map((permit) => {
            const expiryInfo = getPermitExpiryInfo(permit);
            return (
              <div
                key={permit.id}
                onClick={() => onNavigateTab('permits')}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  expiryInfo.isExpired
                    ? 'bg-rose-950/20 border-rose-500/40 hover:bg-rose-950/30'
                    : expiryInfo.isExpiringSoon
                    ? 'bg-amber-950/20 border-amber-500/40 hover:bg-amber-950/30'
                    : 'bg-slate-850/60 border-slate-750 hover:bg-slate-800'
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-white">
                      {permit.permitNumber}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-750 text-slate-300">
                      {permit.type === 'hot_work'
                        ? 'عمل ساخن'
                        : permit.type === 'confined_space'
                        ? 'مكان محصور'
                        : permit.type === 'height_work'
                        ? 'عمل بارتفاع'
                        : permit.type === 'electrical'
                        ? 'كهرباء / عزل'
                        : 'أعمال حفر'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 font-medium truncate">
                    {permit.title}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    الموقع: {permit.location}
                  </div>
                </div>

                <div className="text-left shrink-0 space-y-1">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                      expiryInfo.isExpired
                        ? 'bg-rose-600/30 text-rose-300 border-rose-500 animate-pulse'
                        : expiryInfo.isExpiringSoon
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                        : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>{expiryInfo.timeRemainingText}</span>
                  </span>
                  <div className="text-[10px] text-slate-400 text-left font-mono">
                    حتى: {permit.endTime || permit.endDate || '-'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // 5. RECENT INCIDENTS
  const renderRecentIncidents = () => (
    <div id="dashboard-recent-incidents" className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 space-y-3.5 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">سجل البلاغات والحوادث وشبه الحوادث الأخيرة</h3>
            <div className="text-[10px] text-slate-400">إجراءات التحقيق والتصحيح الميداني الفوري</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigateTab('incidents')}
          className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 cursor-pointer"
        >
          <span>عرض الكل ({incidents.length})</span>
          <ChevronRight className="w-3.5 h-3.5 rotate-180" />
        </button>
      </div>

      {incidents.length === 0 ? (
        <div className="text-center py-8 text-slate-400 space-y-2">
          <ShieldCheck className="w-8 h-8 mx-auto text-emerald-500" />
          <p className="text-xs font-medium text-slate-300">لم يتم تسجيل أي حوادث بالموقع (سجل آمن 100%)</p>
          <button
            type="button"
            onClick={onQuickReportIncident}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>إبلاغ عن واقعة أو شبه حادث</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {incidents.slice(0, 4).map((inc) => (
            <div
              key={inc.id}
              onClick={() => onNavigateTab('incidents')}
              className="p-3 rounded-xl bg-slate-850/60 border border-slate-750 hover:bg-slate-800 hover:border-slate-650 transition-all cursor-pointer flex items-center justify-between gap-3"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-white">
                    {inc.referenceNumber}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      inc.type === 'near_miss'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : inc.type === 'first_aid'
                        ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                        : inc.type === 'lost_time'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-orange-500/15 text-orange-300 border-orange-500/30'
                    }`}
                  >
                    {inc.type === 'near_miss'
                      ? 'شبه حادث (وشيك)'
                      : inc.type === 'first_aid'
                      ? 'إسعاف أولي'
                      : inc.type === 'lost_time'
                      ? 'وقت ضائع (LTI)'
                      : inc.type === 'property_damage'
                      ? 'أضرار معدات'
                      : 'حادث بيئي'}
                  </span>
                </div>
                <div className="text-xs text-slate-200 font-medium truncate">
                  {inc.title}
                </div>
                <div className="text-[11px] text-slate-400">
                  الموقع: {inc.location} • المبلّغ: {inc.reportedBy}
                </div>
              </div>

              <div className="text-left shrink-0 space-y-1">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                    inc.status === 'investigating'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : inc.status === 'action_pending'
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {inc.status === 'investigating'
                    ? 'قيد التحقيق'
                    : inc.status === 'action_pending'
                    ? 'إجراء معلّق'
                    : 'تم الإغلاق'}
                </span>
                <div className="text-[10px] text-slate-400 font-mono text-left">
                  {inc.dateTime ? inc.dateTime.slice(0, 10) : '-'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // 6. SOUND ALERTS BAR
  const renderSoundAlerts = () => (
    <div id="dashboard-sound-alerts">
      <SoundAlertToggle />
    </div>
  );

  // 7. REFERENCE STATION
  const renderReferenceStation = () => (
    <div id="dashboard-reference-station" className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="text-sm font-bold text-white">المحطة الإرشادية والتشغيلية الميدانية</h3>
            <p className="text-xs text-slate-400">أرقام الطوارئ السريعة بالعراق، التسلسل الهرمي، والقواعد الذهبية</p>
          </div>
        </div>

        {/* Reference Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-850 rounded-xl border border-slate-750">
          <button
            type="button"
            onClick={() => setActiveReferenceTab('emergency')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeReferenceTab === 'emergency'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>أرقام الطوارئ بالعراق</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveReferenceTab('hierarchy')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeReferenceTab === 'hierarchy'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>الهرم الوقائي (Controls)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveReferenceTab('rules')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeReferenceTab === 'rules'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>قواعد تصاريح العمل (PTW)</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Iraq Emergency Call Buttons */}
      {activeReferenceTab === 'emergency' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <a
            href="tel:911"
            className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/70 to-slate-850 border-2 border-rose-500/50 hover:border-rose-400 transition-all text-right group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-300">الطوارئ الموحد</span>
              <PhoneCall className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black font-mono text-white">911</div>
              <div className="text-[10px] text-slate-400 mt-0.5">اتصال مباشر فوري</div>
            </div>
          </a>

          <a
            href="tel:115"
            className="p-4 rounded-2xl bg-slate-850 border border-slate-750 hover:border-amber-500/50 transition-all text-right group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300">الدفاع المدني والإطفاء</span>
              <Flame className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black font-mono text-white">115</div>
              <div className="text-[10px] text-slate-400 mt-0.5">مكافحة الحرائق والإنقاذ</div>
            </div>
          </a>

          <a
            href="tel:122"
            className="p-4 rounded-2xl bg-slate-850 border border-slate-750 hover:border-emerald-500/50 transition-all text-right group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300">الإسعاف الفوري</span>
              <Activity className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black font-mono text-white">122</div>
              <div className="text-[10px] text-slate-400 mt-0.5">الإصابات والحالات الحرجة</div>
            </div>
          </a>

          <a
            href="tel:104"
            className="p-4 rounded-2xl bg-slate-850 border border-slate-750 hover:border-sky-500/50 transition-all text-right group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-300">شرطة النجدة</span>
              <PhoneCall className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black font-mono text-white">104</div>
              <div className="text-[10px] text-slate-400 mt-0.5">الأمن والمساندة الميدانية</div>
            </div>
          </a>
        </div>
      )}

      {/* Tab 2: Hierarchy of Controls */}
      {activeReferenceTab === 'hierarchy' && (
        <div className="space-y-2">
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center justify-between text-xs font-bold">
            <span>1. الإزالة (Elimination)</span>
            <span className="text-[11px] font-normal">إزالة مصدر الخطر مادياً ونهائياً (الأكثر فاعلية بنسبة 100%)</span>
          </div>
          <div className="p-3 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-300 flex items-center justify-between text-xs font-bold">
            <span>2. الاستبدال (Substitution)</span>
            <span className="text-[11px] font-normal">استبدال المادة الخطرة أو العملية ببديل أقل خطورة</span>
          </div>
          <div className="p-3 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-300 flex items-center justify-between text-xs font-bold">
            <span>3. التحكم الهندسي (Engineering Controls)</span>
            <span className="text-[11px] font-normal">العزل الميكانيكي، التهوية القسرية، وتركيب الحواجز الواقية</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center justify-between text-xs font-bold">
            <span>4. التحكم الإداري (Administrative Controls)</span>
            <span className="text-[11px] font-normal">تصاريح العمل PTW، التدريب، لوحات التحذير، وتدوير العمال</span>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 flex items-center justify-between text-xs font-bold">
            <span>5. مهمات الوقاية الشخصية (PPE)</span>
            <span className="text-[11px] font-normal">الخوذة، الحزام، القناع، الحذاء الواقي (خط الدفاع الأخير)</span>
          </div>
        </div>
      )}

      {/* Tab 3: PTW Golden Rules */}
      {activeReferenceTab === 'rules' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-750 space-y-1">
            <div className="font-bold text-sky-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>فحص الغازات للأماكن المحصورة</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              الأكسجين O2 بين 19.5% و 23.5%، الغازات القابلة للاشتعال LEL أقل من 10%، والغازات السامة صفر قبل أي دخول.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-750 space-y-1">
            <div className="font-bold text-amber-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>مراقب الحريق للأعمال الساخنة</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              تواجد مراقب حريق (Fire Watch) دائم مع مطفأة مناسبة طوال فترة اللحام ولمدة 30 دقيقة على الأقل بعد الانتهاء.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-750 space-y-1">
            <div className="font-bold text-rose-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>العزل وقفل الطاقة (LOTO)</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              عزل مصادر الطاقة الكهربائية، الهيدروليكية، والضغط بقفل وبطاقة تحذير قبل بدء الصيانة والتفتيش.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-750 space-y-1">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>إلزامية الإغلاق الرسمي للتصريح</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              تنظيف الموقع وإعادة الحواجز لحالتها وتسليم التصريح موقعاً لإغلاقه في النظام لمنع تداخل الأعمال.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6" dir="rtl">
      {renderHeroStatus()}
      {renderRapidActions()}
      {renderKpiMetrics()}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {renderLivePermits()}
        {renderRecentIncidents()}
      </div>
      {renderSoundAlerts()}
      {renderReferenceStation()}
    </div>
  );
};
