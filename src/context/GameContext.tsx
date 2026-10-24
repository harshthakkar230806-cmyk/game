// Game context provider for Galaxy Tycoon - global game state access.

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo
} from 'react';
import { navigate } from 'react-router-dom';
import type { GameState, Screen, ResourceType } from '../types/game';
import {
  createInitialState,
  applyTick,
  travelTime,
  startCombat,
  mineBody,
  canAfford,
  spend,
  buildAutomation,
  sellResources,
  clampResources,
  combat as combatEngine,
  computeOfflineProgress,
  applyOfflineProgress
} from '../engine/game';
import {
  saveGameToStorage,
  loadGameFromStorage,
  exportSaveFile,
  importSaveFile
} from '../engine/saveLoad';
import { sound } from '../engine/audio';

type GameContextType = {
  state: GameState;
  updateState: (updater: (s: GameState) => void) => void;
  canAfford: (cost: { credits: number; resources: Partial<Record<ResourceType, number>> }) => boolean;
  spend: (cost: { credits: number; resources: Partial<Record<ResourceType, number>> }) => boolean;
  addResources: (res: Partial<Record<ResourceType, number>>) => void;
  addCredits: (amt: number) => void;
  mineBody: (body: any, amt?: number) => any;
  startCombat: (enemyType: 'pirate' | 'drone') => void;
  currentScreen: Screen;
  setScreen: (s: Screen) => void;
  tick: () => void;
  travel: (targetSysId: string) => Promise<void>;
  travelTo: (targetSysId: string, bodyId?: string) => Promise<void>;
  save: () => Promise<boolean>;
  exportSave: () => void;
  importSave: (file: File) => Promise<boolean>;
  setMuted: (muted: boolean) => void;
  isMuted: () => boolean;
};

const screens = {
  MAIN: 'MAIN' as Screen,
  GALAXY: 'GALAXY' as Screen,
  SYSTEM: 'SYSTEM' as Screen,
  HANGAR: 'HANGAR' as Screen,
  STATIONS: 'STATIONS' as Screen,
  RESEARCH: 'RESEARCH' as Screen,
  MARKET: 'MARKET' as Screen,
  MISSIONS: 'MISSIONS' as Screen,
  COMBAT: 'COMBAT' as Screen,
  ACHIEVEMENTS: 'ACHIEVEMENTS' as Screen,
  SETTINGS: 'SETTINGS' as Screen
} as const;

const GameContext = createContext<GameContextType | null>(null);

