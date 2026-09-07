import React, { useState } from 'react';
import {
  AlertTriangle,
  Flame,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  User,
  Activity,
  Calendar,
  Layers,
  Filter,
  Eye,
  X,
  Camera,
  Image as ImageIcon,
  FileSpreadsheet,
  FileText,
  Search,
  CheckSquare,
  Sparkles,
  Volume2,
  Database,
  WifiOff,
} from 'lucide-react';
import {
  IncidentReport,
  IncidentType,
  IncidentSeverity
} from '../types';

interface IncidentsLogModuleProps {
  incidents: IncidentReport[];
  onSaveIncident: (incident: IncidentReport) => void;
  onUpdateIncidentStatus: (id: string, status: 'investigating' | 'action_pending' | 'closed') => void;
  onToggleActionDone: (incidentId: string, actionId: string) => void;
  onDeleteIncident: (id: string) => void;
  onLoadIncidentTemplates?: () => void;
  onExportPdf?: () => void;
  initialOpenCreateModal?: boolean;
  isGuest?: boolean;
  isOnline?: boolean;
  pendingOfflineIds?: string[];
}

export const INCIDENT_TYPE_INFO: Record<
  IncidentType,
  { label: string; badge: string; desc: string }
> = {
  near_miss: {
    label: 'حادث وشيك (Near Miss)',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    desc: 'حدث كاد أن يسبب ضرراً أو إصابة ولكن تم تفاديه',
  },
  first_aid: {
    label: 'حالة إسعافات أولية (First Aid)',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    desc: 'إصابة طفيفة عولجت فوراً بموقع العمل',
  },
  medical_treatment: {
    label: 'حالة علاج طبي (Medical Treatment)',
    badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    desc: 'إصابة تطلبت تدخلاً طبياً دون هدر لأيام العمل',
  },
  lti: {
    label: 'إصابة مضيعة للوقت (LTI)',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    desc: 'إصابة عمل أدت لغياب العامل لوردية أو أكثر',
  },
  property_damage: {
    label: 'تلف معدات وممتلكات (Property Damage)',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    desc: 'أضرار مادية بالمعدات أو الآلات أو المنشآت',
  },
  environmental: {
    label: 'حادثة بيئية (Environmental Incident)',
    badge: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    desc: 'انسكاب مواد كيميائية أو زيوت أو تلوث التربة والماء',
  },
  dangerous_occurrence: {
    label: 'واقعة خطيرة (Dangerous Occurrence)',
    badge: 'bg-red-600 text-white border-red-500',
    desc: 'انهيار سقالة، سقوط رافعة، أو حريق مفاجئ',
  },
};

export const SEVERITY_INFO: Record<
  IncidentSeverity,
  { label: string; badgeClass: string }
