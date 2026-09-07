import React, { useState } from 'react';
import { PhoneCall, X, ShieldAlert, HeartPulse, Flame, Siren, AlertTriangle, ChevronRight, Activity } from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  const [activeGuideTab, setActiveGuideTab] = useState<'contacts' | 'first_aid'>('contacts');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-lg w-full bg-slate-900 border border-slate-700/90 rounded-2xl overflow-hidden shadow-2xl text-white max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">طوارئ وإسعاف جمهورية العراق</h3>
                <span className="text-[11px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30 font-bold">
                  911 موحد
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">خطوط الطوارئ والإنقاذ المباشرة والإجراءات الفورية</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 bg-slate-900/90 px-4 text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => setActiveGuideTab('contacts')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all ${
              activeGuideTab === 'contacts'
                ? 'border-rose-500 text-rose-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Siren className="w-4 h-4" />
            <span>أرقام الاتصال المباشر</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveGuideTab('first_aid')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all ${
              activeGuideTab === 'first_aid'
                ? 'border-rose-500 text-rose-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            <span>دليل الإسعافات الأولية السريع</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {activeGuideTab === 'contacts' ? (
            <div className="space-y-3">
              {/* Primary Unified 911 */}
              <a
                href="tel:911"
                className="group flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-l from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 active:scale-[0.99] transition-all border border-rose-500 text-white shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-black/20 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-black text-base flex items-center gap-2">
                      <span>رقم الطوارئ الموحد</span>
                      <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded-full font-bold">العراق</span>
                    </div>
                    <div className="text-xs text-rose-100 mt-0.5">البلاغات الطارئة والحوادث الجسيمة والفورية</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 font-mono font-black text-xl bg-black/30 px-3 py-1.5 rounded-xl group-hover:bg-black/40">
                  <PhoneCall className="w-4 h-4 text-rose-200" />
                  <span>911</span>
                </div>
              </a>

              {/* Civil Defense 115 */}
              <a
                href="tel:115"
                className="group flex items-center justify-between p-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 active:scale-[0.99] transition-all border border-slate-700 text-white shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-100">الدفاع المدني والإطفاء</div>
                    <div className="text-xs text-slate-400 mt-0.5">مكافحة الحرائق، الإنقاذ في الأماكن المغلقة والانهيارات</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 font-mono font-bold text-lg text-amber-400 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-700/60">
                  <PhoneCall className="w-4 h-4" />
                  <span>115</span>
                </div>
              </a>

              {/* Ambulance 122 */}
              <a
                href="tel:122"
                className="group flex items-center justify-between p-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 active:scale-[0.99] transition-all border border-slate-700 text-white shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-100">الإسعاف الفوري</div>
                    <div className="text-xs text-slate-400 mt-0.5">الإصابات الخطيرة، النوبات القلبية، وحوادث العمل</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 font-mono font-bold text-lg text-emerald-400 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-700/60">
                  <PhoneCall className="w-4 h-4" />
                  <span>122</span>
                </div>
              </a>

              {/* Police 104 */}
              <a
                href="tel:104"
                className="group flex items-center justify-between p-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 active:scale-[0.99] transition-all border border-slate-700 text-white shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                    <Siren className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-100">شرطة النجدة</div>
                    <div className="text-xs text-slate-400 mt-0.5">الأمن، تنظيم المرور، وتأمين محيط المنشآت</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 font-mono font-bold text-lg text-sky-400 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-700/60">
                  <PhoneCall className="w-4 h-4" />
                  <span>104</span>
                </div>
              </a>

              {/* Protocol info */}
              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs space-y-1.5 text-slate-300">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>بروتوكول البلاغ الطارئ في موقع العمل:</span>
                </div>
                <p>1. تحديد الموقع الدقيق (اسم المشروع، المحافظة، البوابة أو الرمز التعريفي).</p>
                <p>2. وصف طبيعة الخطر (حريق، سقوط، إصابة كهربائية، تسرب كيميائي/غازات).</p>
                <p>3. عدد المصابين والحالة العامة مع تفعيل خطة الإخلاء والإنقاذ فوراً.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl space-y-1.5">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5 text-sm">
                  <Activity className="w-4 h-4" />
                  <span>الإنعاش القلبي الرئوي (CPR):</span>
                </div>
                <p className="text-slate-300">
                  إذا كان المصاب فاقداً للوعي ولا يتنفس: ابدأ فوراً بـ <strong>30 ضغطة صدرية</strong> بعمق 5 سم بمعدل 100-120 ضغطة/دقيقة، يليها <strong>نَفَسَان إنقاذيان</strong>، واطلب جهاز الصدمات الآلي (AED).
                </p>
              </div>

              <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl space-y-1.5">
                <div className="font-bold text-amber-400 flex items-center gap-1.5 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>الصعق الكهربائي:</span>
                </div>
                <p className="text-slate-300">
                  لا تلمس المصاب إطلاقاً قبل فصل التيار من القاطع الرئيسي أو إبعاده بجسم عازل جاف (خشب أو بلاستيك)، وتأكد من التنفس فوراً.
                </p>
              </div>

              <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl space-y-1.5">
                <div className="font-bold text-rose-400 flex items-center gap-1.5 text-sm">
                  <Flame className="w-4 h-4" />
                  <span>الحروق والحرائق:</span>
                </div>
                <p className="text-slate-300">
                  تبريد الحرق فوراً بماء جارٍ بارد (وليس ثلجاً) لمدة 10 إلى 20 دقيقة، وتغطيته بضماد معقم غير لاصق، وتجنب وضع الزيوت أو المعجون.
                </p>
              </div>

              <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl space-y-1.5">
                <div className="font-bold text-sky-400 flex items-center gap-1.5 text-sm">
                  <ChevronRight className="w-4 h-4" />
                  <span>النزيف الحاد ووضع الإفاقة:</span>
                </div>
                <p className="text-slate-300">
                  الضغط المباشر المستمر على الجرح بضماد نظيف ورفع العضو المصاب أعلى من مستوى القلب. وفي حالة الإغماء مع وجود تنفس، ضعه في <strong>وضع الإفاقة (Recovery Position)</strong>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-center shrink-0">
          <p className="text-[11px] text-slate-400">
            للطوارئ الفورية اضغط مباشرة على <span className="text-rose-400 font-bold">911</span>
          </p>
        </div>
      </div>
    </div>
  );
};
