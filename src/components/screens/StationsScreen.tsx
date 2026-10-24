// Stations screen - automation, refineries, and research labs.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameContext } from '../../context/GameContext';
import type { Screen } from '../../types/game';
import { STATION_TEMPLATES, StationType } from '../../engine/constants';

type StationTab = 'drone' | 'miningShip' | 'cargoVessel' | 'miningStation' | 'refinery' | 'lab';

export interface StationTabProps {
  state: any;
  type: StationTab;
  automations: any[];
  spend: any;
  setScreen: any;
}

export function StationTab({ state, type, automations, spend, setScreen }: StationTabProps) {
  const tpl = STATION_TEMPLATES[type];
  const stationList = automations.filter((a) => a.type === type);

  return (
    <div className="space-y-6">
      <div className="glass p-6">
        <h3 className="text-xl font-bold text-cyan-400 mb-2">{tpl.label}</h3>
        <p className="text-slate-400 mb-4">{tpl.description}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-item p-3 text-center">
            <div className="text-xs text-slate-400">Production Rate</div>
            <div className="text-lg font-mono text-cyan-400 font-bold">{tpl.baseRate}/tick</div>
          </div>
          <div className="glass-item p-3 text-center">
            <div className="text-xs text-slate-400">Energy Use</div>
            <div className="text-lg font-mono text-yellow-400 font-bold">{tpl.baseEnergy}/tick</div>
          </div>
          <div className="glass-item p-3 text-center">
            <div className="text-xs text-slate-400">Produces</div>
            <div className="text-lg font-mono text-green-400 font-bold capitalize">{tpl.produces}</div>
          </div>
          <div className="glass-item p-3 text-center">
            <div className="text-xs text-slate-400">Consumes</div>
            <div className="text-lg font-mono text-red-400 font-bold capitalize">{tpl.consumes}</div>
          </div>
        </div>
      </div>

      <div className="glass p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-bold text-cyan-400">Active Stations ({stationList.length})</h4>
          <button
            onClick={() => {
              const cost = { credits: tpl.baseCostCredits, resources: tpl.baseCostResources };
              if (spend(cost)) {
                automations.push({
                  id: 'auto_' + Date.now(),
                  type,
                  name: tpl.label,
                  level: 1,
                  rate: tpl.baseRate,
                  cost,
                  produces: tpl.produces,
                  consumes: tpl.consumes,
                  energy: tpl.baseEnergy,
                  efficiency: 1.0
                });
              }
            }}
            disabled={!spend({ credits: tpl.baseCostCredits, resources: tpl.baseCostResources })}
            className="btn btn-primary"
          >
            Construct ({tpl.baseCostCredits} Cr)
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {stationList.map((st) => (
            <div key={st.id} className="glass-item p-4 border border-slate-700/50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-bold text-white">{st.name}</div>
                  <div className="text-xs text-slate-400">Level {st.level}</div>
                </div>
                <span className="text-xs px-2 py-1 bg-green-900/50 text-green-400 rounded">Active</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-3">
                <span>Rate: {st.rate * st.efficiency}/tick</span>
                <span>Energy: {st.energy}/tick</span>
              </div>
            </div>
          ))}
          {stationList.length === 0 && (
            <div className="col-span-2 text-center text-slate-500 py-8">
              No stations constructed yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StatiionsScreen() {
  const nav = useNavigate();
  const { state, spend, setScreen, currentScreen } = useGameContext();
  const [activeTab, setActiveTab] = useState<StationTab>('drone');

  if (!state || currentScreen !== 'STATIONS') return null;

  return (
    <div className="min-h-screen p-4 fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button onClick={() => setScreen('MAIN')} className="btn btn-secondary mb-0">
            ← Menu
          </button>
          <span className="text-2xl font-bold">Automation & Stations</span>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="w-48 glass p-2 flex flex-col gap-1 flex-shrink-0">
          {(['drone', 'miningShip', 'cargoVessel', 'miningStation', 'refinery', 'lab'] as StationTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`p-3 text-left rounded capitalize ${activeTab === tab ? 'bg-cyan-900/50 border border-cyan-500' : 'hover:bg-slate-800/50'}`}
            >
              <div className="text-sm font-bold">{STATION_TEMPLATES[tab].label}</div>
            </button>
          ))}
        </div>

        <div className="flex-1 glass p-6">
          <StationTab
            state={state}
            type={activeTab}
            automations={state.automations}
            spend={spend}
            setScreen={setScreen}
          />
        </div>
      </div>
    </div>
  );
}