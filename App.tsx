import React, { useState, useRef, useEffect } from 'react';
import { GameStatus, Chemical, UserProfile, Theme, GameSettings } from './types';
import { generateGameData } from './services/geminiService';
import GameEngine from './components/GameEngine';
import { audioService } from './services/audioService';
import { THEMES, MAX_REVIVES, FALLBACK_CHEMICALS, BOSSES_PER_REVIVE } from './constants';

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [profile, setProfile] = useState<UserProfile>({ 
      nickname: '玩家001', 
      themeId: 'tech', 
      bestScore: 0,
      hasCompletedTutorial: true 
  });
  const [settings, setSettings] = useState<GameSettings>({ 
      bgmVolume: 0.5, 
      sfxVolume: 0.8, 
      controlOpacity: 0.8, 
      showChemicalNames: true,
      showTrivia: true,
      showReactions: true,
      showUI: true,
      enableTouchControls: true
  });
  
  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [revivesLeft, setRevivesLeft] = useState(MAX_REVIVES);
  const [reviveTrigger, setReviveTrigger] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false); 
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [tempName, setTempName] = useState('');
  const [bossKillCount, setBossKillCount] = useState(0);

  const currentTheme = THEMES.find(t => t.id === profile.themeId) || THEMES[0];

  const handleStartSetup = () => {
      setStatus(GameStatus.SETUP);
      audioService.init();
      audioService.playButtonTap();
  };

  const handleProfileComplete = () => {
      audioService.playButtonTap();
      if (tempName) setProfile(p => ({ ...p, nickname: tempName }));
      startGame();
  };

  const startGame = async () => {
    setStatus(GameStatus.LOADING);
    setRevivesLeft(MAX_REVIVES);
    setBossKillCount(0);
    setIsPaused(false);
    try {
        const data = await generateGameData(1);
        setChemicals(data);
    } catch {
        setChemicals(FALLBACK_CHEMICALS);
    }
    setStatus(GameStatus.PLAYING);
  };

  const handleGameOver = (finalScore: number) => {
      if (finalScore > profile.bestScore) {
          setProfile(p => ({ ...p, bestScore: finalScore }));
      }
      setStatus(GameStatus.GAME_OVER);
  };

  // --- UI COMPONENTS ---

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button 
        onClick={() => {
            audioService.playButtonTap();
            onChange(!checked);
        }}
        className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${checked ? 'bg-cyan-500' : 'bg-slate-600'}`}
    >
        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 left-1 transition-transform shadow-md ${checked ? 'translate-x-6' : ''}`} />
    </button>
  );

  const InstructionsContent = () => (
      <div className="space-y-6 overflow-y-auto flex-1 pr-2 custom-scrollbar text-slate-300">
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
             <div className="flex items-start gap-4 mb-6">
                 <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center text-2xl">🧬</div>
                 <div>
                     <h3 className="text-white font-bold text-lg">实验守则</h3>
                     <p className="text-sm mt-1 leading-relaxed text-slate-400">
                         操控微型纳米机器人（贪吃蛇），在微观世界中通过吞噬原子来生长，利用真实的化学反应公式来获取能量与弹药。
                     </p>
                 </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                     <div className="text-cyan-400 font-bold mb-2">基础操控</div>
                     <ul className="text-xs space-y-2 text-slate-400">
                         <li>🕹️ <strong>移动：</strong> 左侧虚拟摇杆</li>
                         <li>⚡ <strong>加速：</strong> 闪电图标按钮</li>
                         <li>🎯 <strong>射击：</strong> 准星图标按钮</li>
                     </ul>
                 </div>
                 <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                     <div className="text-purple-400 font-bold mb-2">实验技巧</div>
                     <ul className="text-xs space-y-2 text-slate-400">
                         <li>⚛️ <strong>合成：</strong> H + Cl = 盐酸 (强力弹药)</li>
                         <li>💥 <strong>战斗：</strong> 消耗弹药攻击巨型病毒</li>
                         <li>⭕ <strong>围杀：</strong> 用身体包围BOSS触发电击</li>
                     </ul>
                 </div>
             </div>
          </div>
          
          <div className="text-center text-xs text-slate-500">
              提示：实验中遇到不懂的元素？点击它，也许有惊喜冷知识！
          </div>
      </div>
  );

  const SettingsContent = () => (
      <div className="space-y-6 overflow-y-auto flex-1 pr-2 custom-scrollbar">
          {/* Visual & UI */}
          <div className="bg-slate-900/50 p-4 rounded-xl space-y-4 border border-white/5">
              <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-4">显示设置 (DISPLAY)</h3>
              <div className="space-y-4">
                  <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">显示化学式</span>
                      <Toggle checked={settings.showChemicalNames} onChange={(v) => setSettings(s => ({...s, showChemicalNames: v}))} />
                  </div>
                  <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">趣味冷知识卡片</span>
                      <Toggle checked={settings.showTrivia} onChange={(v) => setSettings(s => ({...s, showTrivia: v}))} />
                  </div>
                  <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">反应方程式动画</span>
                      <Toggle checked={settings.showReactions} onChange={(v) => setSettings(s => ({...s, showReactions: v}))} />
                  </div>
                   <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">HUD 仪表盘</span>
                      <Toggle checked={settings.showUI} onChange={(v) => setSettings(s => ({...s, showUI: v}))} />
                  </div>
              </div>
          </div>

          {/* Controls */}
          <div className="bg-slate-900/50 p-4 rounded-xl space-y-4 border border-white/5">
              <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-4">操控设置 (CONTROLS)</h3>
               <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-slate-300">启用触屏虚拟摇杆</span>
                  <Toggle checked={settings.enableTouchControls} onChange={(v) => setSettings(s => ({...s, enableTouchControls: v}))} />
              </div>
              <div>
                  <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wide">按键透明度</label>
                  <input 
                    type="range" min="0" max="1" step="0.1" 
                    value={settings.controlOpacity}
                    onChange={(e) => setSettings(s => ({...s, controlOpacity: parseFloat(e.target.value)}))}
                    className="w-full accent-cyan-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
              </div>
          </div>

          {/* Theme Selector */}
          <div className="bg-slate-900/50 p-4 rounded-xl space-y-4 border border-white/5">
              <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-4">主题选择 (THEME)</h3>
              <div className="grid grid-cols-2 gap-3">
                  {THEMES.map(t => (
                      <button 
                        key={t.id}
                        onClick={() => {
                            audioService.playButtonTap();
                            setProfile(p => ({ ...p, themeId: t.id }));
                        }}
                        className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${profile.themeId === t.id ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-700 bg-slate-800/50 hover:border-slate-500'}`}
                      >
                          <span className="text-2xl">{t.snakeHeadIcon}</span>
                          <span className="text-xs font-bold text-slate-300">{t.name}</span>
                      </button>
                  ))}
              </div>
          </div>
      </div>
  );

  return (
    <div className="w-full min-h-screen bg-slate-950 text-white font-sans select-none overflow-hidden touch-none flex flex-col">
      
      {/* Settings Modal */}
      {showSettingsModal && (
          <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in">
              <div className="bg-[#0f172a] p-6 rounded-3xl w-full max-w-lg border border-slate-700 flex flex-col max-h-[85vh] shadow-2xl relative">
                  <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                      <h2 className="text-xl font-bold text-white tracking-widest uppercase">系统设置</h2>
                      <button 
                        onClick={() => { audioService.playButtonTap(); setShowSettingsModal(false); }} 
                        className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                      >&times;</button>
                  </div>
                  <SettingsContent />
                  <button 
                    onClick={() => { audioService.playButtonTap(); setShowSettingsModal(false); }} 
                    className="mt-6 w-full bg-cyan-600 py-4 rounded-2xl font-bold hover:bg-cyan-500 transition-colors shadow-lg shadow-cyan-900/20"
                  >应用更改</button>
              </div>
          </div>
      )}

      {/* Instructions Modal */}
      {showInstructionsModal && (
          <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in">
              <div className="bg-[#0f172a] p-6 rounded-3xl w-full max-w-xl border border-slate-700 flex flex-col max-h-[85vh] shadow-2xl">
                  <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                      <h2 className="text-xl font-bold text-white tracking-widest uppercase">操作指南</h2>
                      <button 
                        onClick={() => { audioService.playButtonTap(); setShowInstructionsModal(false); }} 
                        className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                      >&times;</button>
                  </div>
                  <InstructionsContent />
                  <button 
                    onClick={() => { audioService.playButtonTap(); setShowInstructionsModal(false); }} 
                    className="mt-6 w-full bg-white text-slate-900 py-4 rounded-2xl font-black hover:bg-slate-200 transition-colors"
                  >开始实验</button>
              </div>
          </div>
      )}

      {/* Main Menu - Minimalist Tech Propaganda Style */}
      {status === GameStatus.IDLE && (
        <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-950">
          
          {/* Tech Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.5)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/80"></div>
          
          {/* Floating Chemical Elements Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
               {/* H2O */}
               <div className="absolute top-1/4 left-1/4 opacity-10 animate-bubble" style={{animationDuration: '15s'}}>
                   <span className="text-6xl font-black text-blue-500">H₂O</span>
               </div>
               {/* Atom Symbol */}
               <div className="absolute bottom-1/3 right-1/4 opacity-10 animate-spin-slow" style={{animationDuration: '20s'}}>
                   <svg width="100" height="100" viewBox="0 0 100 100" fill="none" stroke="currentColor" className="text-cyan-500">
                       <ellipse cx="50" cy="50" rx="40" ry="10" />
                       <ellipse cx="50" cy="50" rx="40" ry="10" transform="rotate(60 50 50)" />
                       <ellipse cx="50" cy="50" rx="40" ry="10" transform="rotate(120 50 50)" />
                       <circle cx="50" cy="50" r="5" fill="currentColor" />
                   </svg>
               </div>
               {/* Benzene Ring */}
               <div className="absolute top-20 right-20 opacity-10 animate-bubble" style={{animationDuration: '25s', animationDelay: '2s'}}>
                    <svg width="80" height="80" viewBox="0 0 100 100" fill="none" stroke="currentColor" className="text-white" strokeWidth="2">
                        <path d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z" />
                        <circle cx="50" cy="50" r="20" />
                    </svg>
               </div>
               {/* Beaker */}
               <div className="absolute bottom-20 left-10 opacity-10 animate-bubble" style={{animationDuration: '18s', animationDelay: '5s'}}>
                   <span className="text-8xl">⚗️</span>
               </div>
               {/* Formulas */}
               <div className="absolute top-1/2 left-10 opacity-5 font-mono text-xl text-green-500">E = mc²</div>
               <div className="absolute top-10 left-1/2 opacity-5 font-mono text-xl text-yellow-500">C₆H₁₂O₆</div>
          </div>

          {/* Center Content */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center py-8 px-6">
             
             {/* Header Group */}
             <div className="text-center mb-16 relative">
                 <div className="absolute -inset-10 bg-cyan-500/20 blur-[100px] rounded-full opacity-50 animate-pulse-slow"></div>
                 
                 <div className="text-cyan-500 font-mono text-xs tracking-[0.3em] mb-4 uppercase opacity-80 animate-fade-in-up">
                    周末科幻实验室出品
                 </div>
                 
                 <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-200 to-blue-500 drop-shadow-[0_0_30px_rgba(6,182,212,0.6)] tracking-tight leading-none mb-2 font-[system-ui]">
                    元素贪吃蛇
                 </h1>
                 
                 <div className="text-2xl md:text-3xl font-light text-slate-400 tracking-[0.5em] uppercase scale-y-75 mt-2">
                    Element Snake
                 </div>
             </div>
             
             {/* Menu Actions */}
             <div className="w-full max-w-sm space-y-4 flex flex-col items-center z-20">
                 <button 
                    onClick={handleStartSetup}
                    className="group relative w-full py-5 bg-white text-slate-950 text-xl font-bold rounded-none hover:bg-cyan-50 transition-all clip-path-polygon"
                    style={{clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'}}
                 >
                     <div className="absolute left-0 top-0 h-full w-1 bg-cyan-500 transition-all group-hover:w-2"></div>
                     <span className="tracking-widest">启动实验 (START)</span>
                 </button>

                 <div className="flex gap-4 w-full">
                    <button 
                        onClick={() => { audioService.playButtonTap(); setShowInstructionsModal(true); }} 
                        className="flex-1 py-4 bg-slate-900/80 text-slate-300 border border-slate-700 hover:border-cyan-500/50 hover:text-white transition-all text-xs font-bold tracking-widest uppercase rounded-sm"
                    >
                        操作指南
                    </button>
                    <button 
                        onClick={() => { audioService.playButtonTap(); setShowSettingsModal(true); }} 
                        className="flex-1 py-4 bg-slate-900/80 text-slate-300 border border-slate-700 hover:border-cyan-500/50 hover:text-white transition-all text-xs font-bold tracking-widest uppercase rounded-sm"
                    >
                        系统设置
                    </button>
                 </div>
             </div>

             {/* Footer Info */}
             <div className="absolute bottom-8 text-center space-y-2">
                 <div className="text-cyan-500/60 font-mono text-[10px] tracking-widest">
                     最高分记录 :: {profile.bestScore.toLocaleString().padStart(6, '0')}
                 </div>
                 <div className="flex gap-4 text-[10px] text-slate-600 font-mono uppercase tracking-widest">
                     <span>游戏版本 V1.0</span>
                     <span>2025.12.05</span>
                 </div>
             </div>
          </div>
        </div>
      )}

      {/* Setup Screen - Aligned with new style */}
      {status === GameStatus.SETUP && (
          <div className="h-full flex flex-col items-center justify-center bg-slate-950 p-6 space-y-8 animate-in slide-in-from-right">
              <h2 className="text-3xl font-black text-white tracking-widest uppercase">建立档案</h2>
              
              <div className="w-full max-w-sm space-y-6">
                  <div>
                    <label className="text-cyan-500 text-xs font-bold tracking-widest uppercase mb-2 block">实验员代号</label>
                    <input 
                        type="text" 
                        className="w-full bg-slate-900 border border-slate-700 rounded-none p-4 text-white focus:border-cyan-500 outline-none font-mono"
                        placeholder="请输入代号"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-cyan-500 text-xs font-bold tracking-widest uppercase mb-2 block">视觉主题</label>
                    <div className="grid grid-cols-2 gap-3">
                        {THEMES.map(t => (
                            <button 
                                key={t.id}
                                onClick={() => {
                                    audioService.playButtonTap();
                                    setProfile(p => ({ ...p, themeId: t.id }));
                                }}
                                className={`p-4 border transition-all flex flex-col items-center gap-2 ${profile.themeId === t.id ? 'border-cyan-500 bg-cyan-900/20' : 'border-slate-800 bg-slate-900/50'}`}
                            >
                                <span className="text-3xl">{t.snakeHeadIcon}</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t.name}</span>
                            </button>
                        ))}
                    </div>
                  </div>
              </div>

              <button 
                onClick={handleProfileComplete}
                className="w-full max-w-sm py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(8,145,178,0.4)]"
              >
                  进入实验室
              </button>
          </div>
      )}

      {/* Game Loading */}
      {status === GameStatus.LOADING && (
          <div className="h-full flex items-center justify-center bg-black">
              <div className="flex flex-col items-center gap-6">
                  <div className="relative">
                      <div className="w-16 h-16 border-2 border-slate-800 rounded-full"></div>
                      <div className="absolute inset-0 border-t-2 border-cyan-500 rounded-full animate-spin"></div>
                  </div>
                  <div className="text-cyan-500 font-mono text-xs tracking-[0.5em] animate-pulse">系统初始化中...</div>
              </div>
          </div>
      )}

      {/* Game Playing & Pause Overlay */}
      {status === GameStatus.PLAYING && (
          <>
            <GameEngine 
                initialChemicals={chemicals}
                onGameOver={(score) => {
                    if (revivesLeft > 1) {
                        audioService.playExplosion();
                        setRevivesLeft(r => r - 1);
                        setReviveTrigger(Date.now());
                    } else {
                        setRevivesLeft(0);
                        audioService.playGameOver();
                        handleGameOver(score);
                    }
                }}
                onBossDefeated={() => {
                    setBossKillCount(prev => {
                        const next = prev + 1;
                        if (next % BOSSES_PER_REVIVE === 0) {
                            setRevivesLeft(r => {
                                audioService.playAchievement(); 
                                return r + 1;
                            });
                        }
                        return next;
                    });
                }}
                onTutorialComplete={() => {
                    // Tutorial logic removed
                }}
                hasCompletedTutorial={true}
                status={status}
                reviveTrigger={reviveTrigger}
                revivesLeft={revivesLeft}
                theme={currentTheme}
                settings={settings}
                nickname={profile.nickname}
                isPaused={isPaused}
                onPause={() => setIsPaused(true)}
            />

            {/* PAUSE MENU OVERLAY */}
            {isPaused && (
                <div className="absolute inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
                     <div className="bg-[#0f172a] p-6 rounded-3xl w-full max-w-lg border border-slate-700 flex flex-col max-h-[90vh] shadow-2xl relative">
                        <div className="text-center mb-6">
                             <h2 className="text-2xl font-black text-white tracking-[0.5em] uppercase">实验暂停</h2>
                        </div>

                        {/* Settings in Pause Menu */}
                        <div className="flex-1 overflow-hidden flex flex-col min-h-0 mb-4">
                            <SettingsContent />
                        </div>

                        <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-white/10">
                            <button 
                                onClick={() => {
                                    audioService.playButtonTap();
                                    setIsPaused(false);
                                }}
                                className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold text-sm tracking-widest uppercase shadow-lg transition-transform"
                            >
                                继续实验
                            </button>
                            <button 
                                onClick={() => {
                                    audioService.playButtonTap();
                                    setStatus(GameStatus.IDLE);
                                    setIsPaused(false);
                                }}
                                className="w-full py-4 bg-transparent border border-red-900 text-red-500 hover:bg-red-900/20 rounded-xl font-bold text-sm tracking-widest uppercase transition-transform"
                            >
                                放弃任务
                            </button>
                        </div>
                     </div>
                </div>
            )}
          </>
      )}

      {/* Game Over Screen */}
      {status === GameStatus.GAME_OVER && (
          <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center z-50 animate-in zoom-in p-6">
              <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-900 mb-4 tracking-tighter">实验失败</h1>
              <p className="text-slate-500 mb-12 text-xl font-mono tracking-widest uppercase">生命体征消失</p>
              
              <div className="flex flex-col gap-4 w-full max-w-xs">
                  <button 
                    onClick={() => {
                        audioService.playButtonTap();
                        startGame();
                    }}
                    className="w-full py-4 bg-white text-slate-950 font-black tracking-widest uppercase hover:scale-105 transition-transform"
                  >
                      重启实验
                  </button>
                  <button 
                    onClick={() => {
                        audioService.playButtonTap();
                        setStatus(GameStatus.IDLE);
                    }}
                    className="w-full py-4 border border-slate-700 text-slate-400 font-bold tracking-widest uppercase hover:text-white hover:border-white transition-colors"
                  >
                      返回基地
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default App;