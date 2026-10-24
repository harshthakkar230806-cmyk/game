// Galaxy map screen with interactive star system navigation and 3D-style rendering.

import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameContext } from '../../context/GameContext';
import type { Screen } from '../../types/game';
import { RESOURCE_COLORS, SHIP_CLASSES } from '../../engine/constants';

type StarSize = 'normal' | 'large' | 'expanded';

interface StarSystemStar {
  id: string;
  sysId: string;
  x: number;
  y: number;
  color: string;
  visited: boolean;
  connected: boolean;
  size: StarSize;
}

export default function GalaxyMapScreen() {
  const nav = useNavigate();
  const { state, travelTo, setScreen, ship, updateState } = useGameContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hovered, setHovered] = useState<{ sysId: string | null; x: number; y: number } | null>(null);
  const [starSystems, setStarSystems] = useState<StarSystemStar[]>([]);

  // Generate star visuals from systems
  useEffect(() => {
    if (!state || !state.systems.length) return;

    const starList: StarSystemStar[] = state.systems.map((sys) => {
      const isUnvisited = !sys.visited;
      const isVisitedWithPassable = sys.visited || sys.bodies.length > 0;
      const isCurrent = sys.id === state.currentSystemId;

      let size: StarSize = 'normal';
      if (isVisitedWithPassable || isUnvisited && isCurrent) size = 'normal';
      if (isUnvisited) size = 'expanded';
      if (isCurrent) size = 'large';

      return {
        id: sys.id,
        sysId: sys.id,
        x: sys.x,
        y: sys.y,
        color: isUnvisited ? '#64748b' : isCurrent ? '#22d3ee' : '#7dd3fc',
        visited: sys.visited,
        connected: isVisitedWithPassable,
        size
      };
    });
    setStarSystems(starList);
  }, [state]);

  const draw = (width: number, height: number) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    // Background gradient
    const grad = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height));
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    const gridSize = 50;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    // Connecting lines to current system
    const current = state?.systems.find(sys => sys.id === state?.currentSystemId);
    if (current && starSystems.length > 0) {
      starSystems.forEach((star) => {
        if (star.sysId !== current.id && star.connected) {
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(34, 211, 238, 0.15)';
          ctx.lineWidth = 2;
          ctx.moveTo(current.x + width/2, current.y + height/2);
          ctx.lineTo(star.x + width/2, star.y + height/2);
          ctx.stroke();
        }
      });
    }

    // Draw stars
    starSystems.forEach((star) => {
      const screenX = star.x + width/2;
      const screenY = star.y + height/2;

      // Glow effect
      if (star.size !== 'normal' || star.visited) {
        const glowSize = star.size === 'large' ? 15 : star.size === 'expanded' ? 25 : 10;
        const grad = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, glowSize);
        grad.addColorStop(0, star.color + '60');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(screenX, screenY, glowSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Star body
      const radius = star.size === 'large' ? 6 : star.size === 'expanded' ? 8 : 5;
      ctx.beginPath();
      ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
      ctx.fillStyle = star.color;
      ctx.fill();

      // Visited indicator ring
      if (star.visited) {
        ctx.beginPath();
        ctx.arc(screenX, screenY, radius + 8, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Current system indicator
      if (star.size === 'large') {
        ctx.beginPath();
        ctx.arc(screenX, screenY, radius + 14, 0, Math.PI * 2);
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // Title overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('GALAXY MAP', 20, 30);

    // Current system info
    if (current) {
      const infoX = width - 200;
      const infoY = 30;
      ctx.fillStyle = 'rgba(34, 211, 238, 0.7)';
      ctx.font = '12px sans-serif';

      let lines = [current.name];
      if (current.anomaly) lines.push(`Anomaly: ${current.anomaly.discovered ? '(Discovered)' : '(Unknown)'}`);
      lines.push(`Bodies: ${current.bodies.length}`);
      lines.push(`Visit Status: ${current.visited ? 'Visited' : 'Unvisited'}`);

      lines.forEach((line, i) => {
        ctx.fillText(line, infoX, infoY + i * 16);
      });

      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '10px sans-serif';
      ctx.fillText(`[Click] Navigate to system`, infoX, infoY + lines.length * 16 + 20);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth * 0.95;
      canvas.height = window.innerHeight * 0.8;
      draw(canvas.width, canvas.height);
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (!state) return;

      const clickRange = 30;
      let target = null;
      starSystems.forEach((star) => {
        const screenX = star.x + canvas.width/2;
        const screenY = star.y + canvas.height/2;
        const dist = Math.hypot(screenX - x, screenY - y);
        if (dist < clickRange) {
          target = star.sysId;
        }
      });

      if (target) {
        travelTo(target);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (!state) return;

      let hoveredItem = null;
      starSystems.forEach((star) => {
        const screenX = star.x + canvas.width/2;
        const screenY = star.y + canvas.height/2;
        const dist = Math.hypot(screenX - x, screenY - y);
        if (dist < 30) {
          hoveredItem = { sysId: star.sysId, x, y };
        }
      });
      setHovered(hoveredItem);
    };

    canvas.addEventListener('resize', resize);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('mousemove', handleMouseMove);
    resize();

    return () => {
      canvas.removeEventListener('resize', resize);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [state, starSystems, travelTo]);

  return (
    <div className="flex flex-col h-full fade-in">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <button onClick={() => setScreen('MAIN')} className="btn btn-secondary mb-0">
          ← Menu
        </button>
        <div className="glass p-2 px-4">
          <span className="text-sm text-cyan-300">Your Ship:</span>
          <span className="ml-2 text-white">{ship.name}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setScreen('MISSIONS')} className="btn btn-secondary mb-0">
            Mission Log
          </button>
        </div>
      </div>
      <div className="flex gap-4 flex-1 overflow-hidden">
        <div className="relative flex-1">
          <canvas
            ref={canvasRef}
            className="rounded-lg cursor-crosshair"
            style={{ touchAction: 'none' }}
          />
          {hovered && (
            <div
              className="absolute pointer-events-none bg-slate-900/90 border border-cyan-500/50 px-3 py-2 rounded text-sm shadow-lg"
              style={{
                left: hovered.x + 10,
                top: hovered.y + 10
              }}
            >
              {starSystems.find(s => s.sysId === hovered.sysId)?.sysId === state?.currentSystemId
                ? 'Current System'
                : 'Navigate'}
            </div>
          )}
        </div>
        <div className="w-48 glass p-3 overflow-auto flex-shrink-0">
          <h3 className="font-bold text-cyan-400 mb-3 text-sm uppercase">Systems</h3>
          <div className="space-y-1">
            {starSystems.map((star) => {
              const sys = state?.systems.find(s => s.id === star.sysId);
              const isCurrent = star.sysId === state?.currentSystemId;
              return (
                <div
                  key={star.sysId}
                  className={`p-2 rounded cursor-pointer text-sm ${
                    isCurrent ? 'bg-cyan-900/50 border border-cyan-500' :
                    star.visited ? 'bg-slate-800/50 hover:bg-slate-700/50' : 'bg-slate-900/30'
                  }`}
                  onClick={() => !isCurrent && travelTo(star.sysId)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white">{sys?.name || star.sysId}</span>
                    {isCurrent && <span className="text-cyan-400 text-xs">●</span>}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{sys?.bodies.length || 0} bodies</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}