// Save/Load system using IndexedDB with localStorage fallback, and JSON export/import.

import { GameState } from '../types/game';
import { SAVE_KEY, SAVE_STORE, SAVE_STORE_KEY, SAVE_VERSION } from './constants';
import { createInitialState } from './game';

export const saveGameToStorage = async (state: GameState): Promise<boolean> => {
  try {
    state.lastSaved = Date.now();
    const json = JSON.stringify(state);
    // localStorage backup
    localStorage.setItem(SAVE_KEY, json);

    // IndexedDB primary
    await new Promise<void>((resolve, reject) => {
      const req = indexedDB.open(SAVE_STORE, 1);
      req.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('saves')) {
          db.createObjectStore('saves');
        }
      };
      req.onsuccess = (e: any) => {
        const db = e.target.result;
        const tx = db.transaction('saves', 'readwrite');
        const store = tx.objectStore('saves');
        store.put(json, SAVE_STORE_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      };
      req.onerror = () => reject(req.error);
    });
    return true;
  } catch (err) {
    console.error('Save failed:', err);
    return false;
  }
};

export const loadGameFromStorage = async (): Promise<GameState | null> => {
  try {
    let json: string | null = null;
    try {
      json = await new Promise<string | null>((resolve) => {
        const req = indexedDB.open(SAVE_STORE, 1);
        req.onupgradeneeded = (e: any) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('saves')) db.createObjectStore('saves');
        };
        req.onsuccess = (e: any) => {
          const db = e.target.result;
          const tx = db.transaction('saves', 'readonly');
          const store = tx.objectStore('saves');
          const getReq = store.get(SAVE_STORE_KEY);
          getReq.onsuccess = () => resolve(getReq.result || null);
          getReq.onerror = () => resolve(null);
        };
        req.onerror = () => resolve(null);
      });
    } catch {
      // ignore IDB error
    }

    if (!json) {
      json = localStorage.getItem(SAVE_KEY);
    }

    if (!json) return null;

    const parsed = JSON.parse(json) as GameState;
    if (!parsed || !parsed.version) return null;
    return parsed;
  } catch (err) {
    console.error('Load failed:', err);
    return null;
  }
};

export const exportSaveFile = (state: GameState): void => {
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `galaxy-tycoon-save-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importSaveFile = async (file: File): Promise<GameState | null> => {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text) as GameState;
    if (!parsed || !parsed.version || !parsed.ship) {
      throw new Error('Invalid save file structure');
    }
    await saveGameToStorage(parsed);
    return parsed;
  } catch (err) {
    console.error('Import failed:', err);
    return null;
  }
};
