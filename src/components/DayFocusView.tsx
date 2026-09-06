import React from 'react';
import {
  Clock,
  Coffee,
  Sun,
  Sunset,
  Moon,
  Copy,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { DayInfo, TimeSlot, ScheduleCell, WorkspaceId, WeekData } from '../types';
import { DAYS_OF_WEEK, TIME_SLOTS, WORKSPACE_USERS } from '../data/scheduleConfig';
import { ScheduleCellCard } from './ScheduleCellCard';
import { getDayDateStr, getDayFullDateStr } from '../utils/dateUtils';

interface DayFocusViewProps {
  currentWorkspaceId: WorkspaceId;
  myIdentity: WorkspaceId;
  currentWeekId: string;
  currentWeek?: WeekData;
  selectedDayId: string;
  onSelectDayId: (dayId: string) => void;
  cells: Record<string, ScheduleCell>;
  onEditCell: (dayId: string, slotId: string, existingCell?: ScheduleCell) => void;
  onDeleteCell: (cellId: string) => void;
  onSyncSingleCell: (cellId: string) => void;
  onSyncDayToMe: (dayId: string) => void;
}

export const DayFocusView: React.FC<DayFocusViewProps> = ({
  currentWorkspaceId,
  myIdentity,
  currentWeekId,
  currentWeek,
  selectedDayId,
  onSelectDayId,
  cells,
  onEditCell,
  onDeleteCell,
  onSyncSingleCell,
  onSyncDayToMe,
}) => {
  const isReadOnly = currentWorkspaceId !== myIdentity;
  const myUser = WORKSPACE_USERS[myIdentity];
  const currentDayInfo =
    DAYS_OF_WEEK.find((d) => d.id === selectedDayId) || DAYS_OF_WEEK[0];

  const currentIndex = DAYS_OF_WEEK.findIndex((d) => d.id === selectedDayId);
  const prevDay =
    DAYS_OF_WEEK[(currentIndex - 1 + DAYS_OF_WEEK.length) % DAYS_OF_WEEK.length];
  const nextDay = DAYS_OF_WEEK[(currentIndex + 1) % DAYS_OF_WEEK.length];

  const getCellKey = (slotId: string) =>
    `${currentWorkspaceId}_${currentWeekId}_${selectedDayId}_${slotId}`;

  const morningSlots = TIME_SLOTS.filter((s) => s.type === 'morning');
  const afternoonSlots = TIME_SLOTS.filter((s) => s.type === 'afternoon');
  const eveningBreakSlot = TIME_SLOTS.find((s) => s.id === 'ev_break');
  const selfStudySlot = TIME_SLOTS.find((s) => s.id === 'self_study');

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Day Selector Bar */}
      <div className="bg-white rounded-2xl border border-rose-100 p-3 shadow-2xs flex items-center justify-between gap-2">
        <button
          onClick={() => onSelectDayId(prevDay.id)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-rose-50 text-gray-700 text-xs font-bold transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-rose-500" />
          <span className="hidden sm:inline">{prevDay.name}</span>
        </button>

        <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-2">
          {DAYS_OF_WEEK.map((d, dIdx) => {
            const dateStr = getDayDateStr(currentWeek?.startDate, dIdx);
            return (
              <button
                key={d.id}
                onClick={() => onSelectDayId(d.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-1 ${
                  selectedDayId === d.id
                    ? 'bg-rose-500 text-white shadow-xs scale-105'
                    : 'text-gray-600 hover:bg-rose-50 hover:text-rose-700'
                }`}
              >
                <span>{d.name}</span>
                {dateStr && (
                  <span
                    className={`text-[10px] font-semibold px-1 rounded ${
                      selectedDayId === d.id
                        ? 'bg-rose-600/70 text-white'
                        : 'bg-rose-100/70 text-rose-700'
                    }`}
                  >
                    {dateStr}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onSelectDayId(nextDay.id)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-rose-50 text-gray-700 text-xs font-bold transition-colors"
        >
          <span className="hidden sm:inline">{nextDay.name}</span>
          <ChevronRight className="w-4 h-4 text-rose-500" />
        </button>
      </div>

      {/* Main Day Container */}
      <div className="bg-white rounded-3xl border border-rose-100 p-4 sm:p-6 shadow-xs space-y-6">
        {/* Day Header with Sync */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-rose-100">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-gray-800 flex items-center gap-2">
              <span>{currentDayInfo.name}</span>
              {currentWeek?.startDate && (
                <span className="text-sm font-bold text-rose-600 bg-rose-50 border border-rose-200/80 px-2.5 py-0.5 rounded-lg">
                  {getDayFullDateStr(currentWeek.startDate, currentIndex)}
                </span>
              )}
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700">
                {selectedDayId === 'sun' ? 'Ngày nghỉ thảnh thơi' : 'Lịch học tập'}
              </span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Đầy đủ 5 tiết sáng (7h), 4 tiết chiều (1h30), nghỉ ngơi &amp; tự học đêm (8h30 - 10h)
            </p>
          </div>

          {isReadOnly && (
            <button
              id={`btn-dayfocus-sync-${selectedDayId}`}
              onClick={() => onSyncDayToMe(selectedDayId)}
              className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-all"
            >
              <Copy className="w-4 h-4" />
              <span>Chép toàn bộ {currentDayInfo.name} sang lịch tôi</span>
            </button>
          )}
        </div>

        {/* BUỔI SÁNG (5 TIẾT) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sky-800 font-bold text-sm">
            <Sun className="w-4 h-4 text-sky-600" />
            <span>Buổi Sáng (07:00 - 11:15)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {morningSlots.map((slot) => {
              const cellData = cells[getCellKey(slot.id)];
              return (
                <div key={slot.id} className="border border-rose-100 rounded-2xl p-3 bg-gray-50/50">
                  <div className="flex items-center justify-between mb-2 text-xs">
                    <span className="font-extrabold text-gray-800">{slot.name}</span>
                    <span className="text-gray-500 font-medium">
                      {slot.startTime} - {slot.endTime} (45p)
                    </span>
                  </div>
                  <ScheduleCellCard
                    cell={cellData}
                    slotId={slot.id}
                    dayId={selectedDayId}
                    isReadOnly={isReadOnly}
                    myIdentity={myIdentity}
                    currentWorkspaceId={currentWorkspaceId}
                    onEdit={() => onEditCell(selectedDayId, slot.id, cellData)}
                    onDelete={() => cellData && onDeleteCell(cellData.id)}
                    onSyncCellToMe={() => cellData && onSyncSingleCell(cellData.id)}
                  />
                  {slot.breakDescription && (
                    <div className="mt-2 text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <Coffee className="w-3 h-3" />
                      <span>{slot.breakDescription}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* NGHỈ TRƯA */}
        <div className="p-3 bg-teal-50 rounded-2xl border border-teal-200 text-teal-800 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span>🍱</span>
            <span>Nghỉ trưa &amp; Ăn trưa thư giãn (11:15 - 13:30)</span>
          </div>
          <span className="text-[11px] text-teal-600">135 phút</span>
        </div>

        {/* BUỔI CHIỀU (4 TIẾT) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-orange-800 font-bold text-sm">
            <Sunset className="w-4 h-4 text-orange-600" />
            <span>Buổi Chiều (13:30 - 17:00)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {afternoonSlots.map((slot) => {
              const cellData = cells[getCellKey(slot.id)];
              return (
                <div key={slot.id} className="border border-orange-100 rounded-2xl p-3 bg-gray-50/50">
                  <div className="flex items-center justify-between mb-2 text-xs">
                    <span className="font-extrabold text-gray-800">{slot.name}</span>
                    <span className="text-gray-500 font-medium">
                      {slot.startTime} - {slot.endTime} (45p)
                    </span>
                  </div>
                  <ScheduleCellCard
                    cell={cellData}
                    slotId={slot.id}
                    dayId={selectedDayId}
                    isReadOnly={isReadOnly}
                    myIdentity={myIdentity}
                    currentWorkspaceId={currentWorkspaceId}
                    onEdit={() => onEditCell(selectedDayId, slot.id, cellData)}
                    onDelete={() => cellData && onDeleteCell(cellData.id)}
                    onSyncCellToMe={() => cellData && onSyncSingleCell(cellData.id)}
                  />
                  {slot.breakDescription && (
                    <div className="mt-2 text-[10px] text-orange-700 bg-orange-50 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <Coffee className="w-3 h-3" />
                      <span>{slot.breakDescription}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CHIỀU TỐI & TỰ HỌC ĐÊM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
          {eveningBreakSlot && (
            <div className="border border-purple-100 rounded-2xl p-3.5 bg-purple-50/30">
              <div className="flex items-center justify-between mb-2 text-xs font-bold text-purple-900">
                <span className="flex items-center gap-1">
                  <span>🏸</span> {eveningBreakSlot.name}
                </span>
                <span className="text-gray-500 font-normal">17:00 - 20:30</span>
              </div>
              <ScheduleCellCard
                cell={cells[getCellKey(eveningBreakSlot.id)]}
                slotId={eveningBreakSlot.id}
                dayId={selectedDayId}
                isReadOnly={isReadOnly}
                myIdentity={myIdentity}
                currentWorkspaceId={currentWorkspaceId}
                onEdit={() => onEditCell(selectedDayId, eveningBreakSlot.id, cells[getCellKey(eveningBreakSlot.id)])}
                onDelete={() => cells[getCellKey(eveningBreakSlot.id)] && onDeleteCell(cells[getCellKey(eveningBreakSlot.id)].id)}
                onSyncCellToMe={() => cells[getCellKey(eveningBreakSlot.id)] && onSyncSingleCell(cells[getCellKey(eveningBreakSlot.id)].id)}
              />
            </div>
          )}

          {selfStudySlot && (
            <div className="border border-indigo-200 rounded-2xl p-3.5 bg-indigo-50/30">
              <div className="flex items-center justify-between mb-2 text-xs font-bold text-indigo-900">
                <span className="flex items-center gap-1">
                  <Moon className="w-3.5 h-3.5 text-indigo-600" /> Tự học cá nhân &amp; Ôn tập
                </span>
                <span className="text-gray-500 font-normal">20:30 - 22:00</span>
              </div>
              <ScheduleCellCard
                cell={cells[getCellKey(selfStudySlot.id)]}
                slotId={selfStudySlot.id}
                dayId={selectedDayId}
                isReadOnly={isReadOnly}
                myIdentity={myIdentity}
                currentWorkspaceId={currentWorkspaceId}
                onEdit={() => onEditCell(selectedDayId, selfStudySlot.id, cells[getCellKey(selfStudySlot.id)])}
                onDelete={() => cells[getCellKey(selfStudySlot.id)] && onDeleteCell(cells[getCellKey(selfStudySlot.id)].id)}
                onSyncCellToMe={() => cells[getCellKey(selfStudySlot.id)] && onSyncSingleCell(cells[getCellKey(selfStudySlot.id)].id)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
