import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Sparkles,
  X,
  Filter,
  Layers,
  HardHat,
  Flame,
  FileCheck,
  ShieldCheck,
  User,
  RotateCcw
} from 'lucide-react';
import { DailyTask, TaskCategory, TaskPriority } from '../types';

interface DailyTaskBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: DailyTask[];
  onSaveTask: (task: DailyTask) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onClearCompleted: () => void;
  onResetSampleTasks?: () => void;
  autoOpenOnLogin: boolean;
  onToggleAutoOpen: (val: boolean) => void;
}

export const TASK_CATEGORY_INFO: Record<
  TaskCategory,
  { label: string; icon: React.ReactNode; color: string; badge: string }
> = {
  inspection: {
    label: 'تفتيش ميداني',
    icon: <HardHat className="w-3.5 h-3.5" />,
    color: 'text-amber-400',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  },
  permits: {
    label: 'تصاريح العمل (PTW)',
    icon: <FileCheck className="w-3.5 h-3.5" />,
    color: 'text-sky-400',
    badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  },
  equipment_ppe: {
    label: 'معدات ووقاية (PPE)',
    icon: <ShieldCheck className="w-3.5 h-3.5" />,
    color: 'text-emerald-400',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  },
  toolbox_talk: {
    label: 'توعية واجتماع (TBT)',
    icon: <Sparkles className="w-3.5 h-3.5" />,
    color: 'text-purple-400',
    badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  },
  audit_action: {
    label: 'متابعة ملاحظات وتصحيح',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    color: 'text-orange-400',
    badge: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  },
  general: {
    label: 'مهام عامة',
    icon: <Layers className="w-3.5 h-3.5" />,
    color: 'text-slate-400',
    badge: 'bg-slate-700/60 text-slate-300 border-slate-600',
  },
};

export const TASK_PRIORITY_INFO: Record<
  TaskPriority,
  { label: string; badge: string; dotColor: string }
> = {
  urgent: {
    label: 'عاجلة جداً',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    dotColor: 'bg-rose-500 animate-pulse',
  },
  medium: {
    label: 'متوسطة الأهمية',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    dotColor: 'bg-amber-400',
  },
  routine: {
    label: 'روتينية / دورية',
    badge: 'bg-slate-800 text-slate-300 border-slate-700',
    dotColor: 'bg-slate-500',
  },
};

export const QUICK_TASK_PRESETS = [
  {
    title: 'جولة تفتيش السلامة الصباحية في موقع العمل',
    category: 'inspection' as TaskCategory,
    priority: 'urgent' as TaskPriority,
    dueTime: '08:00',
  },
  {
    title: 'مراجعة تصاريح العمل (PTW) السارية والتأكد من تواجد المراقب',
    category: 'permits' as TaskCategory,
    priority: 'urgent' as TaskPriority,
    dueTime: '08:30',
  },
  {
    title: 'عقد اجتماع التوعية الميداني (Toolbox Talk) مع فرق التنفيذ',
    category: 'toolbox_talk' as TaskCategory,
    priority: 'medium' as TaskPriority,
    dueTime: '09:00',
  },
  {
    title: 'التحقق من جاهزية طفايات الحريق ونقاط التجمع لحالات الطوارئ',
    category: 'equipment_ppe' as TaskCategory,
    priority: 'medium' as TaskPriority,
    dueTime: '11:00',
  },
  {
    title: 'متابعة إغلاق الملاحظات الحرجة الناتجة عن الجولة السابقة',
    category: 'audit_action' as TaskCategory,
    priority: 'urgent' as TaskPriority,
    dueTime: '13:00',
  },
];

