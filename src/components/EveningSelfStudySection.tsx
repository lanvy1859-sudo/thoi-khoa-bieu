import React, { useState, useEffect } from 'react';
import {
  Moon,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  BookOpen,
  Edit3,
  Save,
  Sparkles,
  Check,
  X,
  UserCheck,
} from 'lucide-react';
import { WorkspaceId, EveningStudyNotes, TaskItem } from '../types';
import { DAYS_OF_WEEK, WORKSPACE_USERS } from '../data/scheduleConfig';

interface EveningSelfStudySectionProps {
  currentWorkspaceId: WorkspaceId;
  myIdentity: WorkspaceId;
  currentWeekId: string;
  eveningNotes: Record<string, EveningStudyNotes>;
  onSaveEveningNotes: (note: EveningStudyNotes) => void;
  onChangeIdentity?: (id: WorkspaceId) => void;
}

export const EveningSelfStudySection: React.FC<EveningSelfStudySectionProps> = ({
  currentWorkspaceId,
  myIdentity,
  currentWeekId,
  eveningNotes,
  onSaveEveningNotes,
  onChangeIdentity,
}) => {
  const [selectedDay, setSelectedDay] = useState<string>('mon');
  const [newTaskInput, setNewTaskInput] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [draftNotes, setDraftNotes] = useState('');
  const [draftGoals, setDraftGoals] = useState('');
  const [justSaved, setJustSaved] = useState(false);

  const isReadOnly = currentWorkspaceId !== myIdentity;
  const currentWs = WORKSPACE_USERS[currentWorkspaceId];

  // Normalized key for current day
  const noteKey = `${currentWorkspaceId}_${currentWeekId}_${selectedDay}`;

  // Robust lookup across possible key formats
  const foundNote =
    eveningNotes[noteKey] ||
    eveningNotes[`${noteKey}_evening`] ||
    (selectedDay === 'mon'
      ? eveningNotes[`${currentWorkspaceId}_${currentWeekId}`] ||
        eveningNotes[`${currentWorkspaceId}_${currentWeekId}_evening`]
      : undefined);

  const currentNote: EveningStudyNotes = {
    id: noteKey,
    goals: foundNote?.goals || '',
    notes: foundNote?.notes || '',
    tasks: foundNote?.tasks || [],
    mood: foundNote?.mood || '🌸 Hào hứng và tập trung',
  };

  // Keep draft in sync whenever day or saved notes change
  useEffect(() => {
    if (!isEditingNotes) {
      setDraftGoals(currentNote.goals);
      setDraftNotes(currentNote.notes);
    }
  }, [
    selectedDay,
    currentWorkspaceId,
    currentWeekId,
    currentNote.goals,
    currentNote.notes,
    isEditingNotes,
  ]);

  const handleToggleTask = (taskId: string) => {
    if (isReadOnly) return;
    const updatedTasks = (currentNote.tasks || []).map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    onSaveEveningNotes({
      ...currentNote,
      id: noteKey,
      tasks: updatedTasks,
    });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || !newTaskInput.trim()) return;

    const newTask: TaskItem = {
      id: `task_${Date.now()}`,
      text: newTaskInput.trim(),
      completed: false,
    };

    onSaveEveningNotes({
      ...currentNote,
      id: noteKey,
      tasks: [...(currentNote.tasks || []), newTask],
    });
    setNewTaskInput('');
  };

  const handleDeleteTask = (taskId: string) => {
    if (isReadOnly) return;
    const updatedTasks = (currentNote.tasks || []).filter((t) => t.id !== taskId);
    onSaveEveningNotes({
      ...currentNote,
      id: noteKey,
      tasks: updatedTasks,
    });
  };

  const handleStartEdit = () => {
    setDraftGoals(currentNote.goals || '');
    setDraftNotes(currentNote.notes || '');
    setIsEditingNotes(true);
  };

  const handleCancelEdit = () => {
    setDraftGoals(currentNote.goals || '');
    setDraftNotes(currentNote.notes || '');
    setIsEditingNotes(false);
  };

  const handleSaveNotes = () => {
    const updatedNote: EveningStudyNotes = {
      ...currentNote,
      id: noteKey,
      goals: draftGoals.trim(),
      notes: draftNotes.trim(),
    };
    onSaveEveningNotes(updatedNote);
    setIsEditingNotes(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  };

  const handleKeyDownEditor = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSaveNotes();
    }
  };

  const selectedDayInfo = DAYS_OF_WEEK.find((d) => d.id === selectedDay) || DAYS_OF_WEEK[0];

  return (
    <div className="bg-gradient-to-br from-purple-50/90 via-rose-50/50 to-indigo-50/70 rounded-2xl border border-purple-200/80 p-4 sm:p-6 shadow-xs mt-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-purple-200/60">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-900 text-purple-200 flex items-center justify-center text-lg shadow-xs">
            <Moon className="w-5 h-5 text-purple-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-base sm:text-lg text-indigo-950">
                Góc Tự Học &amp; Sổ Tay Ghi Chú (20:30 - 22:00)
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold">
                {currentWs.avatar} {currentWs.displayName}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Không gian cá nhân hóa: Lên mục tiêu 90 phút, checklist bài tập về nhà &amp; sổ tay ghi nhớ kiến thức
            </p>
          </div>
        </div>

        {/* Day selection tabs */}
        <div className="flex items-center gap-1 bg-white/80 p-1 rounded-xl border border-purple-200/60 shadow-2xs overflow-x-auto max-w-full">
          {DAYS_OF_WEEK.map((d) => (
            <button
              key={d.id}
              onClick={() => {
                setSelectedDay(d.id);
                setIsEditingNotes(false);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                selectedDay === d.id
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50'
              }`}
            >
              {d.shortName}
            </button>
          ))}
        </div>
      </div>

      {/* Read-only warning with switch identity button */}
      {isReadOnly && (
        <div className="mt-3 p-2.5 bg-amber-50/90 rounded-xl border border-amber-200/80 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <span className="text-sm">🔒</span>
            <span>
              Bạn đang xem góc tự học của <strong>{currentWs.displayName}</strong>.
            </span>
          </div>
          {onChangeIdentity && (
            <button
              onClick={() => onChangeIdentity(currentWorkspaceId)}
              className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-800 font-bold rounded-lg border border-amber-300 shadow-2xs transition-colors flex items-center gap-1"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>Chuyển sang sửa với tư cách {currentWs.displayName}</span>
            </button>
          )}
        </div>
      )}

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-4">
        {/* Left Column: To-Do Checklist for this evening */}
        <div className="bg-white/90 rounded-xl p-4 border border-purple-100 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 font-bold text-sm text-gray-800">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <span>Nhiệm vụ {selectedDayInfo.name}</span>
                <span className="text-xs font-normal text-gray-500">
                  ({(currentNote.tasks || []).filter((t) => t.completed).length}/
                  {(currentNote.tasks || []).length} hoàn thành)
                </span>
              </div>
            </div>

            {/* Tasks list */}
            <div className="space-y-2 min-h-[120px] max-h-[220px] overflow-y-auto pr-1">
              {(!currentNote.tasks || currentNote.tasks.length === 0) && (
                <div className="text-center py-6 text-xs text-gray-400 italic">
                  Chưa có nhiệm vụ nào cho tối {selectedDayInfo.name}.{' '}
                  {!isReadOnly && 'Thêm bài tập cần làm bên dưới nhé! ✨'}
                </div>
              )}

              {(currentNote.tasks || []).map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  className={`flex items-center justify-between p-2 rounded-lg border transition-all text-xs cursor-pointer ${
                    task.completed
                      ? 'bg-purple-50/50 border-purple-200 text-gray-400 line-through'
                      : 'bg-white hover:bg-purple-50/30 border-gray-200 text-gray-700 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-400 shrink-0" />
                    )}
                    <span className="truncate">{task.text}</span>
                  </div>

                  {!isReadOnly && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTask(task.id);
                      }}
                      className="text-gray-400 hover:text-red-500 p-1 opacity-60 hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Add Task Input */}
          {!isReadOnly ? (
            <form onSubmit={handleAddTask} className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
              <input
                type="text"
                placeholder="Thêm bài tập, ôn tập từ vựng, giải đề..."
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-purple-200 focus:outline-hidden focus:ring-2 focus:ring-purple-300"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm
              </button>
            </form>
          ) : (
            <div className="mt-3 pt-2 border-t border-gray-100 text-[11px] text-gray-400 italic text-center">
              Chế độ chỉ đọc: Đang xem checklist của {currentWs.displayName}
            </div>
          )}
        </div>

        {/* Right Column: Revision Notes & Study Goals */}
        <div className="bg-white/90 rounded-xl p-4 border border-purple-100 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 font-bold text-sm text-gray-800">
                <BookOpen className="w-4 h-4 text-rose-500" />
                <span>Sổ Tay Ghi Chú Ôn Tập &amp; Trọng Tâm</span>
              </div>

              <div className="flex items-center gap-2">
                {justSaved && (
                  <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs animate-in fade-in">
                    <Check className="w-3.5 h-3.5" /> Đã lưu!
                  </span>
                )}

                {!isReadOnly && (
                  <div>
                    {isEditingNotes ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs font-semibold transition-colors"
                        >
                          <X className="w-3 h-3" /> Hủy
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveNotes}
                          className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold transition-colors shadow-2xs"
                        >
                          <Save className="w-3.5 h-3.5" /> Lưu
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStartEdit}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-purple-700 hover:bg-purple-50 rounded-md border border-purple-200 transition-colors"
                      >
                        <Edit3 className="w-3 h-3" /> Sửa ghi chú
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {isEditingNotes ? (
              <div className="space-y-3" onKeyDown={handleKeyDownEditor}>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">
                    🎯 Mục tiêu trọng tâm tối {selectedDayInfo.name}:
                  </label>
                  <input
                    type="text"
                    value={draftGoals}
                    onChange={(e) => setDraftGoals(e.target.value)}
                    placeholder="Ví dụ: Nắm chắc 3 công thức lượng giác, viết xong mở bài..."
                    className="w-full text-xs p-2.5 rounded-lg border border-purple-200 focus:outline-hidden focus:ring-2 focus:ring-purple-300 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">
                    📝 Ghi chú bài học, lưu ý của thầy cô:
                  </label>
                  <textarea
                    rows={4}
                    value={draftNotes}
                    onChange={(e) => setDraftNotes(e.target.value)}
                    placeholder="Nhớ nộp bài tập Hóa lúc 7h sáng mai. Đọc lại tác phẩm Vợ Nhặt trang 24..."
                    className="w-full text-xs p-2.5 rounded-lg border border-purple-200 focus:outline-hidden focus:ring-2 focus:ring-purple-300 bg-white"
                  ></textarea>
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span>Nhấn <strong>Ctrl + Enter</strong> để lưu nhanh</span>
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-2xs"
                  >
                    <Save className="w-3 h-3" /> Lưu thay đổi
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 text-xs text-gray-700">
                <div className="bg-purple-50/60 p-3 rounded-xl border border-purple-100">
                  <div className="font-bold text-purple-900 flex items-center gap-1 mb-1 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    Mục tiêu buổi tối:
                  </div>
                  <p className="text-gray-700 italic">
                    {currentNote.goals || (
                      <span className="text-gray-400">
                        Chưa đặt mục tiêu.{' '}
                        {!isReadOnly && 'Bấm "Sửa ghi chú" để thêm mục tiêu!'}
                      </span>
                    )}
                  </p>
                </div>

                <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-100 min-h-[70px]">
                  <div className="font-bold text-rose-900 mb-1 text-[11px]">
                    📝 Ghi chú chi tiết &amp; ôn tập:
                  </div>
                  <p className="whitespace-pre-line text-gray-600">
                    {currentNote.notes || (
                      <span className="text-gray-400">
                        Chưa có ghi chú nào cho tối nay.{' '}
                        {!isReadOnly && 'Bấm "Sửa ghi chú" để ghi lại dặn dò của thầy cô!'}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
            <span className="italic">💡 Mẹo: Nghỉ giải lao 5 phút sau mỗi 45 phút học Pomodoro!</span>
            <span className="font-semibold text-purple-700">20:30 - 22:00</span>
          </div>
        </div>
      </div>
    </div>
  );
};
