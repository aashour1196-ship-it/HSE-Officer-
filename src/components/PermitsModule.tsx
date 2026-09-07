import React, { useState } from 'react';
import {
  FileCheck,
  Flame,
  Snowflake,
  Box,
  Zap,
  Shovel,
  ArrowUpRight,
  Truck,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  AlertOctagon,
  AlertTriangle,
  Hourglass,
  UserCheck,
  Shield,
  Eye,
  X,
  Calendar,
  Layers,
  Filter,
  Check,
  Gauge,
  Sparkles,
  Camera
} from 'lucide-react';
import {
  WorkPermit,
  PermitType,
  PermitStatus,
  SafetyObservation,
  ObservationType,
  GasTestRecord
} from '../types';

interface PermitsModuleProps {
  permits: WorkPermit[];
  observations: SafetyObservation[];
  onSavePermit: (permit: WorkPermit) => void;
  onUpdatePermitStatus: (id: string, status: PermitStatus) => void;
  onDeletePermit: (id: string) => void;
  onSaveObservation: (obs: SafetyObservation) => void;
  onDeleteObservation: (id: string) => void;
  onLoadPermitTemplates?: () => void;
}

export const PERMIT_TYPE_INFO: Record<
  PermitType,
  { label: string; en: string; icon: React.ReactNode; color: string; badge: string }
> = {
  hot_work: {
    label: 'تصريح أعمال ساخنة',
    en: 'Hot Work Permit',
    icon: <Flame className="w-4 h-4 text-rose-400" />,
    color: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
    badge: 'bg-rose-600 text-white',
  },
  cold_work: {
    label: 'تصريح أعمال باردة',
    en: 'Cold Work Permit',
    icon: <Snowflake className="w-4 h-4 text-sky-400" />,
    color: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
    badge: 'bg-sky-600 text-white',
  },
  confined_space: {
    label: 'تصريح دخول أماكن محصورة',
    en: 'Confined Space Permit',
    icon: <Box className="w-4 h-4 text-amber-400" />,
    color: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    badge: 'bg-amber-600 text-white',
  },
  electrical_loto: {
    label: 'تصريح كهرباء وعزل طاقة LOTO',
    en: 'Electrical & LOTO Permit',
    icon: <Zap className="w-4 h-4 text-yellow-400" />,
    color: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300',
    badge: 'bg-yellow-600 text-slate-950 font-bold',
  },
  excavation: {
    label: 'تصريح أعمال الحفر والخنادق',
    en: 'Excavation Permit',
    icon: <Shovel className="w-4 h-4 text-emerald-400" />,
    color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    badge: 'bg-emerald-600 text-white',
  },
  work_at_height: {
    label: 'تصريح عمل على ارتفاع وسقالات',
    en: 'Working at Height Permit',
    icon: <ArrowUpRight className="w-4 h-4 text-indigo-400" />,
    color: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300',
    badge: 'bg-indigo-600 text-white',
  },
  lifting_rigging: {
    label: 'تصريح أعمال الرفع والتصبين',
    en: 'Lifting & Rigging Permit',
    icon: <Truck className="w-4 h-4 text-orange-400" />,
    color: 'border-orange-500/40 bg-orange-500/10 text-orange-300',
    badge: 'bg-orange-600 text-white',
  },
};

export const PERMIT_STATUS_INFO: Record<
  PermitStatus,
  { label: string; color: string; badgeClass: string }
