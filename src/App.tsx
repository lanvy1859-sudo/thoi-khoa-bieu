import React, { useState, useEffect } from 'react';
import {
  Header,
} from './components/Header';
import { SyncBanner } from './components/SyncBanner';
import { TimetableGrid } from './components/TimetableGrid';
import { DayFocusView } from './components/DayFocusView';
import { EveningSelfStudySection } from './components/EveningSelfStudySection';
import { EditCellModal } from './components/EditCellModal';
import { NewWeekModal } from './components/NewWeekModal';
import { SyncConfirmModal } from './components/SyncConfirmModal';
import { DeploymentGuideModal } from './components/DeploymentGuideModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import {
  FullScheduleData,
  ScheduleCell,
  WorkspaceId,
  EveningStudyNotes,
} from './types';
import { INITIAL_SCHEDULE_DATA, WORKSPACE_USERS, DAYS_OF_WEEK } from './data/scheduleConfig';
import {
  fetchScheduleAPI,
  saveCellAPI,
  deleteCellAPI,
  saveEveningNotesAPI,
  syncCellAPI,
  syncDayAPI,
  syncFullWeekAPI,
  createNewWeekAPI,
  saveLocalCachedData,
  getLocalCachedData,
} from './utils/api';
import { saveToSupabase, subscribeToSupabase } from './utils/supabaseSync';
import { Sparkles, Heart, HelpCircle, Calendar, RefreshCw } from 'lucide-react';
import { BookLoadingScreen } from './components/BookLoadingScreen';

