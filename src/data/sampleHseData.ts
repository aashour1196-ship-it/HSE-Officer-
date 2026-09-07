import {
  RiskAssessmentItem,
  WorkPermit,
  SafetyObservation,
  IncidentReport,
  InspectionChecklist,
  DailyTask
} from '../types';

export const SAMPLE_RISK_ASSESSMENTS: RiskAssessmentItem[] = [
  {
    id: 'RA-SAMPLE-1',
    activityName: 'أعمال الحفر العميق وتركيب خطوط المياه',
    location: 'منطقة التوسعة - القطاع B3',
    category: 'excavation',
    hazardDescription: 'انهيار جوانب الحفرية نتيجة عدم وجود دعامات وسقوط ناتج الحفر والمعدات الثقيلة داخل الخندق.',
    potentialHarm: 'دفن العمال، اختناق، كسور مضاعفة أو وفيات، وتلف الكابلات المدفونة.',
    whoIsAtRisk: 'عمال الحفر، مشغلو الحفارات، المارة والمشرفون',
    initialLikelihood: 4,
    initialSeverity: 5,
    initialRiskScore: 20, // Critical
    existingControls: 'توفير حواجز تحذيرية وسترات عاكسة فقط.',
    controlHierarchy: ['engineering', 'administrative', 'ppe'],
    additionalControls: 'تركيب دعامات خشبية/معدنية (Shoring)، تمييل الجوانب (Sloping) وفق نوع التربة، إبعاد ناتج الحفر 60 سم، وتوفير سلالم خروج كل 7.6م.',
    residualLikelihood: 1,
    residualSeverity: 3,
    residualRiskScore: 3, // Low
    isAlarp: true,
    assessorName: 'م. أحمد خالد (أخصائي السلامة والصحة المهنية)',
    reviewerName: 'م. راشد الحازمي (مدير المشروع)',
    date: '2026-09-02',
    status: 'active',
  },
  {
    id: 'RA-SAMPLE-2',
    activityName: 'تركيب واستخدام السقالات المعلقة للواجهات',
    location: 'المبنى الرئيسي - الواجهة الغربية ارتفاع 15م',
    category: 'heights',
    hazardDescription: 'سقوط العمال من ارتفاع شاهق أو سقوط المعدات والأدوات على المشاة أسفل السقالة.',
    potentialHarm: 'إصابات مميتة، كسور حادة، تضرر الممتلكات والمعدات.',
    whoIsAtRisk: 'فنيو الواجهات، المارة في الممرات السفلية',
    initialLikelihood: 4,
    initialSeverity: 5,
    initialRiskScore: 20,
    existingControls: 'وجود حزام أمان عادي.',
    controlHierarchy: ['engineering', 'administrative', 'ppe'],
    additionalControls: 'استخدام مانع سقوط كامل الجسم PFAS مع شريان حياة مستقل، تركيب درابزين علوي (106 سم) وأوسط، حاجز قدم Toe-board (10 سم)، وشبكة أمان سفلية.',
    residualLikelihood: 1,
    residualSeverity: 4,
    residualRiskScore: 4,
    isAlarp: true,
    assessorName: 'فهد المنصور (مشرف السلامة)',
    reviewerName: 'م. أحمد خالد',
    date: '2026-09-02',
    status: 'active',
  },
  {
    id: 'RA-SAMPLE-3',
    activityName: 'أعمال القطع واللحام بالقرب من خزانات الديزل',
    location: 'محيط وحدة المحولات والمولدات',
    category: 'hot_work',
    hazardDescription: 'تطاير الشرر واللهب المكشوف مما قد يشعل أبخرة الوقود والمواد القابلة للاشتعال.',
    potentialHarm: 'اشتعال حريق، انفجار صهريج الوقود، حروق شديدة من الدرجة الثالثة.',
    whoIsAtRisk: 'عمال اللحام، فنيو الميكانيكا، طاقم الموقع',
    initialLikelihood: 4,
    initialSeverity: 5,
    initialRiskScore: 20,
    existingControls: 'طفاية حريق بودرة 6 كجم بجوار العامل.',
    controlHierarchy: ['engineering', 'administrative', 'ppe'],
    additionalControls: 'تنظيف محيط 11 متراً من أي مواد مشتعلة، فحص الغازات (LEL = 0%)، تعيين مراقب حريق (Fire Watch) مدرب ومزود بمطفأة وخرطوم مياه لمدة 30 دقيقة بعد انتهاء العمل.',
    residualLikelihood: 1,
    residualSeverity: 3,
    residualRiskScore: 3,
    isAlarp: true,
    assessorName: 'عمر التميمي (مسؤول مكافحة الحريق)',
    reviewerName: 'م. راشد الحازمي',
    date: '2026-09-02',
    status: 'active',
  }
];