> = {
  low: { label: 'بسيطة (Low)', badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  medium: { label: 'متوسطة (Medium)', badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  high: { label: 'عالية (High)', badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/40' },
  critical: { label: 'حرجة / جسيمة (Critical)', badgeClass: 'bg-rose-600 text-white border-rose-500' },
};

export const IncidentsLogModule: React.FC<IncidentsLogModuleProps> = ({
  incidents,
  onSaveIncident,
  onUpdateIncidentStatus,
  onToggleActionDone,
  onDeleteIncident,
  onLoadIncidentTemplates,
  onExportPdf,
  initialOpenCreateModal,
  isGuest = false,
  isOnline = true,
  pendingOfflineIds = [],
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  React.useEffect(() => {
    if (initialOpenCreateModal) {
      setShowCreateModal(true);
    }
  }, [initialOpenCreateModal]);
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [formType, setFormType] = useState<IncidentType>('near_miss');
  const [formSeverity, setFormSeverity] = useState<IncidentSeverity>('medium');
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formLoc, setFormLoc] = useState('');
  const [formDateTime, setFormDateTime] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [formReporter, setFormReporter] = useState('');
  const [formInjuredName, setFormInjuredName] = useState('');
  const [formInjuredJob, setFormInjuredJob] = useState('');
  const [formInjuryNature, setFormInjuryNature] = useState('');
  const [formLostDays, setFormLostDays] = useState<number>(0);
  const [formEquipDamage, setFormEquipDamage] = useState('');
  const [formImmediateCauses, setFormImmediateCauses] = useState('');
  const [formRootCauses, setFormRootCauses] = useState('');
  const [formImage, setFormImage] = useState<string | null>(null);
  const [previewModalImage, setPreviewModalImage] = useState<string | null>(null);
  const [formActions, setFormActions] = useState<
    Array<{ action: string; responsible: string; targetDate: string }>
  >([
    { action: '', responsible: '', targetDate: '' }
  ]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح (JPG, PNG, WebP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFormImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const addActionRow = () => {
    setFormActions([...formActions, { action: '', responsible: '', targetDate: '' }]);
  };

  const updateActionRow = (index: number, field: string, value: string) => {
    const updated = [...formActions];
    updated[index] = { ...updated[index], [field]: value };
    setFormActions(updated);
  };

  const removeActionRow = (index: number) => {
    if (formActions.length > 1) {
      setFormActions(formActions.filter((_, i) => i !== index));
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) {
      alert('تنبيه: وضع الزائر مخصص للاطلاع وتصفح النظام فقط. لتسجيل البلاغات يرجى تسجيل الدخول ككادر مصرح له.');
      return;
    }
    if (!formTitle.trim() || !formLoc.trim()) return;

    const filteredActions = formActions
      .filter((a) => a.action.trim().length > 0)
      .map((a, idx) => ({
        id: `act-${Date.now()}-${idx}`,
        action: a.action.trim(),
        responsiblePerson: a.responsible.trim() || 'مدير الموقع',
        targetDate: a.targetDate || new Date().toISOString().split('T')[0],
        isCompleted: false,
      }));

    const newReport: IncidentReport = {
      id: `INC-${Date.now()}`,
      referenceNumber: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
      type: formType,
      severity: formSeverity,
      title: formTitle.trim(),
      description: formDesc.trim() || 'تفاصيل الواقعة مسجلة قيد المراجعة',
      location: formLoc.trim(),
      dateTime: formDateTime,
      reportedBy: formReporter.trim() || 'مسؤول السالمة المناوب',
      photoUrl: formImage || undefined,
      injuredPersonName: formInjuredName.trim() || undefined,
      injuredPersonJob: formInjuredJob.trim() || undefined,
      injuryNature: formInjuryNature.trim() || undefined,
      lostTimeDays: Number(formLostDays) || 0,
      equipmentDamaged: formEquipDamage.trim() || undefined,
      immediateCauses: formImmediateCauses
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
      rootCauses: formRootCauses
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
      correctiveActions: filteredActions,
      status: 'investigating',
    };

    onSaveIncident(newReport);
    setShowCreateModal(false);
    // Reset Form
    setFormTitle('');
    setFormDesc('');
    setFormLoc('');
    setFormImmediateCauses('');
    setFormRootCauses('');
    setFormInjuredName('');
    setFormInjuredJob('');
    setFormInjuryNature('');
    setFormLostDays(0);
    setFormEquipDamage('');
    setFormImage(null);
    setFormActions([{ action: '', responsible: '', targetDate: '' }]);
  };

  const filteredIncidents = incidents.filter((inc) => {
    const matchesType = filterType === 'all' || inc.type === filterType;
    const matchesSearch =
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalNearMiss = incidents.filter((i) => i.type === 'near_miss').length;
  const totalLti = incidents.filter((i) => i.type === 'lti').length;
  const totalOpen = incidents.filter((i) => i.status !== 'closed').length;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white">سجل متابعة الحوادث وشبه الحوادث (Incidents & Near Misses Log)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            توثيق الحوادث العرضية وشبه الحوادث، تحليل الأسباب الجذرية (RCA)، ومتابعة خطط الإجراءات التصحيحية
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onExportPdf && (
            <button
              type="button"
              onClick={onExportPdf}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-bold border border-amber-500/30 transition-all shadow-xs"
              title="تصدير سجل الحوادث إلى PDF أو طباعة رسمية"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>تصدير لـ PDF / طباعة</span>
            </button>
          )}

          {isGuest ? (
            <button
              type="button"
              onClick={() => alert('تنبيه: وضع الزائر مخصص للاطلاع وتصفح النظام فقط. لتسجيل البلاغات يرجى تسجيل الدخول ككادر مصرح له.')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-400 border border-slate-700 text-xs font-bold transition-all opacity-80 cursor-pointer"
              title="وضع الزائر: للاطلاع فقط"
            >
              <Eye className="w-4 h-4 text-sky-400" />
              <span>تسجيل بلاغ (للاطلاع فقط)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل بلاغ حادث / وشيك</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
          <div className="text-slate-400 text-[11px]">إجمالي البلاغات المسجلة</div>
          <div className="text-xl font-bold font-mono text-white mt-0.5">{incidents.length}</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
          <div className="text-slate-400 text-[11px]">حوادث كادت أن تقع (Near Miss)</div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">{totalNearMiss}</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
          <div className="text-slate-400 text-[11px]">إصابات مضيعة للوقت (LTI)</div>
          <div className="text-xl font-bold font-mono text-rose-400 mt-0.5">{totalLti}</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
          <div className="text-slate-400 text-[11px]">حالات قيد التحقيق والمتابعة</div>
          <div className="text-xl font-bold font-mono text-sky-400 mt-0.5">{totalOpen}</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/70 border border-slate-800 p-3 rounded-xl text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث برقم الحادث، العنوان، الموقع..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg pr-9 pl-3 py-2 text-xs focus:border-rose-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:border-rose-500 focus:outline-hidden"
          >
            <option value="all">كافة التصنيفات ({incidents.length})</option>
            {Object.entries(INCIDENT_TYPE_INFO).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Incidents List */}
      {filteredIncidents.length === 0 ? (
        <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <h4 className="font-bold text-slate-200 text-sm">سجل الحوادث نظيف (صفر حوادث - Application Fresh)</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            لم تسجل أي حوادث أو شبه حوادث في النظام حالياً. التطبيق مهيأ بالكامل لتسجيل ومتابعة تقارير التحقيق في موقع العمل.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all"
            >
              تسجيل بلاغ حادث جديد
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredIncidents.map((incident) => {
            const typeInfo = INCIDENT_TYPE_INFO[incident.type];
            const sevInfo = SEVERITY_INFO[incident.severity];
            const isPendingOffline = pendingOfflineIds?.includes(incident.id);

            return (
              <div
                key={incident.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4.5 space-y-3 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${typeInfo.badge}`}>
                        {typeInfo.label}
                      </span>
                      <span className="font-mono text-xs text-slate-400 font-bold">{incident.referenceNumber}</span>
                      {isPendingOffline && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md border font-bold bg-amber-500/20 text-amber-300 border-amber-500/40 flex items-center gap-1 font-mono">
                          <Clock className="w-2.5 h-2.5 text-amber-400" />
                          <span>بانتظار المزامنة (IndexedDB)</span>
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-white mt-1.5">{incident.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{incident.location} • {(incident.dateTime || '').replace('T', ' ')}</p>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${sevInfo.badgeClass}`}>
                    {sevInfo.label}
                  </span>
                </div>

                <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 leading-relaxed">
                  {incident.description}
                </p>

                {/* Attached Photo Preview in Card */}
                {incident.photoUrl && (
                  <div
                    onClick={() => setPreviewModalImage(incident.photoUrl || null)}
                    className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 cursor-pointer group max-h-40"
                  >
                    <img
                      src={incident.photoUrl}
                      alt={incident.title}
                      className="w-full h-36 object-cover group-hover:scale-103 transition-transform"
                    />
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-[10px] text-white flex items-center gap-1 font-medium">
                      <Camera className="w-3 h-3 text-rose-400" />
                      <span>صورة توثيقية مرفقة</span>
                    </div>
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs text-white font-bold gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>انقر للمعاينة</span>
                    </div>
                  </div>
                )}

                {/* Causes & Actions summary */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-slate-800/60 rounded-xl border border-slate-750">
                    <div className="text-[11px] text-slate-400">الأسباب الجذرية:</div>
                    <div className="font-semibold text-slate-200 truncate mt-0.5">
                      {incident.rootCauses.length > 0 ? incident.rootCauses[0] : 'قيد الفحص والتحقيق'}
                    </div>
                  </div>

                  <div className="p-2 bg-slate-800/60 rounded-xl border border-slate-750">
                    <div className="text-[11px] text-slate-400">الإجراءات التصحيحية:</div>
                    <div className="font-semibold text-slate-200 mt-0.5">
                      {incident.correctiveActions.filter((a) => a.isCompleted).length} من {incident.correctiveActions.length} منجزة
                    </div>
                  </div>
                </div>

                {/* Footer and view */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">المبلغ: {incident.reportedBy}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedIncident(incident)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg text-[11px] font-semibold"
                    >
                      تفاصيل التحقيق
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (isGuest) {
                        alert('تنبيه: وضع الزائر مخصص للاطلاع وتصفح النظام فقط.');
                        return;
                      }
                      onDeleteIncident(incident.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                    title="حذف البلاغ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Incident Details & Actions Management Modal */}
      {selectedIncident && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs"
          onClick={() => setSelectedIncident(null)}
        >
          <div
            className="relative max-w-xl w-full bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl p-5 text-white space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-rose-400">{selectedIncident.referenceNumber}</span>
                <h3 className="font-bold text-base text-white">{selectedIncident.title}</h3>
                <p className="text-xs text-slate-400">{selectedIncident.location} • {(selectedIncident.dateTime || '').replace('T', ' ')}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIncident(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-800/70 rounded-xl space-y-1">
                <div className="text-slate-400">وصف الحادث:</div>
                <div className="text-slate-200">{selectedIncident.description}</div>
              </div>

              {/* Photo Documentation in Details Modal */}
              {selectedIncident.photoUrl && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-400 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5" />
                      <span>الصورة التوثيقية المرفقة بالبلاغ:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setPreviewModalImage(selectedIncident.photoUrl || null)}
                      className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>عرض بحجم كامل</span>
                    </button>
                  </div>
                  <div
                    onClick={() => setPreviewModalImage(selectedIncident.photoUrl || null)}
                    className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-900 cursor-pointer group"
                  >
                    <img
                      src={selectedIncident.photoUrl}
                      alt={selectedIncident.title}
                      className="w-full max-h-64 object-contain bg-slate-950/80 mx-auto"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs text-white font-bold gap-1.5">
                      <Eye className="w-4 h-4" />
                      <span>انقر للتكبير</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Injured info if any */}
              {selectedIncident.injuredPersonName && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 text-slate-300">
                  <div className="font-bold text-rose-400">بيانات المصاب:</div>
                  <div>الاسم: {selectedIncident.injuredPersonName} ({selectedIncident.injuredPersonJob || 'عامل'})</div>
                  <div>طبيعة الإصابة: {selectedIncident.injuryNature || 'إصابة عمل'}</div>
                  {selectedIncident.lostTimeDays ? (
                    <div>أيام العمل المفقودة (Lost Time): {selectedIncident.lostTimeDays} يوم</div>
                  ) : null}
                </div>
              )}

              {/* Root Causes */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                <div className="font-bold text-amber-400">تحليل الأسباب المباشرة والجذرية:</div>
                {selectedIncident.immediateCauses.length > 0 && (
                  <div>
                    <strong className="text-slate-400">الأسباب المباشرة: </strong>
                    <ul className="list-disc list-inside text-slate-300 mt-0.5">
                      {selectedIncident.immediateCauses.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedIncident.rootCauses.length > 0 && (
                  <div className="pt-1">
                    <strong className="text-slate-400">الأسباب الجذرية (Systemic / Root): </strong>
                    <ul className="list-disc list-inside text-slate-300 mt-0.5">
                      {selectedIncident.rootCauses.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Corrective Action Plan checklist */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="font-bold text-sky-400 flex items-center justify-between">
                  <span>خطة الإجراءات التصحيحية (CAP):</span>
                  <span className="text-[11px] text-slate-400">انقر للتبديل (مكتمل / غير مكتمل)</span>
                </div>

                {selectedIncident.correctiveActions.length === 0 ? (
                  <p className="text-slate-500">لا توجد بنود إجراءات محددة</p>
                ) : (
                  <div className="space-y-1.5">
                    {selectedIncident.correctiveActions.map((act) => (
                      <div
                        key={act.id}
                        onClick={() => onToggleActionDone(selectedIncident.id, act.id)}
                        className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-colors ${
                          act.isCompleted
                            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={act.isCompleted}
                          readOnly
                          className="w-4 h-4 rounded-sm text-emerald-500 mt-0.5 pointer-events-none"
                        />
                        <div className="flex-1 text-xs">
                          <div className={act.isCompleted ? 'line-through text-slate-400 font-semibold' : 'font-semibold'}>
                            {act.action}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            المسؤول: {act.responsiblePerson} • التاريخ المستهدف: {act.targetDate}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Update buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-slate-400 text-xs">تغيير حالة ملف التحقيق:</span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateIncidentStatus(selectedIncident.id, 'action_pending');
                      setSelectedIncident({ ...selectedIncident, status: 'action_pending' });
                    }}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs"
                  >
                    قيد تنفيذ الإجراءات
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateIncidentStatus(selectedIncident.id, 'closed');
                      setSelectedIncident({ ...selectedIncident, status: 'closed' });
                    }}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
                  >
                    إغلاق وأرشفة الملف
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="relative max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl p-5 text-white max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-sm text-white">تسجيل بلاغ حادث / وشيك (Incident Investigation)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">نوع الحادث / البلاغ *</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as IncidentType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-rose-500 focus:outline-hidden"
                  >
                    {Object.entries(INCIDENT_TYPE_INFO).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">مستوى الشدة / الخطورة</label>
                  <select
                    value={formSeverity}
                    onChange={(e) => setFormSeverity(e.target.value as IncidentSeverity)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-rose-500 focus:outline-hidden"
                  >
                    {Object.entries(SEVERITY_INFO).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">عنوان البلاغ الموجز *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: سقوط أداة ثقيلة من السقالة دون إصابات"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-rose-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">الموقع الدقيق *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: منطقة الرافعات - البوابة الشمالية"
                    value={formLoc}
                    onChange={(e) => setFormLoc(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-rose-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">تاريخ ووقت الحادث</label>
                  <input
                    type="datetime-local"
                    value={formDateTime}
                    onChange={(e) => setFormDateTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-rose-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">اسم المُبلّغ / المحقق</label>
                  <input
                    type="text"
                    placeholder="اسمك أو المسمى الوظيفي"
                    value={formReporter}
                    onChange={(e) => setFormReporter(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-rose-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">تفاصيل ما حدث بالضبط (Accident Description) *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="وصف تسلسل الأحداث والمعدات والأشخاص المتواجدين..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:border-rose-500 focus:outline-hidden resize-none"
                />
              </div>

              {/* Injured Person details if injury */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <span className="font-bold text-rose-400">بيانات الإصابات والخسائر (إن وجدت)</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400">اسم المصاب</label>
                    <input
                      type="text"
                      placeholder="اختياري"
                      value={formInjuredName}
                      onChange={(e) => setFormInjuredName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">مهنة المصاب</label>
                    <input
                      type="text"
                      placeholder="مثل: نجار قوالب"
                      value={formInjuredJob}
                      onChange={(e) => setFormInjuredJob(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">طبيعة الإصابة</label>
                    <input
                      type="text"
                      placeholder="مثل: كدمة، جرح قطعي"
                      value={formInjuryNature}
                      onChange={(e) => setFormInjuryNature(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Image Attachment Field */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-rose-400 text-xs">
                    <Camera className="w-4 h-4" />
                    <span>إرفاق صورة توثيقية للبلاغ (موقع الحادث / الأضرار)</span>
                  </div>
                  <span className="text-[10px] text-slate-400">اختياري (JPG, PNG, WebP)</span>
                </div>

                {formImage ? (
                  <div className="relative rounded-xl border border-slate-700 overflow-hidden bg-slate-900 group">
                    <img
                      src={formImage}
                      alt="صورة البلاغ المرفقة"
                      className="w-full h-44 object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewModalImage(formImage)}
                        className="px-3 py-1.5 bg-slate-800/90 hover:bg-slate-750 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-md"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>معاينة مكبرة</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormImage(null)}
                        className="px-3 py-1.5 bg-rose-600/90 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-md"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف الصورة</span>
                      </button>
                    </div>
                    <div className="p-2 text-[11px] bg-slate-900/95 border-t border-slate-800 flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1 text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        تم إرفاق الصورة بنجاح
                      </span>
                      <button
                        type="button"
                        onClick={() => setFormImage(null)}
                        className="text-xs text-rose-400 hover:text-rose-300 font-bold"
                      >
                        تغيير الصورة
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-700 hover:border-rose-500/60 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-900/40 hover:bg-slate-900/80 text-center group">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    <div className="w-10 h-10 rounded-xl bg-slate-800 group-hover:bg-rose-500/20 text-slate-300 group-hover:text-rose-400 flex items-center justify-center mb-1.5 transition-colors">
                      <Camera className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-200 group-hover:text-white">
                      انقر هنا لإرفاق صورة أو التقاطها عبر الكاميرا
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      توثيق بصري للأضرار أو المعدات أو الموقع الميداني
                    </span>
                  </label>
                )}
              </div>

              {/* Immediate & Root Causes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">الأسباب المباشرة (Immediate Causes)</label>
                  <textarea
                    rows={2}
                    placeholder="تصرفات أو ظروف غير آمنة (سطر لكل سبب)..."
                    value={formImmediateCauses}
                    onChange={(e) => setFormImmediateCauses(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white text-xs resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">الأسباب الجذرية والنظامية (Root Causes)</label>
                  <textarea
                    rows={2}
                    placeholder="خلل بالإشراف، التدريب، أو نظام الإدارة (سطر لكل سبب)..."
                    value={formRootCauses}
                    onChange={(e) => setFormRootCauses(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white text-xs resize-none"
                  />
                </div>
              </div>

              {/* Corrective Action Rows */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-400">الإجراءات التصحيحية المقترحة لمنع التكرار</span>
                  <button
                    type="button"
                    onClick={addActionRow}
                    className="text-xs text-sky-400 hover:text-sky-300 font-semibold"
                  >
                    + إضافة إجراء
                  </button>
                </div>

                {formActions.map((act, index) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    <div className="sm:col-span-6">
                      <input
                        type="text"
                        placeholder="الإجراء التصحيحي المطلوب"
                        value={act.action}
                        onChange={(e) => updateActionRow(index, 'action', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-white text-xs"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        placeholder="المسؤول عن التنفيذ"
                        value={act.responsible}
                        onChange={(e) => updateActionRow(index, 'responsible', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-white text-xs"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <input
                        type="date"
                        value={act.targetDate}
                        onChange={(e) => updateActionRow(index, 'targetDate', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-white text-xs"
                      />
                    </div>
                    <div className="sm:col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => removeActionRow(index)}
                        className="text-slate-400 hover:text-rose-400 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {!isOnline && (
                <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-200 text-xs flex items-center gap-2">
                  <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-bold">التطبيق في وضع عدم الاتصال (Offline Mode):</span>
                    <p className="text-[11px] text-amber-300/90 mt-0.5">
                      سيتم حفظ البلاغ محلياً وفورياً داخل قاعدة بيانات <strong>IndexedDB</strong> على جهازك، مع المزامنة التلقائية فور عودة الاتصال.
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95 ${
                    !isOnline
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-rose-600 hover:bg-rose-500 text-white'
                  }`}
                >
                  {!isOnline ? (
                    <>
                      <Database className="w-3.5 h-3.5" />
                      <span>حفظ البلاغ محلياً (IndexedDB)</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>تسجيل البلاغ وإطلاق التنبيه الصوتي</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Lightbox Preview Modal */}
      {previewModalImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewModalImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-slate-950 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between p-3 bg-slate-900 border-b border-slate-800">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-rose-400" />
                <span>معاينة الصورة التوثيقية للبلاغ</span>
              </span>
              <button
                type="button"
                onClick={() => setPreviewModalImage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 overflow-auto flex items-center justify-center bg-black/40">
              <img
                src={previewModalImage}
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
