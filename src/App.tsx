// Main App component - routing and global screen management.

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { GameProvider, useGameContext } from './context/GameContext';
import MainScreen from './components/screens/MainScreen';
import GalaxyMapScreen from './components/screens/GalaxyMapScreen';
import SystemViewScreen from './components/screens/SystemViewScreen';
import HangarScreen from './components/screens/HangarScreen';
import StationsScreen from './components/screens/StationsScreen';
import ResearchScreen from './components/screens/ResearchScreen';
import MissionsScreen from './components/screens/MissionsScreen';
import CombatScreen from './components/screens/CombatScreen';
import AchievementsScreen from './components/screens/AchievementsScreen';
import SettingsScreen from './components/screens/SettingsScreen';

function ScreenRenderer() {
  const { currentScreen } = useGameContext();

  switch (currentScreen) {
    case 'MAIN': return <MainScreen />;
    case 'GALAXY': return <GalaxyMapScreen />;
    case 'SYSTEM': return <SystemViewScreen />;
    case 'HANGAR': return <HangarScreen />;
    case 'STATIONS': return <StationsScreen />;
    case 'RESEARCH': return <ResearchScreen />;
    case 'MISSIONS': return <MissionsScreen />;
    case 'COMBAT': return <CombatScreen />;
    case 'ACHIEVEMENTS': return <AchievementsScreen />;
    case 'SETTINGS': return <SettingsScreen />;
    default: return <MainScreen />;
  }
}

export default function App() {
  return (
    <Router>
      <GameProvider>
        <div className="app-container bg-black text-slate-200 min-h-screen font-sans selection:bg-cyan-500 selection:text-white">
          {/* Scanline overlay for retro aesthetic */}
          <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

          {/* Vignette effect */}
          <div className="fixed inset-0 pointer-events-none z-50 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />

          <main className="relative z-10 h-screen overflow-auto">
            <ScreenRenderer />
          </main>
        </div>
      </GameProvider>
    </Router>
  );
}