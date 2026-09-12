import React, { useState } from 'react';
import { X, Copy, ArrowRight, Check, AlertCircle, Sparkles, BookOpen } from 'lucide-react';
import { WeekData, WorkspaceId, ScheduleCell } from '../types';
import { WORKSPACE_USERS } from '../data/scheduleConfig';

interface CopyWeekModalProps {
  isOpen: boolean;
  currentWeek: WeekData;
  weeks: WeekData[];
  cells: Record<string, ScheduleCell>;
  currentWorkspaceId: WorkspaceId;
  onClose: () => void;
  onConfirmCopy: (
    sourceWeekId: string,
    targetWeekId: string,
    workspaceScope: 'all' | WorkspaceId,
    copyNotes: boolean
  ) => void;
}

export const CopyWeekModal: React.FC<CopyWeekModalProps> = ({
  isOpen,
  currentWeek,
  weeks,
  cells,
  currentWorkspaceId,
  onClose,
  onConfirmCopy,
}) => {
  // Candidate source weeks: all weeks except currentWeek
  const otherWeeks = weeks.filter((w) => w.id !== currentWeek.id);
  
  // Default to week_1 if it's not currentWeek, else the first other week
  const defaultSourceWeekId =
    otherWeeks.find((w) => w.id === 'week_1')?.id || (otherWeeks[0]?.id ?? '');

  const [selectedSourceWeekId, setSelectedSourceWeekId] = useState<string>(defaultSourceWeekId);
  const [scope, setScope] = useState<'all' | WorkspaceId>('all');
  const [copyNotes, setCopyNotes] = useState<boolean>(true);

  if (!isOpen) return null;

  const sourceWeek = weeks.find((w) => w.id === selectedSourceWeekId) || otherWeeks[0];

  // Count classes in source week
  const getCellCount = (weekId: string, wsId?: WorkspaceId) => {
    return Object.keys(cells).filter((k) => {
      if (wsId) {
        return k.startsWith(`${wsId}_${weekId}_`);
      }
      return k.includes(`_${weekId}_`);
    }).length;
  };

  const sourceTotalCells = sourceWeek ? getCellCount(sourceWeek.id) : 0;
  const sourceLanVyCells = sourceWeek ? getCellCount(sourceWeek.id, 'lan_vy') : 0;
  const sourceKimAnhCells = sourceWeek ? getCellCount(sourceWeek.id, 'kim_anh') : 0;

  const currentWsUser = WORKSPACE_USERS[currentWorkspaceId];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSourceWeekId) return;

    onConfirmCopy(selectedSourceWeekId, currentWeek.id, scope, copyNotes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-rose-100 shadow-2xl max-w-lg w-full p-6 text-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-rose-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-100 to-rose-100 text-purple-700 flex items-center justify-center font-bold shadow-2xs">
              <Copy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-gray-800">
                Sao Chép Thời Khóa Biểu
              </h3>
              <p className="text-xs text-gray-500">
                Chép toàn bộ môn học từ tuần khác sang{' '}
                <span className="font-bold text-rose-600">{currentWeek.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-rose-50 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Visual Source -> Target flow */}
          <div className="p-3.5 bg-gradient-to-r from-purple-50 via-pink-50/70 to-rose-50 rounded-2xl border border-purple-100 flex items-center justify-between gap-2">
            <div className="flex-1 bg-white/90 p-2.5 rounded-xl border border-purple-100 text-center shadow-2xs">
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block mb-0.5">
                Tuần nguồn
              </span>
              <span className="font-bold text-gray-800 text-xs truncate block">
                {sourceWeek?.name || 'Chưa chọn'}
              </span>
              <span className="text-[10px] text-gray-500 block mt-0.5">
                {sourceTotalCells} tiết học có sẵn
              </span>
            </div>

            <div className="flex flex-col items-center shrink-0 px-1">
              <span className="text-[10px] text-rose-600 font-bold bg-white px-2 py-0.5 rounded-full border border-rose-200 shadow-2xs">
                Chép sang
              </span>
              <ArrowRight className="w-5 h-5 text-rose-500 mt-1" />
            </div>

            <div className="flex-1 bg-white/90 p-2.5 rounded-xl border border-rose-100 text-center shadow-2xs">
              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block mb-0.5">
                Tuần đích (Hiện tại)
              </span>
              <span className="font-bold text-rose-800 text-xs truncate block">
                {currentWeek.name}
              </span>
              <span className="text-[10px] text-gray-500 block mt-0.5">
                Được cập nhật ngay
              </span>
            </div>
          </div>

          {/* 1. Select Source Week */}
          <div>
            <label className="block font-bold text-gray-700 mb-1.5">
              Chọn tuần muốn sao chép lịch: <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedSourceWeekId}
              onChange={(e) => setSelectedSourceWeekId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-300 font-semibold text-gray-800 bg-white"
            >
              {otherWeeks.map((w) => {
                const count = getCellCount(w.id);
                return (
                  <option key={w.id} value={w.id}>
                    {w.name} ({count > 0 ? `${count} tiết có sẵn` : 'Đang trống'})
                  </option>
                );
              })}
            </select>
          </div>

          {/* 2. Scope Selection */}
          <div>
            <label className="block font-bold text-gray-700 mb-1.5">
              Phạm vi áp dụng:
            </label>
            <div className="space-y-2">
              {/* Option A: All workspaces (Lan Vy + Kim Ánh) */}
              <label
                onClick={() => setScope('all')}
                className={`flex items-start gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all ${
                  scope === 'all'
                    ? 'bg-purple-50/80 border-purple-300 ring-1 ring-purple-300'
                    : 'bg-white hover:bg-gray-50 border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  name="scope"
                  checked={scope === 'all'}
                  onChange={() => setScope('all')}
                  className="mt-0.5 text-purple-600 focus:ring-purple-400"
                />
                <div>
                  <div className="font-bold text-gray-800 flex items-center gap-1.5">
                    <span>🌸 Sao chép cho cả Lan Vy &amp; ✨ Kim Ánh</span>
                    <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded-full font-bold">
                      Khuyên dùng
                    </span>
                  </div>
                  <p className="text-gray-500 mt-0.5 text-[11px]">
                    Đồng bộ cả lịch học chính khóa của Lan Vy ({sourceLanVyCells} tiết) và Kim Ánh ({sourceKimAnhCells} tiết) sang {currentWeek.name}.
                  </p>
                </div>
              </label>

              {/* Option B: Only current workspace */}
              <label
                onClick={() => setScope(currentWorkspaceId)}
                className={`flex items-start gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all ${
                  scope === currentWorkspaceId
                    ? 'bg-rose-50/80 border-rose-300 ring-1 ring-rose-300'
                    : 'bg-white hover:bg-gray-50 border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  name="scope"
                  checked={scope === currentWorkspaceId}
                  onChange={() => setScope(currentWorkspaceId)}
                  className="mt-0.5 text-rose-600 focus:ring-rose-400"
                />
                <div>
                  <div className="font-bold text-gray-800">
                    Chỉ sao chép cho {currentWsUser.avatar} {currentWsUser.displayName}
                  </div>
                  <p className="text-gray-500 mt-0.5 text-[11px]">
                    Chỉ cập nhật lịch học cá nhân của {currentWsUser.displayName}, không thay đổi lịch của người kia.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* 3. Option: Copy Evening notes & self study */}
          <label className="flex items-center gap-2 p-3 rounded-xl bg-gray-50/80 border border-gray-200 cursor-pointer hover:bg-gray-100/60 transition-colors">
            <input
              type="checkbox"
              checked={copyNotes}
              onChange={(e) => setCopyNotes(e.target.checked)}
              className="rounded text-purple-600 focus:ring-purple-400 w-4 h-4"
            />
            <div className="flex items-center gap-1.5 font-medium text-gray-700 text-xs">
              <BookOpen className="w-3.5 h-3.5 text-purple-600" />
              <span>Chép kèm cả Mục tiêu &amp; Sổ tay ghi chú ôn tập tối</span>
            </div>
          </label>

          {/* Warning note */}
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-[11px]">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Lưu ý: Các tiết học hiện có trong <strong>{currentWeek.name}</strong> sẽ được thay thế bằng lịch của <strong>{sourceWeek?.name}</strong>. Bạn vẫn có thể tùy chỉnh lại từng ô sau khi chép!
            </span>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-rose-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!sourceWeek || sourceTotalCells === 0}
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-rose-500 hover:from-purple-700 hover:to-rose-600 rounded-xl shadow-xs transition-all hover:scale-102 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Sao chép sang {currentWeek.name}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
