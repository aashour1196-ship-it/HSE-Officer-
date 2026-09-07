import { ChecklistFrequency, ChecklistQuestion } from '../types';

export interface ChecklistTemplate {
  id: string;
  title: string;
  category: string;
  frequency: ChecklistFrequency;
  description: string;
  referenceStandard: string;
  items: ChecklistQuestion[];
}

export const CHECKLIST_TEMPLATES: ChecklistTemplate[] = [
  {
    id: 'scaffold_inspection',
    title: 'فحص وتدقيق السقالات (Scaffolding Inspection)',
    category: 'العمل على الارتفاعات',
    frequency: 'daily',
    description: 'فحص يومي ودوري لكافة أنواع السقالات قبل بدء الوردية وإصدار كارت الصلاحية (Scaff-Tag)',
    referenceStandard: 'OSHA 29 CFR 1926.451 / معايير الأوشا',
    items: [
      {
        id: 'sc-1',
        category: 'القواعد والأرضية',
        question: 'القواعد الخرسانية أو المعدنية (Base Plates & Sole Boards) مستقرة ومثبتة ولا يوجد هبوط في التربة.',
        standardReference: 'OSHA 1926.451(c)(2)'
      },
      {
        id: 'sc-2',
        category: 'الهيكل والتربيط',
        question: 'القوائم الرأسية مستقيمة تماماً (Vertical Alignment) ومربوطة بنظام ن свер / نهايز متقاطعة (Cross Bracing).',
        standardReference: 'OSHA 1926.451(c)(3)'
      },
      {
        id: 'sc-3',
        category: 'الربط بالمبنى',
        question: 'ربط السقالة بالمبنى مثبت كل 6 متر طولياً و 6 متر عرضياً (أو 4 أضعاف أصغر قاعدة).',
        standardReference: 'OSHA 1926.451(c)(1)'
      },
      {
        id: 'sc-4',
        category: 'منصة العمل',
        question: 'منصة العمل مغطاة بالكامل بألواح سليمة بدون فراغات تزيد عن 2.5 سم، وعرض المنصة لا يقل عن 45 سم.',
        standardReference: 'OSHA 1926.451(b)(1)'
      },
      {
        id: 'sc-5',
        category: 'حواجز الحماية',
        question: 'وجود درابزين علوي (106-110 سم) ودرابزين وسطي (53-55 سم) وحاجز قدم (Toe-board) بارتفاع 10 سم على الأقل.',
        standardReference: 'OSHA 1926.451(g)(4)'
      },
      {
        id: 'sc-6',
        category: 'وسائل الصعود',
        question: 'توفر سلم صعود آمن ومثبت يمتد متراً واحداً (3 أقدام) على الأقل فوق مستوى منصة العمل.',
        standardReference: 'OSHA 1926.1053'
      },
      {
        id: 'sc-7',
        category: 'كرت الصلاحية',
        question: 'تعليق كارت الفحص الأخضر (Scaff-Tag Green) المعتمد مع تاريخ التوقيع واسم الفاحص المؤهل.',
        standardReference: 'OSHA 1926.451(f)(3)'
      },
      {
        id: 'sc-8',
        category: 'المسافة عن خطوط الكهرباء',
        question: 'المسافة بين السقالة وخطوط الكهرباء المعلقة لا تقل عن 3 متر (10 أقدام) لكافة الجهود.',
        standardReference: 'OSHA 1926.451(f)(6)'
      }
    ]
  },
  {
    id: 'excavation_inspection',
    title: 'فحص وتدقيق أعمال الحفر (Excavation Inspection)',
    category: 'أعمال الحفر',
    frequency: 'daily',
    description: 'فحص يومي قبل بدء العمل للحفريات والخنادق للتأكد من استقرار الجوانب وخلوها من المخاطر',
    referenceStandard: 'OSHA 29 CFR 1926 Subpart P',
    items: [
      {
        id: 'ex-1',
        category: 'حماية الجوانب',
        question: 'توفير أنظمة دعم الجوانب (Shoring / Sloping / Shielding) لجميع الحفريات بعمق يتجاوز 1.25 متر.',
        standardReference: 'OSHA 1926.652'
      },
      {
        id: 'ex-2',
        category: 'نواتج الحفر',
        question: 'إبعاد نواتج الحفر والمعدات الثقيلة بمسافة لا تقل عن 60 سم (2 قدم) من حافة الحفرية.',
        standardReference: 'OSHA 1926.651(j)(2)'
      },
      {
        id: 'ex-3',
        category: 'المداخل والمخارج',
        question: 'توفير ساللم خروج آمنة كل 7.6 متر (25 قدماً) للحفريات التي يزيد عمقها عن 1.25 متر.',
        standardReference: 'OSHA 1926.651(c)(2)'
      },
      {
        id: 'ex-4',
        category: 'المرافق المدفونة',
        question: 'تحديد كافة خطوط الخدمات المدفونة (كابلات كهرباء، أنابيب غاز، مياه) بمخططات معتمدة قبل الحفر.',
        standardReference: 'OSHA 1926.651(b)'
      },
      {
        id: 'ex-5',
        category: 'حواجز التحذير',
        question: 'إحاطة منطقة الحفر بحواجز تحذيرية وشريط عاكس وإضاءة ليلية لمنع سقوط المشاة والمركبات.',
        standardReference: 'OSHA 1926.651(f)'
      },
      {
        id: 'ex-6',
        category: 'فحص الجو والغازات',
        question: 'إجراء فحص الغازات (O2, H2S, LEL) للحفريات العميقة التي تزيد عن 1.25 متر قبل دخول العمال.',
        standardReference: 'OSHA 1926.651(g)'
      }
    ]
  },
  {
    id: 'hot_work_fire_inspection',
    title: 'تدقيق الأعمال الساخنة والوقاية من الحريق (Hot Work & Fire)',
    category: 'الحرائق والأعمال الساخنة',
    frequency: 'daily',
    description: 'قائمة تدقيق لمناطق اللحام والقطع والعمليات المنتجة للشرر ولهب اللهب المكشوف',
    referenceStandard: 'NFPA 51B / OSHA 29 CFR 1910.252',
    items: [
      {
        id: 'hw-1',
        category: 'تصريح العمل',
        question: 'وجود تصريح عمل ساخن (Hot Work Permit) ساري المفعول وموقع في موقع العمل.',
        standardReference: 'NFPA 51B Section 5'
      },
      {
        id: 'hw-2',
        category: 'محيط العمل (11 متر)',
        question: 'خلو منطقة العمل بنصف قطر 11 متراً (35 قدماً) من جميع المواد القابلة للاشتعال أو تغطيتها بأغطية مقاومة.',
        standardReference: 'OSHA 1910.252(a)(2)'
      },
      {
        id: 'hw-3',
        category: 'مراقب الحريق (Fire Watch)',
        question: 'تعيين مراقب حريق مدرب ومزود بمطفأة حريق مناسبة يظل متواجداً أثناء العمل وبعده لمدة 30 دقيقة على الأقل.',
        standardReference: 'OSHA 1910.252(a)(2)(iii)'
      },
      {
        id: 'hw-4',
        category: 'أسطوانات الغاز',
        question: 'تثبيت أسطوانات الأكسجين والأستيلين عمودياً بسالسل وتركيب صمامات مانع رجوع اللهب (Flashback Arrestor).',
        standardReference: 'OSHA 1910.253'
      },
      {
        id: 'hw-5',
        category: 'كابلات وماكينة اللحام',
        question: 'تأريض ماكينة اللحام الكهربائي وسلامة الكابلات من التلف والقطع والتوصيالت غير الآمنة.',
        standardReference: 'OSHA 1910.254'
      },
      {
        id: 'hw-6',
        category: 'التهوية والوقاية',
        question: 'توفر تهوية كافية وارتداء عمال اللحام للنظارات وواقيات الوجه المعتمة والقفازات الجلدية المقاومة.',
        standardReference: 'OSHA 1910.252(b)'
      }
    ]
  },
  {
    id: 'electrical_loto_inspection',
    title: 'فحص السلامة الكهربائية ونظام القفل والوسم (Electrical & LOTO)',
    category: 'السلامة الكهربائية',
    frequency: 'weekly',
    description: 'تدقيق أسبوعي للتوصيلات الكهربائية المؤقتة، اللوحات، ونظام العزل الكهربائي (Lockout/Tagout)',
    referenceStandard: 'NFPA 70E / OSHA 29 CFR 1910.147',
    items: [
      {
        id: 'el-1',
        category: 'لوحات التوزيع',
        question: 'اللوحات الكهربائية مغلقة ومؤمنة ويوجد أمامها مسافة عمل حرة لا تقل عن 90 سم (36 بوصة).',
        standardReference: 'OSHA 1910.303(g)'
      },
      {
        id: 'el-2',
        category: 'قواطع التسريب الأرضي',
        question: 'تزويد جميع مخارج الكهرباء المؤقتة بقواطع تسريب تيار أرضي (GFCI) واختبار كفاءتها.',
        standardReference: 'OSHA 1926.404(b)'
      },
      {
        id: 'el-3',
        category: 'التأريض والحماية',
        question: 'تأريض كافة المعدات والهياكل المعدنية والآلات بموصلات أرضية سليمة ومقاسة بالميجر.',
        standardReference: 'OSHA 1910.304(f)'
      },
      {
        id: 'el-4',
        category: 'حالة الكابلات',
        question: 'الكابلات معزولة ومرفوعة عن الأرض أو محمية من مسارات المركبات والدهس وخالية من الوصلات العشوائية.',
        standardReference: 'OSHA 1926.405(a)'
      },
      {
        id: 'el-5',
        category: 'إجراءات العزل (LOTO)',
        question: 'تطبيق أقفال الأمان والبطاقات التحذيرية (Lockout / Tagout) وتفريغ الطاقة المتبقية أثناء الصيانة.',
        standardReference: 'OSHA 1910.147'
      }
    ]
  },
  {
    id: 'lifting_crane_inspection',
    title: 'فحص معدات الرفع والتصبين والأوناش (Lifting & Rigging)',
    category: 'الروافع والأوناش',
    frequency: 'weekly',
    description: 'تدقيق أسبوعي لمعدات الرفع، الوايرات، الشواكل، ومعدات الونش وخطة الرفع المعتمدة',
    referenceStandard: 'OSHA 29 CFR 1926.1400 / ASME B30.5',
    items: [
      {
        id: 'lf-1',
        category: 'شهادات الفحص',
        question: 'الونش ومعدات الرفع حاصلة على شهادات فحص سارية المفعول من طرف ثالث معتمد (Third Party).',
        standardReference: 'OSHA 1926.1412'
      },
      {
        id: 'lf-2',
        category: 'وايرات الرفع والشواكل',
        question: 'وايرات الصلب والشواكل خالية من القطع أو التآكل (استبعاد أي واير به تآكل يزيد عن 10% أو 3 أسلاك مقطوعة في جدلة).',
        standardReference: 'OSHA 1910.184'
      },
      {
        id: 'lf-3',
        category: 'خطاف الرفع (Hook)',
        question: 'خطاف الرفع مزود بلسان أمان (Safety Latch) ولا يوجد به اتساع في الفتحة بنسبة تزيد عن 5% أو تشققات.',
        standardReference: 'ASME B30.10'
      },
      {
        id: 'lf-4',
        category: 'ركائز الونش (Outriggers)',
        question: 'فرد الركائز بالكامل على وسائد خشبية/معدنية صلبة مع ثبات التربة وعدم وجود ميلان.',
        standardReference: 'OSHA 1926.1402'
      },
      {
        id: 'lf-5',
        category: 'عامل الإشارة وحبال التوجيه',
        question: 'تعيين عامل إشارة (Rigger/Signalman) مؤهل واحد فقط واستخدام حبال التوجيه (Tag Lines) للتحكم بالحمل.',
        standardReference: 'OSHA 1926.1428'
      },
      {
        id: 'lf-6',
        category: 'حظر الوقوف أسفل الحمل',
        question: 'تطويق منطقة الرفع ومنع مرور أو وقوف أي شخص أسفل الحمل المعلق تماماً.',
        standardReference: 'OSHA 1926.1425'
      }
    ]
  },
  {
    id: 'general_site_housekeeping_ppe',
    title: 'التدقيق اليومي العام والنظافة ومهمات الوقاية (Daily Site Walk & PPE)',
    category: 'الموقع العام والنظافة',
    frequency: 'daily',
    description: 'جولة تفتيش يومية للموقع تشمل الممرات، النظافة العامة، والتزام العمال بارتداء مهمات الوقاية الشخصية',
    referenceStandard: 'OSHA 29 CFR 1926.25 / 1926.28',
    items: [
      {
        id: 'hk-1',
        category: 'الممرات والمخارج',
        question: 'الممرات والمسارات سالكة بعرض لا يقل عن 70 سم وخالية من العوائق والمخلفات ومواد البناء المتناثرة.',
        standardReference: 'OSHA 1926.25'
      },
      {
        id: 'hk-2',
        category: 'مهمات الوقاية الشخصية (PPE)',
        question: 'التزام جميع العمال بارتداء الخوذة الصلبة، حذاء السلامة، السترة العاكسة، ونظارات الوقاية المناسبة.',
        standardReference: 'OSHA 1926.95 / 1926.100'
      },
      {
        id: 'hk-3',
        category: 'إضاءة الموقع والمخارج',
        question: 'مستوى الإضاءة كافٍ في كافة أماكن العمل، والمسالك ولوحات الطوارئ مضاءة وواضحة.',
        standardReference: 'OSHA 1926.56'
      },
      {
        id: 'hk-4',
        category: 'صناديق الإسعافات الأولية',
        question: 'صناديق الإسعافات الأولية متوفرة ومكتملة المحتويات مع وجود مسعفين أوليين مؤهلين في الموقع.',
        standardReference: 'OSHA 1926.50'
      },
      {
        id: 'hk-5',
        category: 'طفايات الحريق المؤقتة',
        question: 'توزيع طفايات الحريق في أماكن ظاهرة ومرتفعة وخالية من العوائق مع بطاقة فحص شهري سارية.',
        standardReference: 'OSHA 1926.150'
      },
      {
        id: 'hk-6',
        category: 'مياه الشرب والمرافق',
        question: 'توفر مياه شرب نقية مبردة وأماكن استراحة مظللة ونظيفة ومرافق صحية كافية (1 لكل 25 عاملاً).',
        standardReference: 'OSHA 1926.51'
      }
    ]
  }
];