// Helper for realistic relative timestamps
const getRelativeDate = (daysOffset: number) => {
  const d = new Date(Date.now() + daysOffset * 24 * 60 * 60 * 1000);
  return d.toISOString().split('T')[0];
};

const getRelativeDateTime = (hoursOffset: number) => {
  const d = new Date(Date.now() + hoursOffset * 60 * 60 * 1000);
  return {
    date: d.toISOString().split('T')[0],
    time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  };
};

export const SAMPLE_WORK_PERMITS: WorkPermit[] = [
  {
    id: 'PTW-SAMPLE-1',
    permitNumber: 'PTW-HOT-1042',
    type: 'hot_work',
    title: 'أعمال لحام وقطع أنابيب نظام الإطفاء بالسطح',
    description: 'قص ولحام كهربائي لأنابيب شبكة الرشاشات المائية 2.5 بوصة باستخدام ماكينة لحام كهربائية وصاروخ تجليخ.',
    location: 'مبنى الخدمات - سقف الطابق الثاني',
    department: 'قسم الميكانيكا والسباكة',
    contractorName: 'شركة الإتقان للمقاولات العامة',
    workerCount: 3,
    startDate: getRelativeDate(0),
    startTime: '08:00',
    endDate: getRelativeDateTime(10).date, // Expiring in 10 hours (< 24 hours warning)
    endTime: getRelativeDateTime(10).time,
    status: 'active',
    requestorName: 'م. حسام الدين (مهندس الموقع)',
    siteSupervisorName: 'سعيد القحطاني',
    safetyOfficerName: 'أحمد شاكر (HSE Officer)',
    precautions: {
      risk_assessment_done: true,
      ppe_provided: true,
      emergency_explained: true,
      area_barricaded: true,
      fire_extinguisher_ready: true,
      loto_applied: false,
      ventilation_assured: true,
    },
    gasTestRequired: true,
    gasTests: [
      {
        testedAt: '08:15 ص',
        oxygenPercent: 20.9,
        lelPercent: 0,
        h2sPpm: 0,
        coPpm: 2,
        testerName: 'فاحص الغازات المعتمد (AGP)',
        isSafe: true,
        notes: 'الجو آمن تماماً للعمل الساخن وخالٍ من الغازات القابلة للاشتعال.',
      }
    ],
    fireWatchRequired: true,
    fireWatchName: 'محمود الصالحي (Fire Watcher)',
  },
  {
    id: 'PTW-SAMPLE-2',
    permitNumber: 'PTW-CONF-2088',
    type: 'confined_space',
    title: 'تنظيف وصيانة الخزان الأرضي لمياه الحريق',
    description: 'دخول الخزان الأرضي بعمق 4 أمتار لإزالة الرواسب وفحص صمامات السحب والعزل.',
    location: 'خزان المياه الرئيسي رقم 1',
    department: 'إدارة التشغيل والصيانة',
    workerCount: 2,
    startDate: getRelativeDate(0),
    startTime: '07:30',
    endDate: getRelativeDateTime(3).date, // Expiring in 3 hours (Critical alert < 6 hours)
    endTime: getRelativeDateTime(3).time,
    status: 'active',
    requestorName: 'م. فهد الزهراني',
    siteSupervisorName: 'عبدالله ناصر',
    safetyOfficerName: 'أحمد شاكر',
    precautions: {
      risk_assessment_done: true,
      ppe_provided: true,
      emergency_explained: true,
      area_barricaded: true,
      fire_extinguisher_ready: true,
      loto_applied: true,
      ventilation_assured: true,
    },
    gasTestRequired: true,
    gasTests: [
      {
        testedAt: '08:45 ص',
        oxygenPercent: 20.8,
        lelPercent: 0,
        h2sPpm: 0,
        coPpm: 0,
        testerName: 'أحمد شاكر (فاحص الغازات)',
        isSafe: true,
        notes: 'الأكسجين طبيعي، غاز H2S صفر، وجهاز التهوية الميكانيكية يعمل باستمرار.',
      }
    ],
    isolationCertificateNumber: 'ISO-2026-081',
  },
  {
    id: 'PTW-SAMPLE-3',
    permitNumber: 'PTW-ELEC-3015',
    type: 'electrical_loto',
    title: 'صيانة قواطع الجهد المتوسط وعزل غرفة المحولات 11KV',
    description: 'استبدال قاطع هوائي رئيسي وتركيب أقفال LOTO وتأريض الخطوط قبل بدء الفحص الداخلي.',
    location: 'محطة المحولات الكهربائية الفرعية SS-03',
    department: 'قسم الكهرباء والجهد العالي',
    workerCount: 4,
    startDate: getRelativeDate(0),
    startTime: '08:00',
    endDate: getRelativeDate(3), // Valid for 3 days
    endTime: '17:00',
    status: 'active',
    requestorName: 'م. عادل الشمري',
    siteSupervisorName: 'كريم البصري',
    safetyOfficerName: 'أحمد شاكر',
    precautions: {
      risk_assessment_done: true,
      ppe_provided: true,
      emergency_explained: true,
      area_barricaded: true,
      fire_extinguisher_ready: true,
      loto_applied: true,
      ventilation_assured: true,
    },
    gasTestRequired: false,
    isolationCertificateNumber: 'LOTO-ELEC-2026-44',
  }
];

