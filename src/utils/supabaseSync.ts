import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { FullScheduleData } from '../types';
import { INITIAL_SCHEDULE_DATA } from '../data/scheduleConfig';

const SCHEDULE_RECORD_ID = 'main_schedule';

/**
 * Fetch schedule from Supabase table `schedule_store`.
 * If record does not exist yet, initializes it with INITIAL_SCHEDULE_DATA.
 */
export async function fetchFromSupabase(): Promise<FullScheduleData | null> {
  if (!supabase || !isSupabaseConfigured) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('schedule_store')
      .select('data')
      .eq('id', SCHEDULE_RECORD_ID)
      .maybeSingle();

    if (error) {
      console.warn('Supabase fetch error (table may not be created yet):', error.message);
      return null;
    }

    if (data && data.data) {
      return data.data as FullScheduleData;
    }

    // Row doesn't exist yet -> seed initial row
    try {
      await supabase.from('schedule_store').insert({
        id: SCHEDULE_RECORD_ID,
        data: INITIAL_SCHEDULE_DATA,
        updated_at: new Date().toISOString(),
      });
      return INITIAL_SCHEDULE_DATA;
    } catch (seedErr) {
      console.warn('Could not seed initial schedule row to Supabase:', seedErr);
      return INITIAL_SCHEDULE_DATA;
    }
  } catch (err) {
    console.warn('Failed to query Supabase:', err);
    return null;
  }
}

/**
 * Save full schedule data to Supabase table `schedule_store`.
 */
export async function saveToSupabase(schedule: FullScheduleData): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) {
    return false;
  }

  try {
    const { error } = await supabase.from('schedule_store').upsert(
      {
        id: SCHEDULE_RECORD_ID,
        data: schedule,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (error) {
      console.warn('Failed to save schedule to Supabase:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.warn('Error saving to Supabase:', err);
    return false;
  }
}

/**
 * Real-time subscription to listen for schedule changes from other tabs / users.
 */
export function subscribeToSupabase(
  onUpdate: (data: FullScheduleData) => void
): (() => void) | null {
  if (!supabase || !isSupabaseConfigured) {
    return null;
  }

  try {
    const channel = supabase
      .channel('public:schedule_store')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'schedule_store',
          filter: `id=eq.${SCHEDULE_RECORD_ID}`,
        },
        (payload) => {
          if (payload.new && typeof payload.new === 'object' && 'data' in payload.new) {
            const incoming = (payload.new as { data: FullScheduleData }).data;
            if (incoming && incoming.cells && incoming.weeks) {
              onUpdate(incoming);
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('🌸 Supabase Realtime connected for schedule_store');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Failed to setup Supabase realtime subscription:', err);
    return null;
  }
}
