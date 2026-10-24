// Main dashboard screen - landing page and overall summary.

import React from 'react';
import { useGameContext } from '../../context/GameContext';

export default function MainScreen() {
  const { state, ship, setScreen, currentScreen } = useGameContext();

  if (!state || currentScreen !== 'MAIN') return null;

  const totalResources = Object.values(state.resources).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-stars">
      {/* Hero Header */}
      <div className="text-center mb-12 fade-in">
        <h1 className="text-6xl font-black text-white tracking-tighter mb-2">
          GALAXY <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">TYCOON</span>
        </h1>
        <p className="text-slate-400 font-mono text-sm tracking-widest uppercase">Interstellar Command Dashboard</p>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Navigation Column */}
        <div className="md:col-span-1 flex flex-col gap-3">
          <button
            onClick={() => setScreen('SYSTEM')}
            className="group relative p-4 glass hover:bg-cyan-900/20 border-l-4 border-cyan-500 text-left transition-all"
          >
            <div className="text-2xl mb-1">🛰️</div>
            <div className="font-bold text-white group-hover:text-cyan-400">System Operations</div>
            <div className="text-xs text-slate-500">Mining, exploration, and local transit.</div>
          </button>

          <button
            onClick={() => setScreen('GALAXY')}
            className="group relative p-4 glass hover:bg-purple-900/20 border-l-4 border-purple-500 text-left transition-all"
          >
            <div className="text-2xl mb-1">🌌</div>
            <div className="font-bold text-white group-hover:text-purple-400">Stellar Cartography</div>
            <div className="text-xs text-slate-500">Galaxy map and FTL jumping.</div>
          </button>

          <button
            onClick={() => setScreen('HANGAR')}
            className="group relative p-4 glass hover:bg-orange-900/20 border-l-4 border-orange-500 text-left transition-all"
          >
            <div className="text-2xl mb-1">🚀</div>
            <div className="font-bold text-white group-hover:text-orange-400">Ship Hangar</div>
            <div className="text-xs text-slate-500">Upgrades, cargo, and modifications.</div>
          </button>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <button onClick={() => setScreen('RESEARCH')} className="p-3 glass hover:bg-slate-800 text-center text-xs font-bold text-slate-400">🔬 RESEARCH</button>
            <button onClick={() => setScreen('MISSIONS')} className="p-3 glass hover:bg-slate-800 text-center text-xs font-bold text-slate-400">📋 MISSIONS</button>
            <button onClick={() => setScreen('ACHIEVEMENTS')} className="p-3 glass hover:bg-slate-800 text-center text-xs font-bold text-slate-400">🏆 RECORDS</button>
            <button onClick={() => setScreen('SETTINGS')} className="p-3 glass hover:bg-slate-800 text-center text-xs font-bold text-slate-400">⚙️ SETTINGS</button>
          </div>
        </div>

        {/* Status Column */}
        <div className="md:col-span-2 glass p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-8xl pointer-events-none">✨</div>

          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Fleet Overview</h3>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-green-400 font-mono tracking-tighter">ENGINE ONLINE · {ship.name}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-cyan-400 font-mono">{state.credits.toLocaleString()} <span className="text-sm font-normal text-slate-500">Cr</span></div>
              <div className="text-xs text-slate-500 uppercase">Liquid Capital</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="glass-item p-4 text-center">
              <div className="text-[10px] text-slate-500 uppercase mb-1">Stockpile</div>
              <div className="text-lg font-bold text-white">{totalResources.toLocaleString()}</div>
              <div className="text-[10px] text-slate-600">Total Units</div>
            </div>
            <div className="glass-item p-4 text-center">
              <div className="text-[10px] text-slate-500 uppercase mb-1">Exploration</div>
              <div className="text-lg font-bold text-white">{state.stats.systemsVisited}</div>
              <div className="text-[10px] text-slate-600">Systems Logged</div>
            </div>
            <div className="glass-item p-4 text-center">
              <div className="text-[10px] text-slate-500 uppercase mb-1">Automation</div>
              <div className="text-lg font-bold text-white">{state.automations.length}</div>
              <div className="text-[10px] text-slate-600">Active Units</div>
            </div>
            <div className="glass-item p-4 text-center">
              <div className="text-[10px] text-slate-500 uppercase mb-1">Integrity</div>
              <div className="text-lg font-bold text-green-400">{state.ship.hull}%</div>
              <div className="text-[10px] text-slate-600">Hull Status</div>
            </div>
          </div>

          {/* Activity Feed */}
          <div>
            <div className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-3">System Log</div>
            <div className="space-y-2">
              <div className="text-xs p-2 bg-cyan-900/10 border-l-2 border-cyan-500/50 text-cyan-300">
                Welcome Commander. System state restored from IndexedDB. Your current location is {state.systems.find(s => s.id === state.currentSystemId)?.name}.
              </div>
              <div className="text-xs p-2 bg-slate-800/50 border-l-2 border-slate-700 text-slate-400">
                Automation check: {state.automations.length} drones are currently extracting resources across the sector.
              </div>
              {state.stats.totalMined.iron === 0 && (
                <div className="text-xs p-2 bg-yellow-900/10 border-l-2 border-yellow-500/50 text-yellow-300">
                  ADVISORY: Stockpiles are empty. Immediate extraction recommended in local asteroid belts.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-12 text-slate-600 text-[10px] font-mono flex gap-8">
        <span>© 2026 GALAXY TYCOON</span>
        <span>SEED: {state.seed}</span>
        <span>STABLE VERSION 1.0.4</span>
      </div>
    </div>
  );
}