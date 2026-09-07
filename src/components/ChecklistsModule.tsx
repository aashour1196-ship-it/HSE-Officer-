import React, { useState } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Trash2,
  Filter,
  Eye,
  X,
  FileCheck2,
  RotateCcw,
  Sparkles,
  Search,
  Calendar,
  Layers,
  ChevronDown,
  Award,
  FileSignature,
  ShieldCheck
} from 'lucide-react';
import {
  InspectionChecklist,
  ChecklistFrequency,
  ChecklistQuestion
} from '../types';
import { CHECKLIST_TEMPLATES, ChecklistTemplate } from '../data/checklistTemplates';
import { DigitalSignaturePad } from './DigitalSignaturePad';

interface ChecklistsModuleProps {
  completedAudits: InspectionChecklist[];
  onSaveAudit: (audit: InspectionChecklist) => void;
  onDeleteAudit: (id: string) => void;
  onLoadAuditTemplates?: () => void;
}

export const ChecklistsModule: React.FC<ChecklistsModuleProps> = ({
  completedAudits,
  onSaveAudit,
  onDeleteAudit,
  onLoadAuditTemplates,
}) => {
  const [activeTab, setActiveTab] = useState<'run' | 'history'>('run');
  const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate>(CHECKLIST_TEMPLATES[0]);
  const [selectedAuditHistory, setSelectedAuditHistory] = useState<InspectionChecklist | null>(null);

  // Active Runner State
  const [inspectorName, setInspectorName] = useState('');
  const [auditLocation, setAuditLocation] = useState('');
  const [auditFrequency, setAuditFrequency] = useState<ChecklistFrequency>('daily');
  const [supervisorSignOff, setSupervisorSignOff] = useState('');
  const [inspectorSignature, setInspectorSignature] = useState<string | null>(null);
  const [signatureHash, setSignatureHash] = useState<string>('');
  const [itemStatuses, setItemStatuses] = useState<{
    [itemId: string]: { status: 'pass' | 'fail' | 'na'; notes: string };
  }>(() => {
    const initial: { [key: string]: { status: 'pass' | 'fail' | 'na'; notes: string } } = {};
    CHECKLIST_TEMPLATES[0].items.forEach((item) => {
      initial[item.id] = { status: 'pass', notes: '' };
    });
    return initial;
  });

  // Filter state for history
  const [filterFreq, setFilterFreq] = useState<string>('all');
  const [searchHistory, setSearchHistory] = useState('');

  const handleTemplateChange = (tmpl: ChecklistTemplate) => {
    setSelectedTemplate(tmpl);
    setAuditFrequency(tmpl.frequency);
    const newStatuses: { [key: string]: { status: 'pass' | 'fail' | 'na'; notes: string } } = {};
    tmpl.items.forEach((item) => {
      newStatuses[item.id] = { status: 'pass', notes: '' };
    });
    setItemStatuses(newStatuses);
  };

  const setItemStatus = (itemId: string, status: 'pass' | 'fail' | 'na') => {
    setItemStatuses({
      ...itemStatuses,
      [itemId]: {
        ...(itemStatuses[itemId] || { notes: '' }),
        status,
      },
    });
  };

  const setItemNotes = (itemId: string, notes: string) => {
    setItemStatuses({
      ...itemStatuses,
      [itemId]: {
        ...(itemStatuses[itemId] || { status: 'pass' }),
        notes,
      },
    });
  };

  // Calculate stats
  let totalEvaluated = 0;
  let passCount = 0;
  let failCount = 0;

  selectedTemplate.items.forEach((item) => {
    const s = itemStatuses[item.id]?.status;
    if (s === 'pass') {
      passCount++;
      totalEvaluated++;
    } else if (s === 'fail') {
      failCount++;
      totalEvaluated++;
    }
  });

  const complianceRate = totalEvaluated > 0 ? Math.round((passCount / totalEvaluated) * 100) : 100;
  const overallStatus = failCount === 0 ? 'passed' : complianceRate >= 80 ? 'conditional' : 'failed';

  const handleSaveCurrentAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditLocation.trim()) {
      alert('يرجى كتابة موقع التدقيق');
      return;
    }

    const compiledItems: ChecklistQuestion[] = selectedTemplate.items.map((item) => ({
      ...item,
      status: itemStatuses[item.id]?.status || 'pass',
      notes: itemStatuses[item.id]?.notes || '',
    }));

    const newAudit: InspectionChecklist = {
      id: `AUDIT-${Date.now()}`,
      templateId: selectedTemplate.id,
      title: selectedTemplate.title,
      category: selectedTemplate.category,
      frequency: auditFrequency,
      inspectorName: inspectorName.trim() || 'مفتش السلامة الميداني',
      location: auditLocation.trim(),
      inspectedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      overallStatus,
      complianceRate,
      items: compiledItems,
      supervisorSignOff: supervisorSignOff.trim() || undefined,
      inspectorSignature: inspectorSignature || undefined,
      signatureTimestamp: inspectorSignature ? new Date().toISOString().replace('T', ' ').slice(0, 19) : undefined,
      isoStandardRef: 'ISO 45001:2018 (Clause 9.1) & ISO 19011:2018',
      signatureHash: signatureHash || undefined,
    };

    onSaveAudit(newAudit);
    alert('تم حفظ وتوثيق تقرير التدقيق بنجاح وفق معايير ISO 45001!');
    setInspectorSignature(null);
    setSignatureHash('');
    setActiveTab('history');
  };

  const filteredHistory = completedAudits.filter((audit) => {
    const matchesFreq = filterFreq === 'all' || audit.frequency === filterFreq;
    const matchesSearch =
      audit.title.toLowerCase().includes(searchHistory.toLowerCase()) ||
      audit.location.toLowerCase().includes(searchHistory.toLowerCase()) ||
      audit.inspectorName.toLowerCase().includes(searchHistory.toLowerCase());
    return matchesFreq && matchesSearch;
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ClipboardCheck className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white">قوائم التدقيق والتفتيش الميداني (Site Inspection Checklists)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            قوائم فحص يومية وأسبوعية معتمدة وفق معايير OSHA و NFPA لحماية المواقع مع حساب نسبة الامتثال اللحظية
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('run')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'run'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700'
            }`}
          >
            إجراء فحص ميداني جديد
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700'
            }`}
          >
            سجل الفحوصات السابقة ({completedAudits.length})
          </button>
        </div>
      </div>

      {activeTab === 'run' ? (
        <form onSubmit={handleSaveCurrentAudit} className="space-y-6">
          {/* Template Selection Cards */}
          <div className="space-y-2">
            <label className="text-xs text-slate-300 font-semibold block">اختر نوع قائمة التدقيق والتفتيش:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {CHECKLIST_TEMPLATES.map((tmpl) => {
                const isSelected = tmpl.id === selectedTemplate.id;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleTemplateChange(tmpl)}
                    className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                        : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] opacity-75 block font-mono">
                        {tmpl.frequency === 'daily' ? 'فحص يومي' : 'فحص أسبوعي'}
                      </span>
                      <div className="font-bold text-xs mt-1 line-clamp-2">{tmpl.title.split('(')[0]}</div>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-2 font-mono">{tmpl.items.length} بنود</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Audit Metadata Inputs */}
          <div className="bg-slate-900/90 border border-slate-800 p-4.5 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-white">{selectedTemplate.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedTemplate.description}</p>
                <span className="text-[10px] text-amber-400 font-mono mt-1 block">
                  المرجع القياسي: {selectedTemplate.referenceStandard}
                </span>
              </div>

              {/* Compliance indicator pill */}
              <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">نسبة الامتثال للموقع</div>
                  <div className="font-bold font-mono text-sm text-emerald-400">{complianceRate}%</div>
                </div>
                <div className="w-16 bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      complianceRate >= 90
                        ? 'bg-emerald-500'
                        : complianceRate >= 75
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${complianceRate}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">موقع التفتيش بالتفصيل *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مبنى الإدارة - الواجهة B"
                  value={auditLocation}
                  onChange={(e) => setAuditLocation(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">اسم المفتش / القائم بالتدقيق</label>
                <input
                  type="text"
                  placeholder="اسم المفتش"
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">دورية التدقيق</label>
                <select
                  value={auditFrequency}
                  onChange={(e) => setAuditFrequency(e.target.value as ChecklistFrequency)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-emerald-500 focus:outline-hidden"
                >
                  <option value="daily">تدقيق يومي (Daily Site Inspection)</option>
                  <option value="weekly">تدقيق أسبوعي (Weekly Site Audit)</option>
                  <option value="pre_task">قبل بدء المهمة مباشرة (Pre-Task Check)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Checklist Items Table */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs text-slate-300">بنود التفتيش والاشتراطات الفنية:</h4>

            <div className="space-y-2.5">
              {selectedTemplate.items.map((item, index) => {
                const currentStatus = itemStatuses[item.id]?.status || 'pass';
                const currentNotes = itemStatuses[item.id]?.notes || '';

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      currentStatus === 'fail'
                        ? 'bg-rose-950/20 border-rose-500/40'
                        : currentStatus === 'pass'
                        ? 'bg-slate-900 border-slate-800 hover:border-slate-750'
                        : 'bg-slate-900/60 border-slate-800/80 opacity-75'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono flex items-center justify-center font-bold">
                            {index + 1}
                          </span>
                          <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded-md">
                            {item.category}
                          </span>
                          {item.standardReference && (
                            <span className="text-[9px] text-slate-500 font-mono">
                              {item.standardReference}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-200 font-medium leading-relaxed">
                          {item.question}
                        </p>
                      </div>

                      {/* Interactive Radio Group */}
                      <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 shrink-0 self-start md:self-center">
                        <button
                          type="button"
                          onClick={() => setItemStatus(item.id, 'pass')}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            currentStatus === 'pass'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>مطابق</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setItemStatus(item.id, 'fail')}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            currentStatus === 'fail'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>غير مطابق</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setItemStatus(item.id, 'na')}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            currentStatus === 'na'
                              ? 'bg-slate-700 text-white'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          لا ينطبق
                        </button>
                      </div>
                    </div>

                    {/* Notes / Action Taken */}
                    {(currentStatus === 'fail' || currentNotes.length > 0) && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800/80">
                        <input
                          type="text"
                          placeholder="ملاحظات العيب أو الإجراء التصحيحي المطلوب تنفيذه..."
                          value={currentNotes}
                          onChange={(e) => setItemNotes(item.id, e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs placeholder:text-slate-500 focus:border-emerald-500 focus:outline-hidden"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Digital Signature Pad (ISO 45001:2018 & ISO 19011 Compliance) */}
          <DigitalSignaturePad
            inspectorName={inspectorName.trim() || 'مفتش السلامة الميداني'}
            onSignatureComplete={(sigUrl, hash) => {
              setInspectorSignature(sigUrl);
              setSignatureHash(hash);
            }}
            onSignatureClear={() => {
              setInspectorSignature(null);
              setSignatureHash('');
            }}
            existingSignature={inspectorSignature || undefined}
          />

          {/* Supervisor Sign-Off & Submit */}
          <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="w-full sm:w-80 space-y-1">
              <label className="text-slate-300 font-semibold">اعتماد مشرف الموقع / مهندس السلامة</label>
              <input
                type="text"
                placeholder="توقيع المشرف المعتمد"
                value={supervisorSignOff}
                onChange={(e) => setSupervisorSignOff(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-sm active:scale-95 text-xs flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>حفظ وتوثيق نتائج التدقيق</span>
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* History Log Tab */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/70 border border-slate-800 p-3 rounded-xl text-xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="بحث في سجل الفحوصات..."
                value={searchHistory}
                onChange={(e) => setSearchHistory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg pr-9 pl-3 py-2 text-xs focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterFreq}
                onChange={(e) => setFilterFreq(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:border-emerald-500 focus:outline-hidden"
              >
                <option value="all">كافة الفحوصات ({completedAudits.length})</option>
                <option value="daily">فحوصات يومية</option>
                <option value="weekly">فحوصات أسبوعية</option>
              </select>
            </div>
          </div>

          {filteredHistory.length === 0 ? (
            <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-200 text-sm">سجل الفحوصات فارغ (تطبيق نظيف)</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                لم يتم إكمال وحفظ أي قائمة تدقيق حتى الآن. اختر إحدى القوائم اليومية أو الأسبوعية وابدأ التفتيش الميداني.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('run')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all"
                >
                  بدء فحص جديد
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredHistory.map((audit) => {
                let statusBadge = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
                let statusText = 'مطابق ومعتمد (Passed)';
                if (audit.overallStatus === 'failed') {
                  statusBadge = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
                  statusText = 'غير مطابق - ملاحظات حرجة (Failed)';
                } else if (audit.overallStatus === 'conditional') {
                  statusBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                  statusText = 'مشروط بتصحيح الملاحظات (Conditional)';
                }

                return (
                  <div
                    key={audit.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4.5 space-y-3 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          {audit.category}
                        </span>
                        <h4 className="font-bold text-sm text-white mt-1">{audit.title}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{audit.location} • {audit.inspectedAt}</p>
                      </div>

                      <span className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold ${statusBadge}`}>
                        {statusText}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-slate-950/70 rounded-xl border border-slate-800 text-xs">
                      <div>
                        <span className="text-slate-400">نسبة الامتثال: </span>
                        <strong className="font-mono text-emerald-400 font-bold">{audit.complianceRate}%</strong>
                      </div>
                      <div className="text-slate-400">
                        المفتش: <span className="text-slate-200">{audit.inspectorName}</span>
                      </div>
                    </div>

                    {audit.inspectorSignature && (
                      <div className="flex items-center justify-between px-2.5 py-1.5 bg-sky-950/30 rounded-xl border border-sky-500/20 text-[11px]">
                        <span className="text-sky-300 flex items-center gap-1 font-semibold">
                          <FileSignature className="w-3.5 h-3.5 text-sky-400" />
                          <span>موقّع إلكترونياً (معتمد ISO)</span>
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          {audit.signatureTimestamp?.slice(0, 10) || audit.inspectedAt.slice(0, 10)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs">
                      <button
                        type="button"
                        onClick={() => setSelectedAuditHistory(audit)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg text-[11px] font-semibold flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>عرض البنود</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteAudit(audit.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400"
                        title="حذف هذا التدقيق"
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

      {/* Audit Detail View Modal */}
      {selectedAuditHistory && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs"
          onClick={() => setSelectedAuditHistory(null)}
        >
          <div
            className="relative max-w-xl w-full bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl p-5 text-white space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400">{selectedAuditHistory.category}</span>
                <h3 className="font-bold text-base text-white">{selectedAuditHistory.title}</h3>
                <p className="text-xs text-slate-400">{selectedAuditHistory.location} • {selectedAuditHistory.inspectedAt}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAuditHistory(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-slate-400">المفتش القائم بالعمل:</div>
                  <div className="font-bold text-slate-200">{selectedAuditHistory.inspectorName}</div>
                </div>
                <div>
                  <div className="text-slate-400">نسبة الامتثال:</div>
                  <div className="font-bold font-mono text-emerald-400 text-sm">{selectedAuditHistory.complianceRate}%</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-slate-300">نتائج البنود المفحوصة:</div>
                <div className="space-y-1.5">
                  {selectedAuditHistory.items.map((it, idx) => (
                    <div
                      key={it.id}
                      className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-750 flex items-start justify-between gap-2"
                    >
                      <div className="space-y-0.5 flex-1">
                        <div className="text-slate-200 font-medium">{idx + 1}. {it.question}</div>
                        {it.notes && (
                          <div className="text-[11px] text-amber-300 mt-1">ملاحظة: {it.notes}</div>
                        )}
                      </div>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-bold shrink-0 ${
                          it.status === 'pass'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : it.status === 'fail'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {it.status === 'pass' ? 'مطابق' : it.status === 'fail' ? 'غير مطابق' : 'لا ينطبق'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Official Digital Signature Display (ISO 45001 / ISO 19011) */}
              {selectedAuditHistory.inspectorSignature ? (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-xs text-white">التوقيع الرقمي للمفتش المعتمد</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      ISO 45001:2018 معتمد
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <div className="w-full sm:w-60 h-24 bg-slate-950 rounded-xl border border-slate-800 p-2 flex items-center justify-center overflow-hidden">
                      <img
                        src={selectedAuditHistory.inspectorSignature}
                        alt="Inspector Digital Signature"
                        className="max-h-full max-w-full object-contain filter brightness-110"
                      />
                    </div>

                    <div className="space-y-1 text-right flex-1 text-xs">
                      <div className="text-slate-400">
                        القائم بالتوقيع: <strong className="text-white">{selectedAuditHistory.inspectorName}</strong>
                      </div>
                      <div className="text-slate-400">
                        توقيت الاعتماد: <span className="font-mono text-slate-300">{selectedAuditHistory.signatureTimestamp || selectedAuditHistory.inspectedAt}</span>
                      </div>
                      <div className="text-slate-400">
                        المرجع القياسي: <span className="font-mono text-amber-400">{selectedAuditHistory.isoStandardRef || 'ISO 45001:2018 (Clause 9.1)'}</span>
                      </div>
                      {selectedAuditHistory.signatureHash && (
                        <div className="text-[10px] text-slate-500 font-mono">
                          رمز التحقق: {selectedAuditHistory.signatureHash}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}

              {selectedAuditHistory.supervisorSignOff && (
                <div className="p-2.5 bg-slate-800/40 rounded-xl text-slate-300">
                  اعتماد المشرف: <strong>{selectedAuditHistory.supervisorSignOff}</strong>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
