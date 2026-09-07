import React, { useRef } from 'react';
import {
  FileText,
  Printer,
  Download,
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Calendar,
  UserCheck,
  Building
} from 'lucide-react';
import { RiskAssessmentItem, IncidentReport } from '../types';
import { CATEGORY_LABELS, getRiskLevelInfo } from './RiskAssessmentModule';
import { INCIDENT_TYPE_INFO, SEVERITY_INFO } from './IncidentsLogModule';

interface ReportPdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: 'incidents' | 'risk_assessment' | 'combined';
  incidents: IncidentReport[];
  assessments: RiskAssessmentItem[];
  currentUserEmail?: string;
}

export const ReportPdfExportModal: React.FC<ReportPdfExportModalProps> = ({
  isOpen,
  onClose,
  reportType,
  incidents,
  assessments,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const reportDate = new Date().toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const reportTime = new Date().toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const reportRefNumber = `HSE-REP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const handlePrint = () => {
    // Generate standalone printable window to guarantee clean A4 PDF generation
    const printContent = printRef.current?.innerHTML;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8">
          <title>تقرير السلامة والصحة المهنية - ${reportRefNumber}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm 15mm;
            }
            body {
              font-family: 'Cairo', sans-serif;
              color: #0f172a;
              background: #fff;
              margin: 0;
              padding: 10px;
              direction: rtl;
              font-size: 11pt;
              line-height: 1.5;
            }
            * {
              box-sizing: border-box;
            }
            .no-print {
              display: none !important;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 14px 0;
              font-size: 9.5pt;
            }
            th, td {
              border: 1px solid #cbd5e1;
              padding: 7px 9px;
              text-align: right;
            }
            th {
              background-color: #f1f5f9;
              font-weight: 700;
              color: #1e293b;
            }
            tr:nth-child(even) {
              background-color: #f8fafc;
            }
            .badge {
              display: inline-block;
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 8.5pt;
              font-weight: bold;
              border: 1px solid #94a3b8;
            }
            .header-box {
              border-bottom: 2px solid #0f172a;
              padding-bottom: 12px;
              margin-bottom: 16px;
            }
            .stamp {
              border: 2px dashed #0284c7;
              color: #0369a1;
              padding: 6px 12px;
              border-radius: 8px;
              display: inline-block;
              font-weight: 800;
              font-size: 9pt;
            }
            .signatures {
              margin-top: 30px;
              display: flex;
              justify-content: space-between;
              page-break-inside: avoid;
            }
            .sig-block {
              width: 30%;
              border-top: 1px solid #94a3b8;
              padding-top: 8px;
              text-align: center;
              font-size: 9pt;
            }
            .photo-thumb {
              max-width: 130px;
              max-height: 90px;
              object-fit: cover;
              border-radius: 6px;
              border: 1px solid #cbd5e1;
            }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      // Fallback to window.print if popup is blocked
      window.print();
    }
  };

  const handleDownloadHtmlReport = () => {
    const printContent = printRef.current?.innerHTML;
    if (!printContent) return;

    const fullHtml = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <title>تقرير السلامة والصحة المهنية - ${reportRefNumber}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    @page { size: A4 portrait; margin: 12mm 15mm; }
    body { font-family: 'Cairo', sans-serif; color: #0f172a; background: #fff; margin: 0; padding: 20px; direction: rtl; font-size: 11pt; line-height: 1.5; }
    table { width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 9.5pt; }
    th, td { border: 1px solid #cbd5e1; padding: 7px 9px; text-align: right; }
    th { background-color: #f1f5f9; font-weight: 700; color: #1e293b; }
    tr:nth-child(even) { background-color: #f8fafc; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 8.5pt; font-weight: bold; border: 1px solid #94a3b8; }
    .header-box { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
    .stamp { border: 2px dashed #0284c7; color: #0369a1; padding: 6px 12px; border-radius: 8px; display: inline-block; font-weight: 800; font-size: 9pt; }
    .signatures { margin-top: 30px; display: flex; justify-content: space-between; page-break-inside: avoid; }
    .sig-block { width: 30%; border-top: 1px solid #94a3b8; padding-top: 8px; text-align: center; font-size: 9pt; }
    .photo-thumb { max-width: 130px; max-height: 90px; object-fit: cover; border-radius: 6px; border: 1px solid #cbd5e1; }
  </style>
</head>
<body>
  ${printContent}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportRefNumber}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const showIncidents = reportType === 'incidents' || reportType === 'combined';
  const showAssessments = reportType === 'risk_assessment' || reportType === 'combined';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto" dir="rtl">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top Control Bar */}
        <div className="p-4 bg-slate-850 border-b border-slate-700/80 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                تصدير وطباعة تقرير السلامة الرسمي (PDF / Official Document)
              </h3>
              <p className="text-[11px] text-slate-400">
                مستند معتمد وجاهز للطباعة أو الحفظ كملف PDF رقمي متوافق مع معايير OSHA ووزارة العمل
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-sm"
              title="طباعة أو تصدير مباشر إلى PDF"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة / حفظ كـ PDF</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadHtmlReport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              title="تنزيل نسخة رقمية من التقرير"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>تنزيل التقرير</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable A4 Paper Preview Container */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-slate-950/70 flex justify-center">
          <div
            ref={printRef}
            className="w-full max-w-4xl bg-white text-slate-900 rounded-xl p-8 sm:p-10 shadow-2xl text-xs sm:text-sm font-['Cairo',sans-serif] leading-relaxed"
          >
            {/* Header Document */}
            <div className="header-box border-b-2 border-slate-900 pb-4 mb-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
                <div className="flex items-center gap-3.5">
                  <img
                    src="/hse_logo.png"
                    alt="شعار السلامة والصحة المهنية"
                    className="w-16 h-16 object-contain rounded-full border border-slate-300 p-0.5 bg-white shadow-xs shrink-0"
                  />
                  <div className="space-y-0.5">
                    <div className="text-[11px] font-bold text-slate-500">جمهورية العراق • وزارة العمل والشؤون الاجتماعية</div>
                    <h1 className="text-lg sm:text-xl font-black text-slate-950">
                      منظومة إدارة السلامة والصحة المهنية والبيئة (HSE)
                    </h1>
                    <div className="text-xs font-semibold text-slate-700">
                      {reportType === 'incidents'
                        ? 'التقرير الرسمي لسجل الحوادث وشبه الحوادث (Incidents & Near Misses Log)'
                        : reportType === 'risk_assessment'
                        ? 'التقرير الرسمي لمصفوفة تقييم وتحليل المخاطر (Risk Assessment & JHA Matrix)'
                        : 'التقرير الشامل المتكامل لمنظومة السلامة الميدانية (Comprehensive HSE Audit)'}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center sm:items-end gap-1.5">
                  <div className="stamp border-2 border-dashed border-sky-700 text-sky-800 px-3 py-1 rounded-lg text-xs font-extrabold">
                    ✓ معتمد رسمياً • OFFICIAL COMPLIANT
                  </div>
                  <div className="text-[11px] text-slate-600 font-mono">
                    رقم الوثيقة: <strong>{reportRefNumber}</strong>
                  </div>
                </div>
              </div>

              {/* Metadata strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-700 bg-slate-50 p-2.5 rounded-lg">
                <div>
                  <span className="text-slate-500">تاريخ الإصدار: </span>
                  <strong>{reportDate}</strong>
                </div>
                <div>
                  <span className="text-slate-500">وقت التقرير: </span>
                  <strong>{reportTime}</strong>
                </div>
                <div>
                  <span className="text-slate-500">المعايير المعتمدة: </span>
                  <strong>OSHA 1926 / NFPA</strong>
                </div>
                <div>
                  <span className="text-slate-500">جهة الاعتماد: </span>
                  <strong className="font-semibold text-slate-800">إدارة السلامة والصحة المهنية المعتمدة</strong>
                </div>
              </div>
            </div>

            {/* SECTION 1: INCIDENTS LOG */}
            {showIncidents && (
              <div className="mb-8">
                <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-3">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    <span>1. سجل الحوادث وشبه الحوادث الميدانية ({incidents.length} بلاغ)</span>
                  </h2>
                  <span className="text-xs text-slate-500">توثيق الحوادث العرضية والإصابات</span>
                </div>

                {incidents.length === 0 ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs text-center font-bold">
                    ✓ سجل الحوادث نظيف (صفر حوادث مسجلة بالموقع حتى تاريخ إصدار التقرير).
                  </div>
                ) : (
                  <>
                    {/* Desktop & Print Table View */}
                    <div className="hidden md:block print:block overflow-x-auto">
                      <table className="w-full border-collapse border border-slate-300 text-xs">
                        <thead>
                          <tr className="bg-slate-100 text-slate-800 font-bold">
                            <th className="border border-slate-300 p-2 text-right">رقم البلاغ</th>
                            <th className="border border-slate-300 p-2 text-right">عنوان البلاغ</th>
                            <th className="border border-slate-300 p-2 text-right">التصنيف</th>
                            <th className="border border-slate-300 p-2 text-right">الشدة</th>
                            <th className="border border-slate-300 p-2 text-right">الموقع والتاريخ</th>
                            <th className="border border-slate-300 p-2 text-right">المبلّغ</th>
                            <th className="border border-slate-300 p-2 text-right">الحالة</th>
                          </tr>
                        </thead>
                        <tbody>
                          {incidents.map((inc) => {
                            const typeInfo = INCIDENT_TYPE_INFO[inc.type];
                            const sevInfo = SEVERITY_INFO[inc.severity];
                            return (
                              <tr key={inc.id} className="hover:bg-slate-50">
                                <td className="border border-slate-300 p-2 font-mono font-bold text-[11px]">
                                  {inc.referenceNumber}
                                </td>
                                <td className="border border-slate-300 p-2">
                                  <div className="font-bold text-slate-900">{inc.title}</div>
                                  <div className="text-[10px] text-slate-600 line-clamp-1">{inc.description}</div>
                                </td>
                                <td className="border border-slate-300 p-2 text-[11px]">
                                  {typeInfo?.label || inc.type}
                                </td>
                                <td className="border border-slate-300 p-2 text-[11px] font-semibold">
                                  {sevInfo?.label || inc.severity}
                                </td>
                                <td className="border border-slate-300 p-2 text-[11px]">
                                  <div>{inc.location}</div>
                                  <div className="text-[10px] text-slate-500 font-mono">{(inc.dateTime || '').replace('T', ' ')}</div>
                                </td>
                                <td className="border border-slate-300 p-2 text-[11px]">
                                  {inc.reportedBy}
                                </td>
                                <td className="border border-slate-300 p-2 text-[11px] font-bold">
                                  {inc.status === 'closed' ? 'مغلق ومحقق' : 'قيد التحقيق والمتابعة'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards View (for narrow screens & field review) */}
                    <div className="md:hidden print:hidden space-y-3">
                      {incidents.map((inc) => {
                        const typeInfo = INCIDENT_TYPE_INFO[inc.type];
                        const sevInfo = SEVERITY_INFO[inc.severity];
                        return (
                          <div
                            key={inc.id}
                            className="p-3.5 rounded-xl border border-slate-300 bg-white shadow-2xs space-y-2.5 text-xs text-right"
                          >
                            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                              <div>
                                <span className="font-mono font-bold text-[11px] text-slate-500 block">
                                  {inc.referenceNumber}
                                </span>
                                <h4 className="font-bold text-slate-900 text-sm mt-0.5">{inc.title}</h4>
                              </div>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-md font-bold shrink-0 ${
                                  inc.status === 'closed'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                                }`}
                              >
                                {inc.status === 'closed' ? 'مغلق ومحقق' : 'قيد التحقيق'}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded-lg leading-relaxed">
                              {inc.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-semibold border border-slate-200">
                                {typeInfo?.label || inc.type}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 font-semibold border border-rose-200">
                                {sevInfo?.label || inc.severity}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-[10px] text-slate-600">
                              <div>
                                <strong className="text-slate-800">الموقع: </strong>
                                <span>{inc.location}</span>
                              </div>
                              <div>
                                <strong className="text-slate-800">المبلّغ: </strong>
                                <span>{inc.reportedBy}</span>
                              </div>
                              <div className="col-span-2 font-mono text-[9px] text-slate-500">
                                {(inc.dateTime || '').replace('T', ' ')}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Photo evidence for incidents if any */}
                {incidents.some((i) => i.photoUrl) && (
                  <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-rose-600" />
                      <span>الملحق البصري: الصور التوثيقية المرفقة بالبلاغات</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {incidents
                        .filter((i) => i.photoUrl)
                        .map((i) => (
                          <div key={i.id} className="border border-slate-300 rounded-lg p-1.5 bg-white max-w-[170px]">
                            <img
                              src={i.photoUrl}
                              alt={i.title}
                              className="w-full h-24 object-cover rounded-md border border-slate-200"
                            />
                            <div className="text-[10px] font-bold text-slate-800 mt-1 line-clamp-1">{i.title}</div>
                            <div className="text-[9px] text-slate-500 font-mono">{i.referenceNumber}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SECTION 2: RISK ASSESSMENTS */}
            {showAssessments && (
              <div className="mb-8">
                <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-3">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    <span>2. مصفوفة تقييم وتحليل المخاطر المهنية ({assessments.length} تقييم)</span>
                  </h2>
                  <span className="text-xs text-slate-500">حساب الشدة والاحتمالية وهرم السيطرة</span>
                </div>

                {assessments.length === 0 ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-xs text-center">
                    لا توجد تقييمات مخاطر مسجلة في هذا التقرير.
                  </div>
                ) : (
                  <>
                    {/* Desktop & Print Table View */}
                    <div className="hidden md:block print:block overflow-x-auto">
                      <table className="w-full border-collapse border border-slate-300 text-xs">
                        <thead>
                          <tr className="bg-slate-100 text-slate-800 font-bold">
                            <th className="border border-slate-300 p-2 text-right">النشاط والموقع</th>
                            <th className="border border-slate-300 p-2 text-right">التصنيف</th>
                            <th className="border border-slate-300 p-2 text-right">الخطر المحتمل</th>
                            <th className="border border-slate-300 p-2 text-center">المخاطرة الأولية</th>
                            <th className="border border-slate-300 p-2 text-right">إجراءات السيطرة الإضافية</th>
                            <th className="border border-slate-300 p-2 text-center">المخاطرة المتبقية</th>
                            <th className="border border-slate-300 p-2 text-center">ALARP</th>
                          </tr>
                        </thead>
                        <tbody>
                          {assessments.map((ra) => {
                            const initInfo = getRiskLevelInfo(ra.initialRiskScore);
                            const resInfo = getRiskLevelInfo(ra.residualRiskScore);
                            return (
                              <tr key={ra.id} className="hover:bg-slate-50">
                                <td className="border border-slate-300 p-2">
                                  <div className="font-bold text-slate-900">{ra.activityName}</div>
                                  <div className="text-[10px] text-slate-600">{ra.location}</div>
                                </td>
                                <td className="border border-slate-300 p-2 text-[11px]">
                                  {CATEGORY_LABELS[ra.category] || ra.category}
                                </td>
                                <td className="border border-slate-300 p-2 text-[11px]">
                                  <div className="font-medium text-slate-800">{ra.hazardDescription}</div>
                                  <div className="text-[10px] text-slate-500">الفئات المعرضة: {ra.whoIsAtRisk}</div>
                                </td>
                                <td className="border border-slate-300 p-2 text-center font-mono font-bold text-[11px]">
                                  <span className="inline-block px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-900 border border-amber-300">
                                    {ra.initialRiskScore} ({ra.initialLikelihood}×{ra.initialSeverity})
                                  </span>
                                </td>
                                <td className="border border-slate-300 p-2 text-[11px]">
                                  {ra.additionalControls || ra.existingControls}
                                </td>
                                <td className="border border-slate-300 p-2 text-center font-mono font-bold text-[11px]">
                                  <span className="inline-block px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-900 border border-emerald-300">
                                    {ra.residualRiskScore} ({ra.residualLikelihood}×{ra.residualSeverity})
                                  </span>
                                </td>
                                <td className="border border-slate-300 p-2 text-center font-bold text-[10px]">
                                  {ra.isAlarp ? (
                                    <span className="text-emerald-700">✓ محققة</span>
                                  ) : (
                                    <span className="text-rose-700">تحت المراجعة</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards View (for narrow screens & field inspection) */}
                    <div className="md:hidden print:hidden space-y-3">
                      {assessments.map((ra) => {
                        return (
                          <div
                            key={ra.id}
                            className="p-3.5 rounded-xl border border-slate-300 bg-white shadow-2xs space-y-2.5 text-xs text-right"
                          >
                            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                              <div>
                                <h4 className="font-bold text-slate-900 text-sm">{ra.activityName}</h4>
                                <span className="text-[10px] text-slate-500 block mt-0.5">{ra.location}</span>
                              </div>
                              <div className="flex flex-col items-end gap-1 shrink-0">
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-semibold border border-slate-200">
                                  {CATEGORY_LABELS[ra.category] || ra.category}
                                </span>
                                {ra.isAlarp ? (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                                    ✓ ALARP محققة
                                  </span>
                                ) : (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold border border-amber-300">
                                    تحت المراجعة
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="bg-rose-50/70 border border-rose-100 p-2 rounded-lg space-y-1">
                              <div className="text-[10px] font-bold text-rose-800">الخطر المحتمل:</div>
                              <p className="text-[11px] text-slate-800 leading-relaxed">{ra.hazardDescription}</p>
                              <div className="text-[9px] text-slate-500 pt-0.5">
                                المعرضون: <strong>{ra.whoIsAtRisk}</strong>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-center">
                              <div className="p-2 rounded-lg bg-amber-50 border border-amber-200">
                                <span className="text-[9px] text-amber-800 block font-semibold">المخاطرة الأولية</span>
                                <span className="font-mono font-black text-sm text-amber-900">
                                  {ra.initialRiskScore}{' '}
                                  <span className="text-[9px] font-normal text-amber-700">
                                    ({ra.initialLikelihood}×{ra.initialSeverity})
                                  </span>
                                </span>
                              </div>
                              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                                <span className="text-[9px] text-emerald-800 block font-semibold">المخاطرة المتبقية</span>
                                <span className="font-mono font-black text-sm text-emerald-900">
                                  {ra.residualRiskScore}{' '}
                                  <span className="text-[9px] font-normal text-emerald-700">
                                    ({ra.residualLikelihood}×{ra.residualSeverity})
                                  </span>
                                </span>
                              </div>
                            </div>

                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-[10px] space-y-1">
                              <strong className="text-slate-800 block">إجراءات السيطرة وهرم التحكم:</strong>
                              <p className="text-slate-700 leading-relaxed">
                                {ra.additionalControls || ra.existingControls}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Attached photos for Risk Assessments */}
                {assessments.some((a) => a.photoUrl) && (
                  <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-amber-600" />
                      <span>الملحق البصري: صور التوثيق الميداني لتقييمات المخاطر</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {assessments
                        .filter((a) => a.photoUrl)
                        .map((a) => (
                          <div key={a.id} className="border border-slate-300 rounded-lg p-1.5 bg-white max-w-[170px]">
                            <img
                              src={a.photoUrl}
                              alt={a.activityName}
                              className="w-full h-24 object-cover rounded-md border border-slate-200"
                            />
                            <div className="text-[10px] font-bold text-slate-800 mt-1 line-clamp-1">{a.activityName}</div>
                            <div className="text-[9px] text-slate-500">{a.location}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Official Signatures & Stamp Block */}
            <div className="signatures mt-8 pt-6 border-t-2 border-slate-400 grid grid-cols-3 gap-4 text-center">
              <div className="border-t border-slate-300 pt-2">
                <div className="text-[11px] font-bold text-slate-800">أخصائي السلامة الميداني</div>
                <div className="text-[10px] text-slate-500 mt-1">إعداد وتوثيق البيانات</div>
                <div className="h-10 mt-1 border-b border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400">
                  (التوقيع الإلكتروني المعتمد)
                </div>
              </div>

              <div className="border-t border-slate-300 pt-2">
                <div className="text-[11px] font-bold text-slate-800">مدير الموقع / المشرف الهندسي</div>
                <div className="text-[10px] text-slate-500 mt-1">المراجعة والتحقق الميداني</div>
                <div className="h-10 mt-1 border-b border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400">
                  (ختم الإدارة الهندسية)
                </div>
              </div>

              <div className="border-t border-slate-300 pt-2 bg-slate-50/80 p-2 rounded-lg">
                <div className="text-[11px] font-bold text-amber-900">اعتماد إدارة المنظومة</div>
                <div className="text-[10px] font-bold text-slate-800 mt-0.5">مدير السلامة والصحة المهنية المعتمد</div>
                <div className="h-10 mt-1 flex items-center justify-center text-[10px] text-sky-800 font-bold border border-sky-300 rounded-md bg-sky-50">
                  ✓ تم الاعتماد النهائي
                </div>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="mt-8 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-500">
              وثيقة رسمية صادرة إلكترونياً من نظام السلامة والصحة المهنية (HSE Management System) • سرية ومخصصة لأغراض العمل والتدقيق الرسمي
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
