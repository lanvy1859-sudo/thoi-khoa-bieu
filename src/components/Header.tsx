import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Clock,
  Download,
  Database,
  Printer,
  RefreshCw,
  Copy,
} from 'lucide-react';
import { WorkspaceId, WeekData } from '../types';
import { WORKSPACE_USERS } from '../data/scheduleConfig';
import { isSupabaseConfigured } from '../lib/supabase';

interface HeaderProps {
  currentWorkspaceId: WorkspaceId;
  onSelectWorkspace: (id: WorkspaceId) => void;
  myIdentity: WorkspaceId;
  onChangeIdentity: (id: WorkspaceId) => void;
  weeks: WeekData[];
  currentWeekId: string;
  onSelectWeek: (weekId: string) => void;
  onOpenNewWeekModal: () => void;
  onOpenCopyWeekModal?: () => void;
  onOpenFullSyncModal: () => void;
  onOpenGuideModal: () => void;
  onOpenExportModal: () => void;
  viewMode: 'grid' | 'day';
  onChangeViewMode: (mode: 'grid' | 'day') => void;
  selectedDay: string;
  onSelectDay: (day: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentWorkspaceId,
  onSelectWorkspace,
  myIdentity,
  onChangeIdentity,
  weeks,
  currentWeekId,
  onSelectWeek,
  onOpenNewWeekModal,
  onOpenCopyWeekModal,
  onOpenFullSyncModal,
  onOpenGuideModal,
  onOpenExportModal,
}) => {
  const currentWeekIndex = weeks.findIndex((w) => w.id === currentWeekId);
  const currentWeek = weeks[currentWeekIndex] || weeks[0];

  // Live real-time clock
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${h}:${m}:${s}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePrevWeek = () => {
    if (currentWeekIndex > 0) {
      onSelectWeek(weeks[currentWeekIndex - 1].id);
    }
  };

  const handleNextWeek = () => {
    if (currentWeekIndex < weeks.length - 1) {
      onSelectWeek(weeks[currentWeekIndex + 1].id);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="bg-[#FFFDFD] border-b border-rose-100/80 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-2.5">
        {/* ROW 1: BRANDING & WORKSPACE SWITCHER */}
        <div className="flex items-center justify-between gap-4 pb-2.5">
          {/* App Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-200 to-pink-300 flex items-center justify-center text-white text-lg shadow-xs">
              🌸
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold font-display text-gray-800 tracking-tight">
                  Thời Khóa Biểu
                </h1>
                <span className="bg-[#FFE4E8] text-[#E11D48] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full tracking-wider uppercase">
                  PASTEL AESTHETIC
                </span>
                {isSupabaseConfigured && (
                  <span
                    className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs"
                    title="Đã kết nối cơ sở dữ liệu Supabase Cloud thời gian thực"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Supabase Cloud</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Mỗi ngày học tập là một bông hoa nhỏ nở rộ 🌷
              </p>
            </div>
          </div>

          {/* Right: Workspace Switcher Tabs */}
          <div className="bg-[#F8F9FA] p-1 rounded-full border border-gray-200/80 flex items-center gap-1 shadow-2xs">
            <button
              id="btn-ws-lan-vy"
              onClick={() => onSelectWorkspace('lan_vy')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                currentWorkspaceId === 'lan_vy'
                  ? 'bg-white text-rose-600 shadow-xs border border-rose-200/70'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <span>🌸</span>
              <span>Lan Vy</span>
              {currentWorkspaceId === 'lan_vy' && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              )}
            </button>

            <button
              id="btn-ws-kim-anh"
              onClick={() => onSelectWorkspace('kim_anh')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                currentWorkspaceId === 'kim_anh'
                  ? 'bg-white text-amber-600 shadow-xs border border-amber-200/70'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <span>✨</span>
              <span>Kim Ánh</span>
              {currentWorkspaceId === 'kim_anh' && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              )}
            </button>
          </div>
        </div>

        {/* ROW 2: TOOLBAR (WEEK SELECTOR, CLOCK, IDENTITY, ACTION ICONS) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-rose-100/50">
          {/* Left Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Week Selector Pill */}
            <div className="flex items-center bg-white border border-rose-200/80 rounded-xl px-2 py-1 shadow-2xs text-xs font-semibold text-gray-700">
              <button
                onClick={handlePrevWeek}
                disabled={currentWeekIndex <= 0}
                className="p-1 hover:text-rose-600 disabled:opacity-30 disabled:hover:text-gray-700"
                title="Tuần trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="relative flex items-center px-1">
                <select
                  id="select-week"
                  value={currentWeekId}
                  onChange={(e) => onSelectWeek(e.target.value)}
                  className="bg-transparent appearance-none pr-5 font-bold text-gray-800 cursor-pointer focus:outline-hidden"
                >
                  {weeks.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-0 pointer-events-none" />
              </div>

              <button
                onClick={handleNextWeek}
                disabled={currentWeekIndex >= weeks.length - 1}
                className="p-1 hover:text-rose-600 disabled:opacity-30 disabled:hover:text-gray-700"
                title="Tuần sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* "Tuần mới" Button */}
            <button
              id="btn-add-week"
              onClick={onOpenNewWeekModal}
              className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs transition-all hover:scale-102 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tuần mới</span>
            </button>

            {/* "Chép TKB tuần" Button */}
            {onOpenCopyWeekModal && (
              <button
                id="btn-copy-week"
                onClick={onOpenCopyWeekModal}
                className="flex items-center gap-1.5 bg-white hover:bg-purple-50 text-purple-700 hover:text-purple-900 border border-purple-200/90 font-bold text-xs px-3 py-1.5 rounded-xl shadow-2xs transition-all hover:scale-102 active:scale-95"
                title="Sao chép toàn bộ thời khóa biểu từ một tuần khác sang tuần hiện tại"
              >
                <Copy className="w-3.5 h-3.5 text-purple-600" />
                <span>Chép TKB tuần</span>
              </button>
            )}

            {/* Live Clock & Status Badge */}
            <div className="hidden md:flex items-center gap-2 bg-white border border-rose-100 rounded-xl px-3 py-1.5 text-xs text-gray-600 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="font-mono font-bold text-gray-800">{currentTime || '22:30:59'}</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500 font-medium">Đã hoàn thành các tiết học trong ngày</span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Identity Switcher */}
            <div
              onClick={() => onChangeIdentity(myIdentity === 'lan_vy' ? 'kim_anh' : 'lan_vy')}
              className="flex items-center gap-1.5 bg-rose-50/80 border border-rose-200/80 text-rose-700 hover:bg-rose-100/80 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-2xs"
              title="Nhấn để đổi vai trò thử nghiệm giữa Lan Vy và Kim Ánh"
            >
              <span className="text-gray-500 font-medium">Tôi là:</span>
              <span>{myIdentity === 'lan_vy' ? '🌸 Lan Vy' : '✨ Kim Ánh'}</span>
            </div>

            {/* Icon 1: Export */}
            <button
              onClick={onOpenExportModal}
              className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-rose-600 hover:bg-rose-50 transition-colors shadow-2xs"
              title="Sao lưu & Xuất JSON"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {/* Icon 2: Database / Online guide */}
            <button
              onClick={onOpenGuideModal}
              className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors shadow-2xs"
              title="Hướng dẫn lưu trữ & Đưa web online"
            >
              <Database className="w-3.5 h-3.5" />
            </button>

            {/* Icon 3: Print */}
            <button
              onClick={handlePrint}
              className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors shadow-2xs"
              title="In thời khóa biểu"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            {/* Icon 4: Sync */}
            <button
              onClick={onOpenFullSyncModal}
              className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-rose-600 hover:bg-rose-50 transition-colors shadow-2xs"
              title="Đồng bộ toàn bộ TKB"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
