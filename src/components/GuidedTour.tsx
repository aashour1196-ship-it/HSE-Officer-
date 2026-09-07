import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  ChevronRight,
  ChevronLeft,
  X,
  AlertTriangle,
  ClipboardCheck,
  FileCheck,
  PhoneCall,
  Sparkles,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface TourStep {
  id: string;
  targetId?: string;
  tabId?: 'overview' | 'risk_assessment' | 'permits' | 'incidents' | 'checklists';
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  badgeAr: string;
  badgeEn: string;
  icon: React.ReactNode;
}

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: 'overview' | 'risk_assessment' | 'permits' | 'incidents' | 'checklists') => void;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    targetId: 'top-header-brand',
    tabId: 'overview',
    badgeAr: 'مرحباً بك',
    badgeEn: 'Welcome',
    titleAr: 'منظومة السلامة والصحة المهنية الميدانية (HSE)',
    titleEn: 'HSE Field Management System',
    descAr:
      'نظام ميداني متكامل مبني ومصمم وفق معايير OSHA و NFPA للسلامة المهنية. يتيح لك إدارة تصاريح العمل، تقييم المخاطر، توثيق البلاغات، وإجراء التفتيش الميداني بدقة واحترافية.',
    descEn:
      'Comprehensive HSE field management system designed under OSHA & NFPA safety standards to handle PTW permits, JHA risk assessments, instant incident reporting, and digital inspections.',
    icon: <Sparkles className="w-5 h-5 text-amber-400" />,
  },
  {
    id: 'quick_incident',
    targetId: 'quick-report-incident-btn',
    tabId: 'overview',
    badgeAr: 'إبلاغ فوري',
    badgeEn: 'Incident Reporting',
    titleAr: 'كيفية تسجيل بلاغ عن حادث أو شبه حادث (Near Miss)',
    titleEn: 'How to Report an Incident or Near Miss',
    descAr:
      'في حال وقوع أي حادث أو شبه حادث بالموقع، انقر هنا لفتح استمارة البلاغ الفوري. يمكنك تحديد نوع الإصابة (إسعاف أولي، وشيك، هدر وقت LTI)، تحديد الموقع بدقة، التقاط صورة ميدانية، وتشغيل إنذار صوتي فوري لغرفة العمليات.',
    descEn:
      'In case of any site event, tap here to launch the immediate report form. Choose classification (First Aid, Near Miss, LTI, Property Damage), set location, attach a site photo, and fire an audio alarm to site dispatch.',
    icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
  },
  {
    id: 'checklists',
    targetId: 'nav-tab-checklists',
    tabId: 'checklists',
    badgeAr: 'التفتيش الميداني',
    badgeEn: 'Field Checklists',
    titleAr: 'كيفية ملء وتوثيق قائمة فحص وتدقيق السلامة',
    titleEn: 'How to Complete a Safety Inspection Checklist',
    descAr:
      'من خلال قسم قوائم الفحص، اختر النموذج المناسب للعملية (سقالات، رافعات، حفريات، مكافحة حريق، مهمات PPE). قم بفحص البنود نقطة بنقطة، تدوين الملاحظات، وإرفاق الصور مع التوقيع الرقمي لاعتماد الجولة.',
    descEn:
      'Navigate to the Checklists section to select the needed audit template (Scaffolding, Cranes, Excavation, Fire Safety, PPE). Inspect items pass/fail, add observations, and apply digital signature for official approval.',
    icon: <ClipboardCheck className="w-5 h-5 text-emerald-400" />,
  },
  {
    id: 'permits',
    targetId: 'nav-tab-permits',
    tabId: 'permits',
    badgeAr: 'تصاريح العمل',
    badgeEn: 'Work Permits (PTW)',
    titleAr: 'إصدار ومراقبة تصاريح العمل الإلكترونية (PTW)',
    titleEn: 'Issuing & Monitoring Work Permits (PTW)',
    descAr:
      'إصدار وتتبع تصاريح العمل الساخنة، والأماكن المحصورة، والحفر والكهرباء. يوفر النظام مراقبة حية وتنبيهات تلقائية في المتصفح قبل انتهاء صلاحية التصريح بـ 12 ساعة لتجديده أو إغلاقه بأمان.',
    descEn:
      'Issue and track Hot Work, Confined Space, Excavation and Electrical permits. Features live countdowns and browser notification alerts 12 hours before expiration.',
    icon: <FileCheck className="w-5 h-5 text-sky-400" />,
  },
  {
    id: 'emergency',
    targetId: 'emergency-call-btn',
    tabId: 'overview',
    badgeAr: 'الطوارئ والإرشاد',
    badgeEn: 'Emergency & SOS',
    titleAr: 'أرقام الطوارئ الموحدة والقواعد الذهبية للسلامة',
    titleEn: 'Emergency Numbers & Golden Safety Rules',
    descAr:
      'زر الطوارئ الميداني يتيح الاتصال المباشر بأرقام النجدة (911، 115، 122، 104) بنقرة واحدة، بالإضافة لاستعراض إجراءات العزل LOTO وفحص الغازات وهرم التحكم بالمخاطر الميدانية.',
    descEn:
      'Field SOS button enables instant one-tap dialing to emergency services (911, 115, 122, 104), alongside prompt reference to LOTO isolation, gas testing criteria, and the Hierarchy of Controls.',
    icon: <PhoneCall className="w-5 h-5 text-rose-400" />,
  },
];

