import React from 'react';
import {
  MapPin,
  User,
  Copy,
  Pencil,
  Trash2,
  Plus,
} from 'lucide-react';
import { ScheduleCell, WorkspaceId } from '../types';
import { COLOR_PRESETS, WORKSPACE_USERS } from '../data/scheduleConfig';

interface ScheduleCellCardProps {
  cell?: ScheduleCell;
  slotId: string;
  dayId: string;
  isReadOnly: boolean;
  myIdentity: WorkspaceId;
  currentWorkspaceId: WorkspaceId;
  onEdit: () => void;
  onDelete: () => void;
  onSyncCellToMe: () => void;
  isCompact?: boolean;
}

// Fallback icons for known subject titles if cell.icon is not set
const getSubjectIcon = (subject: string, customIcon?: string) => {
  if (customIcon) return customIcon;
  const s = subject.toLowerCase();
  if (s.includes('chào cờ') || s.includes('shdc') || s.includes('sinh hoạt')) return '🌸';
  if (s.includes('vật lý') || s.includes('lý')) return '⚡';
  if (s.includes('toán')) return '📐';
  if (s.includes('văn')) return '📖';
  if (s.includes('ôn tập') || s.includes('nâng cao')) return '📚';
  if (s.includes('hóa')) return '🧪';
  if (s.includes('địa')) return '🌍';
  if (s.includes('anh') || s.includes('tiếng anh')) return '🇬🇧';
  if (s.includes('sinh')) return '🌿';
  if (s.includes('sử') || s.includes('lịch sử')) return '📜';
  if (s.includes('gdcd') || s.includes('công dân')) return '⚖️';
  if (s.includes('tin')) return '💻';
  if (s.includes('thể dục')) return '🏸';
  return '📝';
};

export const ScheduleCellCard: React.FC<ScheduleCellCardProps> = ({
  cell,
  slotId,
  dayId,
  isReadOnly,
  myIdentity,
  onEdit,
  onDelete,
  onSyncCellToMe,
}) => {
  const myUser = WORKSPACE_USERS[myIdentity];

  // EMPTY CELL STATE (Matches "+ Thêm" dashed card in screenshot)
  if (!cell || !cell.subject) {
    if (isReadOnly) {
      return (
        <div className="h-full min-h-[96px] rounded-2xl border border-dashed border-gray-200/70 bg-[#FAFAFB]/50 flex items-center justify-center p-2 text-gray-300 text-xs select-none">
          <span>— Trống —</span>
        </div>
      );
    }

    return (
      <button
        id={`btn-add-cell-${dayId}-${slotId}`}
        onClick={onEdit}
        className="group w-full h-full min-h-[96px] rounded-2xl border-2 border-dashed border-gray-200/90 hover:border-rose-300 bg-white/70 hover:bg-rose-50/40 p-2.5 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-rose-600 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
        title="Bấm để thêm môn học"
      >
        <div className="w-6 h-6 rounded-full border border-gray-300 group-hover:border-rose-400 group-hover:bg-rose-100 flex items-center justify-center transition-colors">
          <Plus className="w-3.5 h-3.5 text-gray-400 group-hover:text-rose-600" />
        </div>
        <span className="text-[11px] font-semibold">+ Thêm</span>
      </button>
    );
  }

  const preset = COLOR_PRESETS[cell.colorTheme || 'rose'] || COLOR_PRESETS.rose;
  const icon = getSubjectIcon(cell.subject, cell.icon);

  return (
    <div
      onClick={() => {
        if (!isReadOnly) onEdit();
      }}
      className={`group relative h-full min-h-[96px] rounded-2xl border ${preset.border} ${preset.bg} p-2.5 flex flex-col justify-between transition-all duration-150 shadow-2xs hover:shadow-xs cursor-pointer select-none`}
    >
      {/* Top Section: Subject Name with Icon & Action Controls */}
      <div>
        <div className="flex items-start justify-between gap-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm shrink-0">{icon}</span>
            <h4 className="text-xs sm:text-[13px] font-extrabold text-gray-800 truncate leading-tight tracking-tight">
              {cell.subject}
            </h4>
          </div>

          {/* Quick sync button for Read-Only mode */}
          {isReadOnly && (
            <button
              id={`btn-sync-cell-${cell.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onSyncCellToMe();
              }}
              className="shrink-0 flex items-center gap-1 bg-white hover:bg-purple-50 text-purple-700 hover:text-purple-900 border border-purple-300 px-1.5 py-0.5 rounded-md text-[10px] font-bold shadow-2xs transition-all hover:scale-105 active:scale-95"
              title={`Chép môn này sang lịch của ${myUser.displayName}`}
            >
              <Copy className="w-2.5 h-2.5 text-purple-600" />
              <span>Chép</span>
            </button>
          )}

          {/* Edit/Delete controls for Own Workspace */}
          {!isReadOnly && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 shrink-0">
              <button
                id={`btn-edit-cell-${cell.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-1 rounded-md bg-white/90 hover:bg-white text-gray-600 hover:text-rose-600 shadow-2xs transition-colors"
                title="Sửa môn"
              >
                <Pencil className="w-2.5 h-2.5" />
              </button>
              <button
                id={`btn-del-cell-${cell.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1 rounded-md bg-white/90 hover:bg-white text-gray-500 hover:text-red-500 shadow-2xs transition-colors"
                title="Xóa môn"
              >
                <Trash2 className="w-2.5 h-2.5" />
              </button>
            </div>
          )}
        </div>

        {/* Middle Section: Room & Teacher Pill Badges (Matches screenshot!) */}
        {(cell.room || cell.teacher) && (
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            {cell.room && (
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[10px] font-bold ${preset.roomBadge}`}
              >
                <MapPin className="w-2.5 h-2.5 shrink-0 opacity-70" />
                <span className="truncate max-w-[85px]">{cell.room}</span>
              </span>
            )}
            {cell.teacher && (
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[10px] font-semibold ${preset.teacherBadge}`}
              >
                <User className="w-2.5 h-2.5 shrink-0 opacity-70" />
                <span className="truncate max-w-[90px]">{cell.teacher}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom Section: Quoted notes (e.g. "Mặc đồng phục áo dài / chỉnh tề") */}
      {cell.notes && (
        <div className="mt-1.5 text-[10.5px] text-gray-500 italic truncate" title={cell.notes}>
          "{cell.notes}"
        </div>
      )}
    </div>
  );
};