> = {
  requested: { label: 'قيد الطلب', color: 'text-slate-400', badgeClass: 'bg-slate-700/60 text-slate-300 border-slate-600' },
  approved: { label: 'معتمد وجاهز', color: 'text-sky-400', badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40' },
  active: { label: 'سارٍ بالموقع (Active)', color: 'text-emerald-400', badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  suspended: { label: 'معلق مؤقتاً', color: 'text-amber-400', badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  closed: { label: 'مغلق ومستلم', color: 'text-slate-400', badgeClass: 'bg-slate-800 text-slate-400 border-slate-700' },
  cancelled: { label: 'ملغي', color: 'text-rose-400', badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
};

export const OBSERVATION_TYPE_INFO: Record<
  ObservationType,
  { label: string; badge: string; desc: string }
> = {
  unsafe_act: { label: 'تصرف غير آمن (Unsafe Act)', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40', desc: 'سلوك فردي يخالف قواعد السلامة' },
  unsafe_condition: { label: 'ظرف غير آمن (Unsafe Condition)', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40', desc: 'خلل في بيئة العمل أو المعدات' },
  safe_behavior: { label: 'سلوك آمن ممتاز (Safe Behavior)', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', desc: 'ممارسة والتزام إيجابي يستحق التقدير' },
  stop_work: { label: 'إيقاف عمل فوري (Stop Work Authority)', badge: 'bg-red-600 text-white border-red-500', desc: 'تدخل عاجل لمنع كارثة وشيكة' },
};

export interface PermitExpiryInfo {
  status: 'closed' | 'expired' | 'critical' | 'warning' | 'valid';
  badgeLabel: string;
  badgeClass: string;
  cardBorderClass: string;
  formattedHours: string;
  hoursRemaining: number;
  isExpiringSoon: boolean; // true if remaining hours <= 24 and > 0
  isExpired: boolean;
  timeRemainingFormatted: string;
  timeRemainingText: string;
}

export function getPermitExpiryInfo(permit: WorkPermit): PermitExpiryInfo {
  if (permit.status === 'closed' || permit.status === 'cancelled') {
    return {
      status: 'closed',
      badgeLabel: permit.status === 'closed' ? 'مغلق ومستلم' : 'ملغي',
      badgeClass: 'bg-slate-800 text-slate-400 border-slate-700',
      cardBorderClass: 'border-slate-800',
      formattedHours: '-',
      hoursRemaining: 0,
      isExpiringSoon: false,
      isExpired: false,
      timeRemainingFormatted: 'تم إغلاق التصريح',
      timeRemainingText: 'تم إغلاق التصريح',
    };
  }

  if (!permit.endDate) {
    return {
      status: 'valid',
      badgeLabel: 'ساري',
      badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
      cardBorderClass: 'border-slate-800',
      formattedHours: '-',
      hoursRemaining: 999,
      isExpiringSoon: false,
      isExpired: false,
      timeRemainingFormatted: 'صلاحية غير محددة',
      timeRemainingText: 'صلاحية غير محددة',
    };
  }

  const timeStr = permit.endTime && permit.endTime.includes(':') ? permit.endTime : '23:59';
  const endDateTime = new Date(`${permit.endDate}T${timeStr}:00`);
  const now = new Date();

  if (isNaN(endDateTime.getTime())) {
    return {
      status: 'valid',
      badgeLabel: 'ساري',
      badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
      cardBorderClass: 'border-slate-800',
      formattedHours: '-',
      hoursRemaining: 999,
      isExpiringSoon: false,
      isExpired: false,
      timeRemainingFormatted: 'ساري الصلاحية',
      timeRemainingText: 'ساري الصلاحية',
    };
  }

  const diffMs = endDateTime.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffMs <= 0) {
    const expiredHoursAgo = Math.abs(Math.round(diffHours));
    const expiredText = expiredHoursAgo > 24 
      ? `انتهى منذ ${Math.round(expiredHoursAgo / 24)} يوم` 
      : `انتهى منذ ${expiredHoursAgo} س`;
    return {
      status: 'expired',
      badgeLabel: 'منتهي الصلاحية',
      badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse font-bold',
      cardBorderClass: 'border-rose-500/40 bg-rose-950/10',
      formattedHours: 'منتهي',
      hoursRemaining: diffHours,
      isExpiringSoon: false,
      isExpired: true,
      timeRemainingFormatted: expiredText,
      timeRemainingText: expiredText,
    };
  }

  // Format hours nicely in Arabic
  const roundedHours = Math.round(diffHours);
  let arabicHoursStr = '';
  if (diffHours < 1) {
    const mins = Math.max(1, Math.round(diffMs / (1000 * 60)));
    arabicHoursStr = `${mins} دقيقة`;
  } else if (roundedHours === 1) {
    arabicHoursStr = 'ساعة واحدة';
  } else if (roundedHours === 2) {
    arabicHoursStr = 'ساعتان';
  } else if (roundedHours >= 3 && roundedHours <= 10) {
    arabicHoursStr = `${roundedHours} ساعات`;
  } else {
    arabicHoursStr = `${roundedHours} ساعة`;
  }

  // Critical Alert: less than 6 hours
  if (diffHours <= 6) {
    const txt = `متبقي ${arabicHoursStr} فقط (حرج)`;
    return {
      status: 'critical',
      badgeLabel: `ينتهي قريباً (أقل من 6 ساعات)`,
      badgeClass: 'bg-rose-500/25 text-rose-300 border-rose-500/60 font-black shadow-xs shadow-rose-950 animate-pulse',
      cardBorderClass: 'border-rose-500/50 bg-gradient-to-b from-rose-500/10 via-slate-900 to-slate-900 shadow-sm shadow-rose-950/40',
      formattedHours: arabicHoursStr,
      hoursRemaining: diffHours,
      isExpiringSoon: true,
      isExpired: false,
      timeRemainingFormatted: txt,
      timeRemainingText: txt,
    };
  }

  // Warning Alert: less than 24 hours (< 24 hours) - Exactly as requested!
  if (diffHours <= 24) {
    const txt = `متبقي ${arabicHoursStr} (< 24 ساعة)`;
    return {
      status: 'warning',
      badgeLabel: `ينتهي قريباً (< 24 ساعة)`,
      badgeClass: 'bg-amber-500/25 text-amber-300 border-amber-500/60 font-black shadow-xs shadow-amber-950',
      cardBorderClass: 'border-amber-500/50 bg-gradient-to-b from-amber-500/10 via-slate-900 to-slate-900 shadow-sm shadow-amber-950/30',
      formattedHours: arabicHoursStr,
      hoursRemaining: diffHours,
      isExpiringSoon: true,
      isExpired: false,
      timeRemainingFormatted: txt,
      timeRemainingText: txt,
    };
  }

  // Normal valid (> 24 hours)
  const days = Math.round(diffHours / 24);
  const validTxt = `ساري حتى ${permit.endDate} (${permit.endTime})`;
  return {
    status: 'valid',
    badgeLabel: `ساري (${days} يوم)`,
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    cardBorderClass: 'border-slate-800',
    formattedHours: `${days} يوم`,
    hoursRemaining: diffHours,
    isExpiringSoon: false,
    isExpired: false,
    timeRemainingFormatted: validTxt,
    timeRemainingText: validTxt,
  };
}

export const PermitsModule: React.FC<PermitsModuleProps> = ({
  permits,
  observations,
  onSavePermit,
  onUpdatePermitStatus,
  onDeletePermit,
  onSaveObservation,
  onDeleteObservation,
  onLoadPermitTemplates,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'permits' | 'observations'>('permits');
  const [filterType, setFilterType] = useState<string>('all');
  const [showCreatePermitModal, setShowCreatePermitModal] = useState(false);
  const [showCreateObsModal, setShowCreateObsModal] = useState(false);
  const [selectedPermit, setSelectedPermit] = useState<WorkPermit | null>(null);

  // Permit Form States
  const [permitType, setPermitType] = useState<PermitType>('hot_work');
  const [permitTitle, setPermitTitle] = useState('');
  const [permitDesc, setPermitDesc] = useState('');
  const [permitLoc, setPermitLoc] = useState('');
  const [permitDept, setPermitDept] = useState('إدارة الصيانة والتشغيل');
  const [permitContractor, setPermitContractor] = useState('');
  const [permitWorkers, setPermitWorkers] = useState<number>(4);
  const [permitStartDate, setPermitStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [permitStartTime, setPermitStartTime] = useState('08:00');
  const [permitEndDate, setPermitEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [permitEndTime, setPermitEndTime] = useState('17:00');
  const [permitRequestor, setPermitRequestor] = useState('');
  const [permitSupervisor, setPermitSupervisor] = useState('');
  const [permitSafetyOfficer, setPermitSafetyOfficer] = useState('');
  
  // Precautions check
  const [precautions, setPrecautions] = useState<{ [key: string]: boolean }>({
    risk_assessment_done: true,
    ppe_provided: true,
    emergency_explained: true,
    area_barricaded: true,
    fire_extinguisher_ready: true,
    loto_applied: false,
    ventilation_assured: false,
  });

  // Gas testing for Confined/Hot
  const [reqGasTest, setReqGasTest] = useState(false);
  const [o2Val, setO2Val] = useState<number>(20.9);
  const [lelVal, setLelVal] = useState<number>(0);
  const [h2sVal, setH2sVal] = useState<number>(0);
  const [coVal, setCoVal] = useState<number>(5);
  const [gasTesterName, setGasTesterName] = useState('');

  // Observation Form States
  const [obsType, setObsType] = useState<ObservationType>('unsafe_act');
  const [obsTitle, setObsTitle] = useState('');
  const [obsDesc, setObsDesc] = useState('');
  const [obsLocation, setObsLocation] = useState('');
  const [obsDept, setObsDept] = useState('الإنشاءات');
  const [obsObserver, setObsObserver] = useState('');
  const [obsImmediateAction, setObsImmediateAction] = useState('');
  const [obsRisk, setObsRisk] = useState<'low' | 'medium' | 'high'>('medium');
  const [obsImage, setObsImage] = useState<string | null>(null);
  const [previewObsImage, setPreviewObsImage] = useState<string | null>(null);

  const handleObsImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح (JPG, PNG, WebP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setObsImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePermit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!permitTitle.trim() || !permitLoc.trim()) return;

    const gasRecords: GasTestRecord[] = [];
    if (reqGasTest) {
      const isGasSafe = o2Val >= 19.5 && o2Val <= 23.5 && lelVal < 10 && h2sVal < 10 && coVal <= 35;
      gasRecords.push({
        testedAt: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
        oxygenPercent: o2Val,
        lelPercent: lelVal,
        h2sPpm: h2sVal,
        coPpm: coVal,
        testerName: gasTesterName || 'فاحص الغازات المعتمد',
        isSafe: isGasSafe,
        notes: isGasSafe ? 'النسب ضمن الحدود الآمنة وفق معايير OSHA' : 'تحذير: القراءات خارج الحدود المسموحة!',
      });
    }

    const newPermit: WorkPermit = {
      id: `PTW-${Date.now()}`,
      permitNumber: `PTW-${Math.floor(1000 + Math.random() * 9000)}`,
      type: permitType,
      title: permitTitle.trim(),
      description: permitDesc.trim() || 'تنفيذ الأعمال وفق خطة السالمة المعتمدة',
      location: permitLoc.trim(),
      department: permitDept,
      contractorName: permitContractor.trim() || undefined,
      workerCount: Number(permitWorkers) || 1,
      startDate: permitStartDate,
      startTime: permitStartTime,
      endDate: permitEndDate,
      endTime: permitEndTime,
      status: 'active',
      requestorName: permitRequestor.trim() || 'طالب التصريح',
      siteSupervisorName: permitSupervisor.trim() || 'مشرف الموقع',
      safetyOfficerName: permitSafetyOfficer.trim() || 'مسؤول السلامة والصحة المهنية',
      precautions: precautions,
      gasTestRequired: reqGasTest,
      gasTests: reqGasTest ? gasRecords : undefined,
      fireWatchRequired: permitType === 'hot_work',
      fireWatchName: permitType === 'hot_work' ? 'مراقب حريق معتمد (Fire Watch)' : undefined,
    };

    onSavePermit(newPermit);
    setShowCreatePermitModal(false);
    // Reset
    setPermitTitle('');
    setPermitDesc('');
    setPermitLoc('');
  };

  const handleCreateObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!obsTitle.trim() || !obsLocation.trim()) return;

    const newObs: SafetyObservation = {
      id: `OBS-${Date.now()}`,
      type: obsType,
      title: obsTitle.trim(),
      description: obsDesc.trim(),
      location: obsLocation.trim(),
      department: obsDept,
      observedBy: obsObserver.trim() || 'مراقب السلامة',
      observedAt: new Date().toISOString().split('T')[0],
      immediateActionTaken: obsImmediateAction.trim() || undefined,
      status: 'open',
      riskRating: obsRisk,
      photoUrl: obsImage || undefined,
    };

    onSaveObservation(newObs);
    setShowCreateObsModal(false);
    // Reset
    setObsTitle('');
    setObsDesc('');
    setObsLocation('');
    setObsImmediateAction('');
    setObsImage(null);
  };

  const expiringSoonCount = permits.filter((p) => {
    const info = getPermitExpiryInfo(p);
    return info.isExpiringSoon;
  }).length;

  const filteredPermits = permits.filter((p) => {
    if (filterType === 'all') return true;
    if (filterType === 'expiring_soon') {
      const exp = getPermitExpiryInfo(p);
      return exp.isExpiringSoon;
    }
    return p.type === filterType;
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <FileCheck className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white">نظام تصاريح العمل وملاحظات السلامة (PTW & BBS)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            إدارة متكاملة لتصاريح العمل الساخنة والباردة والمحصورة والحفر والارتفاعات، مع سجل الملاحظات السلوكية
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeSubTab === 'permits' ? (
            <button
              type="button"
              onClick={() => setShowCreatePermitModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>إصدار تصريح عمل جديد</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowCreateObsModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل ملاحظة سلامة</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-800 bg-slate-900/80 rounded-t-xl px-4 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveSubTab('permits')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all ${
            activeSubTab === 'permits'
              ? 'border-sky-500 text-sky-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>تصاريح العمل (Permits to Work) ({permits.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('observations')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all ${
            activeSubTab === 'observations'
              ? 'border-amber-500 text-amber-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>ملاحظات السلامة السلوكية (BBS Observations) ({observations.length})</span>
        </button>
      </div>

      {/* Sub-tab: Permits */}
      {activeSubTab === 'permits' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">نوع التصريح:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 focus:outline-hidden text-xs"
              >
                <option value="all">كافة أنواع التصاريح ({permits.length})</option>
                {expiringSoonCount > 0 && (
                  <option value="expiring_soon">⚠️ قاربت على الانتهاء (&lt; 24 ساعة) ({expiringSoonCount})</option>
                )}
                {Object.entries(PERMIT_TYPE_INFO).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>

              {/* Expiring Soon quick filter button */}
              {expiringSoonCount > 0 && (
                <button
                  type="button"
                  onClick={() => setFilterType(filterType === 'expiring_soon' ? 'all' : 'expiring_soon')}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 ${
                    filterType === 'expiring_soon'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs shadow-amber-500/30'
                      : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/40'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{expiringSoonCount} قاربت على الانتهاء (&lt; 24 ساعة)</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              {expiringSoonCount > 0 && (
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
                  <span>{expiringSoonCount} تنبيه انتهاء</span>
                </span>
              )}
              <span>
                التصاريح النشطة بالموقع: <strong className="text-emerald-400">{permits.filter(p => p.status === 'active').length}</strong>
              </span>
            </div>
          </div>

          {filteredPermits.length === 0 ? (
            <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
                <FileCheck className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-200 text-sm">لا توجد تصاريح مطابقة للتصفية</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                يمكنك إعادة تعيين خيارات التصفية أو إصدار تصريح عمل جديد أو تحميل نماذج توضيحية.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                {filterType !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setFilterType('all')}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    عرض كافة التصاريح
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowCreatePermitModal(true)}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl text-xs font-bold transition-all"
                >
                  إصدار تصريح عمل
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPermits.map((permit) => {
                const typeInfo = PERMIT_TYPE_INFO[permit.type];
                const statusInfo = PERMIT_STATUS_INFO[permit.status];
                const expiryInfo = getPermitExpiryInfo(permit);

                return (
                  <div
                    key={permit.id}
                    className={`bg-slate-900 border rounded-2xl p-4.5 space-y-3 transition-all ${
                      expiryInfo.cardBorderClass || 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span className={`flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full border font-bold ${typeInfo.color}`}>
                            {typeInfo.icon}
                            <span>{typeInfo.label}</span>
                          </span>
                          <span className="font-mono text-xs text-slate-400 font-bold">{permit.permitNumber}</span>

                          {/* Visual Alert Badge for permits nearing expiration (< 24 hours) */}
                          {expiryInfo.isExpiringSoon && (
                            <span
                              title={`تنبيه: قارب هذا التصريح على انتهاء صلاحيته خلال ${expiryInfo.formattedHours} (أقل من 24 ساعة)`}
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-black ${expiryInfo.badgeClass}`}
                            >
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                              <span>{expiryInfo.badgeLabel}</span>
                            </span>
                          )}

                          {/* Visual Alert Badge for expired permits */}
                          {expiryInfo.isExpired && permit.status !== 'closed' && (
                            <span
                              title="تحذير: انتهت صلاحية هذا التصريح رسمياً ويجب إغلاقه أو تجديده"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-bold bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse"
                            >
                              <AlertOctagon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                              <span>منتهي الصلاحية</span>
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-sm text-white">{permit.title}</h3>
                        <p className="text-xs text-slate-400">{permit.location}</p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold ${statusInfo.badgeClass}`}>
                          {statusInfo.label}
                        </span>
                        {/* Countdown indicator for expiring permits */}
                        {expiryInfo.isExpiringSoon && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-300 bg-amber-950/80 border border-amber-500/50 px-2 py-0.5 rounded-md shadow-xs">
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>متبقي: {expiryInfo.formattedHours}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className={`p-2.5 rounded-xl border text-xs space-y-1.5 transition-all ${
                      expiryInfo.isExpiringSoon
                        ? 'bg-amber-950/25 border-amber-500/40 text-amber-200'
                        : expiryInfo.isExpired && permit.status !== 'closed'
                        ? 'bg-rose-950/25 border-rose-500/40 text-rose-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300'
                    }`}>
                      <div>{permit.description}</div>
                      <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] pt-1.5 border-t border-slate-800/80">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-sky-400" />
                          <span>الصلاحية: {permit.startDate} ({permit.startTime}) إلى {permit.endDate} ({permit.endTime})</span>
                        </div>
                        {expiryInfo.isExpiringSoon && (
                          <span className="inline-flex items-center gap-1 font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/40">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            <span>تنبيه صلاحية: متبقي {expiryInfo.formattedHours}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Gas test badge if present */}
                    {permit.gasTests && permit.gasTests.length > 0 && (
                      <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-750 text-xs">
                        <div className="flex items-center justify-between font-semibold text-slate-300 mb-1">
                          <span className="flex items-center gap-1.5">
                            <Gauge className="w-3.5 h-3.5 text-amber-400" />
                            <span>فحص الغازات (O2, LEL, H2S, CO)</span>
                          </span>
                          <span className={permit.gasTests[0].isSafe ? 'text-emerald-400' : 'text-rose-400'}>
                            {permit.gasTests[0].isSafe ? '✓ آمن للدخول' : '✗ غير آمن'}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-1 text-center font-mono text-[11px]">
                          <div className="bg-slate-900 p-1 rounded-sm">O2: {permit.gasTests[0].oxygenPercent}%</div>
                          <div className="bg-slate-900 p-1 rounded-sm">LEL: {permit.gasTests[0].lelPercent}%</div>
                          <div className="bg-slate-900 p-1 rounded-sm">H2S: {permit.gasTests[0].h2sPpm}</div>
                          <div className="bg-slate-900 p-1 rounded-sm">CO: {permit.gasTests[0].coPpm}</div>
                        </div>
                      </div>
                    )}

                    {/* Actions and Status changes */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs">
                      <div className="flex items-center gap-1.5">
                        {permit.status === 'requested' && (
                          <button
                            type="button"
                            onClick={() => onUpdatePermitStatus(permit.id, 'active')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold"
                          >
                            اعتماد وتفعيل
                          </button>
                        )}
                        {permit.status === 'active' && (
                          <button
                            type="button"
                            onClick={() => onUpdatePermitStatus(permit.id, 'closed')}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-[11px] font-semibold border border-slate-700"
                          >
                            إغلاق التصريح
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedPermit(permit)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-[11px]"
                        >
                          عرض
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onDeletePermit(permit.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                        title="حذف التصريح"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Sub-tab: Safety Observations (BBS) */}
      {activeSubTab === 'observations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 p-3 rounded-xl text-xs">
            <span className="text-slate-300 font-semibold">
              سجل ملاحظات السلامة السلوكية (BBS - Behavior Based Safety)
            </span>
            <button
              type="button"
              onClick={() => setShowCreateObsModal(true)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold"
            >
              + إضافة ملاحظة
            </button>
          </div>

          {observations.length === 0 ? (
            <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
                <Eye className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-200 text-sm">سجل ملاحظات السلامة فارغ (تطبيق نظيف)</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                سجل المالحظات السلوكية لرصد التصرفات غير الآمنة (Unsafe Acts) والظروف غير الآمنة (Unsafe Conditions) وسلطة إيقاف العمل (Stop Work).
              </p>
              <button
                type="button"
                onClick={() => setShowCreateObsModal(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all"
              >
                تسجيل ملاحظة جديدة
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {observations.map((obs) => {
                const info = OBSERVATION_TYPE_INFO[obs.type];
                return (
                  <div
                    key={obs.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 space-y-3 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${info.badge}`}>
                          {info.label}
                        </span>
                        <h4 className="font-bold text-sm text-white mt-1.5">{obs.title}</h4>
                        <p className="text-slate-400 text-[11px]">{obs.location} • {obs.department}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onDeleteObservation(obs.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400"
                        title="حذف الملاحظة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                      {obs.description}
                    </p>

                    {/* Attached Photo in Observation Card */}
                    {obs.photoUrl && (
                      <div
                        onClick={() => setPreviewObsImage(obs.photoUrl || null)}
                        className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 cursor-pointer group max-h-36"
                      >
                        <img
                          src={obs.photoUrl}
                          alt={obs.title}
                          className="w-full h-32 object-cover group-hover:scale-103 transition-transform"
                        />
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-[10px] text-white flex items-center gap-1 font-medium">
                          <Camera className="w-3 h-3 text-amber-400" />
                          <span>صورة الرصد الميداني</span>
                        </div>
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs text-white font-bold gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          <span>معاينة مكبرة</span>
                        </div>
                      </div>
                    )}

                    {obs.immediateActionTaken && (
                      <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
                        <strong className="text-slate-200">الإجراء التصحيحي الفوري: </strong>
                        {obs.immediateActionTaken}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                      <span>الراصد: {obs.observedBy}</span>
                      <span>التاريخ: {obs.observedAt}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Permit Details Modal */}
      {selectedPermit && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs"
          onClick={() => setSelectedPermit(null)}
        >
          <div
            className="relative max-w-xl w-full bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl p-5 text-white space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-sky-400">{selectedPermit.permitNumber}</span>
                <h3 className="font-bold text-base text-white">{selectedPermit.title}</h3>
                <p className="text-xs text-slate-400">{selectedPermit.location}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPermit(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Expiring Soon Alert Banner in Details Modal */}
            {(() => {
              const expiry = getPermitExpiryInfo(selectedPermit);
              if (expiry.isExpiringSoon) {
                return (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <div className="font-bold text-amber-300">
                        تنبيه اقتراب انتهاء الصلاحية: أقل من 24 ساعة متبقية ({expiry.formattedHours})
                      </div>
                      <div className="text-[11px] text-amber-200/80 mt-0.5">
                        ينتهي هذا التصريح بتاريخ {selectedPermit.endDate} الساعة {selectedPermit.endTime}. يُرجى التنسيق مع مشرف الموقع لتجديده أو إغلاقه رسمياً.
                      </div>
                    </div>
                  </div>
                );
              }
              if (expiry.isExpired && selectedPermit.status !== 'closed') {
                return (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs">
                    <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-rose-300">
                        تحذير: هذا التصريح منتهي الصلاحية رسميًا
                      </div>
                      <div className="text-[11px] text-rose-200/80 mt-0.5">
                        انتهت صلاحية العمل المحددة ويجب عدم مباشرة أي نشاط قبل إصدار تصريح جديد أو تمديد رسمي.
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-800/70 rounded-xl space-y-1">
                <div className="text-slate-400">وصف العمل والمعدات:</div>
                <div className="text-slate-200">{selectedPermit.description}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[11px]">طالب التصريح:</div>
                  <div className="font-bold">{selectedPermit.requestorName}</div>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[11px]">مشرف الموقع:</div>
                  <div className="font-bold">{selectedPermit.siteSupervisorName}</div>
                </div>
              </div>

              {selectedPermit.gasTests && selectedPermit.gasTests.length > 0 && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Gauge className="w-4 h-4" />
                    <span>سجل فحص الغازات (Gas Test Log)</span>
                  </div>
                  {selectedPermit.gasTests.map((t, idx) => (
                    <div key={idx} className="space-y-1 text-slate-300">
                      <div className="grid grid-cols-4 gap-2 text-center font-mono">
                        <div className="bg-slate-800 p-1.5 rounded-sm">O2: {t.oxygenPercent}%</div>
                        <div className="bg-slate-800 p-1.5 rounded-sm">LEL: {t.lelPercent}%</div>
                        <div className="bg-slate-800 p-1.5 rounded-sm">H2S: {t.h2sPpm} ppm</div>
                        <div className="bg-slate-800 p-1.5 rounded-sm">CO: {t.coPpm} ppm</div>
                      </div>
                      <div className="text-[11px] text-slate-400">الفاحص: {t.testerName} • {t.notes}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Permit Modal */}
      {showCreatePermitModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs"
          onClick={() => setShowCreatePermitModal(false)}
        >
          <div
            className="relative max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl p-5 text-white max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-sm text-white">إصدار تصريح عمل رسمي (Work Permit - PTW)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreatePermitModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePermit} className="space-y-4 text-xs mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">نوع تصريح العمل (Permit Type) *</label>
                  <select
                    value={permitType}
                    onChange={(e) => {
                      const t = e.target.value as PermitType;
                      setPermitType(t);
                      if (t === 'confined_space' || t === 'hot_work') {
                        setReqGasTest(true);
                      }
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-sky-500 focus:outline-hidden"
                  >
                    {Object.entries(PERMIT_TYPE_INFO).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label} ({v.en})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">عنوان التصريح / المهمة *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: أعمال لحام وتعديل أنابيب بغرفة الغاليات"
                    value={permitTitle}
                    onChange={(e) => setPermitTitle(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">الموقع الدقيق *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: ورشة رقم 2 - قسم التقطير"
                    value={permitLoc}
                    onChange={(e) => setPermitLoc(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-sky-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">المقاول / الجهة المنفذة</label>
                  <input
                    type="text"
                    placeholder="اسم الشركة أو المقاول"
                    value={permitContractor}
                    onChange={(e) => setPermitContractor(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-sky-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">عدد العمال المصرح لهم</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={permitWorkers}
                    onChange={(e) => setPermitWorkers(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">وصف تفصيلي للعمل والمعدات المستخدمة</label>
                <textarea
                  rows={2}
                  placeholder="وصف تفصيلي للمهمة، المعدات المستخدمة، وطرق الوقاية..."
                  value={permitDesc}
                  onChange={(e) => setPermitDesc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:border-sky-500 focus:outline-hidden resize-none"
                />
              </div>

              {/* Time Validity */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <span className="font-bold text-sky-400">فترة سريان التصريح (Validity)</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400">تاريخ البدء</label>
                    <input
                      type="date"
                      value={permitStartDate}
                      onChange={(e) => setPermitStartDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">وقت البدء</label>
                    <input
                      type="time"
                      value={permitStartTime}
                      onChange={(e) => setPermitStartTime(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">تاريخ الانتهاء</label>
                    <input
                      type="date"
                      value={permitEndDate}
                      onChange={(e) => setPermitEndDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">وقت الانتهاء</label>
                    <input
                      type="time"
                      value={permitEndTime}
                      onChange={(e) => setPermitEndTime(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Gas Testing toggle */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-amber-400 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reqGasTest}
                      onChange={(e) => setReqGasTest(e.target.checked)}
                      className="w-4 h-4 rounded-sm text-sky-500"
                    />
                    <span>يتطلب فحص الغازات (Gas Testing Required)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">إلزامي للأماكن المحصورة والأعمال الساخنة</span>
                </div>

                {reqGasTest && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800">
                    <div>
                      <label className="text-[11px] text-slate-400">الأكسجين O2 % (19.5-23.5)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={o2Val}
                        onChange={(e) => setO2Val(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400">الاشتعال LEL % (&lt; 10%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={lelVal}
                        onChange={(e) => setLelVal(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400">كبريتيد H2S (&lt; 10ppm)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={h2sVal}
                        onChange={(e) => setH2sVal(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400">أول أكسيد CO (&lt; 35ppm)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={coVal}
                        onChange={(e) => setCoVal(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-white font-mono text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Responsible Signatures */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300">طالب التصريح</label>
                  <input
                    type="text"
                    placeholder="اسم طالب التصريح"
                    value={permitRequestor}
                    onChange={(e) => setPermitRequestor(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300">مشرف الموقع</label>
                  <input
                    type="text"
                    placeholder="اسم مشرف الموقع"
                    value={permitSupervisor}
                    onChange={(e) => setPermitSupervisor(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300">مسؤول السلامة (HSE Officer)</label>
                  <input
                    type="text"
                    placeholder="اسم مسؤول السلامة"
                    value={permitSafetyOfficer}
                    onChange={(e) => setPermitSafetyOfficer(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreatePermitModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  إصدار التصريح وتفعيله
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Observation Modal */}
      {showCreateObsModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs"
          onClick={() => setShowCreateObsModal(false)}
        >
          <div
            className="relative max-w-lg w-full bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl p-5 text-white space-y-4"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-white">تسجيل ملاحظة سلامة سلوكية (Safety Observation)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateObsModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateObservation} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">نوع الملاحظة *</label>
                <select
                  value={obsType}
                  onChange={(e) => setObsType(e.target.value as ObservationType)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                >
                  {Object.entries(OBSERVATION_TYPE_INFO).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">عنوان الملاحظة *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: عامل يعمل على سلم دون تثبيت النقاط الثلاث"
                  value={obsTitle}
                  onChange={(e) => setObsTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">الموقع *</label>
                  <input
                    type="text"
                    required
                    placeholder="مكان الرصد بالتحديد"
                    value={obsLocation}
                    onChange={(e) => setObsLocation(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">مستوى الخطورة</label>
                  <select
                    value={obsRisk}
                    onChange={(e) => setObsRisk(e.target.value as 'low' | 'medium' | 'high')}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  >
                    <option value="low">منخفض (Low)</option>
                    <option value="medium">متوسط (Medium)</option>
                    <option value="high">عالٍ (High)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">وصف تفصيلي للملاحظة</label>
                <textarea
                  rows={2}
                  placeholder="صف ما تمت مشاهدته، السلوك أو الظرف وتأثيره..."
                  value={obsDesc}
                  onChange={(e) => setObsDesc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">الإجراء التصحيحي الفوري المتخذ</label>
                <input
                  type="text"
                  placeholder="مثال: تم إيقاف العامل وشرح أسلوب الصعود الصحيح وتأمين السلم"
                  value={obsImmediateAction}
                  onChange={(e) => setObsImmediateAction(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300">اسم الراصد (Observer)</label>
                <input
                  type="text"
                  placeholder="اسمك أو صفتك بالموقع"
                  value={obsObserver}
                  onChange={(e) => setObsObserver(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>

              {/* Image Attachment for Observation */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-amber-400 text-xs">
                    <Camera className="w-4 h-4" />
                    <span>إرفاق صورة توثيقية للملاحظة / السلوك / الخطر</span>
                  </div>
                  <span className="text-[10px] text-slate-400">اختياري</span>
                </div>

                {obsImage ? (
                  <div className="relative rounded-xl border border-slate-700 overflow-hidden bg-slate-900 group">
                    <img
                      src={obsImage}
                      alt="صورة الملاحظة المرفقة"
                      className="w-full h-36 object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewObsImage(obsImage)}
                        className="px-3 py-1.5 bg-slate-800/90 hover:bg-slate-750 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>معاينة مكبرة</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setObsImage(null)}
                        className="px-3 py-1.5 bg-rose-600/90 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف</span>
                      </button>
                    </div>
                    <div className="p-1.5 text-[11px] bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1 text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        تم إرفاق الصورة
                      </span>
                      <button
                        type="button"
                        onClick={() => setObsImage(null)}
                        className="text-xs text-amber-400 hover:text-amber-300 font-bold"
                      >
                        تغيير
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="border border-dashed border-slate-700 hover:border-amber-500/60 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-900/40 hover:bg-slate-900/80 text-center group">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleObsImageChange}
                    />
                    <Camera className="w-4 h-4 text-amber-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-white">
                      انقر لاختيار صورة للملاحظة أو التقاطها بالكاميرا
                    </span>
                  </label>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateObsModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  حفظ الملاحظة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Observation Image Lightbox Modal */}
      {previewObsImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewObsImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-slate-950 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between p-3 bg-slate-900 border-b border-slate-800">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-amber-400" />
                <span>معاينة صورة الملاحظة الميدانية</span>
              </span>
              <button
                type="button"
                onClick={() => setPreviewObsImage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 overflow-auto flex items-center justify-center bg-black/40">
              <img
                src={previewObsImage}
                alt="معاينة الصورة"
                className="max-h-[78vh] w-auto max-w-full object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
