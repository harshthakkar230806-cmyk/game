// Missions screen - generated missions, bounties, progress tracking, claiming rewards.

import React from 'react';
import { useGameContext } from '../../context/GameContext';
import { MISSION_TEMPLATES } from '../../engine/constants';

export default function MissionsScreen() {
  const { state, updateState, addCredits, addResources, setScreen, currentScreen } = useGameContext();

  if (!state || currentScreen !== 'MISSIONS') return null;

  return (
    <div className="min-h-screen p-4 fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button onClick={() => setScreen('MAIN')} className="btn btn-secondary mb-0">
            ← Menu
          </button>
          <span className="text-2xl font-bold">Missions & Bounties</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MISSION_TEMPLATES.map((tmpl) => {
          const isCompleted = state.missions.find((m) => m.id === tmpl.id)?.status === 'completed';
          const currentProgress = state.stats.totalMined.iron || 0;
          const target = tmpl.target;

          return (
            <div key={tmpl.id} className="glass p-5">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-white text-lg">{tmpl.name}</h3>
                  <div className="text-xs text-slate-400 capitalize">{tmpl.type} Mission</div>
                </div>
                {isCompleted ? (
                  <span className="text-xs px-2 py-1 bg-green-900 text-green-400 rounded">Completed</span>
                ) : (
                  <span className="text-xs px-2 py-1 bg-cyan-900 text-cyan-400 rounded">In Progress</span>
                )}
              </div>
              <p className="text-sm text-slate-300 my-3">{tmpl.desc}</p>

              <div className="space-y-2 my-4">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Progress</span>
                  <span>{currentProgress}/{target}</span>
                </div>
                <div className="stat-bar">
                  <div
                    className="stat-bar-fill bg-cyan-500"
                    style={{ width: `${Math.min(100, (currentProgress / target) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="text-xs text-slate-400">
                  Reward: <span className="text-yellow-400 font-mono">+{tmpl.rewardCredits} Cr</span>
                  {Object.entries(tmpl.rewardResources).map(([k, v]) => (
                    <span key={k} className="ml-2 text-cyan-400 font-mono">+{v} {k}</span>
                  ))}
                </div>
                {!isCompleted && currentProgress >= target && (
                  <button
                    onClick={() => {
                      addCredits(tmpl.rewardCredits);
                      addResources(tmpl.rewardResources);
                      updateState((s) => {
                        let m = s.missions.find((m) => m.id === tmpl.id);
                        if (!m) {
                          m = { id: tmpl.id, type: tmpl.type, name: tmpl.name, description: tmpl.desc, status: 'completed', progress: target, target, reward: { credits: tmpl.rewardCredits, resources: tmpl.rewardResources } };
                          s.missions.push(m);
                        } else {
                          m.status = 'completed';
                        }
                        return s;
                      });
                    }}
                    className="btn btn-success text-xs"
                  >
                    Claim Reward
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}