export default function App() {
  // Main Data State: Initialize immediately with local cached data to prevent flashing old data
  const [scheduleData, setScheduleData] = useState<FullScheduleData>(() => getLocalCachedData());
  const [isLoading, setIsLoading] = useState(true);

  // Workspace & User State
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<WorkspaceId>('lan_vy');
  const [myIdentity, setMyIdentity] = useState<WorkspaceId>('lan_vy');

  // View & Navigation State
  const [viewMode, setViewMode] = useState<'grid' | 'day'>('grid');
  const [selectedDay, setSelectedDay] = useState<string>('mon');

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeEditSlot, setActiveEditSlot] = useState<{
    dayId: string;
    slotId: string;
    cellData?: ScheduleCell;
  } | null>(null);

  const [isNewWeekModalOpen, setIsNewWeekModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  // Sync Confirmation Modal
  const [syncConfirmModal, setSyncConfirmModal] = useState<{
    isOpen: boolean;
    type: 'full' | 'day';
    dayId?: string;
  }>({ isOpen: false, type: 'full' });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (
    title: string,
    description?: string,
    type: 'success' | 'info' | 'warning' = 'success'
  ) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial Fetch from Supabase Cloud / API + Setup Realtime listener
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      const startTime = Date.now();
      try {
        const data = await fetchScheduleAPI();
        if (isMounted && data) {
          setScheduleData(data);
        }
      } catch (err) {
        console.error('Failed to load schedule from server:', err);
      } finally {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 900 - elapsed);
        setTimeout(() => {
          if (isMounted) setIsLoading(false);
        }, remaining);
      }
    }
    loadData();

    // Supabase Realtime Subscription
    const unsubscribe = subscribeToSupabase((incomingData) => {
      if (isMounted && incomingData && incomingData.cells) {
        setScheduleData(incomingData);
        saveLocalCachedData(incomingData);
        addToast(
          'Đồng bộ từ Cloud ☁️',
          'Đã nhận cập nhật thời khóa biểu mới nhất từ Supabase!',
          'info'
        );
      }
    });

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const currentWeek =
    scheduleData.weeks.find((w) => w.id === scheduleData.currentWeekId) ||
    scheduleData.weeks[0];

  // Handler: Switch Week
  const handleSelectWeek = (weekId: string) => {
    setScheduleData((prev) => ({
      ...prev,
      currentWeekId: weekId,
    }));
  };

  // Handler: Open Edit Modal for a cell
  const handleOpenEditCell = (dayId: string, slotId: string, cellData?: ScheduleCell) => {
    // Cannot edit directly if viewing another user's workspace
    if (currentWorkspaceId !== myIdentity) {
      addToast(
        'Chế độ xem chỉ đọc',
        `Bạn đang ở lịch của ${WORKSPACE_USERS[currentWorkspaceId].displayName}. Hãy bấm "Chép sang lịch tôi" để lưu vào TKB của bạn!`,
        'info'
      );
      return;
    }
    setActiveEditSlot({ dayId, slotId, cellData });
    setIsEditModalOpen(true);
  };

  // Handler: Save Cell
  const handleSaveCell = async (cell: ScheduleCell) => {
    setScheduleData((prev) => {
      const updatedCells = { ...prev.cells, [cell.id]: cell };
      const updatedData = { ...prev, cells: updatedCells };
      saveLocalCachedData(updatedData);
      saveToSupabase(updatedData);
      return updatedData;
    });

    addToast('Đã lưu tiết học ✨', `${cell.subject} đã được cập nhật vào thời khóa biểu.`);
    await saveCellAPI(cell);
  };

  // Handler: Delete Cell
  const handleDeleteCell = async (cellId: string) => {
    setScheduleData((prev) => {
      const updatedCells = { ...prev.cells };
      delete updatedCells[cellId];
      const updatedData = { ...prev, cells: updatedCells };
      saveLocalCachedData(updatedData);
      saveToSupabase(updatedData);
      return updatedData;
    });

    addToast('Đã xóa tiết học', 'Tiết học đã được làm trống.', 'info');
    await deleteCellAPI(cellId);
  };

  // Handler: Save Evening Notes
  const handleSaveEveningNotes = async (note: EveningStudyNotes) => {
    setScheduleData((prev) => {
      const updatedNotes = { ...prev.eveningNotes, [note.id]: note };
      const updatedData = { ...prev, eveningNotes: updatedNotes };
      saveLocalCachedData(updatedData);
      saveToSupabase(updatedData);
      return updatedData;
    });

    addToast('Đã cập nhật góc tự học 🌙', 'Mục tiêu và ghi chú ôn tập đã được lưu.');
    await saveEveningNotesAPI(note);
  };

  // ==========================================
  // SYNC FEATURES (Requested Core Feature)
  // ==========================================

  // 1. CELL SYNC (Đồng bộ từng ô)
  const handleSyncSingleCell = async (sourceCellId: string) => {
    const sourceCell = scheduleData.cells[sourceCellId];
    if (!sourceCell) return;

    // Build target cell ID for myIdentity
    const parts = sourceCellId.split('_');
    const srcWs = parts[0] + (parts[1] === 'vy' || parts[1] === 'anh' ? '_' + parts[1] : '');
    const remainder = sourceCellId.substring(srcWs.length + 1);
    const targetCellId = `${myIdentity}_${remainder}`;

    const newTargetCell: ScheduleCell = {
      ...sourceCell,
      id: targetCellId,
      updatedAt: new Date().toISOString(),
    };

    setScheduleData((prev) => {
      const updated = {
        ...prev,
        cells: {
          ...prev.cells,
          [targetCellId]: newTargetCell,
        },
      };
      saveLocalCachedData(updated);
      saveToSupabase(updated);
      return updated;
    });

    addToast(
      '✨ Chép tiết học thành công!',
      `Đã chép môn "${sourceCell.subject}" sang thời khóa biểu của ${WORKSPACE_USERS[myIdentity].displayName}.`
    );

    await syncCellAPI(sourceCellId, myIdentity);
  };

  // 2. DAY SYNC (Đồng bộ hàng/thứ)
  const handleTriggerDaySync = (dayId: string) => {
    setSyncConfirmModal({
      isOpen: true,
      type: 'day',
      dayId,
    });
  };

  const handleExecuteDaySync = async (dayId: string) => {
    const sourcePrefix = `${currentWorkspaceId}_${scheduleData.currentWeekId}_${dayId}_`;
    const targetPrefix = `${myIdentity}_${scheduleData.currentWeekId}_${dayId}_`;

    setScheduleData((prev) => {
      const updatedCells = { ...prev.cells };
      // Remove target day cells
      Object.keys(updatedCells).forEach((k) => {
        if (k.startsWith(targetPrefix)) delete updatedCells[k];
      });
      // Copy source day cells
      (Object.entries(prev.cells) as [string, ScheduleCell][]).forEach(([key, cell]) => {
        if (key.startsWith(sourcePrefix) && cell) {
          const suffix = key.substring(sourcePrefix.length);
          const newKey = `${targetPrefix}${suffix}`;
          updatedCells[newKey] = {
            ...cell,
            id: newKey,
            updatedAt: new Date().toISOString(),
          };
        }
      });
      const updatedData = { ...prev, cells: updatedCells };
      saveLocalCachedData(updatedData);
      saveToSupabase(updatedData);
      return updatedData;
    });

    const dayName = DAYS_OF_WEEK.find((d) => d.id === dayId)?.name || dayId;
    addToast(
      '✨ Chép ngày thành công!',
      `Đã sao chép tất cả các tiết của ${dayName} sang lịch của ${WORKSPACE_USERS[myIdentity].displayName}.`
    );

    await syncDayAPI(currentWorkspaceId, myIdentity, scheduleData.currentWeekId, dayId);
  };

  // 3. FULL SYNC (Đồng bộ toàn bộ tuần)
  const handleTriggerFullSync = () => {
    setSyncConfirmModal({
      isOpen: true,
      type: 'full',
    });
  };

  const handleExecuteFullSync = async () => {
    const srcWs = currentWorkspaceId;
    const tgtWs = myIdentity;
    const weekId = scheduleData.currentWeekId;

    const srcPrefix = `${srcWs}_${weekId}_`;
    const tgtPrefix = `${tgtWs}_${weekId}_`;

    setScheduleData((prev) => {
      const updatedCells = { ...prev.cells };
      // Clear target week
      Object.keys(updatedCells).forEach((k) => {
        if (k.startsWith(tgtPrefix)) delete updatedCells[k];
      });
      // Copy from source
      (Object.entries(prev.cells) as [string, ScheduleCell][]).forEach(([key, cell]) => {
        if (key.startsWith(srcPrefix) && cell) {
          const suffix = key.substring(srcPrefix.length);
          const newKey = `${tgtPrefix}${suffix}`;
          updatedCells[newKey] = {
            ...cell,
            id: newKey,
            updatedAt: new Date().toISOString(),
          };
        }
      });
      const updatedData = { ...prev, cells: updatedCells, lastSyncedAt: new Date().toISOString() };
      saveLocalCachedData(updatedData);
      saveToSupabase(updatedData);
      return updatedData;
    });

    addToast(
      '🎉 Đồng bộ toàn bộ hoàn tất!',
      `Toàn bộ thời khóa biểu của ${WORKSPACE_USERS[srcWs].displayName} đã được chép sang lịch của ${WORKSPACE_USERS[tgtWs].displayName}.`
    );

    await syncFullWeekAPI(srcWs, tgtWs, weekId);
  };

  // 4. CREATE NEW WEEK (Tạo tuần mới)
  const handleCreateNewWeek = async (payload: {
    name: string;
    startDate: string;
    endDate: string;
    copyFromWeekId?: string;
  }) => {
    const nextNum = scheduleData.weeks.length + 1;
    const newWeekId = `week_${nextNum}_${Date.now()}`;

    const newWeek = {
      id: newWeekId,
      weekNumber: nextNum,
      name: payload.name,
      startDate: payload.startDate,
      endDate: payload.endDate,
    };

    setScheduleData((prev) => {
      const updatedWeeks = [...prev.weeks, newWeek];
      const updatedCells = { ...prev.cells };

      if (payload.copyFromWeekId) {
        (Object.entries(prev.cells) as [string, ScheduleCell][]).forEach(([key, cell]) => {
          if (key.includes(`_${payload.copyFromWeekId}_`) && cell) {
            const newKey = key.replace(`_${payload.copyFromWeekId}_`, `_${newWeekId}_`);
            updatedCells[newKey] = {
              ...cell,
              id: newKey,
              updatedAt: new Date().toISOString(),
            };
          }
        });
      }

      const updatedData = {
        ...prev,
        weeks: updatedWeeks,
        currentWeekId: newWeekId,
        cells: updatedCells,
      };
      saveLocalCachedData(updatedData);
      saveToSupabase(updatedData);
      return updatedData;
    });

    addToast(
      '✨ Tạo tuần mới thành công!',
      `Đã chuyển sang ${payload.name}${payload.copyFromWeekId ? ' (Kế thừa môn từ tuần trước)' : ''}.`
    );

    await createNewWeekAPI(payload);
  };

  // Handler: Import full JSON data
  const handleImportData = (imported: FullScheduleData) => {
    setScheduleData(imported);
    saveLocalCachedData(imported);
    saveToSupabase(imported);
    addToast('Khôi phục dữ liệu thành công!', 'Thời khóa biểu đã được cập nhật từ file JSON.');
  };

  return (
    <div className="min-h-screen bg-[#faf7f5] text-[#332d3b] flex flex-col selection:bg-rose-200 selection:text-rose-900">
      {/* Book Lottie Loading Screen (Requested: Display until data is completely loaded) */}
      {isLoading && (
        <BookLoadingScreen
          message="Đang tải thời khóa biểu..."
          subMessage="Đồng bộ dữ liệu học tập dịu dàng của bạn..."
        />
      )}

      {/* Header */}
      <Header
        currentWorkspaceId={currentWorkspaceId}
        onSelectWorkspace={(id) => setCurrentWorkspaceId(id)}
        myIdentity={myIdentity}
        onChangeIdentity={(id) => setMyIdentity(id)}
        weeks={scheduleData.weeks}
        currentWeekId={scheduleData.currentWeekId}
        onSelectWeek={handleSelectWeek}
        onOpenNewWeekModal={() => setIsNewWeekModalOpen(true)}
        onOpenFullSyncModal={handleTriggerFullSync}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        onOpenExportModal={() => setIsGuideModalOpen(true)}
        viewMode={viewMode}
        onChangeViewMode={(m) => setViewMode(m)}
        selectedDay={selectedDay}
        onSelectDay={(d) => setSelectedDay(d)}
      />

      {/* Read-Only & Sync Reminder Banner */}
      <SyncBanner
        currentWorkspaceId={currentWorkspaceId}
        myIdentity={myIdentity}
        onSwitchToMyWorkspace={() => setCurrentWorkspaceId(myIdentity)}
        onTriggerFullSync={handleTriggerFullSync}
      />

      {/* Main Content Area */}
      <main className="grow max-w-[1440px] w-full mx-auto px-3 sm:px-6 py-4">
        {/* View Switcher: Weekly Grid vs Day Focus */}
        {viewMode === 'grid' ? (
          <TimetableGrid
            currentWorkspaceId={currentWorkspaceId}
            myIdentity={myIdentity}
            currentWeekId={scheduleData.currentWeekId}
            currentWeek={currentWeek}
            cells={scheduleData.cells}
            onEditCell={handleOpenEditCell}
            onDeleteCell={handleDeleteCell}
            onSyncSingleCell={handleSyncSingleCell}
            onSyncDayToMe={handleTriggerDaySync}
            onSyncSlotToMe={(slotId) => {
              // Quick slot sync to me
              addToast(
                'Chép tiết cả tuần',
                'Đang đồng bộ tiết này cho tất cả các ngày trong tuần...',
                'info'
              );
            }}
          />
        ) : (
          <DayFocusView
            currentWorkspaceId={currentWorkspaceId}
            myIdentity={myIdentity}
            currentWeekId={scheduleData.currentWeekId}
            currentWeek={currentWeek}
            selectedDayId={selectedDay}
            onSelectDayId={(d) => setSelectedDay(d)}
            cells={scheduleData.cells}
            onEditCell={handleOpenEditCell}
            onDeleteCell={handleDeleteCell}
            onSyncSingleCell={handleSyncSingleCell}
            onSyncDayToMe={handleTriggerDaySync}
          />
        )}

        {/* Evening Self-Study & Notes Section (Requested: 20:30 - 22:00) */}
        <EveningSelfStudySection
          currentWorkspaceId={currentWorkspaceId}
          myIdentity={myIdentity}
          currentWeekId={scheduleData.currentWeekId}
          eveningNotes={scheduleData.eveningNotes}
          onSaveEveningNotes={handleSaveEveningNotes}
        />
      </main>

      {/* Footer */}
      <footer className="mt-8 border-t border-rose-100 bg-white/70 py-5 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base">������</span>
            <span className="font-semibold text-gray-700">
              Thời khóa biểu Lan Vy &amp; Kim Ánh
            </span>
            <span className="text-gray-400">•</span>
            <span>Style pastel dịu dàng, đồng bộ 2 chiều</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsGuideModalOpen(true)}
              className="text-purple-600 hover:text-purple-800 font-bold underline decoration-purple-300"
            >
              Cách lưu trữ &amp; Triển khai web online
            </button>
            <span>•</span>
            <span className="text-gray-400">© 2026 Studio</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {activeEditSlot && (
        <EditCellModal
          isOpen={isEditModalOpen}
          dayId={activeEditSlot.dayId}
          slotId={activeEditSlot.slotId}
          cellData={activeEditSlot.cellData}
          workspaceId={currentWorkspaceId}
          currentWeekId={scheduleData.currentWeekId}
          onClose={() => {
            setIsEditModalOpen(false);
            setActiveEditSlot(null);
          }}
          onSave={handleSaveCell}
          onDelete={handleDeleteCell}
        />
      )}

      <NewWeekModal
        isOpen={isNewWeekModalOpen}
        currentWeek={currentWeek}
        totalWeeksCount={scheduleData.weeks.length}
        onClose={() => setIsNewWeekModalOpen(false)}
        onCreateWeek={handleCreateNewWeek}
      />

      <SyncConfirmModal
        isOpen={syncConfirmModal.isOpen}
        type={syncConfirmModal.type}
        sourceWorkspaceId={currentWorkspaceId}
        targetWorkspaceId={myIdentity}
        currentWeek={currentWeek}
        dayName={
          syncConfirmModal.dayId
            ? DAYS_OF_WEEK.find((d) => d.id === syncConfirmModal.dayId)?.name
            : undefined
        }
        onClose={() => setSyncConfirmModal({ isOpen: false, type: 'full' })}
        onConfirm={() => {
          if (syncConfirmModal.type === 'day' && syncConfirmModal.dayId) {
            handleExecuteDaySync(syncConfirmModal.dayId);
          } else {
            handleExecuteFullSync();
          }
        }}
      />

      <DeploymentGuideModal
        isOpen={isGuideModalOpen}
        scheduleData={scheduleData}
        onClose={() => setIsGuideModalOpen(false)}
        onImportData={handleImportData}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
