import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle2,
  Filter,
  Eye,
  X,
  FileSpreadsheet,
  Download,
  Info,
  Layers,
  ArrowDownRight,
  Sparkles,
  Search,
  Camera,
  FileText
} from 'lucide-react';
import {
  RiskAssessmentItem,
  RiskCategory,
  LikelihoodLevel,
  SeverityLevel,
  HierarchyControl
} from '../types';

interface RiskAssessmentModuleProps {
  assessments: RiskAssessmentItem[];
  onSaveAssessment: (item: RiskAssessmentItem) => void;
  onDeleteAssessment: (id: string) => void;
  onLoadTemplates?: () => void;
  onExportPdf?: () => void;
}

export const LIKELIHOOD_LABELS: Record<LikelihoodLevel, { text: string; desc: string }> = {
  1: { text: '1 - نادر جداً (Very Unlikely)', desc: 'احتمال نادر للغاية، تدابير موثوقة' },
  2: { text: '2 - غير محتمل (Unlikely)', desc: 'قد يحدث في ظروف استثنائية' },
  3: { text: '3 - محتمل (Likely)', desc: 'يمكن حدوثه في ظروف العمل العادية' },
  4: { text: '4 - محتمل جداً (Very Likely)', desc: 'يتكرر حدوثه أو يعتمد فقط على الحذر الفردي' },
  5: { text: '5 - مؤكد الحدوث (Almost Certain)', desc: 'خطر وشيك، غياب تدابير الرقابة' },
};

export const SEVERITY_LABELS: Record<SeverityLevel, { text: string; desc: string }> = {
  1: { text: '1 - إسعاف أولي (First Aid)', desc: 'خدوش، حروق بسيطة، جرح سطحي' },
  2: { text: '2 - إصابة طفيفة (Minor Injury)', desc: 'إصابة أقل من يومين، التواء بسيط' },
  3: { text: '3 - إصابة مضيعة للوقت (LTI > 3 days)', desc: 'إصابة أكثر من 3 أيام أو كسر خفيف' },
  4: { text: '4 - إصابة جسيمة (Major / Disability)', desc: 'كسور مضاعفة، عجز دائم جزئي أو كلي' },
  5: { text: '5 - وفاة / كارثة (Fatality / Disaster)', desc: 'وفاة فرد أو أكثر أو انهيار منشأة' },
};

export const CATEGORY_LABELS: Record<RiskCategory, string> = {
  heights: 'العمل على الارتفاعات والسقالات',
  confined_space: 'الأماكن المحصورة والمغلقة',
  hot_work: 'الأعمال الساخنة واللحام',
  electrical: 'السلامة الكهربائية وعزل الطاقة',
  excavation: 'أعمال الحفر والخنادق',
  lifting: 'عمليات الرفع والتصبين والأوناش',
  chemical: 'المواد الكيميائية والخطرة HAZMAT',
  mechanical: 'المخاطر الميكانيكية والآلات',
  ergonomic: 'الأرجونومكس والمناولة اليدوية',
  general: 'الموقع العام والبيئة',
};

