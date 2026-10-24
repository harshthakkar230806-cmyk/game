// Combat screen - tactical ship combat.

import React, { useState, useEffect } from 'react';
import { useGameContext } from '../../context/GameContext';

export default function CombatScreen() {
  const { state, ship, updateState, setScreen, currentScreen } = useGameContext();
  const [log, setLog] = useState<string[]>(['Sensors locking on target...', 'Readying weapons systems.']);
  const [enemyHealth, setEnemyHealth] = useState(100);
  const [isGameOver, setIsGameOver] = useState(false);

  if (!state || currentScreen !== 'COMBAT') return null;

  const handleAttack = () => {
    if (isGameOver) return;

    const damage = Math.floor(ship.mineEff * 10 + Math.random() * 20);
    const enemyDmg = Math.floor(Math.random() * 15 + 5);

    setEnemyHealth(prev => Math.max(0, prev - damage));
    setLog(prev => [`You hit the enemy for ${damage} damage!`, ...prev]);

    updateState(s => {
      s.ship.hull = Math.max(0, s.ship.hull - enemyDmg);
      return s;
    });
    setLog(prev => [`Enemy strikes back for ${enemyDmg} damage!`, ...prev]);

    if (enemyHealth - damage <= 0) {
      setLog(prev => ['ENEMY NEUTRALIZED.', 'Scanning wreckage for salvage...', ...prev]);
      setIsGameOver(true);
      setTimeout(() => {
        updateState(s => {
          s.credits += 500;
          s.stats.totalEnemiesDefeated += 1;
          return s;
        });
        setScreen('SYSTEM');
      }, 3000);
    } else if (state.ship.hull - enemyDmg <= 0) {
      setLog(prev => ['CRITICAL SYSTEM FAILURE.', 'Ejecting escape pod...', ...prev]);
      setIsGameOver(true);
      setTimeout(() => {
        setScreen('MAIN');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center fade-in bg-black">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Player Status */}
        <div className="glass p-6 border-l-4 border-cyan-500">
          <div className="text-sm text-cyan-400 font-mono mb-2">FRIENDLY: {ship.name}</div>
          <div className="text-4xl mb-4">🚀</div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Hull Integrity</span>
              <span>{state.ship.hull.toFixed(0)}%</span>
            </div>
            <div className="stat-bar bg-slate-800">
              <div
                className="stat-bar-fill bg-cyan-500"
                style={{ width: `${state.ship.hull}%` }}
              />
            </div>
          </div>
        </div>

        {/* Enemy Status */}
        <div className="glass p-6 border-r-4 border-red-500 text-right">
          <div className="text-sm text-red-400 font-mono mb-2">HOSTILE: Pirate Interceptor</div>
          <div className="text-4xl mb-4 text-red-500 scale-x-[-1] inline-block">🛸</div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Enemy Integrity</span>
              <span>{enemyHealth.toFixed(0)}%</span>
            </div>
            <div className="stat-bar bg-slate-800">
              <div
                className="stat-bar-fill bg-red-500 ml-auto"
                style={{ width: `${enemyHealth}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Combat Actions & Log */}
      <div className="w-full max-w-4xl mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 h-64">
        <div className="glass p-4 flex flex-col justify-center gap-3">
          <button
            onClick={handleAttack}
            disabled={isGameOver}
            className="btn btn-primary w-full py-4 text-lg font-bold"
          >
            🔥 FIRE WEAPONS
          </button>
          <button
            onClick={() => setScreen('SYSTEM')}
            disabled={isGameOver}
            className="btn btn-secondary w-full"
          >
            🏃 RETREAT
          </button>
        </div>

        <div className="md:col-span-2 glass p-4 overflow-hidden relative">
          <div className="text-xs text-slate-500 uppercase mb-2 font-bold tracking-widest">Tactical Log</div>
          <div className="space-y-1 font-mono text-xs overflow-y-auto h-44 pr-2">
            {log.map((line, i) => (
              <div key={i} className={line.includes('hit') ? 'text-green-400' : line.includes('strikes') ? 'text-red-400' : 'text-slate-400'}>
                [{new Date().toLocaleTimeString()}] {line}
              </div>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-slate-900/50 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}