export const SAMPLE_OBSERVATIONS: SafetyObservation[] = [
  {
    id: 'OBS-SAMPLE-1',
    type: 'unsafe_act',
    title: 'صعود عامل على سلم نقالي دون استخدام قاعدة النقاط الثلاث',
    description: 'تم رصد أحد الفنيين يحمل صندوق العدة بكلتا يديه أثناء صعود السلم النقالي دون التثبت بالدرجات.',
    location: 'مبنى المستودعات - البوابة رقم 4',
    department: 'الكهرباء',
    observedBy: 'مراقب السلامة الميداني',
    observedAt: '2026-09-02',
    immediateActionTaken: 'تم إيقاف العامل فوراً وتوفير حزام لحمل العدة وتوضيح طريقة الصعود الآمن مع 3 نقاط اتصال.',
    status: 'closed',
    riskRating: 'medium',
  },
  {
    id: 'OBS-SAMPLE-2',
    type: 'unsafe_condition',
    title: 'كابل كهربائي مكشوف يمر فوق ممر مائي',
    description: 'وجود تآكل في العازل الخارجي لكابل تغذية مضخة الخرسانة بالقرب من مسار تصريف المياه.',
    location: 'منطقة صب القواعد B',
    department: 'المقاول الرئيسي',
    observedBy: 'م. أحمد خالد',
    observedAt: '2026-09-02',
    immediateActionTaken: 'فصل التيار وتطبيق القفل والوسم واستبدال الكابل المتضرر ورفعه على حوامل عازلة.',
    status: 'closed',
    riskRating: 'high',
  },
  {
    id: 'OBS-SAMPLE-3',
    type: 'safe_behavior',
    title: 'التزام كامل بارتداء مانع السقوط وفحص السقالة قبل الصعود',
    description: 'قام طاقم السقالات بفحص كارت الصلاحية الأخضر وربط حبال الحياة بنقاط ربط معتمدة قبل بدء العمل.',
    location: 'الواجهة الشمالية',
    department: 'فريق السقالات',
    observedBy: 'مشرف السلامة',
    observedAt: '2026-09-02',
    immediateActionTaken: 'توجيه شكر للطاقم وتوثيق السلوك الإيجابي في اجتماع السلامة اليومي (TBT).',
    status: 'closed',
    riskRating: 'low',
  }
];

