import { createClient } from '@supabase/supabase-js';
import { FullScheduleData, ScheduleCell, WeekData, EveningStudyNotes } from '../types';
import { INITIAL_SCHEDULE_DATA } from '../data/scheduleConfig';

const LOCAL_STORAGE_KEY = 'tkb_lanvy_kimanh_v1';

// Key kết nối lấy từ Vercel Env hoặc dán trực tiếp key Supabase của bạn vào đây
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://zuqukykninqoskfetlaq.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1cXVreWtuaW5xb3NrZmV0bGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MjE2NjAsImV4cCI6MjEwNDE5NzY2MH0.7KodYMszDzfjoCSwx5qnHwX9E72j8pwejyMJ3SZ0DLs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 1. Lấy dữ liệu từ LocalStorage tạm thời
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

// 2. Lưu vào LocalStorage
export function saveLocalCachedData(data: FullScheduleData) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Could not save to localStorage', e);
  }
}

// 3. Lấy dữ liệu thực từ Supabase
export async function fetchScheduleAPI(): Promise<FullScheduleData> {
  try {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('id', 'main_schedule')
      .single();

    if (data && !error) {
      const fullData = data.content as FullScheduleData;
      saveLocalCachedData(fullData);
      return fullData;
    }
  } catch (e) {
    console.warn('Failed to fetch from Supabase, using local cache', e);
  }
  return getLocalCachedData();
}

// 4. Lưu từng ô dữ liệu (cell) lên Supabase
export async function saveCellAPI(cell: ScheduleCell): Promise<boolean> {
  try {
    const currentData = getLocalCachedData();
    const updatedCells = { ...currentData.cells, [cell.id]: cell };
    const newData = { ...currentData, cells: updatedCells };

    saveLocalCachedData(newData);

    const { error } = await supabase
      .from('schedules')
      .upsert({ id: 'main_schedule', content: newData });

    return !error;
  } catch (e) {
    console.warn('Failed to save cell to Supabase', e);
    return false;
  }
}

// 5. Xóa cell khỏi Supabase
export async function deleteCellAPI(cellId: string): Promise<boolean> {
  try {
    const currentData = getLocalCachedData();
    const { [cellId]: omitted, ...updatedCells } = currentData.cells;
    const newData = { ...currentData, cells: updatedCells };

    saveLocalCachedData(newData);

    const { error } = await supabase
      .from('schedules')
      .upsert({ id: 'main_schedule', content: newData });

    return !error;
  } catch (e) {
    console.warn('Failed to delete cell from Supabase', e);
    return false;
  }
}
