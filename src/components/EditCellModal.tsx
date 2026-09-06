import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  MapPin,
  User,
  Sparkles,
  Trash2,
  ListTodo,
} from 'lucide-react';
import { ScheduleCell, TaskItem, WorkspaceId } from '../types';
import {
  COLOR_PRESETS,
  DAYS_OF_WEEK,
  TIME_SLOTS,
} from '../data/scheduleConfig';

interface EditCellModalProps {
  isOpen: boolean;
  dayId: string;
  slotId: string;
  cellData?: ScheduleCell;
  workspaceId: WorkspaceId;
  currentWeekId: string;
  onClose: () => void;
  onSave: (cell: ScheduleCell) => void;
  onDelete?: (cellId: string) => void;
}

// 8 Môn học gợi ý nhanh matching image 2
const QUICK_SUBJECTS = [
  { name: 'Toán Học', icon: '📐', color: 'sky', teacher: 'Thầy Minh' },
  { name: 'Ngữ Văn', icon: '📖', color: 'rose', teacher: 'Cô Mai' },
  { name: 'Tiếng Anh', icon: '🇬🇧', color: 'mint', teacher: 'Cô Emily' },
  { name: 'Vật Lý', icon: '⚡', color: 'sky', teacher: 'Thầy Quang' },
  { name: 'Hóa Học', icon: '🧪', color: 'honey', teacher: 'Cô Lan' },
  { name: 'Sinh Học', icon: '🌿', color: 'mint', teacher: 'Cô Thảo' },
  { name: 'Lịch Sử', icon: '📜', color: 'peach', teacher: 'Thầy Hưng' },
  { name: 'Địa Lý', icon: '🌍', color: 'mint', teacher: 'Cô Hiền' },
];

// Emojis matching row 1 and row 2 in image 2
const CUTE_EMOJIS_ROW_1 = ['🌸', '🌷', '🌿', '🌱', '☕', '✨', '🎀', '🧸', '📚', '📝', '🎨', '📐', '🧪'];
const CUTE_EMOJIS_ROW_2 = ['💡', '🎵', '🎧', '💻', '🍀', '☀️', '🧁', '🍓', '🍰', '🕊️', '🌞'];

// 8 Color presets matching image 2
const MODAL_COLOR_ORDER = ['rose', 'mint', 'lavender', 'honey', 'sky', 'peach', 'indigo', 'blush'];