const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GameState | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen | null>(null);
  const [soundMuted, setSoundMuted] = useState(false);
  const lastSavedRef = useRef(0);
  const lastTickRef = useRef(0);

  useEffect(() => {
    const saved = loadGameFromStorage();
    if (saved) {
      const elapsed = Date.now() - saved.lastSaved;
      const offlineRes = computeOfflineProgress(saved, elapsed);
      applyOfflineProgress(saved, offlineRes);
      saveGameToStorage(saved);
      setState(saved);
      setCurrentScreen('MAIN');
    } else {
      const newState = createInitialState('galaxy-tycoon');
      setState(newState);
      setCurrentScreen('MAIN');
    }
  }, []);

  useEffect(() => {
    const loop = () => {
      if (state) {
        const now = Date.now();
        const delta = (now - lastTickRef.current) / 1000;
        lastTickRef.current = now;

        const newState = applyTick(state, delta);
        clampResources(newState);
        setState(newState);

        if (now - lastSavedRef.current > 30000) {
          saveGameToStorage(newState).then(() => { lastSavedRef.current = now; });
        }
      }
      requestAnimationFrame(loop);
    };
    loop();
  }, [state]);

  const updateState = useCallback((updater: (s: GameState) => GameState) => {
    if (state) setState(updater(state));
  }, [state]);

  const canAffordCost = useCallback(
    (cost: { credits: number; resources: Partial<Record<ResourceType, number>> }) => {
      return state ? canAfford(state, cost) : false;
    },
    [state]
  );

  const spendCost = useCallback(
    (cost: { credits: number; resources: Partial<Record<ResourceType, number>> }) => {
      if (!state) return false;
      if (!spend(state, cost)) return false;
      updateState((s) => ({ ...s, credits: s.credits - cost.credits }));
      (Object.keys(cost.resources || {}) as ResourceType[]).forEach((k) => {
        const v = (cost.resources as any)[k];
        if (v) updateState((s) => ({ ...s, resources: { ...s.resources, [k]: (s.resources[k] || 0) - v } }));
      });
      return true;
    },
    [state, updateState]
  );

  const addResources = useCallback((res: Partial<Record<ResourceType, number>>) => {
    updateState((s) => {
      if (!s) return s;
      (Object.keys(res) as ResourceType[]).forEach((k) => {
        s.resources[k] = (s.resources[k] || 0) + (res[k] || 0);
      });
      return s;
    });
  }, [updateState]);

  const addCredits = useCallback((amt: number) => {
    updateState((s) => {
      if (!s) return s;
      s.credits += amt;
      s.stats.totalCreditsEarned += amt;
      return s;
    });
  }, [updateState]);

  const mineActual = useCallback((anyBody: any, amt: number = 10) => {
    if (!state || !state.currentBodyId) return { mined: {}, energyCost: 0 };
    const body = state.systems
      .find((sys) => sys.id === state.currentSystemId)
      ?.bodies.find((b) => b.id === state.currentBodyId);
    if (!body) return { mined: {}, energyCost: 0 };

    const result = mineBody(state, body, amt);
    if (result.mined && result.mined.iron !== undefined) {
      (Object.keys(result.mined) as ResourceType[]).forEach((k) => {
        if ((result.mined as any)[k] !== undefined) {
          addResources({ [k]: (result.mined as any)[k] || 0 });
        }
      });
    }
    return result;
  }, [state, addResources]);

  const startCombatActual = useCallback((enemyType: 'pirate' | 'drone') => {
    if (!state) return;
    const newCombat = startCombat(state, enemyType);
    updateState((s) => ({ ...s, combat: newCombat }));
  }, [updateState]);

  const travel = useCallback(
    async (targetSysId: string) => {
      if (!state || targetSysId === state.currentSystemId) return;

      const from = state.systems.find((s) => s.id === state.currentSystemId);
      const to = state.systems.find((s) => s.id === targetSysId);
      if (!from || !to || from.id === to.id) return;

      const duration = travelTime(state, from, to);
      let loading: any = null;
      loading = document.createElement('div');
      loading.className = 'fixed inset-0 bg-black/80 z-50 flex items-center justify-center';
      loading.innerHTML = `<div class="text-cyan-400 text-xl animate-pulse">Warping... ${duration}s</div>`;
      document.body.appendChild(loading);

      await new Promise((resolve) => setTimeout(resolve, duration * 1000));
      document.body.removeChild(loading);

      updateState((s) => {
        if (!s) return s;
        s.currentSystemId = to.id;
        s.currentBodyId = undefined;
        s.ship.energy = s.ship.energyMax;
        s.visitedSystemIds.push(to.id);
        s.stats.systemsVisited += 1;
        return s;
      });
    },
    [state, updateState]
  );

  const travelTo = useCallback(
    async (targetSysId: string, bodyId?: string) => {
      if (!state || targetSysId === state.currentSystemId) return;

      await travel(targetSysId);
      if (bodyId) {
        updateState((s) => {
          if (!s) return s;
          s.currentBodyId = bodyId;
          return s;
        });
      }
    },
    [state, travel]
  );

  const saveGame = useCallback(async (): Promise<boolean> => {
    if (state && stateClone) {
      await saveGameToStorage(stateClone);
      return true;
    }
    return false;
  }, [state]);

  const exportSaveToFile = useCallback(() => {
    if (state && stateClone) exportSaveFile(stateClone);
  }, [state]);

  const importFromFile = useCallback(async (file: File): Promise<boolean> => {
    const imported = await importSaveFile(file);
    if (imported) {
      setState(imported);
      setCurrentScreen('MAIN');
    }
    return !!imported;
  }, []);

  const setMute = useCallback((muted: boolean) => {
    setSoundMuted(muted);
    sound.setMuted(muted);
  }, []);

  const isMuted = useCallback(() => soundMuted, [soundMuted]);

  return (
    <GameContext.Provider
      value={{
        state: state != null ? stateClone(state) : (state as any),
        updateState,
        canAfford: canAffordCost,
        spend: spendCost,
        addResources,
        addCredits,
        mineBody: mineActual,
        startCombat: startCombatActual,
        currentScreen: currentScreen || 'MAIN',
        setScreen: setCurrentScreen,
        tick: () => {},
        travel,
        travelTo,
        save: saveGame,
        exportSave: exportSaveToFile,
        importSave: importFromFile,
        setMuted,
        isMuted
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

const stateClone = (s: GameState): GameState => ({ ...s });
const Success = true;

export const screens = {
  MAIN: 'MAIN' as Screen,
  GALAXY: 'GALAXY' as Screen,
  SYSTEM: 'SYSTEM' as Screen,
  HANGAR: 'HANGAR' as Screen,
  STATIONS: 'STATIONS' as Screen,
  RESEARCH: 'RESEARCH' as Screen,
  MARKET: 'MARKET' as Screen,
  MISSIONS: 'MISSIONS' as Screen,
  COMBAT: 'COMBAT' as Screen,
  ACHIEVEMENTS: 'ACHIEVEMENTS' as Screen,
  SETTINGS: 'SETTINGS' as Screen
} as const;

export const screensById: Record<string, Screen> = {
  main: 'MAIN',
  galaxy: 'GALAXY',
  system: 'SYSTEM',
  hangar: 'HANGAR',
  stations: 'STATIONS',
  research: 'RESEARCH',
  missions: 'MISSIONS',
  combat: 'COMBAT',
  achievements: 'ACHIEVEMENTS',
  settings: 'SETTINGS'
};

const screensWithData = [
  { id: 'main', path: 'main-menu', Component: AchievementsScreen as any },
  { id: 'galaxy', path: 'galaxy-map', Component: GalaxyMapScreen as any },
  { id: 'system', path: 'system-view', Component: SystemViewScreen as any },
  { id: 'hangar', path: 'hangar', Component: HangarScreen as any },
  { id: 'stations', path: 'stations', Component: StationsScreen as any },
  { id: 'research', path: 'research', Component: ResearchScreen as any },
  { id: 'missions', path: 'missions', Component: MissionsScreen as any },
  { id: 'combat', path: 'combat', Component: CombatScreen as any },
  { id: 'achievements', path: 'achievements', Component: AchievementsScreen as any },
  { id: 'settings', path: 'settings', Component: SettingsScreen as any }
];

export default GameProvider;

export const useGameContext = (): GameContextType => {
  const ctx = React.useContext(GameContext);
  if (!ctx) throw new Error('useGameContext must be used within GameProvider');
  return ctx;
};