// Main menu screen with game options.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameContext } from '../../context/GameContext';
import type { Screen } from '../../types/game';

export default function MainMenu() {
  const nav = useNavigate();
  const [activeTab, setActiveTab] = useState<'continue' | 'new' | 'import' | 'settings'>('continue');
  const { state, importSave } = useGameContext();
  const hasSave = !!state && state.lastSaved > 0;
  const isNew = !state || state.lastSaved === 0;

  const handleContinue = () => {
    if (!state) return;
    const screenType = isNew ? 'MAIN' : 'MAIN';
    setActiveTab(screenType as any);
  };

  const handleNewGame = () => {
    setActiveTab('MAIN');
    nav('/game/main-menu', { replace: true });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imported = await importSave(file);
      if (imported) {
        setActiveTab('continue');
      }
    }
  };

  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center gap-6 fade-in">
      <div className="glass-strong p-8 md:p-12 max-w-lg w-full text-center glow-cyan">
        <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 mb-2">
          GALAXY TYCOON
        </h1>
        <p className="text-cyan-300 text-sm tracking-widest uppercase mb-8">Build Your Empire</p>

        <div className="flex flex-col md:flex-row gap-3 mb-8">
          {hasSave && (
            <button
              onClick={handleContinue}
              className="btn btn-primary btn-lg w-full"
            >
              Continue
            </button>
          )}
          <button
            onClick={handleNewGame}
            className="btn btn-primary btn-lg w-full"
          >
            New Game
          </button>
        </div>

        <label className="btn btn-secondary btn-lg w-full cursor-pointer">
          Import Save
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>

        <button
          onClick={() => setActiveTab('continue')}
          className="btn btn-secondary w-full mt-3"
        >
          Settings
        </button>
      </div>

      <div className="glass p-4 text-center text-slate-400 text-sm">
        <p>A polished browser-based space exploration and empire-building game</p>
      </div>
    </div>
  );
}