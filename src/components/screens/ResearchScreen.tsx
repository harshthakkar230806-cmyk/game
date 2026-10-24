// Research screen - tech tree branches.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameContext } from '../../context/GameContext';
import type { Screen, TechBranch } from '../../types/game';
import { TECH_TREE_NODES } from '../../engine/constants';

export default function ResearchScreen() {
  const { state, spend, updateState, setScreen, currentScreen } = useGameContext();
  const [activeBranch, setActiveBranch] = useState<TechBranch>('engineering');

  if (!state || currentScreen !== 'RESEARCH') return null;

  const branchNodes = TECH_TREE_NODES.filter((n) => n.branch === activeBranch);

  return (
    <div className="min-h-screen p-4 fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button onClick={() => setScreen('MAIN')} className="btn btn-secondary mb-0">
            ← Menu
          </button>
          <span className="text-2xl font-bold">Research Labs</span>
        </div>
        <div className="glass px-3 py-1 rounded text-sm flex items-center gap-2">
          <span>Resources:</span>
          <span className="text-purple-400 font-bold">{state.resources.crystals.toFixed(0)} Crystals</span>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="w-48 glass p-2 flex flex-col gap-1 flex-shrink-0">
          {(['engineering', 'automation', 'exploration', 'energy', 'alien'] as TechBranch[]).map((br) => (
            <button
              key={br}
              onClick={() => setActiveBranch(br)}
              className={`p-3 text-left rounded capitalize ${activeBranch === br ? 'bg-purple-900/50 border border-purple-500' : 'hover:bg-slate-800/50'}`}
            >
              <div className="text-sm font-bold">{br}</div>
            </button>
          ))}
        </div>

        <div className="flex-1 glass p-6 overflow-auto">
          <h3 className="text-xl font-bold text-purple-400 mb-6 capitalize">{activeBranch} Branch</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {branchNodes.map((tech) => {
              const isResearched = state.researchedTech.includes(tech.id);
              const isLocked = tech.prereqs.some((p) => !state.researchedTech.includes(p));
              const canBuy = !isResearched && !isLocked && spend({ credits: tech.cost.credits, resources: tech.cost.resources });

              return (
                <div
                  key={tech.id}
                  className={`glass-item p-5 border ${
                    isResearched ? 'border-green-500/50' :
                    isLocked ? 'border-slate-800 opacity-50' : 'border-slate-700/50 hover:border-purple-500/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className={`font-bold ${isResearched ? 'text-green-400' : 'text-white'}`}>{tech.name}</h4>
                      <div className="text-xs text-slate-400">Tier {tech.tier} · {tech.effect}</div>
                    </div>
                    {isResearched && <span className="text-xs text-green-400">RESEARCHED</span>}
                  </div>
                  <p className="text-sm text-slate-300 my-3">{tech.description}</p>

                  <div className="flex items-center justify-between mt-4">
                    <div className="text-xs text-slate-400">
                      Cost: <span className="text-yellow-400">{tech.cost.credits} Cr</span>
                      {Object.entries(tech.cost.resources).map(([k, v]) => (
                        <span key={k} className="ml-2 text-purple-400"> +{v} {k}</span>
                      ))}
                    </div>
                    {!isResearched && (
                      <button
                        onClick={() => {
                          if (spend({ credits: tech.cost.credits, resources: tech.cost.resources })) {
                            updateState((s) => {
                              s.researchedTech.push(tech.id);
                              tech.onComplete(s);
                              return s;
                            });
                          }
                        }}
                        disabled={!canBuy}
                        className={`btn btn-primary text-xs ${isLocked ? 'btn-secondary' : ''}`}
                      >
                        {isLocked ? 'Locked' : 'Research'}
                      </button>
                    )}
                  </div>
                  {isLocked && (
                    <div className="text-[10px] text-red-400 mt-2">
                      Requires: {tech.prereqs.join(', ')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}