export const HIERARCHY_LABELS: Record<HierarchyControl, { title: string; en: string; badgeColor: string }> = {
  elimination: { title: 'الإزالة', en: 'Elimination', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  substitution: { title: 'الاستبدال', en: 'Substitution', badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30' },
  engineering: { title: 'التحكم الهندسي', en: 'Engineering Controls', badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30' },
  administrative: { title: 'التحكم الإداري', en: 'Administrative Controls', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  ppe: { title: 'مهمات الوقاية PPE', en: 'Personal Protective Eq.', badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
};

export function getRiskLevelInfo(score: number) {
  if (score >= 20) {
    return {
      label: 'خطر لا يطاق (Intolerable / Critical)',
      color: 'bg-rose-600 text-white border-rose-500',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      action: 'إيقاف العمل فوراً. المخاطرة غير مقبولة وبحاجة لاستشارة وتدابير عاجلة.',
    };
  }
  if (score >= 12) {
    return {
      label: 'خطر عالٍ (High Risk)',
      color: 'bg-orange-500 text-white border-orange-400',
      badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      action: 'إجراءات أمان إضافية إلزامية وإشراف مكثف قبل بدء العمل.',
    };
  }
  if (score >= 5) {
    return {
      label: 'خطر متوسط (Medium Risk)',
      color: 'bg-amber-500 text-slate-950 border-amber-400',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      action: 'مخاطرة تحت السيطرة بشرط الالتزام الصارم بضوابط السلامة.',
    };
  }
  return {
    label: 'خطر منخفض (Low / Acceptable)',
    color: 'bg-emerald-600 text-white border-emerald-500',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    action: 'مخاطرة مقبولة، الحفاظ على ضوابط السلامة الروتينية ومتابعتها.',
  };
}

export const RiskAssessmentModule: React.FC<RiskAssessmentModuleProps> = ({
  assessments,
  onSaveAssessment,
  onDeleteAssessment,
  onLoadTemplates,
  onExportPdf,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<RiskAssessmentItem | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMatrixModal, setShowMatrixModal] = useState(false);
  const [previewModalImage, setPreviewModalImage] = useState<string | null>(null);

  // Form State
  const [formActivity, setFormActivity] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formCategory, setFormCategory] = useState<RiskCategory>('heights');
  const [formHazard, setFormHazard] = useState('');
  const [formHarm, setFormHarm] = useState('');
  const [formWho, setFormWho] = useState('عمال الموقع، المشرفون، المقاولون');
  const [formInitL, setFormInitL] = useState<LikelihoodLevel>(4);
  const [formInitS, setFormInitS] = useState<SeverityLevel>(4);
  const [formExistingControls, setFormExistingControls] = useState('');
  const [formSelectedHierarchy, setFormSelectedHierarchy] = useState<HierarchyControl[]>([
    'engineering',
    'administrative',
    'ppe',
  ]);
  const [formAdditionalControls, setFormAdditionalControls] = useState('');
  const [formResL, setFormResL] = useState<LikelihoodLevel>(2);
  const [formResS, setFormResS] = useState<SeverityLevel>(2);
  const [formAssessor, setFormAssessor] = useState('');
  const [formReviewer, setFormReviewer] = useState('');
  const [formImage, setFormImage] = useState<string | null>(null);

  const initScore = formInitL * formInitS;
  const resScore = formResL * formResS;
  const isAlarp = resScore <= 4;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHierarchyToggle = (ctrl: HierarchyControl) => {
    if (formSelectedHierarchy.includes(ctrl)) {
      setFormSelectedHierarchy(formSelectedHierarchy.filter((c) => c !== ctrl));
    } else {
      setFormSelectedHierarchy([...formSelectedHierarchy, ctrl]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formActivity.trim() || !formHazard.trim()) return;

    const newItem: RiskAssessmentItem = {
      id: `RA-${Date.now()}`,
      activityName: formActivity.trim(),
      location: formLocation.trim() || 'الموقع الرئيسي',
      category: formCategory,
      hazardDescription: formHazard.trim(),
      potentialHarm: formHarm.trim() || 'إصابات جسدية وتوقف للعمليات',
      whoIsAtRisk: formWho.trim() || 'جميع العاملين بالمنطقة',
      initialLikelihood: formInitL,
      initialSeverity: formInitS,
      initialRiskScore: initScore,
      existingControls: formExistingControls.trim() || 'إجراءات السلامة القياسية',
      controlHierarchy: formSelectedHierarchy,
      additionalControls: formAdditionalControls.trim() || 'مراقبة مستمرة وتحديث تصريح العمل',
      residualLikelihood: formResL,
      residualSeverity: formResS,
      residualRiskScore: resScore,
      isAlarp: isAlarp,
      assessorName: formAssessor.trim() || 'أخصائي السلامة',
      reviewerName: formReviewer.trim(),
      photoUrl: formImage || undefined,
      date: new Date().toISOString().split('T')[0],
      status: 'active',
    };

    onSaveAssessment(newItem);
    setShowCreateModal(false);
    // Reset Form
    setFormActivity('');
    setFormHazard('');
    setFormHarm('');
    setFormExistingControls('');
    setFormAdditionalControls('');
    setFormImage(null);
  };

  const filteredAssessments = assessments.filter((item) => {
    const matchesCat = filterCategory === 'all' || item.category === filterCategory;
    const matchesSearch =
      item.activityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.hazardDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white">نظام تقييم المخاطر التفاعلي (Risk Assessment & JHA)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            مصفوفة 5×5 لتقييم الشدة والاحتمالية وحساب المخاطرة الأولية والمتبقية وتطبيق هرم السيطرة والـ ALARP
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onExportPdf && (
            <button
              type="button"
              onClick={onExportPdf}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-bold border border-amber-500/30 transition-all shadow-xs"
              title="تصدير تقرير تقييم المخاطر إلى PDF أو طباعة رسمية"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>تصدير لـ PDF / طباعة</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowMatrixModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Layers className="w-4 h-4 text-sky-400" />
            <span>عرض مصفوفة 5×5</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء تقييم مخاطر جديد</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-900/70 border border-slate-800/80 p-3 rounded-xl text-xs">
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث بالنشاط، الخطر، أو الموقع..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700/80 text-white rounded-lg pr-9 pl-3 py-2 focus:outline-hidden focus:border-amber-500 placeholder:text-slate-500 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700/80 text-white rounded-lg px-3 py-2 focus:outline-hidden focus:border-amber-500 text-xs"
          >
            <option value="all">كافة مجالات المخاطر ({assessments.length})</option>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assessments List / Table */}
      {filteredAssessments.length === 0 ? (
        <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-200 text-sm">سجل تقييم المخاطر فارغ (تطبيق نظيف)</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            لم يتم تسجيل أي تقييم للمخاطر حتى الآن. يمكنك البدء بإضافة تقييم عملي جديد، أو تحميل أمثلة استرشادية من المعايير القياسية.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all"
            >
              إضافة تقييم مخاطر
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAssessments.map((item) => {
            const initialInfo = getRiskLevelInfo(item.initialRiskScore);
            const residualInfo = getRiskLevelInfo(item.residualRiskScore);

            return (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4.5 space-y-3.5 transition-all shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      {CATEGORY_LABELS[item.category] || item.category}
                    </span>
                    <h3 className="font-bold text-sm text-white mt-1">{item.activityName}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{item.location}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedAssessment(item)}
                      title="عرض التفاصيل الكاملة"
                      className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteAssessment(item.id)}
                      title="حذف التقييم"
                      className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-slate-750 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1 text-xs">
                  <div className="text-slate-300">
                    <strong className="text-rose-400">الخطر المحتمل: </strong>
                    {item.hazardDescription}
                  </div>
                  <div className="text-slate-400">
                    <strong className="text-slate-300">المعرضون للخطر: </strong>
                    {item.whoIsAtRisk}
                  </div>
                  {item.photoUrl && (
                    <div className="pt-1.5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewModalImage(item.photoUrl || null)}
                        className="group relative flex items-center gap-1.5 p-1 rounded-lg bg-slate-900 border border-slate-750 hover:border-amber-500/50 transition-all text-slate-300 text-[11px]"
                      >
                        <img
                          src={item.photoUrl}
                          alt="توثيق الخطر الميداني"
                          className="w-10 h-10 object-cover rounded-md border border-slate-700 group-hover:opacity-90"
                        />
                        <span className="flex items-center gap-1 pr-1 text-amber-300 group-hover:underline">
                          <Camera className="w-3.5 h-3.5" />
                          <span>صورة توثيقية للخطر (اضغط للتكبير)</span>
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Risk Scores Comparison */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-750">
                    <div className="text-[11px] text-slate-400 mb-1">المخاطرة الأولية</div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-200">
                        {item.initialLikelihood} × {item.initialSeverity} = {item.initialRiskScore}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${initialInfo.badge}`}>
                        {item.initialRiskScore}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-750">
                    <div className="text-[11px] text-slate-400 mb-1">المخاطرة المتبقية (بعد الضوابط)</div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-200">
                        {item.residualLikelihood} × {item.residualSeverity} = {item.residualRiskScore}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${residualInfo.badge}`}>
                        {item.residualRiskScore}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hierarchy badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.controlHierarchy.map((ctrl) => {
                    const info = HIERARCHY_LABELS[ctrl];
                    return (
                      <span
                        key={ctrl}
                        className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${info.badgeColor}`}
                      >
                        {info.title}
                      </span>
                    );
                  })}
                  {item.isAlarp && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                      ✓ ALARP محقق
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5x5 Matrix Reference Modal */}
      {showMatrixModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowMatrixModal(false)}
        >
          <div
            className="relative max-w-2xl w-full bg-slate-900 border border-slate-700/90 rounded-2xl overflow-hidden shadow-2xl p-5 text-white space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-white">مصفوفة تقييم المخاطر 5×5 (Risk Assessment Matrix)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMatrixModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              حساب مستوى المخاطرة: <strong>المخاطرة (Risk) = الاحتمالية (Likelihood) × الشدة (Severity)</strong>
            </p>

            {/* Desktop Matrix Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-center text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-slate-300">
                    <th className="p-2 border border-slate-700">الاحتمالية \ الشدة</th>
                    <th className="p-2 border border-slate-700">1: إسعاف أولي</th>
                    <th className="p-2 border border-slate-700">2: إصابة طفيفة</th>
                    <th className="p-2 border border-slate-700">3: غياب 3 أيام</th>
                    <th className="p-2 border border-slate-700">4: إصابة جسيمة</th>
                    <th className="p-2 border border-slate-700">5: وفاة / كارثة</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { l: 5, label: '5: مؤكد الحدوث' },
                    { l: 4, label: '4: محتمل جداً' },
                    { l: 3, label: '3: محتمل' },
                    { l: 2, label: '2: غير محتمل' },
                    { l: 1, label: '1: نادر جداً' },
                  ].map((row) => (
                    <tr key={row.l}>
                      <td className="p-2 border border-slate-700 bg-slate-800 font-semibold text-slate-200 text-right">
                        {row.label}
                      </td>
                      {[1, 2, 3, 4, 5].map((s) => {
                        const score = row.l * s;
                        let cellColor = 'bg-emerald-700/70 text-emerald-100';
                        if (score >= 20) cellColor = 'bg-rose-700 text-white font-bold';
                        else if (score >= 12) cellColor = 'bg-orange-600 text-white font-bold';
                        else if (score >= 5) cellColor = 'bg-amber-600/90 text-slate-950 font-bold';

                        return (
                          <td key={s} className={`p-2 border border-slate-700 font-mono ${cellColor}`}>
                            {score}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (for narrow screens & field inspection) */}
            <div className="md:hidden space-y-3">
              <div className="text-[11px] text-amber-300/90 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                💡 تم تحويل المصفوفة إلى بطاقات ميدانية لسهولة القراءة واللمس على الشاشات الصغيرة:
              </div>

              {[
                { l: 5, label: 'الاحتمالية 5: مؤكد الحدوث (Almost Certain)' },
                { l: 4, label: 'الاحتمالية 4: محتمل جداً (Very Likely)' },
                { l: 3, label: 'الاحتمالية 3: محتمل (Likely)' },
                { l: 2, label: 'الاحتمالية 2: غير محتمل (Unlikely)' },
                { l: 1, label: 'الاحتمالية 1: نادر جداً (Very Unlikely)' },
              ].map((row) => (
                <div key={row.l} className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-2">
                  <div className="font-bold text-xs text-amber-400 border-b border-slate-800 pb-1.5 flex items-center justify-between">
                    <span>{row.label}</span>
                    <span className="text-[10px] text-slate-400 font-mono">L = {row.l}</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 text-center">
                    {[
                      { s: 1, name: 'إسعاف' },
                      { s: 2, name: 'طفيفة' },
                      { s: 3, name: '3 أيام' },
                      { s: 4, name: 'جسيمة' },
                      { s: 5, name: 'كارثة' },
                    ].map(({ s, name }) => {
                      const score = row.l * s;
                      let badgeBg = 'bg-emerald-600/90 text-white';
                      if (score >= 20) badgeBg = 'bg-rose-600 text-white font-black';
                      else if (score >= 12) badgeBg = 'bg-orange-600 text-white font-bold';
                      else if (score >= 5) badgeBg = 'bg-amber-500 text-slate-950 font-bold';

                      return (
                        <div key={s} className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center justify-between">
                          <span className="text-[9px] text-slate-400 truncate w-full">{name}</span>
                          <span className={`w-full mt-1 py-1 rounded text-xs font-mono ${badgeBg}`}>
                            {score}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Levels key */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
              <div className="p-2 bg-emerald-950/80 border border-emerald-500/40 rounded-lg text-emerald-300">
                <span className="font-bold">1 - 4: منخفض (Low)</span>
                <p className="text-[10px] text-slate-400 mt-0.5">مخاطرة مقبولة</p>
              </div>
              <div className="p-2 bg-amber-950/80 border border-amber-500/40 rounded-lg text-amber-300">
                <span className="font-bold">5 - 10: متوسط (Medium)</span>
                <p className="text-[10px] text-slate-400 mt-0.5">إجراءات تحكم مطلوبة</p>
              </div>
              <div className="p-2 bg-orange-950/80 border border-orange-500/40 rounded-lg text-orange-300">
                <span className="font-bold">12 - 16: عالٍ (High)</span>
                <p className="text-[10px] text-slate-400 mt-0.5">ضوابط إلزامية وموارد إضافية</p>
              </div>
              <div className="p-2 bg-rose-950/80 border border-rose-500/40 rounded-lg text-rose-300">
                <span className="font-bold">20 - 25: حرج (Critical)</span>
                <p className="text-[10px] text-slate-400 mt-0.5">إيقاف فوري للعمل</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details View Modal */}
      {selectedAssessment && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs"
          onClick={() => setSelectedAssessment(null)}
        >
          <div
            className="relative max-w-xl w-full bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl p-5 text-white space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[11px] text-amber-400 font-mono">
                  {CATEGORY_LABELS[selectedAssessment.category]}
                </span>
                <h3 className="font-bold text-base text-white mt-0.5">{selectedAssessment.activityName}</h3>
                <p className="text-xs text-slate-400">{selectedAssessment.location} • {selectedAssessment.date}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAssessment(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-800/80 rounded-xl space-y-1.5">
                <div className="text-slate-400">وصف الخطر والضرر المحتمل:</div>
                <div className="font-semibold text-slate-200 text-sm">{selectedAssessment.hazardDescription}</div>
                <p className="text-slate-400">{selectedAssessment.potentialHarm}</p>
              </div>

              {selectedAssessment.photoUrl && (
                <div className="p-3 bg-slate-800/80 rounded-xl space-y-2">
                  <div className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-amber-400" />
                    <span>الصورة التوثيقية الميدانية للخطر:</span>
                  </div>
                  <div className="relative rounded-xl overflow-hidden border border-slate-700 max-h-64 flex items-center justify-center bg-black/40">
                    <img
                      src={selectedAssessment.photoUrl}
                      alt="توثيق تقييم الخطر"
                      className="max-h-64 w-auto object-contain cursor-pointer hover:opacity-95 transition-opacity"
                      onClick={() => setPreviewModalImage(selectedAssessment.photoUrl || null)}
                    />
                    <button
                      type="button"
                      onClick={() => setPreviewModalImage(selectedAssessment.photoUrl || null)}
                      className="absolute bottom-2 left-2 px-2.5 py-1 bg-black/70 hover:bg-black/90 text-white rounded-lg text-[11px] font-bold backdrop-blur-xs flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>عرض ملء الشاشة</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="p-3 bg-slate-800/80 rounded-xl space-y-1.5">
                <div className="text-slate-400">تدابير التحكم والسيطرة الحالية:</div>
                <div className="text-slate-200">{selectedAssessment.existingControls}</div>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl space-y-1.5">
                <div className="text-slate-400">التدابير الإضافية لتحقيق الحد المعقول (ALARP):</div>
                <div className="text-emerald-300 font-medium">{selectedAssessment.additionalControls}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-slate-400 mb-1">المخاطرة الأولية</div>
                  <div className="text-base font-mono font-bold text-amber-400">
                    {selectedAssessment.initialRiskScore} من 25
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    احتمالية: {selectedAssessment.initialLikelihood} | شدة: {selectedAssessment.initialSeverity}
                  </div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-slate-400 mb-1">المخاطرة المتبقية</div>
                  <div className="text-base font-mono font-bold text-emerald-400">
                    {selectedAssessment.residualRiskScore} من 25
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    احتمالية: {selectedAssessment.residualLikelihood} | شدة: {selectedAssessment.residualSeverity}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl text-slate-400">
                <span>معد التقييم: <strong className="text-slate-200">{selectedAssessment.assessorName}</strong></span>
                {selectedAssessment.reviewerName && (
                  <span>المراجع: <strong className="text-slate-200">{selectedAssessment.reviewerName}</strong></span>
                )}
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
            className="relative max-w-2xl w-full bg-slate-900 border border-slate-700/90 rounded-2xl overflow-hidden shadow-2xl p-5 text-white max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">إعداد نموذج تقييم المخاطر (JHA / Risk Assessment)</h3>
                  <p className="text-[11px] text-slate-400">تحديد الخطر، تقدير الشدة والاحتمالية، وتطبيق هرم التحكم</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs mt-4">
              {/* Step 1: Work Activity & Context */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">اسم النشاط أو المهمة (Task / Activity) *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: تركيب سقالة معدنية بواجهة المبنى"
                    value={formActivity}
                    onChange={(e) => setFormActivity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 text-xs focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">موقع العمل بالتفصيل (Location)</label>
                  <input
                    type="text"
                    placeholder="مثال: الواجهة الشرقية - الطابق الثالث"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 text-xs focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">تصنيف مجال الخطر (Category)</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as RiskCategory)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-amber-500 focus:outline-hidden"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">من المعرض للضرر؟ (Who is at Risk?)</label>
                  <input
                    type="text"
                    value={formWho}
                    onChange={(e) => setFormWho(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Hazard Description */}
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">تحديد ووصف الخطر (Hazard Identification) *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="حدد مصدر الخطر، مثل: عدم استقرار قواعد السقالة أو العمل بدون درابزين أو بالقرب من خط كهربائي..."
                  value={formHazard}
                  onChange={(e) => setFormHazard(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white placeholder:text-slate-500 text-xs focus:border-amber-500 focus:outline-hidden resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">العواقب والضرر المحتمل (Potential Consequences)</label>
                <input
                  type="text"
                  placeholder="مثال: سقوط العمال من ارتفاع يؤدي إلى كسور بالغة أو وفاة وتلف بالمعدات"
                  value={formHarm}
                  onChange={(e) => setFormHarm(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 text-xs focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              {/* Photo Evidence Field */}
              <div className="space-y-1.5 p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                <label className="text-slate-300 font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-amber-400" />
                    <span>إرفاق صورة توثيقية لمصدر الخطر (Photo Attachment)</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">اختياري للتأكيد الميداني</span>
                </label>

                {formImage ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-900 flex items-center justify-between p-2">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={formImage}
                        alt="معاينة الصورة"
                        className="w-14 h-14 object-cover rounded-lg border border-slate-700"
                      />
                      <div className="text-[11px] text-slate-300">
                        <div className="font-bold text-emerald-400">✓ تم إرفاق الصورة بنجاح</div>
                        <div className="text-slate-500 text-[10px]">جاهزة للحفظ مع تقييم المخاطر والتقرير الرسمي</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormImage(null)}
                      className="px-2.5 py-1 text-[11px] text-rose-400 hover:text-rose-300 bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/40 rounded-lg transition-colors"
                    >
                      حذف الصورة
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-xl bg-slate-900/70 hover:bg-slate-850 cursor-pointer transition-colors text-center group">
                    <Camera className="w-6 h-6 text-slate-500 group-hover:text-amber-400 transition-colors mb-1" />
                    <span className="text-xs text-slate-300 font-semibold">اضغط هنا لرفع صورة من الجهاز أو التقاطها بالكاميرا</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">يدعم JPG, PNG, WEBP لتوثيق المخاطر بدقة</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Initial Risk Rating */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400">تقييم المخاطرة الأولية (قبل تطبيق الضوابط الإضافية)</span>
                  <span className="font-mono font-bold text-xs bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                    الدرجة: {initScore} من 25
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400">الاحتمالية (Likelihood): {formInitL}</label>
                    <select
                      value={formInitL}
                      onChange={(e) => setFormInitL(Number(e.target.value) as LikelihoodLevel)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs"
                    >
                      {Object.entries(LIKELIHOOD_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v.text}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400">الشدة / العواقب (Severity): {formInitS}</label>
                    <select
                      value={formInitS}
                      onChange={(e) => setFormInitS(Number(e.target.value) as SeverityLevel)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs"
                    >
                      {Object.entries(SEVERITY_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v.text}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Hierarchy of Controls Selector */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold flex items-center justify-between">
                  <span>التسلسل الهرمي للتحكم المطبق (Hierarchy of Controls)</span>
                  <span className="text-[10px] text-slate-400 font-normal">اختر وسائل التحكم المستخدمة</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(['elimination', 'substitution', 'engineering', 'administrative', 'ppe'] as HierarchyControl[]).map(
                    (ctrl) => {
                      const isSelected = formSelectedHierarchy.includes(ctrl);
                      const info = HIERARCHY_LABELS[ctrl];
                      return (
                        <button
                          key={ctrl}
                          type="button"
                          onClick={() => handleHierarchyToggle(ctrl)}
                          className={`p-2 rounded-xl border text-center transition-all ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="text-[11px]">{info.title}</div>
                          <div className="text-[9px] opacity-75 font-mono">{info.en}</div>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Controls Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">إجراءات السيطرة والتحكم الحالية</label>
                  <textarea
                    rows={2}
                    placeholder="مثال: توفير خوذة وأحذية سلامة وإشراف عام..."
                    value={formExistingControls}
                    onChange={(e) => setFormExistingControls(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white placeholder:text-slate-500 text-xs focus:border-amber-500 focus:outline-hidden resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">إجراءات التحكم الإضافية (ALARP Required)</label>
                  <textarea
                    rows={2}
                    placeholder="مثال: إلزامية حزام براشوت PFAS بنقطة تثبيت مستقلة، تركيب درابزين وحاجز قدم..."
                    value={formAdditionalControls}
                    onChange={(e) => setFormAdditionalControls(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white placeholder:text-slate-500 text-xs focus:border-amber-500 focus:outline-hidden resize-none"
                  />
                </div>
              </div>

              {/* Residual Risk Rating */}
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400">تقييم المخاطرة المتبقية (Residual Risk)</span>
                  <span className="font-mono font-bold text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    المتبقي: {resScore} من 25 {isAlarp ? '✓ (ALARP)' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400">الاحتمالية بعد الضوابط: {formResL}</label>
                    <select
                      value={formResL}
                      onChange={(e) => setFormResL(Number(e.target.value) as LikelihoodLevel)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs"
                    >
                      {Object.entries(LIKELIHOOD_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v.text}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400">الشدة بعد الضوابط: {formResS}</label>
                    <select
                      value={formResS}
                      onChange={(e) => setFormResS(Number(e.target.value) as SeverityLevel)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-xs"
                    >
                      {Object.entries(SEVERITY_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v.text}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300">أخصائي السلامة / المقيم (Assessor)</label>
                  <input
                    type="text"
                    placeholder="اسم القائم بالتقييم"
                    value={formAssessor}
                    onChange={(e) => setFormAssessor(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300">المراجع / مدير المشروع (Reviewer)</label>
                  <input
                    type="text"
                    placeholder="اسم المعتمد"
                    value={formReviewer}
                    onChange={(e) => setFormReviewer(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  حفظ واعتماد التقييم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Image Lightbox Modal */}
      {previewModalImage && (
        <div
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in"
          onClick={() => setPreviewModalImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreviewModalImage(null)}
              className="absolute -top-10 left-0 text-white hover:text-amber-400 bg-slate-800/80 p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewModalImage}
              alt="معاينة الصورة بالحجم الكامل"
              className="max-h-[85vh] max-w-full object-contain rounded-xl border border-slate-700 shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
