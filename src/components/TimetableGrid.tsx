import React, { useState } from 'react';
import {
  Clock,
  Coffee,
  Sun,
  Sunset,
  Moon,
  Copy,
  Filter,
} from 'lucide-react';
import { TimeSlot, ScheduleCell, WorkspaceId, WeekData } from '../types';
import { DAYS_OF_WEEK, TIME_SLOTS, WORKSPACE_USERS } from '../data/scheduleConfig';
import { ScheduleCellCard } from './ScheduleCellCard';
import { getDayDateStr, isDateToday } from '../utils/dateUtils';

interface TimetableGridProps {
  currentWorkspaceId: WorkspaceId;
  myIdentity: WorkspaceId;
  currentWeekId: string;
  currentWeek?: WeekData;
  cells: Record<string, ScheduleCell>;
  onEditCell: (dayId: string, slotId: string, existingCell?: ScheduleCell) => void;
  onDeleteCell: (cellId: string) => void;
  onSyncSingleCell: (cellId: string) => void;
  onSyncDayToMe: (dayId: string) => void;
  onSyncSlotToMe: (slotId: string) => void;
}

type ShiftFilter = 'all' | 'morning' | 'afternoon' | 'evening';

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  currentWorkspaceId,
  myIdentity,
  currentWeekId,
  currentWeek,
  cells,
  onEditCell,
  onDeleteCell,
  onSyncSingleCell,
  onSyncDayToMe,
}) => {
  const isReadOnly = currentWorkspaceId !== myIdentity;
  const myUser = WORKSPACE_USERS[myIdentity];

  // Filter state for Khung giờ
  const [shiftFilter, setShiftFilter] = useState<ShiftFilter>('all');

  const getCellKey = (dayId: string, slotId: string) =>
    `${currentWorkspaceId}_${currentWeekId}_${dayId}_${slotId}`;

  // Sáng (5 Tiết)
  const morningSlots = TIME_SLOTS.filter((s) => s.type === 'morning');
  // Chiều (4 Tiết)
  const afternoonSlots = TIME_SLOTS.filter((s) => s.type === 'afternoon');
  // Tối & Tự học
  const eveningSlots = TIME_SLOTS.filter(
    (s) => s.type === 'evening_break' || s.type === 'self_study'
  );

  // Exact matching grid track definition for pixel-perfect vertical alignment across all rows!
  const gridTrackClasses = 'grid grid-cols-[125px_repeat(7,minmax(140px,1fr))]';

  return (
    <div className="w-full space-y-3.5 pb-6">
      {/* 1. KHUNG GIỜ FILTER BAR (Matches screenshot!) */}
      <div className="bg-white rounded-2xl border border-rose-200/80 p-2.5 shadow-2xs flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#E11D48] px-2">
          <Filter className="w-3.5 h-3.5" />
          <span>Khung giờ:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setShiftFilter('all')}
            className={`px-3.5 py-1.5 rounded-full font-bold transition-all ${
              shiftFilter === 'all'
                ? 'bg-[#F43F5E] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-rose-50'
            }`}
          >
            Tất cả các ca
          </button>

          <button
            onClick={() => setShiftFilter('morning')}
            className={`px-3.5 py-1.5 rounded-full font-semibold transition-all flex items-center gap-1.5 ${
              shiftFilter === 'morning'
                ? 'bg-[#F43F5E] text-white shadow-xs font-bold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-rose-50'
            }`}
          >
            <span>☀️</span>
            <span>Sáng (5 Tiết: 07h00 - 11h15)</span>
          </button>

          <button
            onClick={() => setShiftFilter('afternoon')}
            className={`px-3.5 py-1.5 rounded-full font-semibold transition-all flex items-center gap-1.5 ${
              shiftFilter === 'afternoon'
                ? 'bg-[#F43F5E] text-white shadow-xs font-bold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-rose-50'
            }`}
          >
            <span>⛅</span>
            <span>Chiều (4 Tiết: 13h30 - 17h00)</span>
          </button>

          <button
            onClick={() => setShiftFilter('evening')}
            className={`px-3.5 py-1.5 rounded-full font-semibold transition-all flex items-center gap-1.5 ${
              shiftFilter === 'evening'
                ? 'bg-[#F43F5E] text-white shadow-xs font-bold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-rose-50'
            }`}
          >
            <span>🌙</span>
            <span>Tối &amp; Tự học (17h00 - 22h00)</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN TIMETABLE CONTAINER ("Cột ra cột hàng ra hàng không bị lệch") */}
      <div className="w-full overflow-x-auto rounded-3xl border border-rose-100 shadow-xs bg-white">
        <div className="min-w-[1120px]">
          {/* HEADER ROW */}
          <div className={`${gridTrackClasses} bg-[#FCFBFB] border-b border-rose-100/90 sticky top-0 z-20`}>
            {/* Top-left column: Thời gian */}
            <div className="p-3 border-r border-rose-100/80 flex flex-col justify-center items-center text-center select-none bg-white">
              <div className="flex items-center gap-1 text-xs font-extrabold text-gray-800">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                <span>Thời gian</span>
              </div>
              <span className="text-[10px] text-gray-400 font-medium mt-0.5">
                Tiết học &amp; Ra chơi
              </span>
            </div>

            {/* 7 Days Columns (Thứ Hai -> Chủ Nhật) */}
            {DAYS_OF_WEEK.map((day, dayIndex) => {
              const dateStr = getDayDateStr(currentWeek?.startDate, dayIndex);
              const isToday = isDateToday(currentWeek?.startDate, dayIndex);

              return (
                <div
                  key={day.id}
                  className={`p-3 border-r last:border-r-0 border-rose-100/80 flex flex-col items-center justify-center text-center relative hover:bg-rose-50/20 transition-colors ${
                    isToday ? 'bg-rose-50/40' : ''
                  }`}
                >
                  <div className="flex items-center gap-1 font-extrabold text-xs sm:text-sm text-gray-800 tracking-tight">
                    <span className="text-base">{day.icon}</span>
                    <span>{day.name}</span>
                    {isToday && (
                      <span className="bg-[#E11D48] text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full tracking-wider uppercase ml-0.5 shadow-2xs animate-pulse">
                        Hôm nay
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] text-gray-400 font-medium">
                      {day.enName}
                    </span>
                    {dateStr && (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-100/80 border border-rose-200/50 px-1.5 py-0.2 rounded-md tracking-tight">
                        {dateStr}
                      </span>
                    )}
                  </div>

                  {/* Day Sync Button for Read-Only mode */}
                  {isReadOnly && (
                    <button
                      onClick={() => onSyncDayToMe(day.id)}
                      className="mt-1 flex items-center gap-1 text-[10px] text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-full font-bold shadow-2xs transition-all hover:scale-102"
                      title={`Chép toàn bộ ${day.name} sang lịch của ${myUser.displayName}`}
                    >
                      <Copy className="w-2.5 h-2.5" />
                      <span>Chép ngày</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* TABLE BODY (SLOTS & BREAKS) */}
          <div className="divide-y divide-rose-100/70">
            {/* ========================================================= */}
            {/* BUỔI SÁNG (5 TIẾT, 07:00 - 11:15) */}
            {/* ========================================================= */}
            {(shiftFilter === 'all' || shiftFilter === 'morning') &&
              morningSlots.map((slot, index) => {
                const isAfterSecondPeriod = slot.periodNumber === 2;
                const isLastMorningPeriod = slot.periodNumber === 5;

                return (
                  <React.Fragment key={slot.id}>
                    {/* LESSON ROW */}
                    <div className={`${gridTrackClasses} hover:bg-[#FFFDFD] transition-colors`}>
                      {/* Left: Time & Period label */}
                      <div className="p-2.5 border-r border-rose-100/80 flex flex-col justify-center items-center text-center bg-[#FAFAFB]/50 select-none">
                        <span className="font-extrabold text-xs sm:text-sm text-gray-800">
                          {slot.name}
                        </span>
                        <span className="text-rose-500 font-bold text-[11px] mt-0.5">
                          {slot.startTime} - {slot.endTime}
                        </span>
                        <span className="text-gray-400 text-[10px] font-medium">45 phút</span>
                      </div>

                      {/* 7 Day Cells */}
                      {DAYS_OF_WEEK.map((day) => {
                        const cellData = cells[getCellKey(day.id, slot.id)];
                        return (
                          <div
                            key={day.id}
                            className="p-2 border-r last:border-r-0 border-rose-100/80 flex flex-col justify-center"
                          >
                            <ScheduleCellCard
                              cell={cellData}
                              slotId={slot.id}
                              dayId={day.id}
                              isReadOnly={isReadOnly}
                              myIdentity={myIdentity}
                              currentWorkspaceId={currentWorkspaceId}
                              onEdit={() => onEditCell(day.id, slot.id, cellData)}
                              onDelete={() => cellData && onDeleteCell(cellData.id)}
                              onSyncCellToMe={() => cellData && onSyncSingleCell(cellData.id)}
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* RECESS / BREAK STRIP (Matches screenshot!) */}
                    {!isLastMorningPeriod && (
                      <div className="w-full bg-[#FFFDF7] border-y border-[#FFF3D6]/70 py-1 px-4 flex items-center justify-center gap-1.5 text-xs text-[#D97706] font-semibold select-none">
                        <Coffee className="w-3.5 h-3.5 text-[#D97706]" />
                        <span>{slot.breakDescription || 'Ra chơi 5 phút'}</span>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}

            {/* ========================================================= */}
            {/* NGHỈ TRƯA (11:15 - 13:30) */}
            {/* ========================================================= */}
            {shiftFilter === 'all' && (
              <div className="w-full bg-[#F0FDF4] border-y border-[#DCFCE7] py-2 px-4 flex items-center justify-center gap-2 text-xs text-[#16A34A] font-bold select-none">
                <span className="text-sm">🍱</span>
                <span>Nghỉ trưa &amp; Ăn trưa thư giãn (11:15 - 13:30) • 135 phút</span>
              </div>
            )}

            {/* ========================================================= */}
            {/* BUỔI CHIỀU (4 TIẾT, 13:30 - 16:55) */}
            {/* ========================================================= */}
            {(shiftFilter === 'all' || shiftFilter === 'afternoon') &&
              afternoonSlots.map((slot, index) => {
                const isFirstAfternoonPeriod = slot.periodNumber === 1;
                const isLastAfternoonPeriod = slot.periodNumber === 4;

                return (
                  <React.Fragment key={slot.id}>
                    {/* LESSON ROW */}
                    <div className={`${gridTrackClasses} hover:bg-[#FFFDFD] transition-colors`}>
                      {/* Left: Time & Period label */}
                      <div className="p-2.5 border-r border-rose-100/80 flex flex-col justify-center items-center text-center bg-[#FAFAFB]/50 select-none">
                        <span className="font-extrabold text-xs sm:text-sm text-gray-800">
                          {slot.name}
                        </span>
                        <span className="text-[#EA580C] font-bold text-[11px] mt-0.5">
                          {slot.startTime} - {slot.endTime}
                        </span>
                        <span className="text-gray-400 text-[10px] font-medium">45 phút</span>
                      </div>

                      {/* 7 Day Cells */}
                      {DAYS_OF_WEEK.map((day) => {
                        const cellData = cells[getCellKey(day.id, slot.id)];
                        return (
                          <div
                            key={day.id}
                            className="p-2 border-r last:border-r-0 border-rose-100/80 flex flex-col justify-center"
                          >
                            <ScheduleCellCard
                              cell={cellData}
                              slotId={slot.id}
                              dayId={day.id}
                              isReadOnly={isReadOnly}
                              myIdentity={myIdentity}
                              currentWorkspaceId={currentWorkspaceId}
                              onEdit={() => onEditCell(day.id, slot.id, cellData)}
                              onDelete={() => cellData && onDeleteCell(cellData.id)}
                              onSyncCellToMe={() => cellData && onSyncSingleCell(cellData.id)}
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* RECESS / BREAK STRIP */}
                    {!isLastAfternoonPeriod && (
                      <div className="w-full bg-[#FFFDF7] border-y border-[#FFF3D6]/70 py-1 px-4 flex items-center justify-center gap-1.5 text-xs text-[#D97706] font-semibold select-none">
                        <Coffee className="w-3.5 h-3.5 text-[#D97706]" />
                        <span>
                          {isFirstAfternoonPeriod
                            ? 'Ra chơi 15 phút (14:15 - 14:30)'
                            : slot.breakDescription || 'Ra chơi 5 phút'}
                        </span>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}

            {/* ========================================================= */}
            {/* CHIỀU TỐI & TỰ HỌC (17:00 - 22:00) */}
            {/* ========================================================= */}
            {(shiftFilter === 'all' || shiftFilter === 'evening') &&
              eveningSlots.map((slot) => {
                const isSelfStudy = slot.id === 'self_study';
                return (
                  <div
                    key={slot.id}
                    className={`${gridTrackClasses} hover:bg-[#FFFDFD] transition-colors`}
                  >
                    {/* Left: Time & Period label */}
                    <div className="p-2.5 border-r border-rose-100/80 flex flex-col justify-center items-center text-center bg-[#FAFAFB]/50 select-none">
                      <span className="font-extrabold text-xs sm:text-sm text-gray-800">
                        {slot.name}
                      </span>
                      <span
                        className={`font-bold text-[11px] mt-0.5 ${
                          isSelfStudy ? 'text-purple-600' : 'text-amber-600'
                        }`}
                      >
                        {slot.startTime} - {slot.endTime}
                      </span>
                      <span className="text-gray-400 text-[10px] font-medium">
                        {isSelfStudy ? '90 phút' : '210 phút'}
                      </span>
                    </div>

                    {/* 7 Day Cells */}
                    {DAYS_OF_WEEK.map((day) => {
                      const cellData = cells[getCellKey(day.id, slot.id)];
                      return (
                        <div
                          key={day.id}
                          className="p-2 border-r last:border-r-0 border-rose-100/80 flex flex-col justify-center"
                        >
                          <ScheduleCellCard
                            cell={cellData}
                            slotId={slot.id}
                            dayId={day.id}
                            isReadOnly={isReadOnly}
                            myIdentity={myIdentity}
                            currentWorkspaceId={currentWorkspaceId}
                            onEdit={() => onEditCell(day.id, slot.id, cellData)}
                            onDelete={() => cellData && onDeleteCell(cellData.id)}
                            onSyncCellToMe={() => cellData && onSyncSingleCell(cellData.id)}
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};
