import React, { useRef, useEffect, useState } from 'react';
import { GameSettings } from '../types';
import { MISSILE_AMMO_THRESHOLD } from '../constants';
import { audioService } from '../services/audioService';

interface ControlsProps {
  onJoystickMove: (vector: {x: number, y: number}) => void;
  onAction: (action: 'BOOST' | 'BRAKE' | 'SHOOT' | 'NONE') => void;
  settings: GameSettings;
  ammo: number;
}

const Controls: React.FC<ControlsProps> = ({ onJoystickMove, onAction, settings, ammo }) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const radius = 50; // Compact joystick
  const isMissileReady = ammo >= MISSILE_AMMO_THRESHOLD;

  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    setActive(true);
    handleMove(e);
  };

  const handleMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!active || !joystickRef.current) return;
    
    let clientX, clientY;
    if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
    }

    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    const clampedDist = Math.min(dist, radius);
    
    const x = Math.cos(angle) * clampedDist;
    const y = Math.sin(angle) * clampedDist;
    
    setPos({ x, y });
    onJoystickMove({ x: x / radius, y: y / radius });
  };

  const handleEnd = () => {
    setActive(false);
    setPos({ x: 0, y: 0 });
    onJoystickMove({ x: 0, y: 0 });
  };

  useEffect(() => {
    const onUp = () => handleEnd();
    const onMove = (e: any) => { if (active) handleMove(e); }
    window.addEventListener('mouseup', onUp);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchend', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    return () => {
        window.removeEventListener('mouseup', onUp);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('touchend', onUp);
        window.removeEventListener('touchmove', onMove);
    };
  }, [active]);

  const handleAction = (type: 'BOOST' | 'BRAKE' | 'SHOOT' | 'NONE') => {
      if (type !== 'NONE') {
          audioService.playButtonTap();
      }
      onAction(type);
  };

  // --- SVGs for Icons ---
  const BoltIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );

  const ShieldIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );

  const CrosshairIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <circle cx="12" cy="12" r="10" />
      <line x1="22" y1="12" x2="18" y2="12" />
      <line x1="6" y1="12" x2="2" y2="12" />
      <line x1="12" y1="6" x2="12" y2="2" />
      <line x1="12" y1="22" x2="12" y2="18" />
    </svg>
  );

  const RocketIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
       <path d="M2.25 15.65c.307-1.353 1.156-2.528 2.37-3.238l9.648-5.742a2.025 2.025 0 012.75 2.75L11.277 19.07c-.71 1.214-1.885 2.063-3.238 2.37-1.393.316-2.502-1.077-1.78-2.327l1.04-1.801-4.757-4.757-1.802 1.04c-1.25.722-2.643-.387-2.327-1.78zM17.062 6.563l2.875-2.875a.75.75 0 011.06 1.06l-2.875 2.875a.75.75 0 01-1.06-1.06z" />
    </svg>
  );

  return (
    <div className="w-full h-full pointer-events-none absolute inset-0 overflow-hidden" style={{ opacity: settings.controlOpacity }}>
      
      {/* BOTTOM-LEFT: ACTION BUTTONS CLUSTER (Fast, Slow, Shoot) */}
      <div className="pointer-events-auto absolute bottom-8 left-8 flex flex-col items-start gap-4">
          
          {/* Top Row: Brake (Smallest) */}
          <div className="flex gap-4 items-end pl-2">
            <button
              className="w-12 h-12 rounded-full flex flex-col items-center justify-center bg-slate-800/80 backdrop-blur-md border border-white/20 text-slate-300 active:bg-slate-700 active:scale-95 transition-all shadow-lg"
              onTouchStart={(e) => { e.preventDefault(); handleAction('BRAKE'); }}
              onTouchEnd={(e) => { e.preventDefault(); handleAction('NONE'); }}
              onMouseDown={(e) => { e.preventDefault(); handleAction('BRAKE'); }}
              onMouseUp={(e) => { e.preventDefault(); handleAction('NONE'); }}
            >
              <ShieldIcon />
              <span className="text-[8px] font-bold">慢</span>
            </button>
          </div>

          {/* Bottom Row: Boost & Shoot */}
          <div className="flex items-end gap-3">
             {/* Boost (Medium) */}
            <button
              className="w-16 h-16 rounded-full flex flex-col items-center justify-center bg-cyan-600/20 backdrop-blur-md border-2 border-cyan-500/50 text-cyan-400 active:bg-cyan-500/40 active:scale-95 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              onTouchStart={(e) => { e.preventDefault(); handleAction('BOOST'); }}
              onTouchEnd={(e) => { e.preventDefault(); handleAction('NONE'); }}
              onMouseDown={(e) => { e.preventDefault(); handleAction('BOOST'); }}
              onMouseUp={(e) => { e.preventDefault(); handleAction('NONE'); }}
            >
              <BoltIcon />
              <span className="text-[10px] font-bold mt-0.5">快</span>
            </button>

            {/* Shoot (Large) */}
            <button
              className={`rounded-full flex flex-col items-center justify-center backdrop-blur-md border-2 transition-all active:scale-95
                ${isMissileReady 
                    ? 'w-20 h-20 bg-red-600/30 border-red-500 text-red-400 shadow-[0_0_25px_rgba(239,68,68,0.4)] animate-pulse' 
                    : 'w-16 h-16 bg-yellow-600/20 border-yellow-500/50 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                }`}
              onTouchStart={(e) => { e.preventDefault(); handleAction('SHOOT'); }}
              onTouchEnd={(e) => { e.preventDefault(); handleAction('NONE'); }}
              onMouseDown={(e) => { e.preventDefault(); handleAction('SHOOT'); }}
              onMouseUp={(e) => { e.preventDefault(); handleAction('NONE'); }}
            >
              {isMissileReady ? <RocketIcon /> : <CrosshairIcon />}
              <span className="text-[9px] font-bold mt-1 tracking-wider">{isMissileReady ? '发射' : `${ammo}`}</span>
            </button>
          </div>
      </div>

      {/* BOTTOM-RIGHT: JOYSTICK */}
      <div 
        ref={joystickRef}
        className="pointer-events-auto absolute bottom-8 right-8 w-36 h-36 touch-none flex items-center justify-center group"
        onMouseDown={handleStart}
        onTouchStart={handleStart}
      >
        {/* Joystick Background (HUD Style) */}
        <div className="absolute inset-0 rounded-full bg-slate-900/60 backdrop-blur-sm border border-white/10 shadow-2xl overflow-hidden">
             {/* Crosshairs & Rings */}
             <div className="absolute inset-0 flex items-center justify-center opacity-30">
                 <div className="w-full h-[1px] bg-white"></div>
                 <div className="h-full w-[1px] bg-white absolute"></div>
                 <div className="w-[70%] h-[70%] border border-white rounded-full absolute"></div>
                 <div className="w-[30%] h-[30%] border border-white rounded-full absolute"></div>
             </div>
        </div>

        {/* Joystick Knob */}
        <div 
            className="absolute w-12 h-12 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.4)] bg-gradient-to-br from-cyan-400 to-blue-600 z-10 transition-transform duration-75 ease-out flex items-center justify-center"
            style={{
                transform: `translate(${pos.x}px, ${pos.y}px)`
            }}
        >
            <div className="w-3 h-3 rounded-full bg-white/50 blur-[1px]"></div>
            <div className="absolute inset-0 rounded-full border border-white/30"></div>
        </div>
      </div>

    </div>
  );
};

export default Controls;