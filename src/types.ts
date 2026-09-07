export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface DayInfo {
  id: DayOfWeek;
  name: string; // 'Thứ Hai', 'Thứ Ba', ...
  shortName: string; // 'T2', 'T3', ...
  enName?: string; // 'Mon', 'Tue', ...
  icon?: string; // '🌱', '🌸', etc.
  dateLabel?: string; // e.g. '08/09'
  isToday?: boolean;
}

export type PeriodType = 'morning' | 'lunch' | 'afternoon' | 'evening_break' | 'self_study';

export interface TimeSlot {
  id: string; // e.g. 'm1', 'm2', 'm3', 'm4', 'm5', 'a1', 'a2', 'a3', 'a4', 'ev_break', 'self_study'
  type: PeriodType;
  periodNumber?: number; // 1, 2, 3, 4, 5
  name: string; // 'Tiết 1 (Sáng)', 'Nghỉ giải lao', etc.
  startTime: string; // '07:00'
  endTime: string; // '07:45'
  breakAfterMinutes?: number; // 5 or 15 or undefined
  breakDescription?: string; // 'Ra chơi 5p' or 'Ra chơi lớn 15p'
  isBreakSlot?: boolean;
}

export interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface ScheduleCell {
  id: string; // `${workspaceId}_${weekId}_${day}_${slotId}`
  subject: string;
  room?: string;
  teacher?: string;
  notes?: string;
  tasks?: TaskItem[];
  colorTheme?: string; // preset key or hex
  icon?: string; // icon name
  customStartTime?: string; // e.g. '15:30'
  customEndTime?: string; // e.g. '17:00'
  customTime?: string; // formatted e.g. '15:30 - 17:00'
  isExtraClass?: boolean; // true = Lịch học thêm / Khung giờ riêng
  updatedAt?: string;
}

export interface EveningStudyNotes {
  id: string; // `${workspaceId}_${weekId}_${day}_evening`
  goals: string;
  notes: string;
  tasks: TaskItem[];
  mood?: string;
}

export type WorkspaceId = 'lan_vy' | 'kim_anh';

export interface WorkspaceUser {
  id: WorkspaceId;
  displayName: string;
  title: string;
  avatar: string; // emoji or icon
  themeColor: string; // primary accent
  tagline: string;
}

export interface WeekData {
  id: string; // 'week_1', 'week_2'
  weekNumber: number;
  name: string; // 'Tuần 1: Khởi động năm học'
  startDate: string; // '2026-09-07'
  endDate: string; // '2026-09-13'
  isCurrent?: boolean;
}

export interface FullScheduleData {
  weeks: WeekData[];
  currentWeekId: string;
  // schedules[workspaceId][weekId][`${day}_${slotId}`] = ScheduleCell
  cells: Record<string, ScheduleCell>; // Key: `${workspaceId}_${weekId}_${day}_${slotId}`
  eveningNotes: Record<string, EveningStudyNotes>; // Key: `${workspaceId}_${weekId}_${day}`
  lastSyncedAt?: string;
}
