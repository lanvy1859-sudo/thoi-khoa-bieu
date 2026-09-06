import React from 'react';
import { AlertTriangle, RefreshCw, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { WorkspaceId, WeekData } from '../types';
import { WORKSPACE_USERS } from '../data/scheduleConfig';

interface SyncConfirmModalProps {
  isOpen: boolean;
  type: 'full' | 'day';
  sourceWorkspaceId: WorkspaceId;
  targetWorkspaceId: WorkspaceId;
  currentWeek: WeekData;
  dayName?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export const SyncConfirmModal: React.FC<SyncConfirmModalProps> = ({
  isOpen,
  type,
  sourceWorkspaceId,
  targetWorkspaceId,
  currentWeek,
  dayName,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  const srcUser = WORKSPACE_USERS[sourceWorkspaceId];
  const tgtUser = WORKSPACE_USERS[targetWorkspaceId];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-rose-100 shadow-2xl max-w-md w-full p-6 text-gray-800">
        {/* Warning Icon */}
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="grow">
            <h3 className="font-display font-extrabold text-base sm:text-lg text-gray-800">
              {type === 'full'
                ? 'Xác nhận Đồng bộ Toàn bộ Thời khóa biểu'
                : `Xác nhận Sao chép ${dayName}`}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Hành động này sẽ ghi đè dữ liệu lịch học của bạn
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Sync Flow Diagram */}
        <div className="my-4 p-3.5 bg-gradient-to-r from-rose-50 via-purple-50 to-amber-50 rounded-2xl border border-rose-200/80 flex items-center justify-between">
          <div className="text-center">
            <div className="text-2xl">{srcUser.avatar}</div>
            <div className="text-xs font-bold text-gray-800 mt-1">{srcUser.displayName}</div>
            <div className="text-[10px] text-gray-600 font-medium">Nguồn sao chép</div>
          </div>

          <div className="flex flex-col items-center px-2">
            <div className="flex items-center gap-1 text-rose-600 font-bold text-xs bg-white px-2 py-0.5 rounded-full shadow-2xs border border-rose-200">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Ghi đè</span>
            </div>
            <ArrowRight className="w-5 h-5 text-rose-500 mt-1" />
          </div>

          <div className="text-center">
            <div className="text-2xl">{tgtUser.avatar}</div>
            <div className="text-xs font-bold text-gray-800 mt-1">{tgtUser.displayName}</div>
            <div className="text-[10px] text-rose-600 font-bold">Đích nhận dữ liệu</div>
          </div>
        </div>

        {/* Notice details */}
        <div className="space-y-2 text-xs text-gray-600">
          <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-amber-900 leading-relaxed">
            {type === 'full' ? (
              <span>
                Toàn bộ các tiết học trong <strong>{currentWeek.name}</strong> của{' '}
                <strong>{tgtUser.displayName}</strong> sẽ được thay thế bằng thời khóa biểu hiện tại của{' '}
                <strong>{srcUser.displayName}</strong>.
              </span>
            ) : (
              <span>
                Các tiết học của <strong>{dayName}</strong> trong {currentWeek.name} của{' '}
                <strong>{tgtUser.displayName}</strong> sẽ được thay thế hoàn toàn bằng các tiết của{' '}
                <strong>{srcUser.displayName}</strong>.
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-600 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Bạn có thể chỉnh sửa lại từng ô sau khi quá trình đồng bộ hoàn tất.</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-2 font-bold text-white bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 rounded-xl shadow-xs transition-all hover:scale-102 active:scale-95 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Tôi đồng ý ghi đè</span>
          </button>
        </div>
      </div>
    </div>
  );
};
