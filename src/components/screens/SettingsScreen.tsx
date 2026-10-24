// Settings screen - save management, audio, and visual preferences.

import React from 'react';
import { useGameContext } from '../../context/GameContext';

export default function SettingsScreen() {
  const { state, updateState, setScreen, currentScreen, saveGame, resetGame } = useGameContext();

  if (!state || currentScreen !== 'SETTINGS') return null;

  return (
    <div className="min-h-screen p-4 fade-in flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl glass p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white">System Settings</h2>
          <button onClick={() => setScreen('MAIN')} className="btn btn-secondary">Done</button>
        </div>

        <div className="space-y-8">
          {/* Audio Section */}
          <section className="glass-item p-6">
            <h3 className="text-lg font-bold text-cyan-400 mb-4">Audio Control</h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white">Master Volume</div>
                <div className="text-sm text-slate-400">Synthesized sound effects and ambient noise</div>
              </div>
              <input
                type="range"
                className="w-32 accent-cyan-500"
                min="0"
                max="100"
                defaultValue="75"
              />
            </div>
          </section>

          {/* Save Management */}
          <section className="glass-item p-6">
            <h3 className="text-lg font-bold text-cyan-400 mb-4">Save Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-800/50 rounded border border-slate-700/50">
                <div className="text-sm text-slate-400 mb-1">Last Saved</div>
                <div className="font-mono text-white mb-4">{new Date(state.lastSave).toLocaleString()}</div>
                <button
                  onClick={() => {
                    saveGame();
                    alert('Log: Game state synchronized with local IndexedDB.');
                  }}
                  className="btn btn-primary w-full"
                >
                  Manual Save
                </button>
              </div>

              <div className="p-4 bg-red-900/10 rounded border border-red-900/30">
                <div className="text-sm text-red-400 mb-1">Danger Zone</div>
                <div className="text-xs text-slate-500 mb-4">This will permanently erase all galactic progress.</div>
                <button
                  onClick={() => {
                    if (confirm('Are you absolutely sure? This cannot be undone.')) {
                      resetGame();
                      window.location.reload();
                    }
                  }}
                  className="btn bg-red-600 hover:bg-red-500 text-white w-full border-none"
                >
                  Delete Save Data
                </button>
              </div>
            </div>
          </section>

          {/* Visuals */}
          <section className="glass-item p-6">
            <h3 className="text-lg font-bold text-cyan-400 mb-4">Interface</h3>
            <div className="flex items-center justify-between">
              <span className="text-white">High Contrast Mode</span>
              <button className="text-cyan-400 font-bold">DISABLED</button>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 text-center">
          <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Galaxy Tycoon Engine</div>
          <div className="text-[10px] text-slate-600">Version 1.0.4-BETA · Client-Side Only · No Backend</div>
        </div>
      </div>
    </div>
  );
}