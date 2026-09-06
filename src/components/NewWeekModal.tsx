import React, { useState, useEffect } from 'react';
import { X, Calendar, Copy, Sparkles, Check, Info } from 'lucide-react';
import { WeekData } from '../types';
import { getNextSequentialWeek } from '../utils/dateUtils';

interface NewWeekModalProps {
  isOpen: boolean;
  currentWeek: WeekData;
  totalWeeksCount: number;
  onClose: () => void;
  onCreateWeek: (payload: {
    name: string;
    startDate: string;
    endDate: string;
    copyFromWeekId?: string;
  }) => void;
}

export const NewWeekModal: React.FC<NewWeekModalProps> = ({
  isOpen,
  currentWeek,
  totalWeeksCount,
  onClose,
  onCreateWeek,
}) => {
  const nextNum = totalWeeksCount + 1;
  const defaultSeq = getNextSequentialWeek(currentWeek.startDate, nextNum);

  const [weekName, setWeekName] = useState(defaultSeq.name);
  const [startDate, setStartDate] = useState(defaultSeq.startDate);
  const [endDate, setEndDate] = useState(defaultSeq.endDate);
  const [copyMode, setCopyMode] = useState<'inherit' | 'blank'>('inherit');

  useEffect(() => {
    if (isOpen) {
      const seq = getNextSequentialWeek(currentWeek.startDate, totalWeeksCount + 1);
      setWeekName(seq.name);
      setStartDate(seq.startDate);
      setEndDate(seq.endDate);
    }
  }, [isOpen, currentWeek.startDate, totalWeeksCount]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weekName.trim()) return;

    onCreateWeek({
      name: weekName.trim(),
      startDate: startDate || defaultSeq.startDate,
      endDate: endDate || defaultSeq.endDate,
      copyFromWeekId: copyMode === 'inherit' ? currentWeek.id : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-rose-100 shadow-2xl max-w-md w-full p-6 text-gray-800">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-rose-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-gray-800">Tạo Tuần Học Mới</h3>
              <p className="text-xs text-gray-500">Lưu tuần cũ và tạo lịch cho tuần kế tiếp</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-rose-50 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Week Name */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Tên tuần học <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={weekName}
              onChange={(e) => setWeekName(e.target.value)}
              placeholder="Ví dụ: Tuần 2, Tuần 3 - Ôn tập giữa kỳ..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-300 font-semibold text-gray-800"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Ngày bắt đầu</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Ngày kết thúc</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 font-medium"
              />
            </div>
          </div>

          {/* Creation Mode */}
          <div>
            <label className="block font-bold text-gray-700 mb-2">Chế độ tạo tuần mới:</label>
            <div className="space-y-2">
              {/* Option 1: Inherit / Duplicate */}
              <label
                onClick={() => setCopyMode('inherit')}
                className={`flex items-start gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all ${
                  copyMode === 'inherit'
                    ? 'bg-rose-50/80 border-rose-300 ring-1 ring-rose-300'
                    : 'bg-white hover:bg-gray-50 border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  name="copyMode"
                  checked={copyMode === 'inherit'}
                  onChange={() => setCopyMode('inherit')}
                  className="mt-0.5 text-rose-600 focus:ring-rose-400"
                />
                <div>
                  <div className="font-bold text-gray-800 flex items-center gap-1.5">
                    <Copy className="w-3.5 h-3.5 text-rose-500" />
                    <span>Sao chép thời khóa biểu từ {currentWeek.name}</span>
                    <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded-full font-bold">
                      Khuyên dùng
                    </span>
                  </div>
                  <p className="text-gray-500 mt-0.5 text-[11px]">
                    Giữ nguyên các môn học cố định từ T2 đến CN của cả Vy &amp; Ánh. Bạn chỉ cần sửa các tiết thay đổi, không cần nhập lại từ đầu!
                  </p>
                </div>
              </label>

              {/* Option 2: Blank */}
              <label
                onClick={() => setCopyMode('blank')}
                className={`flex items-start gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all ${
                  copyMode === 'blank'
                    ? 'bg-rose-50/80 border-rose-300 ring-1 ring-rose-300'
                    : 'bg-white hover:bg-gray-50 border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  name="copyMode"
                  checked={copyMode === 'blank'}
                  onChange={() => setCopyMode('blank')}
                  className="mt-0.5 text-rose-600 focus:ring-rose-400"
                />
                <div>
                  <div className="font-bold text-gray-800">Tạo tuần trống hoàn toàn</div>
                  <p className="text-gray-500 mt-0.5 text-[11px]">
                    Bắt đầu với một lưới thời khóa biểu trắng để tự sắp xếp lại toàn bộ các tiết.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Info note */}
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-purple-50/70 border border-purple-200 text-purple-800 text-[11px]">
            <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <span>
              Tuần cũ ({currentWeek.name}) vẫn được lưu lại an toàn trên hệ thống. Bạn có thể chọn menu tuần trên thanh công cụ để xem lại bất cứ lúc nào!
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
              className="px-5 py-2 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl shadow-xs transition-all hover:scale-102 active:scale-95"
            >
              Tạo &amp; Chuyển sang tuần mới
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