export const GuidedTour: React.FC<GuidedTourProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const { language, t, isRtl, dir } = useLanguage();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const step = TOUR_STEPS[currentStepIndex];

  // When step changes, navigate to the step's tab and locate target
  useEffect(() => {
    if (!isOpen || !step) return;

    if (step.tabId) {
      onNavigateTab(step.tabId);
    }

    // Allow time for DOM to update after tab change
    const updateTargetRect = () => {
      if (step.targetId) {
        const el = document.getElementById(step.targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const rect = el.getBoundingClientRect();
          setTargetRect(rect);
          return;
        }
      }
      setTargetRect(null);
    };

    const timer = setTimeout(updateTargetRect, 250);
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect, true);
    };
  }, [isOpen, currentStepIndex, step?.id]);

  if (!isOpen || !step) return null;

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
      // Record tour completion in localStorage
      localStorage.setItem('hse_tour_completed_v2', 'true');
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const title = isRtl ? step.titleAr : step.titleEn;
  const desc = isRtl ? step.descAr : step.descEn;
  const badge = isRtl ? step.badgeAr : step.badgeEn;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-auto" dir={dir}>
      {/* Dark Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-[2px] transition-all"
        onClick={onClose}
      />

      {/* Target Highlight Box (Spotlight Effect) */}
      {targetRect && (
        <div
          style={{
            top: `${Math.max(8, targetRect.top - 6)}px`,
            left: `${Math.max(8, targetRect.left - 6)}px`,
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`,
          }}
          className="fixed pointer-events-none z-[101] rounded-2xl ring-4 ring-amber-400 ring-offset-4 ring-offset-slate-950 shadow-[0_0_50px_rgba(245,158,11,0.5)] transition-all duration-300 animate-pulse"
        />
      )}

      {/* Floating Tooltip Card */}
      <div className="fixed inset-x-4 bottom-6 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 max-w-lg w-full z-[102] mx-auto">
        <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-black/80 text-right overflow-hidden relative backdrop-blur-md">
          {/* Progress Bar */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300"
              style={{
                width: `${((currentStepIndex + 1) / TOUR_STEPS.length) * 100}%`,
              }}
            />
          </div>

          {/* Top Bar with Step counter and close button */}
          <div className="flex items-center justify-between gap-3 mb-4 pt-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {step.icon}
              </span>
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {badge}
                </span>
                <span className="text-xs text-slate-400 font-mono block mt-0.5">
                  {isRtl
                    ? `الخطوة ${currentStepIndex + 1} من ${TOUR_STEPS.length}`
                    : `Step ${currentStepIndex + 1} of ${TOUR_STEPS.length}`}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              title={isRtl ? 'إغلاق الجولة' : 'Close Tour'}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Step Content */}
          <div className="space-y-2 mb-6">
            <h3 className="text-base sm:text-lg font-black text-white leading-snug">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {desc}
            </p>
          </div>

          {/* Steps Indicator Dots */}
          <div className="flex items-center justify-center gap-1.5 mb-5">
            {TOUR_STEPS.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentStepIndex
                    ? 'w-6 bg-amber-400'
                    : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
                title={`الخطوة ${idx + 1}`}
              />
            ))}
          </div>

          {/* Footer Navigation Buttons */}
          <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {t('skipTour')}
            </button>

            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition-all border border-slate-700 flex items-center gap-1 cursor-pointer active:scale-95"
                >
                  {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  <span>{t('prevStep')}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-450 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black transition-all shadow-md shadow-amber-500/20 flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <span>{isLastStep ? t('finishTour') : t('nextStep')}</span>
                {isLastStep ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