export const SAMPLE_INCIDENTS: IncidentReport[] = [
  {
    id: 'INC-SAMPLE-1',
    referenceNumber: 'INC-2026-001',
    type: 'near_miss',
    severity: 'medium',
    title: 'سقوط برميل فارغ بالقرب من مسار المشاة أثناء الرفع',
    description: 'أثناء تفريغ شحنة براميل باستخدام الونش، انزلق برميل فارغ من الشاحنة وسقط بالقرب من ممر العمال دون حدوث إصابات.',
    location: 'منطقة التحميل والتفريغ - البوابة 2',
    dateTime: '2026-09-02T10:15',
    reportedBy: 'فهد المنصور (مشرف الحركة)',
    immediateCauses: [
      'عدم إحكام ربط البراميل برباط تصبين مناسب (Improper Rigging)',
      'سير أحد العمال بالقرب من منطقة الرفع النشطة'
    ],
    rootCauses: [
      'غياب عامل إشارة معتمد (Rigger) لتوجيه حركة الونش وتأمين النطاق',
      'عدم تطويق منطقة الرفع بشريط تحذيري كافٍ'
    ],
    correctiveActions: [
      {
        id: 'act-1',
        action: 'إعادة تدريب طواقم الرفع والتصبين على اشتراطات ASME B30.5 ورباطات التصبين السليمة',
        responsiblePerson: 'مهندس التدريب والسلامة',
        targetDate: '2026-09-05',
        isCompleted: true,
      },
      {
        id: 'act-2',
        action: 'تطويق مناطق الرفع بحواجز صلبة وتعيين رجل إشارة مخصص يمنع اقتراب المشاة',
        responsiblePerson: 'مشرف الموقع',
        targetDate: '2026-09-03',
        isCompleted: true,
      }
    ],
    status: 'closed',
  }
];

export const SAMPLE_DAILY_TASKS: DailyTask[] = [
  {
    id: 'TASK-1',
    title: 'جولة تفتيش السلامة الصباحية الشاملة على قطاعات الموقع',
    description: 'التأكد من خلو ممرات الطوارئ وفحص اللوحات الإرشادية والتزام العمال بمعدات الوقاية',
    category: 'inspection',
    priority: 'urgent',
    dueTime: '08:00',
    assignedTo: 'مشرف السلامة الميداني',
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'TASK-2',
    title: 'مراجعة تصاريح العمل (PTW) السارية والتأكد من توقيعات المراقبين',
    description: 'تصريح العمل الساخن في الورشة وتصريح الرفع بالرافعة المحمولة',
    category: 'permits',
    priority: 'urgent',
    dueTime: '08:30',
    assignedTo: 'مسؤول تصاريح العمل',
    isCompleted: true,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  },
  {
    id: 'TASK-3',
    title: 'عقد اجتماع صندوق المحادثة (Toolbox Talk) مع عمال الوردية الأولى',
    description: 'موضوع التوعية اليوم: مخاطر العمل على ارتفاعات والوقاية من السقوط وإجراءات ربط حزام الأمان',
    category: 'toolbox_talk',
    priority: 'medium',
    dueTime: '09:00',
    assignedTo: 'ضابط السلامة والصحة المهنية',
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'TASK-4',
    title: 'فحص جاهزية طفايات الحريق وخراطيم الإطفاء في منطقة خزانات الوقود',
    description: 'التحقق من مؤشرات الضغط وسلامة صمامات الأمان وتاريخ الفحص الدوري',
    category: 'equipment_ppe',
    priority: 'medium',
    dueTime: '11:00',
    assignedTo: 'فني معدات مكافحة الحريق',
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'TASK-5',
    title: 'إغلاق الإجراءات التصحيحية الخاصة بملاحظة السقالات الحرجة',
    description: 'تركيب حاجز أصابع القدم Toe-board وتثبيت حبال الأمان المستقلة',
    category: 'audit_action',
    priority: 'urgent',
    dueTime: '13:00',
    assignedTo: 'مشرف السقالات',
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
];
