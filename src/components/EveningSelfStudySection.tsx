import React, { useState } from 'react';
import {
  Moon,
  BookOpen,
  CheckCircle2,
  Circle,
  Plus,
  Sparkles,
  Smile,
  Edit3,
  Save,
  Check,
  Trash2,
} from 'lucide-react';
import { DayInfo, EveningStudyNotes, TaskItem, WorkspaceId } from '../types';
import { DAYS_OF_WEEK, WORKSPACE_USERS } from '../data/scheduleConfig';

interface EveningSelfStudySectionProps {
  currentWorkspaceId: WorkspaceId;
  myIdentity: WorkspaceId;
  currentWeekId: string;
  eveningNotes: Record<string, EveningStudyNotes>;
  onSaveEveningNotes: (note: EveningStudyNotes) => void;
}

export const EveningSelfStudySection: React.FC<EveningSelfStudySectionProps> = ({
  currentWorkspaceId,
  myIdentity,
  currentWeekId,
  eveningNotes,
  onSaveEveningNotes,
}) => {
  const [selectedDay, setSelectedDay] = useState<string>('mon');
  const [newTaskInput, setNewTaskInput] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [draftNotes, setDraftNotes] = useState('');
  const [draftGoals, setDraftGoals] = useState('');

  const isReadOnly = currentWorkspaceId !== myIdentity;
  const currentWs = WORKSPACE_USERS[currentWorkspaceId];

  const noteKey = `${currentWorkspaceId}_${currentWeekId}_${selectedDay}`;
  const currentNote = eveningNotes[noteKey] || {
    id: `${currentWorkspaceId}_${currentWeekId}_${selectedDay}_evening`,
    goals: '',
    notes: '',
    tasks: [],
    mood: '🌸 Hào hứng và tập trung',
  };

  const handleToggleTask = (taskId: string) => {
    if (isReadOnly) return;
    const updatedTasks = (currentNote.tasks || []).map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    onSaveEveningNotes({
      ...currentNote,
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
      tasks: [...(currentNote.tasks || []), newTask],
    });
    setNewTaskInput('');
  };

  const handleDeleteTask = (taskId: string) => {
    if (isReadOnly) return;
    const updatedTasks = (currentNote.tasks || []).filter((t) => t.id !== taskId);
    onSaveEveningNotes({
      ...currentNote,
      tasks: updatedTasks,
    });
  };

  const handleStartEdit = () => {
    setDraftGoals(currentNote.goals || '');
    setDraftNotes(currentNote.notes || '');
    setIsEditingNotes(true);
  };

  const handleSaveNotes = () => {
    onSaveEveningNotes({
      ...currentNote,
      goals: draftGoals,
      notes: draftNotes,
    });
    setIsEditingNotes(false);
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
                Góc Tự Học &amp; Ghi Chú Ôn Tập (20:30 - 22:00)
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

          {/* Add Task Input (Disabled in read-only) */}
          {!isReadOnly ? (
            <form onSubmit={handleAddTask} className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
              <input
                type="text"
                placeholder="Thêm bài tập, ôn tập từ vựng, giải đề..."
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                className="grow text-xs px-3 py-1.5 rounded-lg border border-purple-200 focus:outline-hidden focus:ring-2 focus:ring-purple-300"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm</span>
              </button>
            </form>
          ) : (
            <div className="text-[11px] text-gray-600 text-center pt-2 italic">
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

              {!isReadOnly && (
                <div>
                  {isEditingNotes ? (
                    <button
                      onClick={handleSaveNotes}
                      className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold transition-colors shadow-2xs"
                    >
                      <Save className="w-3 h-3" /> Lưu
                    </button>
                  ) : (
                    <button
                      onClick={handleStartEdit}
                      className="flex items-center gap-1 px-2 py-0.5 text-xs text-purple-700 hover:bg-purple-50 rounded-md border border-purple-200 transition-colors"
                    >
                      <Edit3 className="w-3 h-3" /> Sửa ghi chú
                    </button>
                  )}
                </div>
              )}
            </div>

            {isEditingNotes ? (
              <div className="space-y-2">
                <div>
                  <label className="text-[11px] font-bold text-gray-600 block mb-0.5">
                    Mục tiêu trọng tâm tối nay:
                  </label>
                  <input
                    type="text"
                    value={draftGoals}
                    onChange={(e) => setDraftGoals(e.target.value)}
                    placeholder="Ví dụ: Nắm chắc 3 công thức lượng giác, viết xong mở bài..."
                    className="w-full text-xs p-2 rounded-lg border border-purple-200 focus:outline-hidden focus:ring-2 focus:ring-purple-300"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-600 block mb-0.5">
                    Ghi chú bài học, lưu ý của thầy cô:
                  </label>
                  <textarea
                    rows={4}
                    value={draftNotes}
                    onChange={(e) => setDraftNotes(e.target.value)}
                    placeholder="Nhớ nộp bài tập Hóa lúc 7h sáng mai. Đọc lại tác phẩm Vợ Nhặt trang 24..."
                    className="w-full text-xs p-2 rounded-lg border border-purple-200 focus:outline-hidden focus:ring-2 focus:ring-purple-300"
                  ></textarea>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 text-xs text-gray-700">
                <div className="bg-purple-50/50 p-2.5 rounded-lg border border-purple-100">
                  <div className="font-bold text-purple-900 flex items-center gap-1 mb-1 text-[11px]">
                    <Sparkles className="w-3 h-3 text-purple-600" />
                    Mục tiêu buổi tối:
                  </div>
                  <p className="text-gray-700 italic">
                    {currentNote.goals || 'Chưa đặt mục tiêu. Bấm "Sửa ghi chú" để thêm mục tiêu!'}
                  </p>
                </div>

                <div className="bg-rose-50/40 p-2.5 rounded-lg border border-rose-100 min-h-[60px]">
                  <div className="font-bold text-rose-900 mb-1 text-[11px]">
                    📝 Ghi chú chi tiết &amp; ôn tập:
                  </div>
                  <p className="whitespace-pre-line text-gray-600">
                    {currentNote.notes || 'Chưa có ghi chú nào cho tối nay.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
            <span className="italic">💡 Mẹo: Nghỉ giải lao 5 phút sau mỗi 45 phút học Pomodoro!</span>
            <span className="font-medium text-purple-700">20:30 - 22:00</span>
          </div>
        </div>
      </div>
    </div>
  );
};
