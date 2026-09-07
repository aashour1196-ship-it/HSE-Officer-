import React, { useRef, useState, useEffect } from 'react';
import {
  PenTool,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Award,
  Clock,
  Sparkles,
  FileCheck2,
  FileSignature
} from 'lucide-react';

interface DigitalSignaturePadProps {
  inspectorName: string;
  onSignatureComplete: (signatureDataUrl: string, hash: string) => void;
  onSignatureClear: () => void;
  existingSignature?: string;
  isReadOnly?: boolean;
}

export const DigitalSignaturePad: React.FC<DigitalSignaturePadProps> = ({
  inspectorName,
  onSignatureComplete,
  onSignatureClear,
  existingSignature,
  isReadOnly = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(Boolean(existingSignature));
  const [inkColor, setInkColor] = useState<string>('#38bdf8'); // Sky blue digital ink
  const [signatureHash, setSignatureHash] = useState<string>(() => {
    return `ISO-45001-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  });
  const [signedAtTime, setSignedAtTime] = useState<string>('');

  // Setup canvas with high DPI for crisp strokes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Set logical size and display size
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.strokeStyle = inkColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw baseline guideline
    drawGuidelines(ctx, rect.width, rect.height);

    // If existing signature provided, load it
    if (existingSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHasSignature(true);
      };
      img.src = existingSignature;
    }
  }, []);

  const drawGuidelines = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    // Horizontal guide line at 75% height
    ctx.moveTo(30, height - 35);
    ctx.lineTo(width - 30, height - 35);
    ctx.stroke();

    // Draw an 'X' sign mark on the right in RTL or left in LTR
    ctx.font = '12px sans-serif';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.fillText('✕ توقيع المفتش المعتمد', 35, height - 42);
    ctx.restore();
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (isReadOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const { x, y } = getCanvasCoordinates(e);

    ctx.strokeStyle = inkColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isReadOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Prevent default scroll on touch
    if ('touches' in e && e.cancelable) {
      e.preventDefault();
    }

    const { x, y } = getCanvasCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing || isReadOnly) return;
    setIsDrawing(false);
    setHasSignature(true);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const nowTimestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    setSignedAtTime(nowTimestamp);
    onSignatureComplete(dataUrl, signatureHash);
  };

  const clearCanvas = () => {
    if (isReadOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGuidelines(ctx, rect.width, rect.height);
    setHasSignature(false);
    setSignedAtTime('');
    onSignatureClear();
  };

  return (
    <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4" dir="rtl">
      {/* Header & ISO Compliance Seal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0">
            <FileSignature className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-white">التوقيع الرقمي للمفتش الميداني (Digital Signature)</h4>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-mono">
                <Award className="w-3 h-3" />
                <span>ISO 45001 & 19011</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              توثيق رسمي ملزم ومطابق لمتطلبات التدقيق الدوري والأدلة الميدانية
            </p>
          </div>
        </div>

        {/* Controls / Palette */}
        {!isReadOnly && (
          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* Color Selectors */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setInkColor('#38bdf8')}
                title="حبر أزرق تقني"
                className={`w-5 h-5 rounded-full bg-sky-400 transition-all ${
                  inkColor === '#38bdf8' ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'
                }`}
              />
              <button
                type="button"
                onClick={() => setInkColor('#34d399')}
                title="حبر أخضر سلامة"
                className={`w-5 h-5 rounded-full bg-emerald-400 transition-all ${
                  inkColor === '#34d399' ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'
                }`}
              />
              <button
                type="button"
                onClick={() => setInkColor('#f59e0b')}
                title="حبر ذهبي معتمد"
                className={`w-5 h-5 rounded-full bg-amber-400 transition-all ${
                  inkColor === '#f59e0b' ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'
                }`}
              />
              <button
                type="button"
                onClick={() => setInkColor('#f8fafc')}
                title="حبر أبيض"
                className={`w-5 h-5 rounded-full bg-white transition-all ${
                  inkColor === '#f8fafc' ? 'ring-2 ring-slate-400 scale-110' : 'opacity-60 hover:opacity-100'
                }`}
              />
            </div>

            <button
              type="button"
              onClick={clearCanvas}
              title="إعادة تعيين ومسح التوقيع"
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-rose-400 border border-slate-800 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">مسح التوقيع</span>
            </button>
          </div>
        )}
      </div>

      {/* Signature Canvas Area */}
      <div className="relative">
        <div className="w-full h-44 sm:h-48 bg-slate-900 border-2 border-dashed border-slate-700 hover:border-sky-500/60 transition-colors rounded-2xl overflow-hidden relative touch-none shadow-inner">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-full cursor-crosshair block"
          />

          {!hasSignature && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center gap-1 text-slate-500">
              <PenTool className="w-7 h-7 text-slate-600 animate-bounce" />
              <span className="text-xs font-semibold text-slate-400">
                وقع هنا باستخدام القلم الرقمي أو الإصبع أو مؤشر الفأرة
              </span>
              <span className="text-[11px] text-slate-500">
                (Sign here with finger, stylus, or mouse)
              </span>
            </div>
          )}

          {/* Verification Watermark Badge */}
          {hasSignature && (
            <div className="absolute top-2 left-2 pointer-events-none bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-2.5 py-1 rounded-lg text-[10px] font-mono flex items-center gap-1 backdrop-blur-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>موقّع إلكترونياً • SIGNED</span>
            </div>
          )}
        </div>
      </div>

      {/* Inspector Legal Attestation & Verification Details */}
      <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-2 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              القائم بالتوقيع: <strong className="text-white">{inspectorName || 'مفتش السلامة الميداني'}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 font-mono">
            <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>{signedAtTime || new Date().toISOString().slice(0, 10)}</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400/90 font-mono text-[10px]">{signatureHash}</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/80 pt-2">
          إقرار رسمي: أؤكد أنا المفتش المذكور أعلاه أن كافة نتائج الفحص والتفتيش الميداني تم إجراؤها ومراجعتها حضورياً في الموقع ومطابقة لمعايير السلامة والصحة المهنية ISO 45001:2018.
        </p>
      </div>
    </div>
  );
};
