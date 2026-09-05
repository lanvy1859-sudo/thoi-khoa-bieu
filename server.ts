import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { INITIAL_SCHEDULE_DATA } from './src/data/scheduleConfig.js';
import { FullScheduleData, ScheduleCell, WeekData } from './src/types.js';

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'schedule_store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to load data
function getScheduleData(): FullScheduleData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading schedule file, falling back to initial data:', err);
  }
  // Initialize with initial data
  saveScheduleData(INITIAL_SCHEDULE_DATA);
  return INITIAL_SCHEDULE_DATA;
}

// Helper to save data
function saveScheduleData(data: FullScheduleData) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving schedule data:', err);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Get full schedule
  app.get('/api/schedule', (req, res) => {
    const data = getScheduleData();
    res.json(data);
  });

  // Save/Update single cell
  app.post('/api/schedule/cell', (req, res) => {
    const { cell } = req.body as { cell: ScheduleCell };
    if (!cell || !cell.id) {
      return res.status(400).json({ error: 'Missing cell or cell.id' });
    }
    const data = getScheduleData();
    data.cells[cell.id] = {
      ...cell,
      updatedAt: new Date().toISOString(),
    };
    saveScheduleData(data);
    res.json({ success: true, cell: data.cells[cell.id] });
  });

  // Delete a single cell
  app.delete('/api/schedule/cell/:id', (req, res) => {
    const cellId = req.params.id;
    const data = getScheduleData();
    if (data.cells[cellId]) {
      delete data.cells[cellId];
      saveScheduleData(data);
    }
    res.json({ success: true });
  });

  // Update Evening notes
  app.post('/api/schedule/evening', (req, res) => {
    const { note } = req.body;
    if (!note || !note.id) {
      return res.status(400).json({ error: 'Missing note or note.id' });
    }
    const data = getScheduleData();
    data.eveningNotes[note.id] = note;
    saveScheduleData(data);
    res.json({ success: true, note });
  });

  // SYNC: Single Cell
  // Copy one cell from source workspace to target workspace
  app.post('/api/schedule/sync-cell', (req, res) => {
    const { sourceCellId, targetWorkspaceId } = req.body;
    // cellId format: `${workspaceId}_${weekId}_${day}_${slotId}`
    const data = getScheduleData();
    const sourceCell = data.cells[sourceCellId];
    if (!sourceCell) {
      return res.status(404).json({ error: 'Source cell not found' });
    }

    const parts = sourceCellId.split('_');
    // First part is workspace, remaining is weekId_day_slotId
    // But weekId might be 'week_1', so let's parse safely:
    // parts[0] is workspace ('lan_vy' or 'kim_anh')
    const srcWs = parts[0] + (parts[1] === 'vy' || parts[1] === 'anh' ? '_' + parts[1] : '');
    const remainder = sourceCellId.substring(srcWs.length + 1);
    const targetCellId = `${targetWorkspaceId}_${remainder}`;

    const newCell: ScheduleCell = {
      ...sourceCell,
      id: targetCellId,
      updatedAt: new Date().toISOString(),
    };
    data.cells[targetCellId] = newCell;
    saveScheduleData(data);

    res.json({ success: true, syncedCell: newCell });
  });

  // SYNC: Day (Row/Column Sync)
  // Copy all slots for a given day in a week from sourceWorkspace to targetWorkspace
  app.post('/api/schedule/sync-day', (req, res) => {
    const { sourceWorkspaceId, targetWorkspaceId, weekId, dayId } = req.body;
    const data = getScheduleData();
    let copiedCount = 0;

    const sourcePrefix = `${sourceWorkspaceId}_${weekId}_${dayId}_`;
    const targetPrefix = `${targetWorkspaceId}_${weekId}_${dayId}_`;

    // Remove existing target day cells
    Object.keys(data.cells).forEach((k) => {
      if (k.startsWith(targetPrefix)) {
        delete data.cells[k];
      }
    });

    // Copy source day cells
    Object.entries(data.cells).forEach(([key, cell]) => {
      if (key.startsWith(sourcePrefix)) {
        const slotPart = key.substring(sourcePrefix.length);
        const newKey = `${targetPrefix}${slotPart}`;
        data.cells[newKey] = {
          ...cell,
          id: newKey,
          updatedAt: new Date().toISOString(),
        };
        copiedCount++;
      }
    });

    saveScheduleData(data);
    res.json({ success: true, copiedCount });
  });

  // SYNC: Slot (Period across all days)
  app.post('/api/schedule/sync-slot', (req, res) => {
    const { sourceWorkspaceId, targetWorkspaceId, weekId, slotId } = req.body;
    const data = getScheduleData();
    let copiedCount = 0;

    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    days.forEach((day) => {
      const srcKey = `${sourceWorkspaceId}_${weekId}_${day}_${slotId}`;
      const tgtKey = `${targetWorkspaceId}_${weekId}_${day}_${slotId}`;
      if (data.cells[srcKey]) {
        data.cells[tgtKey] = {
          ...data.cells[srcKey],
          id: tgtKey,
          updatedAt: new Date().toISOString(),
        };
        copiedCount++;
      }
    });

    saveScheduleData(data);
    res.json({ success: true, copiedCount });
  });

  // SYNC: Full Week Timetable
  // Copy all cells of weekId from sourceWorkspace to targetWorkspace
  app.post('/api/schedule/sync-full', (req, res) => {
    const { sourceWorkspaceId, targetWorkspaceId, weekId } = req.body;
    const data = getScheduleData();
    let copiedCount = 0;

    const srcPrefix = `${sourceWorkspaceId}_${weekId}_`;
    const tgtPrefix = `${targetWorkspaceId}_${weekId}_`;

    // Clear target week cells first
    Object.keys(data.cells).forEach((k) => {
      if (k.startsWith(tgtPrefix)) {
        delete data.cells[k];
      }
    });

    // Copy from source
    Object.entries(data.cells).forEach(([key, cell]) => {
      if (key.startsWith(srcPrefix)) {
        const suffix = key.substring(srcPrefix.length);
        const newKey = `${tgtPrefix}${suffix}`;
        data.cells[newKey] = {
          ...cell,
          id: newKey,
          updatedAt: new Date().toISOString(),
        };
        copiedCount++;
      }
    });

    data.lastSyncedAt = new Date().toISOString();
    saveScheduleData(data);
    res.json({ success: true, copiedCount, syncedAt: data.lastSyncedAt });
  });

  // CREATE NEW WEEK
  app.post('/api/schedule/new-week', (req, res) => {
    const { name, startDate, endDate, copyFromWeekId } = req.body;
    const data = getScheduleData();

    const nextWeekNum = data.weeks.length + 1;
    const newWeekId = `week_${nextWeekNum}_${Date.now()}`;

    const newWeek: WeekData = {
      id: newWeekId,
      weekNumber: nextWeekNum,
      name: name || `Tuần ${nextWeekNum}`,
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || '',
    };

    data.weeks.push(newWeek);
    data.currentWeekId = newWeekId;

    // If copyFromWeekId is provided, duplicate all cells for both workspaces!
    if (copyFromWeekId) {
      Object.entries(data.cells).forEach(([key, cell]) => {
        // e.g. lan_vy_week_1_mon_m1
        if (key.includes(`_${copyFromWeekId}_`)) {
          const newKey = key.replace(`_${copyFromWeekId}_`, `_${newWeekId}_`);
          data.cells[newKey] = {
            ...cell,
            id: newKey,
            updatedAt: new Date().toISOString(),
          };
        }
      });
    }

    saveScheduleData(data);
    res.json({ success: true, newWeek, allWeeks: data.weeks });
  });

  // RESET TO DEFAULT
  app.post('/api/schedule/reset', (req, res) => {
    saveScheduleData(INITIAL_SCHEDULE_DATA);
    res.json({ success: true, data: INITIAL_SCHEDULE_DATA });
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌸 Timetable Server running on port ${PORT}`);
  });
}

startServer();
