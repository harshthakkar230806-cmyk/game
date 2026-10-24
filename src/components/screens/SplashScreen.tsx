// Initial loading screen showing logo and loading animation.

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Screen } from '../../types/game';
import screens from './index';

export default function SplashScreen() {
  const nav = useNavigate();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loaded) {
      setTimeout(() => {
        nav('/game/main-menu');
      }, 500);
    }
  }, [loaded, nav]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-space">
      <div className={`transition-all duration-700 ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="relative">
          <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full animate-pulse" />
          <div className="relative glass p-8 text-center glow-cyan">
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 mb-4">
              GALAXY
            </h1>
            <h2 className="text-4xl font-bold text-white mb-2">TYCOON</h2>
            <p className="text-cyan-300 text-sm tracking-widest uppercase">Build Your Empire</p>
            <div className="mt-6 flex justify-center gap-2">
              <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}