export const DailyTaskBoardModal: React.FC<DailyTaskBoardModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onSaveTask,
  onToggleTask,
  onDeleteTask,
  onClearCompleted,
  onResetSampleTasks,
  autoOpenOnLogin,
  onToggleAutoOpen,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'urgent'>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('inspection');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueTime, setDueTime] = useState('09:00');
  const [assignedTo, setAssignedTo] = useState('مشرف السلامة الميداني');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask: DailyTask = {
      id: `TASK-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      priority,
      dueTime: dueTime || undefined,
      assignedTo: assignedTo.trim() || undefined,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    onSaveTask(newTask);
    setTitle('');
    setDescription('');
    setShowAddForm(false);
  };

  const handleApplyPreset = (preset: typeof QUICK_TASK_PRESETS[0]) => {
    const newTask: DailyTask = {
      id: `TASK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: preset.title,
      category: preset.category,
      priority: preset.priority,
      dueTime: preset.dueTime,
      assignedTo: 'مشرف السلامة الميداني',
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };
    onSaveTask(newTask);
  };

  // Metrics
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const pendingCount = totalCount - completedCount;
  const urgentCount = tasks.filter((t) => t.priority === 'urgent' && !t.isCompleted).length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filtered tasks
  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending') return !t.isCompleted;
    if (filter === 'completed') return t.isCompleted;
    if (filter === 'urgent') return t.priority === 'urgent' && !t.isCompleted;
    return true;
  });

  const todayArabic = new Intl.DateTimeFormat('ar-IQ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn"
      dir="rtl"
    >
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/95 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-xs">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  لوحة المهام اليومية الميدانية (Daily Task Board)
                </h2>
                <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full font-mono">
                  {todayArabic}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                تتبع سريع للمهام الميدانية وتذكيرات السلامة لوردية العمل اليومية
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-800/60 border border-slate-800 p-3 rounded-xl">
              <div className="text-[11px] text-slate-400 mb-1">إجمالي المهام</div>
              <div className="text-lg font-bold text-white">{totalCount}</div>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
              <div className="text-[11px] text-amber-300 mb-1">المتبقية للإنجاز</div>
              <div className="text-lg font-bold text-amber-400">{pendingCount}</div>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
              <div className="text-[11px] text-emerald-300 mb-1">المهام المكتملة</div>
              <div className="text-lg font-bold text-emerald-400">{completedCount}</div>
            </div>
            <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
              <div className="text-[11px] text-rose-300 mb-1">مهام عاجلة متبقية</div>
              <div className="text-lg font-bold text-rose-400">{urgentCount}</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800/80 space-y-1.5">
            <div className="flex justify-between items-center text-[11px] font-semibold text-slate-300">
              <span>معدل إنجاز مهام اليوم</span>
              <span className="font-mono text-amber-400">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Preset Quick-Add Chips */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>إضافة سريعة لمهام السلامة القياسية بضغطة واحدة:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TASK_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 active:scale-95 text-slate-200 hover:text-white rounded-lg border border-slate-700 text-[11px] font-medium transition-all flex items-center gap-1"
                >
                  <Plus className="w-3 h-3 text-amber-400" />
                  <span>{preset.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Add Custom Task Button / Form */}
          <div className="bg-slate-800/50 border border-slate-750 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                إضافة مهمة تذكيرية جديدة
              </span>
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-bold underline"
              >
                {showAddForm ? 'إخفاء نموذج الإضافة' : '+ كتابة مهمة مخصصة'}
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t border-slate-700/60">
                <div>
                  <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                    عنوان المهمة الميدانية <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: فحص نقاط التثبيت وعزل الطاقة في المحطة رقم 4"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                      فئة المهمة
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as TaskCategory)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-hidden focus:border-amber-500 text-xs"
                    >
                      <option value="inspection">تفتيش ميداني</option>
                      <option value="permits">تصاريح العمل (PTW)</option>
                      <option value="equipment_ppe">معدات ووقاية (PPE)</option>
                      <option value="toolbox_talk">اجتماع وتوعية (TBT)</option>
                      <option value="audit_action">متابعة ملاحظات وتصحيح</option>
                      <option value="general">عامة</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                      درجة الأهمية
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as TaskPriority)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-hidden focus:border-amber-500 text-xs"
                    >
                      <option value="urgent">🔴 عاجلة جداً</option>
                      <option value="medium">🟡 متوسطة الأهمية</option>
                      <option value="routine">🟢 روتينية</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                      وقت الإنجاز المقترح
                    </label>
                    <input
                      type="time"
                      value={dueTime}
                      onChange={(e) => setDueTime(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-hidden focus:border-amber-500 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                      المسؤول / المنفذ
                    </label>
                    <input
                      type="text"
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      placeholder="مثال: مسؤول السلامة، مهندس الموقع"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                      ملاحظات أو تفاصيل إضافية (اختياري)
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="أي تفاصيل خاصة بتنفيذ المهمة..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-bold text-xs"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold text-xs flex items-center gap-1 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>حفظ المهمة</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  filter === 'all'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                الكل ({totalCount})
              </button>
              <button
                type="button"
                onClick={() => setFilter('pending')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  filter === 'pending'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                المتبقية ({pendingCount})
              </button>
              <button
                type="button"
                onClick={() => setFilter('completed')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  filter === 'completed'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                المكتملة ({completedCount})
              </button>
              <button
                type="button"
                onClick={() => setFilter('urgent')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  filter === 'urgent'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                عاجلة ({urgentCount})
              </button>
            </div>

            {completedCount > 0 && (
              <button
                type="button"
                onClick={onClearCompleted}
                className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>حذف المكتملة</span>
              </button>
            )}
          </div>

          {/* Tasks List */}
          <div className="space-y-2 max-h-[38vh] overflow-y-auto pr-1">
            {filteredTasks.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/50 rounded-xl border border-slate-800 border-dashed text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="font-semibold text-xs">لا توجد مهام مطابقة في هذه القائمة</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  يمكنك إضافة مهمة جديدة أو اختيار إحدى المهام القياسية بالأعلى
                </p>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const catInfo = TASK_CATEGORY_INFO[task.category] || TASK_CATEGORY_INFO.general;
                const priorityInfo = TASK_PRIORITY_INFO[task.priority] || TASK_PRIORITY_INFO.routine;

                return (
                  <div
                    key={task.id}
                    className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                      task.isCompleted
                        ? 'bg-slate-900/40 border-slate-800/60 opacity-70'
                        : 'bg-slate-850/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => onToggleTask(task.id)}
                        className="mt-0.5 text-slate-400 hover:text-amber-400 transition-colors shrink-0"
                        title={task.isCompleted ? 'تحديد كغير مكتملة' : 'تحديد كمكتملة'}
                      >
                        {task.isCompleted ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </button>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`font-semibold text-xs ${
                              task.isCompleted ? 'line-through text-slate-400' : 'text-slate-100'
                            }`}
                          >
                            {task.title}
                          </span>

                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-md border font-semibold flex items-center gap-1 ${catInfo.badge}`}
                          >
                            {catInfo.icon}
                            <span>{catInfo.label}</span>
                          </span>

                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-md border font-semibold flex items-center gap-1 ${priorityInfo.badge}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${priorityInfo.dotColor}`} />
                            <span>{priorityInfo.label}</span>
                          </span>
                        </div>

                        {task.description && (
                          <p className="text-[11px] text-slate-400">{task.description}</p>
                        )}

                        <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-0.5">
                          {task.dueTime && (
                            <span className="flex items-center gap-1 font-mono text-slate-300">
                              <Clock className="w-3 h-3 text-amber-400" />
                              <span>الموعد: {task.dueTime}</span>
                            </span>
                          )}
                          {task.assignedTo && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              <span>{task.assignedTo}</span>
                            </span>
                          )}
                          {task.isCompleted && task.completedAt && (
                            <span className="text-emerald-400 font-mono">
                              ✓ أُنجزت الساعة {new Date(task.completedAt).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteTask(task.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
                      title="حذف المهمة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-900 flex items-center justify-between gap-2 shrink-0">
          <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-300 hover:text-white select-none">
            <input
              type="checkbox"
              checked={autoOpenOnLogin}
              onChange={(e) => onToggleAutoOpen(e.target.checked)}
              className="rounded-sm border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-400"
            />
            <span>عرض قائمة المهام تلقائياً عند فتح النظام يومياً</span>
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-xs"
            >
              إغلاق ومتابعة العمل
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
