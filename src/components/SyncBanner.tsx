import React from 'react';
import { Eye, ArrowRight, RefreshCw, Sparkles, ShieldAlert } from 'lucide-react';
import { WorkspaceId } from '../types';
import { WORKSPACE_USERS } from '../data/scheduleConfig';

interface SyncBannerProps {
  currentWorkspaceId: WorkspaceId;
  myIdentity: WorkspaceId;
  onSwitchToMyWorkspace: () => void;
  onTriggerFullSync: () => void;
}

export const SyncBanner: React.FC<SyncBannerProps> = ({
  currentWorkspaceId,
  myIdentity,
  onSwitchToMyWorkspace,
  onTriggerFullSync,
}) => {
  if (currentWorkspaceId === myIdentity) {
    return null; // Don't show if user is in their own workspace
  }

  const viewingUser = WORKSPACE_USERS[currentWorkspaceId];
  const myUser = WORKSPACE_USERS[myIdentity];

  return (
    <div className="bg-gradient-to-r from-amber-50 via-rose-50 to-purple-50 border-b border-amber-200/80 px-4 py-2.5 shadow-2xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100/90 text-amber-700 flex items-center justify-center shrink-0 border border-amber-300">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-gray-800">
              <span>Đang xem không gian của:</span>
              <span className="text-amber-700 underline font-extrabold decoration-amber-400">
                {viewingUser.displayName} {viewingUser.avatar}
              </span>
              <span className="bg-amber-100 text-amber-800 text-[11px] font-semibold px-2 py-0.2 rounded-full border border-amber-200">
                Chế độ chỉ xem (Read-only)
              </span>
            </div>
            <p className="text-gray-600 text-xs mt-0.5">
              Các nút sửa/xóa trực tiếp đã được ẩn. Bạn có thể bấm{' '}
              <strong className="text-purple-700">"Chép sang lịch của tôi"</strong> ở từng ô,
              hoặc chép cả cột ngày/toàn tuần sang lịch của bạn (<strong>{myUser.displayName}</strong>).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-banner-full-sync"
            onClick={onTriggerFullSync}
            className="flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Chép toàn bộ TKB sang {myUser.displayName}</span>
          </button>
          <button
            id="btn-banner-back-to-mine"
            onClick={onSwitchToMyWorkspace}
            className="flex items-center gap-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium px-2.5 py-1.5 rounded-xl transition-all text-xs"
          >
            <span>Về lịch {myUser.displayName}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
