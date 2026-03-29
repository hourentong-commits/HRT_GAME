import React, { useState, useRef, useEffect } from 'react';
import { GameStatus, Chemical, UserProfile, Theme, GameSettings, Achievement, IconType } from './types';
import { generateGameData } from './services/geminiService';
import GameEngine from './components/GameEngine';
import { audioService } from './services/audioService';
import { THEMES, MAX_REVIVES, FALLBACK_CHEMICALS, BOSSES_PER_REVIVE, FULL_PERIODIC_TABLE } from './constants';

// --- DATA: Element Trivia Database ---
const ELEMENT_TRIVIA_DB: Record<string, string> = {
    'H': '宇宙中75%的质量都是我！我是最轻的元素，虽然我排第一，但我其实是个独行侠，既像金属又像非金属。',
    'He': '我是唯一不会结冰的元素，哪怕绝对零度也不行！另外，吸入我会让你的声音变得像唐老鸭一样尖细。',
    'Li': '虽然是金属，但我轻到可以浮在油面上！我是手机电池的心脏，没有我，你的手机只能用几分钟。',
    'Be': '我尝起来是甜的，但是剧毒！千万别被我的“糖衣炮弹”骗了。',
    'B': '我是植物的营养素，也是防弹衣的增强剂。我既硬又脆，是元素界的“黑钻石”。',
    'C': '我是生命的骨架！不管是你吃的米饭，还是你手上的钻石，甚至铅笔芯，本质上都是我。',
    'N': '别看氧气很出名，其实空气里78%都是我。我是植物生长的必须品，液态的我还能瞬间冻结玫瑰花！',
    'O': '没有我，火烧不起来，你也活不下去。我是地壳里含量最多的元素，石头里其实藏着大量的我。',
    'F': '我是元素界的“霸王”，谁的电子我都敢抢！我太活泼了，以至于想把我分离出来都很难。',
    'Ne': '我是霓虹灯的灵魂，通电后我会发出迷人的红光。我很懒，几乎不和任何人发生反应。',
    'Na': '我脾气很暴躁，扔进水里就会爆炸！但我也是你每天吃的食盐（氯化钠）的一半。',
    'Mg': '我燃烧时会发出耀眼的白光，以前的照相机闪光灯就是靠我！植物叶绿素里也有我的身影。',
    'Al': '我是地壳里最多的金属。以前我比金子还贵，拿破仑请客时，只有他用铝碗，客人都得用金碗！',
    'Si': '我是沙子的主要成分，也是芯片的基石。没有我，就没有电脑、手机和这个游戏。',
    'P': '我的名字意思是“携带光的人”。白磷很危险，红磷却能做火柴盒的侧面。人骨头里也少不了我。',
    'S': '我有股臭鸡蛋味儿，火山喷发时经常能闻到。但我也是火药的三大成分之一！',
    'Cl': '我是泳池消毒水的味道来源。虽然单质有毒，但和钠结合后，就成了美味的食盐。',
    'Ar': '我很懒（惰性气体），但我很便宜。灯泡里充的就是我，为了防止钨丝氧化烧断。',
    'K': '香蕉里富含我！我是神经传导的关键，如果你觉得肌肉无力，可能就是缺我了。',
    'Ca': '喝牛奶补钙就是补我！我是骨骼和牙齿的硬度来源。',
    'Ti': '我轻便又坚硬，还不过敏，所以经常被用来做人造骨骼和高级眼镜架。',
    'Fe': '工业的骨骼！你的血液是红色的，也是因为红细胞里的我（血红蛋白）在运输氧气。',
    'Cu': '我是人类最早使用的金属之一。导电性超好，你家墙里的电线基本都是我做的。',
    'Zn': '我是人体必需的微量元素，牡蛎里含量最高。我还能保护钢铁不生锈（镀锌）。',
    'Ga': '我在手里就会融化！因为我的熔点只有29.76℃。把它放在手心，你会看到金属化成液体的魔术。',
    'As': '著名的毒药“砒霜”就是我的氧化物。但在微量情况下，我其实也是一种药物。',
    'Br': '我是常温下唯一的液态非金属，红棕色的液体，挥发出的烟雾很难闻且有毒。',
    'Kr': '超人的故乡？不，我只是个惰性气体。不过我也能用来制作高亮度的闪光灯。',
    'Ag': '我是导电性最好的金属，比铜还强！只是因为太贵了，所以还没法用我做电线。',
    'Sn': '锡纸其实是铝做的，但我才是真正的“锡”。我很怕冷，温度太低我会变成粉末，叫“锡疫”。',
    'I': '我是甲状腺的守护者，海带里有很多我。升华时我会直接变成紫色的蒸汽，非常漂亮。',
    'Xe': '虽然是惰性气体，但我能做麻醉剂，还能在离子推进器里推着卫星在太空飞行。',
    'Cs': '我是定义“一秒钟”的男人！原子钟就是利用我的振荡频率来计时的，精准无比。',
    'Ba': '做“钡餐”检查时喝的就是我的硫酸盐。虽然我有毒，但硫酸钡不溶于水和酸，所以很安全。',
    'W': '我是最耐热的金属，熔点高达3422℃！所以灯泡里的灯丝非我莫属。',
    'Pt': '白金就是我。我非常稳定，王水都很难腐蚀我，是催化剂之王。',
    'Au': '真金不怕火炼！我延展性极好，1克黄金可以拉成4000米长的金丝。',
    'Hg': '我是常温下唯一的液态金属。虽然很好玩（水银），但剧毒，千万别碰！',
    'Pb': '我很重，也很软。我是防辐射的好手，X光室的门里通常都夹着我。',
    'U': '我是核电站的燃料。虽然我有放射性，但其实玻璃着色剂里以前也用过我（铀玻璃），发出荧光绿。',
    'Pu': '我是原子弹的原料，名字来源于冥王星。剧毒且有着可怕的放射性。',
    'Og': '我是目前周期表上最重的元素（118号），是为了纪念Oganessian教授而命名的。但我很不稳定，存在时间极短。'
};

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [profile, setProfile] = useState<UserProfile>({ 
      nickname: '玩家001', 
      themeId: 'tech', 
      bestScore: 0,
      hasCompletedTutorial: true,
      unlockedAchievements: []
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
  const [showPeriodicTableModal, setShowPeriodicTableModal] = useState(false); // New Modal State
  const [tempName, setTempName] = useState('');
  const [bossKillCount, setBossKillCount] = useState(0);
  const [achievementNotification, setAchievementNotification] = useState<Achievement | null>(null);
  const [isMuted, setIsMuted] = useState(false);

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

  const handleUnlockAchievement = (achievement: Achievement) => {
      if (profile.unlockedAchievements.includes(achievement.id)) return;

      setProfile(prev => ({
          ...prev,
          unlockedAchievements: [...prev.unlockedAchievements, achievement.id]
      }));

      setAchievementNotification(achievement);
      audioService.playAchievement();
      setTimeout(() => setAchievementNotification(null), 4000);
  };

  const toggleMute = () => {
      const muted = audioService.toggleMute();
      setIsMuted(muted);
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

  const PeriodicTableModal = () => {
      const [selectedElement, setSelectedElement] = useState<any>(FULL_PERIODIC_TABLE[0]); 
      const [clickedId, setClickedId] = useState<number | null>(null);
      
      // Pan & Zoom State
      const [scale, setScale] = useState(1.1);
      const [position, setPosition] = useState({ x: 0, y: 0 });
      const containerRef = useRef<HTMLDivElement>(null);
      const isDraggingRef = useRef(false);
      const lastPosRef = useRef({ x: 0, y: 0 });
      const lastDistRef = useRef<number | null>(null);

      // Reset view on open
      useEffect(() => {
          setScale(1.1);
          setPosition({ x: 0, y: 0 });
      }, []);

      const handleWheel = (e: React.WheelEvent) => {
          e.stopPropagation();
          const newScale = Math.min(Math.max(0.5, scale - e.deltaY * 0.002), 4);
          setScale(newScale);
      };

      const handleTouchStart = (e: React.TouchEvent) => {
          if (e.touches.length === 1) {
              isDraggingRef.current = true;
              lastPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          } else if (e.touches.length === 2) {
              const dist = Math.hypot(
                  e.touches[0].clientX - e.touches[1].clientX,
                  e.touches[0].clientY - e.touches[1].clientY
              );
              lastDistRef.current = dist;
          }
      };

      const handleTouchMove = (e: React.TouchEvent) => {
          if (e.touches.length === 1 && isDraggingRef.current) {
              const dx = e.touches[0].clientX - lastPosRef.current.x;
              const dy = e.touches[0].clientY - lastPosRef.current.y;
              setPosition(p => ({ x: p.x + dx, y: p.y + dy }));
              lastPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          } else if (e.touches.length === 2 && lastDistRef.current) {
              const dist = Math.hypot(
                  e.touches[0].clientX - e.touches[1].clientX,
                  e.touches[0].clientY - e.touches[1].clientY
              );
              const delta = dist - lastDistRef.current;
              // Slower zoom speed for better control
              const newScale = Math.min(Math.max(0.5, scale + delta * 0.005), 4);
              setScale(newScale);
              lastDistRef.current = dist;
          }
      };

      const handleTouchEnd = () => {
          isDraggingRef.current = false;
          lastDistRef.current = null;
      };

      // Mouse Drag support
      const handleMouseDown = (e: React.MouseEvent) => {
          isDraggingRef.current = true;
          lastPosRef.current = { x: e.clientX, y: e.clientY };
      };
      const handleMouseMove = (e: React.MouseEvent) => {
          if (isDraggingRef.current) {
              const dx = e.clientX - lastPosRef.current.x;
              const dy = e.clientY - lastPosRef.current.y;
              setPosition(p => ({ x: p.x + dx, y: p.y + dy }));
              lastPosRef.current = { x: e.clientX, y: e.clientY };
          }
      };
      const handleMouseUp = () => { isDraggingRef.current = false; };

      
      const getCategoryColor = (cat: string) => {
          switch(cat) {
              case 'nonmetal': return '#3b82f6';
              case 'noble-gas': return '#8b5cf6';
              case 'alkali-metal': return '#ef4444';
              case 'alkaline-earth': return '#f97316';
              case 'metalloid': return '#10b981';
              case 'halogen': return '#06b6d4';
              case 'transition': return '#eab308';
              case 'post-transition': return '#84cc16';
              case 'lanthanide': return '#ec4899';
              case 'actinide': return '#f43f5e';
              default: return '#64748b';
          }
      };

      const getElementImageUrl = (z: number) => {
          // Reliable image source for elements 1-118
          return `https://periodictable.com/Samples/${z.toString().padStart(3, '0')}/s9s.JPG`;
      };

      const getScienceTrivia = (el: any) => {
          if (ELEMENT_TRIVIA_DB[el.symbol]) {
              return ELEMENT_TRIVIA_DB[el.symbol];
          }
          return `${el.name}（${el.symbol}）是原子序数为 ${el.z} 的${el.category.includes('metal') ? '金属' : '非金属'}元素。它的相对原子质量约为 ${el.mass}。`;
      };

      const triggerClickAnim = (chem: any) => {
          audioService.playButtonTap();
          setSelectedElement(chem);
          setClickedId(chem.z);
          setTimeout(() => setClickedId(null), 500);
      };

      return (
          <div className="absolute inset-0 z-[100] flex flex-col bg-slate-950/98 backdrop-blur-2xl animate-in fade-in duration-300">
              {/* Header */}
              <div className="flex justify-between items-center px-4 py-2 border-b border-white/10 bg-black/40 shrink-0 h-12 z-20 relative shadow-lg">
                  <div className="flex items-center gap-3">
                      <div className="text-cyan-400 text-lg animate-spin-slow">⌬</div>
                      <div className="flex flex-col">
                          <h2 className="text-sm font-bold text-white tracking-widest uppercase leading-none">元素图鉴</h2>
                          <span className="text-[8px] text-cyan-500/60 font-mono tracking-widest">DATABASE ACCESS</span>
                      </div>
                  </div>
                  <button 
                    onClick={() => { audioService.playButtonTap(); setShowPeriodicTableModal(false); }} 
                    className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                  >&times;</button>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
                  
                  {/* Left: Interactive Periodic Table Canvas */}
                  <div 
                    className="flex-1 overflow-hidden relative bg-slate-900 cursor-move"
                    ref={containerRef}
                    onWheel={handleWheel}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                      <div className="absolute inset-0 pointer-events-none opacity-20" 
                           style={{backgroundImage: 'linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)', backgroundSize: '40px 40px'}}>
                      </div>
                      
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-mono z-10 pointer-events-none bg-black/60 px-3 py-1 rounded-full backdrop-blur border border-white/10">
                          PINCH / SCROLL TO ZOOM
                      </div>

                      {/* Transform Container */}
                      <div 
                        className="origin-center transition-transform duration-75 ease-out flex items-center justify-center min-h-full min-w-full p-0"
                        style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` }}
                      >
                          {/* Saturated Grid: with very slight gap for aesthetics */}
                          <div className="grid grid-cols-18 gap-[1px] auto-rows-fr w-[1000px] aspect-[18/10] bg-transparent p-1" style={{ gridTemplateColumns: 'repeat(18, minmax(0, 1fr))' }}>
                              {FULL_PERIODIC_TABLE.map((chem) => (
                                  <button
                                      key={chem.z}
                                      onClick={(e) => { e.stopPropagation(); triggerClickAnim(chem); }}
                                      className={`relative flex flex-col items-center justify-center overflow-hidden transition-all duration-200 rounded-sm scale-[0.95]
                                          ${selectedElement?.z === chem.z ? 'z-30 ring-2 ring-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.6)]' : 'opacity-80 hover:opacity-100 hover:z-20 hover:scale-105 hover:ring-1 hover:ring-white/30'}
                                      `}
                                      style={{
                                          backgroundColor: getCategoryColor(chem.category),
                                          gridColumnStart: chem.group,
                                          gridRowStart: chem.period
                                      }}
                                  >
                                      {/* Click Animation Ripple */}
                                      {clickedId === chem.z && (
                                          <span className="absolute inset-0 rounded-full bg-white/40 animate-ping"></span>
                                      )}
                                      
                                      <span className="text-[6px] absolute top-1 left-1 opacity-60 font-mono">{chem.z}</span>
                                      <span className="text-xl font-black text-white leading-none drop-shadow-md my-1">{chem.symbol}</span>
                                      <span className="text-[6px] text-white/90 scale-90 truncate w-full text-center font-bold bg-black/10 py-0.5">{chem.name}</span>
                                  </button>
                              ))}
                              
                              {/* Decorative Placeholders for Lanthanides/Actinides markers */}
                              <div className="col-start-3 row-start-6 flex items-center justify-center bg-white/5 rounded-sm m-[1px]"><span className="text-[6px] text-slate-500">57-71</span></div>
                              <div className="col-start-3 row-start-7 flex items-center justify-center bg-white/5 rounded-sm m-[1px]"><span className="text-[6px] text-slate-500">89-103</span></div>
                          </div>
                      </div>
                  </div>

                  {/* Right (Desktop) / Bottom (Mobile): Data Terminal - Fixed Layout */}
                  <div className="h-[35vh] md:h-auto md:w-80 border-t md:border-t-0 md:border-l border-cyan-500/20 bg-slate-950/95 backdrop-blur-xl flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-30 shrink-0 relative transition-all">
                      
                      {/* Decorative Tech Lines */}
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
                      <div className="absolute top-0 right-0 w-[1px] h-20 bg-gradient-to-b from-cyan-500 to-transparent opacity-30"></div>

                      {selectedElement ? (
                          <div className="flex flex-col h-full animate-in slide-in-from-bottom fade-in duration-300">
                              {/* 1. Header (Clean Information) */}
                              <div className="relative h-28 shrink-0 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950">
                                  <div className="absolute inset-0 opacity-20" style={{backgroundColor: getCategoryColor(selectedElement.category)}}></div>
                                  <div className="absolute top-0 right-0 p-2 opacity-5 text-8xl font-black text-white select-none">{selectedElement.z}</div>
                                  
                                  <div className="relative h-full px-5 flex items-center justify-between">
                                      <div className="flex items-center gap-4">
                                          <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-white/10 to-transparent backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl font-black text-white shadow-2xl relative overflow-hidden">
                                              <div className="absolute inset-0 bg-white/5 animate-pulse"></div>
                                              {selectedElement.symbol}
                                          </div>
                                          <div>
                                              <div className="text-2xl font-bold text-white leading-none mb-1 tracking-wide">{selectedElement.name}</div>
                                              <div className="text-xs text-white/60 font-mono">{selectedElement.mass} u</div>
                                          </div>
                                      </div>
                                      <div className="text-right">
                                          <div className="text-3xl font-black text-white/90 font-mono leading-none tracking-tighter">{selectedElement.z}</div>
                                          <div className="text-[8px] text-cyan-400 uppercase tracking-wider mt-1 opacity-80">Atomic No.</div>
                                      </div>
                                  </div>
                              </div>

                              {/* 2. Data Grid (Compact) */}
                              <div className="grid grid-cols-3 gap-0 border-y border-white/5 bg-slate-900/50">
                                  <div className="p-2 border-r border-white/5 text-center hover:bg-white/5 transition-colors">
                                      <div className="text-[8px] text-slate-500 uppercase tracking-wider">周期 Period</div>
                                      <div className="text-sm font-mono text-white font-bold">{selectedElement.period > 7 ? (selectedElement.period === 9 ? 6 : 7) : selectedElement.period}</div>
                                  </div>
                                  <div className="p-2 border-r border-white/5 text-center hover:bg-white/5 transition-colors">
                                      <div className="text-[8px] text-slate-500 uppercase tracking-wider">族 Group</div>
                                      <div className="text-sm font-mono text-white font-bold">{selectedElement.group}</div>
                                  </div>
                                  <div className="p-2 text-center hover:bg-white/5 transition-colors">
                                      <div className="text-[8px] text-slate-500 uppercase tracking-wider">分类 Class</div>
                                      <div className="text-[9px] font-bold text-cyan-300 truncate px-1 mt-0.5">
                                          {selectedElement.category.split('-').join(' ')}
                                      </div>
                                  </div>
                              </div>
                              
                              {/* 3. Trivia Section (Scrollable with Image) */}
                              <div className="flex-1 overflow-y-auto custom-scrollbar p-5 bg-[linear-gradient(rgba(15,23,42,0.8),rgba(15,23,42,1))]">
                                  
                                  {/* --- NEW: Element Sample Image Card --- */}
                                  <div className="mb-6 rounded-xl overflow-hidden bg-slate-900 border border-white/10 shadow-2xl relative group">
                                      <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-black/60 backdrop-blur rounded text-[8px] text-white/80 font-mono uppercase tracking-widest border border-white/10">
                                          Real Sample
                                      </div>
                                      <div className="aspect-[4/3] w-full bg-slate-800 relative">
                                          <img 
                                            src={getElementImageUrl(selectedElement.z)} 
                                            alt={`${selectedElement.name} Sample`}
                                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                            loading="lazy"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.parentElement?.classList.add('hidden');
                                            }}
                                          />
                                      </div>
                                      <div className="h-1 w-full" style={{backgroundColor: getCategoryColor(selectedElement.category)}}></div>
                                  </div>

                                  <div className="flex items-center gap-2 mb-3">
                                      <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></span>
                                      <span className="text-xs font-bold text-cyan-100 uppercase tracking-widest">专属档案 (DATA LOG)</span>
                                  </div>
                                  
                                  <div className="bg-slate-800/30 p-3 rounded-r-xl border-l-2 border-cyan-500/50">
                                      <p className="text-sm text-slate-300 leading-6 font-medium text-justify font-sans">
                                          {getScienceTrivia(selectedElement)}
                                      </p>
                                  </div>
                              </div>
                          </div>
                      ) : (
                          <div className="h-full flex items-center justify-center text-slate-600">
                              <span className="animate-pulse tracking-widest text-xs">AWAITING SELECTION</span>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      );
  };

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
      
      {/* Achievement Notification Overlay (Compact Top-Center) */}
      {achievementNotification && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[90] animate-in slide-in-from-top duration-500 fade-out slide-out-to-top fill-mode-forwards" style={{animationDuration: '4s'}}>
              <div className="bg-slate-900/90 backdrop-blur-md pl-3 pr-5 py-2 rounded-full border border-yellow-500/30 shadow-lg flex items-center gap-3">
                  <div className="text-xl animate-bounce">{achievementNotification.icon}</div>
                  <div className="flex flex-col">
                      <div className="text-[8px] font-bold text-yellow-500 uppercase tracking-widest leading-none mb-0.5">ACHIEVEMENT</div>
                      <div className="text-white font-bold text-xs leading-none">{achievementNotification.title}</div>
                  </div>
              </div>
          </div>
      )}

      {/* Modals */}
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

      {showPeriodicTableModal && <PeriodicTableModal />}

      {/* Main Menu - Enhanced Chemistry Theme V2.0 */}
      {status === GameStatus.IDLE && (
        <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-950">
          
          {/* Tech Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.5)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/80"></div>
          
          {/* Animated Particles / Bubbles */}
          <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                  <div 
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-cyan-500/20 bubble-anim"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: '100%',
                        animationDelay: `${Math.random() * 5}s`,
                        animationDuration: `${5 + Math.random() * 10}s`,
                        width: `${Math.random() * 10 + 2}px`,
                        height: `${Math.random() * 10 + 2}px`
                    }}
                  ></div>
              ))}
          </div>

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
                    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" stroke="currentColor" className="text-white" strokeWidth="2">
                        <path d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z" />
                        <circle cx="50" cy="50" r="20" />
                        <line x1="50" y1="5" x2="90" y2="25" strokeDasharray="4 4" />
                    </svg>
               </div>
               {/* DNA Helix Abstract */}
               <div className="absolute bottom-10 right-10 opacity-5 animate-pulse-slow" style={{animationDuration: '8s'}}>
                   <svg width="120" height="200" viewBox="0 0 100 200" stroke="currentColor" className="text-purple-500">
                        <path d="M30 0 Q70 50 30 100 T30 200" fill="none" strokeWidth="4"/>
                        <path d="M70 0 Q30 50 70 100 T70 200" fill="none" strokeWidth="4"/>
                        <line x1="30" y1="20" x2="70" y2="20" strokeWidth="2"/>
                        <line x1="40" y1="40" x2="60" y2="40" strokeWidth="2"/>
                        <line x1="30" y1="60" x2="70" y2="60" strokeWidth="2"/>
                        <line x1="40" y1="80" x2="60" y2="80" strokeWidth="2"/>
                   </svg>
               </div>
               {/* Beaker */}
               <div className="absolute bottom-20 left-10 opacity-10 animate-bubble" style={{animationDuration: '18s', animationDelay: '5s'}}>
                   <span className="text-8xl">⚗️</span>
               </div>
               {/* Formulas */}
               <div className="absolute top-1/2 left-10 opacity-5 font-mono text-xl text-green-500">E = mc²</div>
               <div className="absolute top-10 left-1/2 opacity-5 font-mono text-xl text-yellow-500">C₆H₁₂O₆</div>
               <div className="absolute bottom-1/2 right-10 opacity-5 font-mono text-xl text-red-500">NH₃</div>
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
                 
                 <button 
                    onClick={() => { audioService.playButtonTap(); setShowPeriodicTableModal(true); }} 
                    className="w-full py-4 bg-slate-900/80 text-slate-300 border border-slate-700 hover:border-cyan-500/50 hover:text-white transition-all text-xs font-bold tracking-widest uppercase rounded-sm flex items-center justify-center gap-2"
                 >
                    <span>🧪</span> 元素图鉴 (REFERENCE)
                 </button>
             </div>

             {/* Footer Info */}
             <div className="absolute bottom-8 text-center space-y-2">
                 <div className="text-cyan-500/60 font-mono text-[10px] tracking-widest">
                     最高分记录 :: {profile.bestScore.toLocaleString().padStart(6, '0')}
                 </div>
                 <div className="flex gap-4 text-[10px] text-slate-600 font-mono uppercase tracking-widest">
                     <span>游戏版本 V2.0</span>
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
                onUnlockAchievement={handleUnlockAchievement}
                hasCompletedTutorial={true}
                unlockedAchievements={profile.unlockedAchievements}
                status={status}
                reviveTrigger={reviveTrigger}
                revivesLeft={revivesLeft}
                theme={currentTheme}
                settings={settings}
                nickname={profile.nickname}
                isPaused={isPaused}
                onPause={() => setIsPaused(true)}
                isMuted={isMuted}
                onToggleMute={toggleMute}
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