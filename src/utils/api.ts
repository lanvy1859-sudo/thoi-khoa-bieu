import { FullScheduleData, ScheduleCell, WeekData, EveningStudyNotes } from '../types';
import { INITIAL_SCHEDULE_DATA } from '../data/scheduleConfig';
import { fetchFromSupabase, saveToSupabase } from './supabaseSync';

const LOCAL_STORAGE_KEY = 'tkb_lanvy_kimanh_v1';

// Get cached data from localStorage as immediate initial state
export function getLocalCachedData(): FullScheduleData {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.cells && parsed.weeks) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read from localStorage', e);
  }
  return INITIAL_SCHEDULE_DATA;
}

// Save to localStorage
export function saveLocalCachedData(data: FullScheduleData) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Could not save to localStorage', e);
  }
}

// Fetch from Supabase Cloud first, fallback to API then local cache
export async function fetchScheduleAPI(): Promise<FullScheduleData> {
  // 1. Try Supabase Cloud
  try {
    const supabaseData = await fetchFromSupabase();
    if (supabaseData && supabaseData.cells) {
      saveLocalCachedData(supabaseData);
      return supabaseData;
    }
  } catch (e) {
    console.warn('Supabase fetch bypassed, attempting API fallback:', e);
  }

  // 2. Try Express /api/schedule
  try {
    const res = await fetch('/api/schedule');
    if (res.ok) {
      const data = await res.json();
      saveLocalCachedData(data);
      return data;
    }
  } catch (e) {
    console.warn('Failed to fetch from /api/schedule, using local cache', e);
  }

  // 3. Fallback to LocalStorage
  return getLocalCachedData();
}

// Save single cell to API
export async function saveCellAPI(cell: ScheduleCell): Promise<boolean> {
  try {
    const res = await fetch('/api/schedule/cell', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cell }),
    });
    return res.ok;
  } catch (e) {
    console.warn('Failed to save cell to API', e);
    return false;
  }
}

// Delete single cell
export async function deleteCellAPI(cellId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/schedule/cell/${encodeURIComponent(cellId)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (e) {
    console.warn('Failed to delete cell from API', e);
    return false;
  }
}

// Save evening notes
export async function saveEveningNotesAPI(note: EveningStudyNotes): Promise<boolean> {
  try {
    const res = await fetch('/api/schedule/evening', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note }),
    });
    return res.ok;
  } catch (e) {
    console.warn('Failed to save evening notes to API', e);
    return false;
  }
}

// Sync single cell
export async function syncCellAPI(sourceCellId: string, targetWorkspaceId: string): Promise<ScheduleCell | null> {
  try {
    const res = await fetch('/api/schedule/sync-cell', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceCellId, targetWorkspaceId }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.syncedCell;
    }
  } catch (e) {
    console.warn('Failed to sync cell via API', e);
  }
  return null;
}

// Sync full day
export async function syncDayAPI(
  sourceWorkspaceId: string,
  targetWorkspaceId: string,
  weekId: string,
  dayId: string
): Promise<number> {
  try {
    const res = await fetch('/api/schedule/sync-day', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceWorkspaceId, targetWorkspaceId, weekId, dayId }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.copiedCount || 0;
    }
  } catch (e) {
    console.warn('Failed to sync day via API', e);
  }
  return 0;
}

// Sync full week
export async function syncFullWeekAPI(
  sourceWorkspaceId: string,
  targetWorkspaceId: string,
  weekId: string
): Promise<number> {
  try {
    const res = await fetch('/api/schedule/sync-full', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceWorkspaceId, targetWorkspaceId, weekId }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.copiedCount || 0;
    }
  } catch (e) {
    console.warn('Failed to sync full week via API', e);
  }
  return 0;
}

// Create new week
export async function createNewWeekAPI(payload: {
  name: string;
  startDate: string;
  endDate?: string;
  copyFromWeekId?: string;
}): Promise<WeekData | null> {
  try {
    const res = await fetch('/api/schedule/new-week', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      return data.newWeek;
    }
  } catch (e) {
    console.warn('Failed to create new week via API', e);
  }
  return null;
}

// Reset schedule
export async function resetScheduleAPI(): Promise<FullScheduleData | null> {
  try {
    const res = await fetch('/api/schedule/reset', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      return data.data;
    }
  } catch (e) {
    console.warn('Failed to reset schedule via API', e);
  }
  return null;
}
