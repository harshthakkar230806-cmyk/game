// Achievements screen - trophies and badges.

import React from 'react';
import { useGameContext } from '../../context/GameContext';

const ACHIEVEMENTS = [
  { id: 'first_mine', name: 'Deep Space Miner', desc: 'Mine your first asteroid', target: 1, stat: 'totalMined' },
  { id: 'explorer', name: 'Trailblazer', desc: 'Visit 10 different star systems', target: 10, stat: 'systemsVisited' },
  { id: 'rich', name: 'Galactic Tycoon', desc: 'Accumulate 1,000,000 credits', target: 1000000, stat: 'totalCreditsEarned' },
  { id: 'pirate_hunter', name: 'Aegis of the Stars', desc: 'Defeat 25 pirate ships', target: 25, stat: 'totalEnemiesDefeated' },
  { id: 'master_researcher', name: 'Singularity', desc: 'Unlock all research technologies', target: 20, stat: 'totalTechsUnlocked' },
];

export default function AchievementsScreen() {
  const { state, setScreen, currentScreen } = useGameContext();

  if (!state || currentScreen !== 'ACHIEVEMENTS') return null;

  return (
    <div className="min-h-screen p-4 fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button onClick={() => setScreen('MAIN')} className="btn btn-secondary mb-0">
            ← Menu
          </button>
          <span className="text-2xl font-bold">Galactic Records</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ACHIEVEMENTS.map((ach) => {
          // Flatten mining stats for check
          const currentVal = ach.stat === 'totalMined'
            ? Object.values(state.stats.totalMined).reduce((a, b) => a + b, 0)
            : (state.stats as any)[ach.stat] || 0;

          const isUnlocked = currentVal >= ach.target;

          return (
            <div
              key={ach.id}
              className={`glass p-5 border-t-4 ${isUnlocked ? 'border-yellow-500 bg-yellow-900/10' : 'border-slate-700 grayscale opacity-60'}`}
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="text-3xl">{isUnlocked ? '🏆' : '🔒'}</div>
                <div>
                  <h3 className={`font-bold ${isUnlocked ? 'text-yellow-400' : 'text-slate-300'}`}>{ach.name}</h3>
                  <p className="text-xs text-slate-400">{ach.desc}</p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-tighter">
                  <span>Progress</span>
                  <span>{currentVal.toLocaleString()} / {ach.target.toLocaleString()}</span>
                </div>
                <div className="stat-bar h-1.5">
                  <div
                    className={`stat-bar-fill ${isUnlocked ? 'bg-yellow-500' : 'bg-slate-700'}`}
                    style={{ width: `${Math.min(100, (currentVal / ach.target) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}