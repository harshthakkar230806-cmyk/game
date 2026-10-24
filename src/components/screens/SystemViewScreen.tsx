// System view screen - inspection of star systems, planets, and mining.

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameContext } from '../../context/GameContext';
import type { Screen } from '../../types/game';
import { RESOURCE_COLORS } from '../../engine/constants';

interface CelestialBody {
  id: string;
  name: string;
  type: 'star' | 'planet' | 'moon' | 'asteroid';
  distance: number;
  radius: number;
  color: string;
}

export default function SystemViewScreen() {
  const nav = useNavigate();
  const { state, travelTo, setScreen, ship, updateState, mineBody, addResources, addCredits, startCombat, currentScreen } = useGameContext();
  const [selectedBody, setSelectedBody] = useState<string | null>(null);

  const currentSystem = state?.systems.find(sys => sys.id === state?.currentSystemId);
  const currentBody = selectedBody
    ? currentSystem?.bodies.find(b => b.id === selectedBody)
    : currentSystem?.bodies.find(b => b.type === 'star' && b.id === `${state?.currentSystemId}_sun`);

  const styledBodies = useMemo(() => {
    return currentSystem?.bodies.map((body) => {
      const isSelected = body.id === selectedBody;
      const isMineable = body.type === 'asteroid';
      const isVisible = body.discovered || body.type === 'star';
      return { ...body, isSelected, isMineable, isVisible };
    }) || [];
  }, [currentSystem, selectedBody]);

  useEffect(() => {
    if (!selectedBody && currentSystem) {
      setSelectedBody(currentSystem.bodies.find(b => b.type === 'star')?.id || null);
    }
  }, [currentSystem, selectedBody]);

  const handleMine = () => {
    if (!currentBody || !state || state.energy < 5) return;
    const result = mineBody(state, currentBody, 20);
    if (result.mined.iron !== undefined) {
      Object.keys(result.mined).forEach((k) => {
        (addResources as any)({ [k]: result.mined[k as keyof typeof result.mined] });
      });
    }
  };

  const handleTravelTo = (sysId: string) => {
    travelTo(sysId);
  };

  if (!state || !currentSystem) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-4 fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <button onClick={() => setScreen('GALAXY')} className="btn btn-secondary mb-0">
            ← Overview
          </button>
          <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            {currentSystem.name}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen('STATIONS')} className="btn btn-secondary mb-0">
            🛰️ Stations
          </button>
          <span className="glass px-3 py-1 rounded text-sm flex items-center gap-2">
            <span>Credits:</span>
            <span className="text-cyan-400 font-bold">{state.credits.toLocaleString()}</span>
          </span>
        </div>
      </div>

      <div className="flex gap-4 h-[65vh]">
        {/* Bodies List */}
        <div className="w-56 glass p-3 overflow-auto flex-shrink-0">
          <h3 className="text-cyan-400 font-mono text-sm uppercase mb-2">Celestial Bodies</h3>
          <div className="space-y-1">
            {styledBodies.map((body) => (
              <div
                key={body.id}
                onClick={() => setSelectedBody(body.id)}
                className="group p-2 rounded cursor-pointer border border-transparent hover:border-slate-600 transition-all"
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: body.color }} />
                  <span className="text-sm">{body.name}</span>
                </div>
                <div className="text-xs text-slate-400 pl-5 mt-1">
                  {body.type.toUpperCase()} · R:{body.radius} units
                </div>
                {body.discovered && (
                  <div className="text-xs text-green-400 pl-5">Discovered</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Body Details */}
        <div className="flex-1 flex flex-col gap-4 overflow-auto">
          {currentBody && (
            <>
              <div
                className="glass p-6 flex items-center justify-between"
                style={{ borderColor: currentBody.type === 'star' ? '#fbbf24' : currentBody.type === 'planet' ? '#22c55e' : '#6b7280', borderWidth: '2px' }}
              >
                <div>
                  <h2 className="text-2xl font-bold text-white">{currentBody.name}</h2>
                  <p className="text-slate-400 mt-1">{currentBody.type} · Distance: {currentBody.distance} AU</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-400 mb-1">Radius</div>
                  <div className="text-xl font-mono">{currentBody.radius.toFixed(1)} units</div>
                </div>
              </div>

              {currentBody.type === 'asteroid' && ship.energy >= 5 && (
                <div className="glass p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-cyan-400">Mining Laser</h4>
                    <div className="flex items-center gap-4">
                      <div className="text-sm">
                        <span className="text-slate-400">Energy:</span>
                        <span className={`ml-1 ${ship.energy >= 5 ? 'text-green-400' : 'text-red-400'}`}>
                          {ship.energy.toFixed(0)}/100
                        </span>
                      </div>
                      <button
                        onClick={handleMine}
                        disabled={ship.energy < 5}
                        className="btn btn-primary text-sm"
                      >
                        ⚡ Mine 20 Units
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {(Object.keys(currentBody.resources) as any)
                      .filter((k) => (currentBody.resources as any)[k] > 0)
                      .map((resType) => (
                        <div key={resType} className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: RESOURCE_COLORS[resType as keyof typeof RESOURCE_COLORS] }} />
                            <span className="font-mono">{resType}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-white">{(currentBody.resources as any)[resType].toFixed(0)} 💾</div>
                            <button
                              onClick={() => {
                                const resAmount = Math.min((currentBody.resources as any)[resType], 50);
                                (currentBody.resources as any)[resType] -= resAmount;
                                (addResources as any)({ [resType]: resAmount });
                              }}
                              className="text-xs text-slate-400 hover:text-white"
                            >
                              Sell 50
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="glass p-6 flex-1">
                <h3 className="font-bold text-cyan-400 mb-4">Composition</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {(Object.keys(currentBody.composition) as any).map((res: string) => {
                    const val = (currentBody.composition as any)[res];
                    return (
                      <div key={res} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: RESOURCE_COLORS[res as keyof typeof RESOURCE_COLORS] }} />
                          <span className="font-mono text-sm">{res}</span>
                        </div>
                        <div className="glass-item">
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>Abundance</span>
                            <span>{(val * 100).toFixed(0)}%</span>
                          </div>
                          <div className="stat-bar">
                            <div
                              className="stat-bar-fill"
                              style={{ width: `${val * 100}%`, backgroundColor: RESOURCE_COLORS[res as keyof typeof RESOURCE_COLORS] }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}