export const EditCellModal: React.FC<EditCellModalProps> = ({
  isOpen,
  dayId,
  slotId,
  cellData,
  workspaceId,
  currentWeekId,
  onClose,
  onSave,
  onDelete,
}) => {
  const [subject, setSubject] = useState('');
  const [icon, setIcon] = useState('🌸');
  const [room, setRoom] = useState('');
  const [teacher, setTeacher] = useState('');
  const [notes, setNotes] = useState('');
  const [colorTheme, setColorTheme] = useState('rose');
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [showTasks, setShowTasks] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');

  const dayInfo = DAYS_OF_WEEK.find((d) => d.id === dayId);
  const slotInfo = TIME_SLOTS.find((s) => s.id === slotId);

  useEffect(() => {
    if (cellData) {
      setSubject(cellData.subject || '');
      setIcon(cellData.icon || '🌸');
      setRoom(cellData.room || '');
      setTeacher(cellData.teacher || '');
      setNotes(cellData.notes || '');
      setColorTheme(cellData.colorTheme || 'rose');
      setTasks(cellData.tasks || []);
      setShowTasks((cellData.tasks || []).length > 0);
    } else {
      setSubject('');
      setIcon('🌸');
      setRoom('');
      setTeacher('');
      setNotes('');
      setColorTheme('rose');
      setTasks([]);
      setShowTasks(false);
    }
    setNewTaskText('');
  }, [cellData, isOpen]);

  if (!isOpen) return null;

  const handleSelectQuickSubject = (sub: (typeof QUICK_SUBJECTS)[0]) => {
    setSubject(sub.name);
    setIcon(sub.icon);
    setColorTheme(sub.color);
    if (!teacher && sub.teacher) {
      setTeacher(sub.teacher);
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const item: TaskItem = {
      id: `task_${Date.now()}`,
      text: newTaskText.trim(),
      completed: false,
    };
    setTasks([...tasks, item]);
    setNewTaskText('');
  };

  const handleToggleTask = (id: string) => {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleRemoveTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    const cellId = `${workspaceId}_${currentWeekId}_${dayId}_${slotId}`;
    const newCell: ScheduleCell = {
      id: cellId,
      subject: subject.trim(),
      icon,
      room: room.trim() || undefined,
      teacher: teacher.trim() || undefined,
      notes: notes.trim() || undefined,
      colorTheme,
      tasks: tasks.length > 0 ? tasks : undefined,
    };

    onSave(newCell);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl border border-rose-100 shadow-2xl max-w-lg w-full max-h-[92vh] overflow-hidden text-gray-800 flex flex-col">
        {/* Custom scrollable body with cute right accent scroll track matching Image 2 */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-4 max-h-[92vh] pr-4 sm:pr-5">
          {/* 1. MODAL HEADER (Matching image 2) */}
          <div className="flex items-start justify-between gap-2 pb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🌱</span>
                <h3 className="font-extrabold text-xl text-gray-900 tracking-tight">
                  {cellData ? 'Chỉnh sửa tiết học' : 'Thêm tiết học mới'}
                </h3>
              </div>
              <p className="text-xs font-extrabold text-[#E11D48] mt-1">
                {dayInfo?.name} <span className="mx-1">•</span> {slotInfo?.name} ({slotInfo?.startTime} - {slotInfo?.endTime})
              </p>
            </div>

            {/* Circular Close Button */}
            <button
              id="btn-close-edit-modal"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100/80 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors shadow-2xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 2. MÔN HỌC GỢI Ý NHANH (Matching image 2) */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase text-[#E11D48] tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#F43F5E]" />
              <span>MÔN HỌC GỢI Ý NHANH</span>
            </div>

            {/* 2 rows of 4 pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {QUICK_SUBJECTS.map((sub) => (
                <button
                  key={sub.name}
                  type="button"
                  onClick={() => handleSelectQuickSubject(sub)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    subject === sub.name
                      ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-2xs scale-102'
                      : 'bg-[#F8F9FA] hover:bg-rose-50/60 border-gray-200/90 text-gray-700 hover:text-gray-900'
                  }`}
                >
                  <span className="text-sm shrink-0">{sub.icon}</span>
                  <span className="truncate">{sub.name}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 3. TÊN MÔN HỌC * (Matching image 2) */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#E11D48] mb-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#F43F5E]" />
                <span>Tên môn học <span className="text-[#E11D48]">*</span></span>
              </label>

              <div className="flex items-center gap-2.5">
                {/* Big Icon Preview Square */}
                <div
                  className="w-12 h-12 rounded-2xl border-2 border-rose-300 bg-[#FFE4E8]/70 flex items-center justify-center text-2xl shrink-0 shadow-2xs select-none"
                  title="Biểu tượng hiện tại"
                >
                  <span>{icon}</span>
                </div>

                {/* Subject Name Input */}
                <input
                  id="input-subject-name"
                  type="text"
                  required
                  placeholder="Ví dụ: Chào Cờ & SHDC, Toán Học..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="grow h-12 px-4 text-sm sm:text-base rounded-2xl border border-gray-200 focus:outline-hidden focus:border-rose-400 focus:ring-2 focus:ring-rose-200 font-bold text-gray-800 bg-white transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* 4. CHỌN BIỂU TƯỢNG DỄ THƯƠNG (Matching image 2) */}
            <div>
              <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">
                CHỌN BIỂU TƯỢNG DỄ THƯƠNG
              </label>

              <div className="bg-[#FAFAFB] border border-gray-100 rounded-2xl p-2.5 space-y-1.5 shadow-2xs">
                {/* Row 1 */}
                <div className="flex items-center justify-between gap-1 overflow-x-auto py-0.5">
                  {CUTE_EMOJIS_ROW_1.map((emo) => (
                    <button
                      key={emo}
                      type="button"
                      onClick={() => setIcon(emo)}
                      className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-xl text-base transition-all hover:scale-115 cursor-pointer ${
                        icon === emo
                          ? 'border-2 border-rose-400 bg-rose-100/90 shadow-2xs scale-110'
                          : 'hover:bg-rose-50 text-gray-700'
                      }`}
                    >
                      {emo}
                    </button>
                  ))}
                </div>

                {/* Row 2 */}
                <div className="flex items-center justify-between gap-1 overflow-x-auto py-0.5">
                  {CUTE_EMOJIS_ROW_2.map((emo) => (
                    <button
                      key={emo}
                      type="button"
                      onClick={() => setIcon(emo)}
                      className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-xl text-base transition-all hover:scale-115 cursor-pointer ${
                        icon === emo
                          ? 'border-2 border-rose-400 bg-rose-100/90 shadow-2xs scale-110'
                          : 'hover:bg-rose-50 text-gray-700'
                      }`}
                    >
                      {emo}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. TÔNG MÀU PASTEL DỊU DÀNG (Matching image 2) */}
            <div>
              <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">
                TÔNG MÀU PASTEL DỊU DÀNG
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {MODAL_COLOR_ORDER.map((key) => {
                  const preset = COLOR_PRESETS[key] || COLOR_PRESETS.rose;
                  const isSelected = colorTheme === key;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setColorTheme(key)}
                      className={`py-2 px-3 rounded-2xl border flex items-center gap-2 transition-all cursor-pointer ${
                        preset.bg
                      } ${isSelected ? 'border-2 border-rose-500 ring-2 ring-rose-200/80 shadow-xs font-bold scale-102' : `${preset.border} hover:opacity-90 font-medium`}`}
                    >
                      <span className={`w-3 h-3 rounded-full ${preset.dot} shrink-0`}></span>
                      <span className="text-xs text-gray-800 truncate">{preset.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6. GIÁO VIÊN PHỤ TRÁCH & PHÒNG HỌC (Matching image 2) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1 text-xs font-bold text-gray-700 mb-1">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <span>Giáo viên phụ trách</span>
                </label>
                <input
                  id="input-teacher-name"
                  type="text"
                  placeholder="Ví dụ: Thầy Minh, Cô Lan..."
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                  className="w-full h-10 px-3.5 text-xs rounded-2xl border border-gray-200 focus:outline-hidden focus:border-rose-400 focus:ring-2 focus:ring-rose-200 bg-white font-medium text-gray-800"
                />
              </div>

              <div>
                <label className="flex items-center gap-1 text-xs font-bold text-gray-700 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>Phòng học / Địa điểm</span>
                </label>
                <input
                  id="input-room-name"
                  type="text"
                  placeholder="Ví dụ: Sân Trường, A201, Phòng Lý..."
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="w-full h-10 px-3.5 text-xs rounded-2xl border border-gray-200 focus:outline-hidden focus:border-rose-400 focus:ring-2 focus:ring-rose-200 bg-white font-medium text-gray-800"
                />
              </div>
            </div>

            {/* 7. GHI CHÚ & DẶN DÒ BÀI TẬP (Matching image 2) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Ghi chú &amp; Dặn dò bài tập
              </label>
              <textarea
                id="input-notes"
                rows={2}
                placeholder="Ví dụ: Mặc đồng phục áo dài / chỉnh tề, kiểm tra 15p..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 text-xs rounded-2xl border border-gray-200 focus:outline-hidden focus:border-rose-400 focus:ring-2 focus:ring-rose-200 bg-white text-gray-800"
              ></textarea>
            </div>

            {/* OPTIONAL CHECKLIST EXPANDER (For task checklist) */}
            <div>
              <button
                type="button"
                onClick={() => setShowTasks(!showTasks)}
                className="text-xs font-semibold text-gray-500 hover:text-purple-600 flex items-center gap-1 transition-colors"
              >
                <ListTodo className="w-3.5 h-3.5 text-purple-500" />
                <span>
                  {showTasks
                    ? 'Thu gọn danh sách việc cần làm'
                    : `+ Thêm danh sách việc cần làm (${tasks.length})`}
                </span>
              </button>

              {showTasks && (
                <div className="mt-2 border border-purple-100 rounded-2xl p-3 bg-purple-50/20 space-y-2">
                  <div className="space-y-1.5 max-h-24 overflow-y-auto">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-gray-100 text-xs shadow-2xs"
                      >
                        <label className="flex items-center gap-2 cursor-pointer grow">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => handleToggleTask(task.id)}
                            className="rounded text-rose-500 focus:ring-rose-400"
                          />
                          <span
                            className={
                              task.completed ? 'line-through text-gray-400' : 'text-gray-700'
                            }
                          >
                            {task.text}
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveTask(task.id)}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nhiệm vụ: soạn đề cương, làm bài 1..."
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTask(e);
                        }
                      }}
                      className="grow text-xs px-3 py-1.5 bg-white rounded-xl border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={handleAddTask}
                      className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl text-xs font-bold transition-colors"
                    >
                      + Thêm
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 8. MODAL ACTIONS (Save, Cancel, Delete) */}
            <div className="pt-3 border-t border-rose-100 flex items-center justify-between gap-2">
              {cellData && onDelete ? (
                <button
                  id="btn-delete-cell"
                  type="button"
                  onClick={() => {
                    onDelete(cellData.id);
                    onClose();
                  }}
                  className="px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa môn này</span>
                </button>
              ) : (
                <div></div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  id="btn-save-cell"
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 rounded-xl shadow-xs transition-all hover:scale-102 active:scale-95 cursor-pointer"
                >
                  Lưu tiết học ✨
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right accent pink bar matching the vertical pink line in image 2 */}
        <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-pink-200/90 pointer-events-none rounded-r-3xl"></div>
      </div>
    </div>
  );
};
