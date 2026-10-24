// Hangar screen - ship management and upgrades.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameContext } from '../../context/GameContext';
import type { Screen } from '../../types/game';
import { SHIP_CLASSES, UPGRADE_TIERS, ResourceType } from '../../engine/constants';

type HangarTab = 'ship' | 'stats';

export interface HangarTabProps {
  state: any;
  ship: any;
  upgrades: any;
  spend: any;
  addCredits: any;
  addResources: any;
  setScreen: any;
}

export function HangarTab({ state, ship, upgrades, spend, addCredits, addResources, setScreen }: HangarTabProps) {
  return (
    <div className="space-y-6">
      <div className="glass p-6">
        <h3 className="text-xl font-bold text-cyan-400 mb-4">Your Ship</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {['class', 'speed', 'mineEff', 'cargo', 'defense', 'scanner'].map((stat) => (
            <div key={stat} className="glass-item p-3 text-center">
              <div className="text-xs text-slate-400 capitalize mb-1">{stat.replace(/([A-Z])/g, ' $1')}</div>
              <div className={`text-lg font-mono font-bold ${
                stat === 'speed' ? 'text-cyan-400' :
                stat === 'mineEff' ? 'text-yellow-400' :
                stat === 'cargo' ? 'text-orange-400' :
                stat === 'defense' ? 'text-red-400' :
                stat === 'scanner' ? 'text-purple-400' : 'text-slate-300'
              }`}>
                {ship[stat]?.toFixed(1)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass p-6">
        <h3 className="text-xl font-bold text-cyan-400 mb-4">Upgrades</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {UPGRADE_TIERS.filter((u) => u.type !== 'jumpDrive').map((upgrade) => {
            const existingTier = upgrades[upgrade.type];
            const isMaxed = existingTier === upgrade.tier;
            const canAffordCost = { credits: upgrade.costCredits, resources: upgrade.costResources };
            const canBuy = spend && canAffordCost && spend(canAffordCost);
            return (
              <div key={upgrade.id} className="glass-item p-4 border border-slate-700/50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-bold text-white">{upgrade.name}</div>
                    <div className="text-xs text-slate-400">{upgrade.description}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    isMaxed ? 'bg-green-900 text-green-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isMaxed ? 'Maxed' : `Tier ${upgrade.tier}`}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="text-xs text-slate-400">Cost:</div>
                  <div className="flex gap-2">
                    <span className="text-yellow-400 font-mono">{upgrade.costCredits}</span>
                    {Object.keys(upgrade.costResources || {}).length > 0 && (
                      <span className="text-xs text-slate-400">+{Object.entries(upgrade.costResources || {}).map(([k, v]) => `${v}${k[0].toUpperCase()}`).join('')}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (canBuy && spend && spend(canAffordCost)) {
                      (ship as any).baseSpeed += (upgrade.type === 'engine' ? upgrade.tier * 2 : 0);
                      (ship as any).baseMineEff += (upgrade.type === 'laser' ? upgrade.tier * 0.5 : 0);
                      (ship as any).baseCargo += (upgrade.type === 'cargo' ? upgrade.tier * 100 : 0);
                      (ship as any).baseScanner += (upgrade.type === 'scanner' ? upgrade.tier * 3 : 0);
                      (ship as any).baseDefense += upgrade.tier * 20;
                      if (!upgrades[upgrade.type]) upgrades[upgrade.type] = upgrade.tier;
                    }
                  }}
                  disabled={!canBuy}
                  className="btn btn-primary w-full mt-3"
                >
                  {isMaxed ? 'Upgrade Maxed' : 'Purchase'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function HangarScreen() {
  const nav = useNavigate();
  const { state, spend, ship, setScreen, addCredits, addResources, currentScreen } = useGameContext();
  const [tab, setTab] = useState<HangarTab>('ship');

  if (!state || currentScreen !== 'HANGAR') return null;

  return (
    <div className="min-h-screen p-4 fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button onClick={() => setScreen('MAIN')} className="btn btn-secondary mb-0">
            ← Menu
          </button>
          <span className="text-2xl font-bold">Hangar</span>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="w-40 glass p-2 flex flex-col gap-1 flex-shrink-0">
          <button
            onClick={() => setTab('ship')}
            className={`p-3 text-left rounded ${tab === 'ship' ? 'bg-cyan-900/50 border border-cyan-500' : 'hover:bg-slate-800/50'}`}
          >
            <div className="text-lg">🚀</div>
            <div className="text-sm font-bold">Ship</div>
          </button>
          <button
            onClick={() => setTab('stats')}
            className={`p-3 text-left rounded ${tab === 'stats' ? 'bg-cyan-900/50 border border-cyan-500' : 'hover:bg-slate-800/50'}`}
          >
            <div className="text-lg">⬆️</div>
            <div className="text-sm font-bold">Upgrades</div>
          </button>
        </div>

        <div className="flex-1 glass p-6">
          {tab === 'ship' ? (
            <div className="space-y-6">
              <div className="glass p-6 text-center">
                <div className="text-6xl mb-4">🛸</div>
                <h2 className="text-2xl font-bold text-cyan-400">{ship.name}</h2>
                <p className="text-slate-400">Class: {ship.class}</p>
              </div>

              <div className="glass p-4">
                <h3 className="font-bold text-cyan-400 mb-4">Salvage Ship</h3>
                <div className="space-y-2">
                  {Object.keys(ship.cargo).map((res) => (
                    <div key={res} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: res === 'iron' ? '#9ca3af' : res === 'titanium' ? '#e5e7eb' : res === 'copper' ? '#f97316' : res === 'ice' ? '#7dd3fc' : res === 'crystals' ? '#a781fa' : '#facc15' }} />
                        <span className="capitalize">{res}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-white">{ship.cargo[res].toFixed(0)}</span>
                        <button
                          onClick={() => {
                            const amt = ship.cargo[res];
                            addResources({ [res]: amt });
                            addCredits(amt);
                            (ship.cargo as any)[res] = 0;
                          }}
                          className="btn btn-secondary text-xs"
                        >
                          Sell All
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <HangarTab
              state={state}
              ship={ship}
              upgrades={ship.upgrades}
              spend={spend}
              addCredits={addCredits}
              addResources={addResources}
              setScreen={setScreen}
            />
          )}
        </div>
      </div>
    </div>
  );
}