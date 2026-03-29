
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Chemical, GameItem, GameStatus, Player, HazardType, IconType, ReactionRecipe, Position, Boss, BossState, Projectile, Theme, GameSettings, Rank, TutorialStep, Achievement } from '../types';
import { MAP_WIDTH, MAP_HEIGHT, PLAYER_RADIUS, ITEM_RADIUS, SNAKE_SPEED_BASE, SNAKE_SPEED_MIN, SNAKE_SPEED_MAX, SEGMENT_SPACING, GROWTH_PER_ITEM, INITIAL_LENGTH, REACTION_RECIPES, TURN_SMOOTHING, BOSS_HP_PER_LEVEL, LEVEL_SCORE_THRESHOLD_BASE, PLAYER_RANKS, BOSS_ENCIRCLE_DPS, SNAKE_EVOLUTION_THRESHOLD, SNAKE_RESET_LENGTH, EVOLUTION_SPEED_BONUS, MAX_BOSSES_PER_LEVEL, AMMO_PACK_TEMPLATE, MISSILE_AMMO_THRESHOLD, MISSILE_AMMO_COST, NORMAL_AMMO_DAMAGE, MISSILE_DAMAGE, MISSILE_SPEED, RAPID_FIRE_COOLDOWN, MISSILE_COOLDOWN, BOSS_TEMPLATES, NORMAL_AMMO_SPEED, NORMAL_AMMO_TURN_RATE, MISSILE_BASE_TURN_RATE, MISSILE_LEVEL_TURN_BONUS, FALLBACK_CHEMICALS, ACHIEVEMENTS } from '../constants';
import Controls from './Controls';
import { audioService } from '../services/audioService';
import { generateGameData } from '../services/geminiService';

interface GameEngineProps {
  initialChemicals: Chemical[];
  onGameOver: (score: number) => void;
  onBossDefeated: () => void;
  onTutorialComplete: () => void;
  onUnlockAchievement: (achievement: Achievement) => void;
  hasCompletedTutorial: boolean;
  unlockedAchievements: string[];
  status: GameStatus;
  reviveTrigger: number;
  revivesLeft: number;
  theme: Theme;
  settings: GameSettings;
  nickname: string;
  isPaused: boolean;     
  onPause: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
  type: 'circle' | 'square' | 'sparkle';
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  life: number;
  color: string;
  size?: number;
}

// Simplified Equation Overlay for Center Screen (only for major events now)
interface EquationOverlay {
    text: string;
    subText: string;
    phenomenon: string; 
    expiresAt: number;
}

interface TriviaOverlay {
    text: string;
    formula: string;
    name: string;
    color: string;
    expiresAt: number;
}

// New Interface for Reaction Hints
interface ReactionHint {
    recipe: ReactionRecipe;
    haveIngredients: string[];
    missingIngredients: string[];
    isReady: boolean;
}

const GameEngine: React.FC<GameEngineProps> = ({ 
    initialChemicals, onGameOver, onBossDefeated, onTutorialComplete, onUnlockAchievement, hasCompletedTutorial, unlockedAchievements,
    status, reviveTrigger, revivesLeft, theme, settings, nickname, isPaused, onPause, isMuted, onToggleMute 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- REFS ---
  const playerRef = useRef<Player>({
    head: { x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 },
    direction: { x: 0, y: -1 }, 
    targetAngle: -Math.PI / 2,
    length: INITIAL_LENGTH,
    history: [], 
    baseSpeed: SNAKE_SPEED_BASE,
    currentSpeed: SNAKE_SPEED_BASE,
    health: 100,
    isDashing: false,
    invulnerableUntil: 0,
    ammo: 0,
    evolutionTier: 0,
    speedBuffUntil: 0
  });

  const itemsRef = useRef<GameItem[]>([]);
  const inventoryRef = useRef<Map<string, number>>(new Map());
  const particlesRef = useRef<Particle[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const bossRef = useRef<Boss | null>(null);
  
  const scoreRef = useRef(0);
  const levelRef = useRef(1);
  const nextLevelScoreRef = useRef(LEVEL_SCORE_THRESHOLD_BASE);
  const bossesSpawnedInLevelRef = useRef(0);
  const chemicalPoolRef = useRef<Chemical[]>(initialChemicals);
  
  const animationFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const speedScaleRef = useRef(0.1); 
  const shootCooldownRef = useRef(0);
  const startPosRef = useRef({x: 0, y: 0});
  const lastHeartbeatTimeRef = useRef(0);
  
  const currentRankRef = useRef<Rank>(PLAYER_RANKS[0]);
  const prevRevivesRef = useRef(revivesLeft);

  // Session Stats for Achievements
  const sessionStatsRef = useRef({
      bossKills: 0,
      collectedAlkali: new Set<string>(),
      reactionCount: 0,
  });

  // --- STATE ---
  const [uiScore, setUiScore] = useState(0);
  const [uiLevel, setUiLevel] = useState(1);
  const [uiInventory, setUiInventory] = useState<Record<string, number>>({});
  const [recentItems, setRecentItems] = useState<string[]>([]); // New state for recent items
  const [uiAmmo, setUiAmmo] = useState(0);
  const [uiReactionCount, setUiReactionCount] = useState(0); // New State
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [bossHp, setBossHp] = useState({ current: 0, max: 0 });
  const [levelUpMessage, setLevelUpMessage] = useState<string | null>(null);
  const [currentRank, setCurrentRank] = useState<Rank>(PLAYER_RANKS[0]);
  const [showRankUp, setShowRankUp] = useState(false);
  const [showMaxRankCert, setShowMaxRankCert] = useState(false);
  const [equationOverlay, setEquationOverlay] = useState<EquationOverlay | null>(null);
  const [triviaOverlay, setTriviaOverlay] = useState<TriviaOverlay | null>(null);
  const [reactionHints, setReactionHints] = useState<ReactionHint[]>([]);
  
  const [tutorialStep, setTutorialStep] = useState<TutorialStep>(TutorialStep.NONE);

  // --- INITIALIZATION ---
  useEffect(() => {
    initGame();
    return () => audioService.stopEngineSound();
  }, [reviveTrigger]); 

  // Watch for revive changes to show feedback
  useEffect(() => {
      if (revivesLeft > prevRevivesRef.current) {
          const player = playerRef.current;
          addFloatingText(player.head.x, player.head.y - 100, "+1 生命!", "#00ff00", 30);
          spawnParticles(player.head.x, player.head.y, '#00ff00', 30, 'sparkle');
      }
      prevRevivesRef.current = revivesLeft;
  }, [revivesLeft]);

  // Update Reaction Hints based on Inventory
  useEffect(() => {
      if (!settings.showReactions) {
          setReactionHints([]);
          return;
      }

      const inv = uiInventory;
      const hints: ReactionHint[] = [];

      REACTION_RECIPES.forEach(recipe => {
          const have: string[] = [];
          const missing: string[] = [];
          let isReady = true;

          recipe.inputs.forEach(input => {
              if ((inv[input.formula] || 0) >= input.count) {
                  have.push(input.formula);
              } else if ((inv[input.formula] || 0) > 0) {
                  // Have some but not enough count
                  have.push(`${input.formula}`);
                  missing.push(`${input.formula}`);
                  isReady = false;
              } else {
                  missing.push(input.formula);
                  isReady = false;
              }
          });

          // Only show hints if we have at least one ingredient OR if it was just ready (handled by logic loop usually)
          // To make it cleaner: Show if we have ANY part of it.
          // Filter: Must have at least one ingredient type present in inventory
          const hasPartial = recipe.inputs.some(input => (inv[input.formula] || 0) > 0);
          
          if (hasPartial) {
              hints.push({
                  recipe,
                  haveIngredients: have,
                  missingIngredients: missing,
                  isReady
              });
          }
      });

      // Sort: Ready first, then by completeness
      hints.sort((a, b) => {
          if (a.isReady && !b.isReady) return -1;
          if (!a.isReady && b.isReady) return 1;
          return a.missingIngredients.length - b.missingIngredients.length;
      });

      setReactionHints(hints.slice(0, 3)); // Max 3 hints to avoid clutter
  }, [uiInventory, settings.showReactions]);

  // --- CONTROLS HOOKS ---
  const handleShootingInput = () => {
    if (isPaused) return;
    // Direct fire if cooldown is ready, no more holding state
    if (shootCooldownRef.current <= 0 && playerRef.current.ammo > 0) {
        audioService.playButtonTap();
        fireProjectile();
    }
  };

  // --- PC MOUSE CONTROLS ---
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
       if (isPaused) return;
       const centerX = window.innerWidth / 2;
       const centerY = window.innerHeight / 2;
       const dx = e.clientX - centerX;
       const dy = e.clientY - centerY;
       const angle = Math.atan2(dy, dx);
       playerRef.current.targetAngle = angle;
    };
    
    const handleMouseDown = (e: MouseEvent) => {
        if (e.button === 0) { // Left click
            handleShootingInput();
        }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [isPaused]);

  // --- KEYBOARD CONTROLS ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (isPaused) return;
        const p = playerRef.current;
        
        switch(e.code) {
            case 'Escape':
                onPause();
                break;
            case 'Space': 
            case 'KeyJ':
                if (!e.repeat) handleShootingInput();
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
            case 'KeyW': 
            case 'ArrowUp':
                p.currentSpeed = SNAKE_SPEED_MAX; 
                break;
            case 'KeyS': 
            case 'ArrowDown':
                p.currentSpeed = SNAKE_SPEED_MIN; 
                break;
        }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
        const p = playerRef.current;
        switch(e.code) {
            case 'ShiftLeft':
            case 'ShiftRight':
            case 'KeyW': 
            case 'ArrowUp':
                p.currentSpeed = p.baseSpeed; 
                break;
            case 'KeyS': 
            case 'ArrowDown':
                p.currentSpeed = p.baseSpeed; 
                break;
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPaused, onPause]);

  const initGame = () => {
    audioService.startBgm();
    
    if (reviveTrigger > 0) {
        playerRef.current.health = 100;
        playerRef.current.invulnerableUntil = Date.now() + 3000;
        playerRef.current.head.x = MAP_WIDTH/2; 
        playerRef.current.head.y = MAP_HEIGHT/2;
        projectilesRef.current = []; 
        spawnParticles(MAP_WIDTH/2, MAP_HEIGHT/2, '#00ff00', 30, 'sparkle');
        return;
    }

    playerRef.current = {
        head: { x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 },
        direction: { x: 0, y: -1 },
        targetAngle: -Math.PI / 2,
        length: INITIAL_LENGTH,
        history: [], 
        baseSpeed: SNAKE_SPEED_BASE,
        currentSpeed: SNAKE_SPEED_BASE,
        health: 100,
        isDashing: false,
        invulnerableUntil: Date.now() + 3000,
        ammo: 5,
        evolutionTier: 0,
        speedBuffUntil: 0
    };
    startPosRef.current = { ...playerRef.current.head };
    
    for(let i=0; i<INITIAL_LENGTH * SEGMENT_SPACING; i++) {
        playerRef.current.history.push({
            x: MAP_WIDTH/2,
            y: MAP_HEIGHT/2 + i * (SNAKE_SPEED_BASE / SEGMENT_SPACING) 
        });
    }

    inventoryRef.current.clear();
    setUiInventory({});
    setRecentItems([]); // Reset recent items
    scoreRef.current = 0;
    levelRef.current = 1;
    bossesSpawnedInLevelRef.current = 0;
    
    // Reset Session Stats
    sessionStatsRef.current = {
        bossKills: 0,
        collectedAlkali: new Set(),
        reactionCount: 0,
    };

    setUiScore(0);
    setUiLevel(1);
    setUiAmmo(5);
    setUiReactionCount(0);
    setCurrentRank(PLAYER_RANKS[0]);
    currentRankRef.current = PLAYER_RANKS[0];
    setShowMaxRankCert(false);
    setTriviaOverlay(null);
    itemsRef.current = [];
    
    // Tutorial removed, direct spawn
    setTutorialStep(TutorialStep.NONE);
    spawnItems(25);

    speedScaleRef.current = 0.1;
    const startTime = Date.now();
    const rampUp = setInterval(() => {
        const elapsed = Date.now() - startTime;
        if (elapsed >= 3000) {
            speedScaleRef.current = 1.0;
            clearInterval(rampUp);
        } else {
            speedScaleRef.current = 0.1 + (elapsed / 3000) * 0.9;
        }
    }, 50);

    return () => clearInterval(rampUp);
  };

  const spawnItems = (count: number) => {
      const pool = chemicalPoolRef.current;
      if (pool.length === 0) return;

      for (let i = 0; i < count; i++) {
          const chem = pool[Math.floor(Math.random() * pool.length)];
          let x, y, safe;
          let attempts = 0;
          do {
             x = Math.random() * (MAP_WIDTH - 100) + 50;
             y = Math.random() * (MAP_HEIGHT - 100) + 50;
             safe = true;
             if (bossRef.current) {
                 if (Math.hypot(x - bossRef.current.x, y - bossRef.current.y) < 200) safe = false;
             }
             attempts++;
          } while(!safe && attempts < 10);

          itemsRef.current.push({
              ...chem,
              uniqueId: Math.random().toString(36),
              isCollected: false,
              position: { x, y },
              radius: ITEM_RADIUS,
              pulseOffset: Math.random() * Math.PI * 2,
              spawnTime: Date.now()
          });
      }
  };

  const spawnBoss = () => {
      if (bossRef.current || bossesSpawnedInLevelRef.current >= MAX_BOSSES_PER_LEVEL) return;
      
      const px = playerRef.current.head.x;
      const py = playerRef.current.head.y;
      const bx = px > MAP_WIDTH/2 ? 200 : MAP_WIDTH - 200;
      const by = py > MAP_HEIGHT/2 ? 200 : MAP_HEIGHT - 200;

      const lvl = levelRef.current;
      bossesSpawnedInLevelRef.current++;

      const template = [...BOSS_TEMPLATES].reverse().find(t => lvl >= t.minLevel) || BOSS_TEMPLATES[0];

      bossRef.current = {
          x: bx,
          y: by,
          hp: BOSS_HP_PER_LEVEL * lvl,
          maxHp: BOSS_HP_PER_LEVEL * lvl,
          radius: 90,
          state: BossState.IDLE,
          color: template.color,
          name: template.name, // Template Name already includes title
          animalIcon: template.icon,
          angle: 0,
          attackCooldown: 120,
          trappedTimer: 0
      };
      setBossHp({ current: bossRef.current.hp, max: bossRef.current.maxHp });
      
      addFloatingText(bx, by, "BOSS WARNING!", "#ff0000", 30);
      audioService.playGameOver(); 
  };

  // --- GAME LOOP ---
  useEffect(() => {
      if (status === GameStatus.PLAYING) {
          lastTimeRef.current = performance.now();
          animationFrameRef.current = requestAnimationFrame(gameLoop);
      } else {
          audioService.stopEngineSound();
      }
      return () => cancelAnimationFrame(animationFrameRef.current);
  }, [status, isPaused]); 

  const gameLoop = (time: number) => {
      if (status !== GameStatus.PLAYING) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      if (canvas.width !== window.innerWidth) canvas.width = window.innerWidth;
      if (canvas.height !== window.innerHeight) canvas.height = window.innerHeight;

      if (!isPaused) {
        updatePhysics();
      } else {
        // Stop engine sound when paused
        audioService.stopEngineSound();
      }
      
      render(ctx, time);
      animationFrameRef.current = requestAnimationFrame(gameLoop);
  };

  const updatePhysics = () => {
      const player = playerRef.current;
      
      let actualSpeed = player.currentSpeed * speedScaleRef.current;
      
      if (player.currentSpeed > player.baseSpeed + 1) {
          audioService.setEngineSound('BOOST');
      } else if (player.currentSpeed < player.baseSpeed - 1) {
          audioService.setEngineSound('BRAKE');
      } else {
          audioService.setEngineSound('IDLE');
      }
      
      if (Date.now() < player.speedBuffUntil) {
          actualSpeed *= 1.5;
          if (Math.random() > 0.5) {
              particlesRef.current.push({
                  x: player.head.x + (Math.random()-0.5)*20,
                  y: player.head.y + (Math.random()-0.5)*20,
                  vx: -player.direction.x * 2,
                  vy: -player.direction.y * 2,
                  life: 0.5,
                  color: '#00ffff',
                  size: 3,
                  type: 'sparkle'
              });
          }
      }

      if (shootCooldownRef.current > 0) shootCooldownRef.current--;

      // Check low health for heartbeat sound
      if (player.health < 30 && player.health > 0) {
          const now = Date.now();
          if (now - lastHeartbeatTimeRef.current > 1000) {
              audioService.playHeartbeat();
              lastHeartbeatTimeRef.current = now;
          }
      }

      const currentAngle = Math.atan2(player.direction.y, player.direction.x);
      let diff = player.targetAngle - currentAngle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      
      const turnStep = TURN_SMOOTHING;
      let newAngle = currentAngle;
      if (Math.abs(diff) > turnStep) {
          newAngle += Math.sign(diff) * turnStep;
      } else {
          newAngle = player.targetAngle;
      }
      player.direction = { x: Math.cos(newAngle), y: Math.sin(newAngle) };

      const newHead = {
          x: player.head.x + player.direction.x * actualSpeed,
          y: player.head.y + player.direction.y * actualSpeed
      };

      if (newHead.x < 0) newHead.x = 0;
      if (newHead.x > MAP_WIDTH) newHead.x = MAP_WIDTH;
      if (newHead.y < 0) newHead.y = 0;
      if (newHead.y > MAP_HEIGHT) newHead.y = MAP_HEIGHT;

      player.history.unshift({ ...player.head });
      const requiredHistory = Math.ceil(player.length * SEGMENT_SPACING);
      if (player.history.length > requiredHistory) {
          player.history.length = requiredHistory;
      }
      player.head = newHead;

      // Dynamic collection radius based on snake size (evolution tier)
      // Visual radius is approx 15 + tier * 2. 
      const currentHeadRadius = 15 + player.evolutionTier * 2;

      itemsRef.current = itemsRef.current.filter(item => {
          // Use dynamic radius for collision detection
          const dist = Math.hypot(newHead.x - item.position.x, newHead.y - item.position.y);
          if (dist < currentHeadRadius + item.radius) {
              handleCollect(item);
              return false;
          }
          return true;
      });

      if (itemsRef.current.length < 15) {
          spawnItems(5);
      }

      updateProjectiles();

      if (bossRef.current) {
          updateBoss();
          checkEncircle(bossRef.current, player);
      } else if (
        scoreRef.current > levelRef.current * 800 && 
        levelRef.current % 1 === 0 && 
        !bossRef.current && 
        bossesSpawnedInLevelRef.current < MAX_BOSSES_PER_LEVEL
      ) {
          spawnBoss();
      }

      particlesRef.current.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.02;
      });
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);

      if (scoreRef.current >= nextLevelScoreRef.current) {
          handleLevelUp();
      }

      const nextRank = PLAYER_RANKS.find(r => scoreRef.current >= r.minScore && r.minScore > currentRankRef.current.minScore);
      if (nextRank && nextRank.id !== currentRankRef.current.id) {
          currentRankRef.current = nextRank;
          setCurrentRank(nextRank);
          
          if (nextRank.title === '化学院士') {
              setShowMaxRankCert(true);
              audioService.playLevelComplete();
              for(let i=0; i<100; i++) {
                 spawnParticles(player.head.x + (Math.random()-0.5)*400, player.head.y + (Math.random()-0.5)*400, nextRank.badgeColor, 2, 'sparkle');
              }
          } else {
              setShowRankUp(true);
              audioService.playAchievement();
              spawnParticles(player.head.x, player.head.y, nextRank.badgeColor, 50, 'sparkle');
              setTimeout(() => setShowRankUp(false), 3500);
          }
      }

      checkEvolution();
  };

  const checkEvolution = () => {
      const p = playerRef.current;
      if (p.length >= SNAKE_EVOLUTION_THRESHOLD) {
          p.evolutionTier++;
          p.length = SNAKE_RESET_LENGTH;
          
          const newHistoryLen = p.length * SEGMENT_SPACING;
          if (p.history.length > newHistoryLen) {
              p.history = p.history.slice(0, newHistoryLen);
          }

          p.baseSpeed += EVOLUTION_SPEED_BONUS;
          p.currentSpeed = p.baseSpeed;

          addFloatingText(p.head.x, p.head.y, "SNAKE EVOLVED!", "#00ffff", 32);
          audioService.playRankUp();
      }
  };

  const checkEncircle = (boss: Boss, player: Player) => {
      const points = player.history.filter((_, i) => i % 5 === 0); 
      points.push(player.head); 

      let inside = false;
      for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
          const xi = points[i].x, yi = points[i].y;
          const xj = points[j].x, yj = points[j].y;
          
          const intersect = ((yi > boss.y) !== (yj > boss.y))
              && (boss.x < (xj - xi) * (boss.y - yi) / (yj - yi) + xi);
          if (intersect) inside = !inside;
      }
      
      if (inside && player.length > 20) {
          boss.trappedTimer = 10; 
          boss.state = BossState.TRAPPED;
          damageBoss(BOSS_ENCIRCLE_DPS); 
          if (Math.random() > 0.7) {
            spawnParticles(boss.x + (Math.random()-0.5)*50, boss.y + (Math.random()-0.5)*50, '#00ffff', 1, 'sparkle');
          }
          if (Math.random() > 0.5) {
              audioService.playElectricShock();
          }
      } else {
          boss.trappedTimer = Math.max(0, boss.trappedTimer - 1);
          if (boss.state === BossState.TRAPPED) boss.state = BossState.IDLE;
      }
  };

  const checkAchievement = (id: string) => {
      if (unlockedAchievements.includes(id)) return;
      const achievement = ACHIEVEMENTS.find(a => a.id === id);
      if (achievement) {
          onUnlockAchievement(achievement);
      }
  };

  const handleCollect = (item: GameItem) => {
      const player = playerRef.current;
      
      if (item.icon === IconType.AMMO_PACK) {
          player.ammo += 15;
          setUiAmmo(player.ammo);
          addFloatingText(item.position.x, item.position.y, "+15 AMMO", "#fbbf24", 24);
          audioService.playCollect();
          spawnParticles(item.position.x, item.position.y, item.color, 12, 'sparkle');
          return;
      }

      // Achievement Check: Alkali Collection
      if (item.icon === IconType.ALKALI_METAL) {
          sessionStatsRef.current.collectedAlkali.add(item.formula);
          const collected = sessionStatsRef.current.collectedAlkali;
          if (collected.has('Li') && collected.has('Na') && collected.has('K')) {
              checkAchievement('alkali_collection');
          }
      }

      player.length += GROWTH_PER_ITEM;
      scoreRef.current += item.points;
      setUiScore(scoreRef.current);
      
      const currentCount = inventoryRef.current.get(item.formula) || 0;
      inventoryRef.current.set(item.formula, currentCount + 1);
      
      const invObj: Record<string, number> = {};
      inventoryRef.current.forEach((v, k) => invObj[k] = v);
      setUiInventory(invObj);

      // Update recent items list (max 9, most recent first)
      setRecentItems(prev => {
          const filtered = prev.filter(f => f !== item.formula);
          return [item.formula, ...filtered].slice(0, 9);
      });

      spawnParticles(item.position.x, item.position.y, item.color, 8, theme.particleStyle);
      
      // Better Sound Logic
      if (item.points >= 50) {
          audioService.playRareCollect();
      } else {
          audioService.playCollect();
      }

      if (settings.showUI) {
        addFloatingText(item.position.x, item.position.y, `+${item.formula}`, item.color, 20);
      }

      // --- TRIVIA DISPLAY LOGIC ---
      if (settings.showTrivia && item.trivia && Math.random() > 0.6) { 
          setTriviaOverlay({
              text: item.trivia,
              formula: item.formula,
              name: item.name,
              color: item.color,
              expiresAt: Date.now() + 5000 
          });
      }

      checkReactions();
  };

  // Implement cascade/chain reactions logic
  const checkReactions = () => {
      let reactionOccurred = true;
      let iterations = 0;
      const MAX_ITERATIONS = 5; // Prevent infinite loops
      
      // Helper to update state at end of chain
      let inventoryUpdated = false;

      while (reactionOccurred && iterations < MAX_ITERATIONS) {
          reactionOccurred = false;
          iterations++;

          for (const recipe of REACTION_RECIPES) {
              let canMake = true;
              for (const input of recipe.inputs) {
                  if ((inventoryRef.current.get(input.formula) || 0) < input.count) {
                      canMake = false;
                      break;
                  }
              }

              if (canMake) {
                  recipe.inputs.forEach(input => {
                      const current = inventoryRef.current.get(input.formula) || 0;
                      const nextVal = current - input.count;
                      inventoryRef.current.set(input.formula, nextVal);
                  });

                  // Add product to inventory
                  inventoryRef.current.set(recipe.product, (inventoryRef.current.get(recipe.product) || 0) + 1);
                  
                  // Update recent items to show created compound
                  setRecentItems(prev => {
                      // Filter out product if it was there, add to top
                      const filtered = prev.filter(f => f !== recipe.product);
                      return [recipe.product, ...filtered].slice(0, 9);
                  });

                  triggerReactionEffect(recipe);
                  
                  reactionOccurred = true; 
                  inventoryUpdated = true;
              }
          }
      }

      // Final UI sync after chain reaction completes
      if (inventoryUpdated) {
          const invObj: Record<string, number> = {};
          inventoryRef.current.forEach((v, k) => {
              if (v > 0) invObj[k] = v; // Only keep positive counts for UI state if we want strictness, or keep all
          });
          setUiInventory(invObj);
      }
  };

  const triggerReactionEffect = (recipe: ReactionRecipe) => {
      const player = playerRef.current;
      scoreRef.current += recipe.power;
      setUiScore(scoreRef.current);
      
      player.ammo += recipe.ammoYield;
      setUiAmmo(player.ammo);

      // Track Reaction Count
      sessionStatsRef.current.reactionCount++;
      setUiReactionCount(sessionStatsRef.current.reactionCount);

      // Achievement Check: Aqua Regia
      if (recipe.productName === '王水') {
          checkAchievement('aqua_regia');
      }

      if (recipe.buff) {
          if (recipe.buff.type === 'SPEED') {
              player.speedBuffUntil = Date.now() + (recipe.buff.duration || 3000);
              addFloatingText(player.head.x, player.head.y - 80, `⚡ SPEED UP!`, '#00ffff', 28);
          } else if (recipe.buff.type === 'HEAL') {
              player.health = Math.min(100, player.health + recipe.buff.value);
              addFloatingText(player.head.x, player.head.y - 80, `💚 HEAL +${recipe.buff.value}`, '#4ade80', 28);
          } else if (recipe.buff.type === 'INVINCIBLE') {
              player.invulnerableUntil = Date.now() + (recipe.buff.duration || 3000);
              addFloatingText(player.head.x, player.head.y - 80, `🛡️ INVINCIBLE!`, '#fbbf24', 28);
          }
      }

      // Trigger overlay only for complex reactions to avoid spam
      if (settings.showReactions && recipe.power > 150) {
          setEquationOverlay({ 
              text: recipe.equation, 
              subText: recipe.reactionType, 
              phenomenon: recipe.phenomenon,
              expiresAt: Date.now() + 3000 
          });
      }

      if (settings.showUI) {
        addFloatingText(player.head.x, player.head.y - 60, `${recipe.productName} 合成!`, recipe.color, 24);
        if (recipe.ammoYield > 0) {
            addFloatingText(player.head.x, player.head.y - 30, `+${recipe.ammoYield} 弹药`, '#ffff00', 20);
        }
      }
      
      // Use advanced sound for powerful reactions
      if (recipe.power >= 500) {
          audioService.playAdvancedReaction();
      } else {
          audioService.playReaction();
      }
      
      spawnParticles(player.head.x, player.head.y, recipe.color, 40, 'sparkle');
  };

  const fireProjectile = () => {
      const player = playerRef.current;
      if (player.ammo <= 0) return;

      const useMissile = player.ammo >= MISSILE_AMMO_THRESHOLD;
      const ammoCost = useMissile ? MISSILE_AMMO_COST : 1;
      const cooldown = useMissile ? MISSILE_COOLDOWN : RAPID_FIRE_COOLDOWN;

      if (player.ammo < ammoCost && useMissile) return;

      player.ammo -= ammoCost;
      setUiAmmo(player.ammo);
      shootCooldownRef.current = cooldown; 

      let target = bossRef.current || undefined;
      
      const speed = useMissile ? MISSILE_SPEED : NORMAL_AMMO_SPEED;
      
      // Calculate normalized direction vector based on current snake head angle
      // This fixes the bug where projectile might fire in weird direction if player.direction wasn't normalized
      const angle = Math.atan2(player.direction.y, player.direction.x);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      const missile: Projectile = {
          id: Math.random(),
          x: player.head.x + Math.cos(angle) * 20, // Spawn slightly ahead
          y: player.head.y + Math.sin(angle) * 20,
          vx: vx,
          vy: vy,
          radius: useMissile ? 25 : 12,
          color: useMissile ? '#ef4444' : '#ffff00',
          damage: useMissile ? MISSILE_DAMAGE : NORMAL_AMMO_DAMAGE, 
          isPlayerAmmo: true,
          isMissile: useMissile,
          target: target
      };

      projectilesRef.current.push(missile);
      if (useMissile) {
          audioService.playMissileLaunch();
      } else {
          audioService.playCollect();
      }
  };

  const updateProjectiles = () => {
      projectilesRef.current.forEach(p => {
          if (p.isPlayerAmmo) {
              if (bossRef.current) {
                  p.target = bossRef.current;
              } else {
                  // If boss is dead, stop tracking to prevent curving towards ghost location
                  p.target = undefined;
              }
              
              if (p.target) {
                const dx = p.target.x - p.x;
                const dy = p.target.y - p.y;
                const dist = Math.hypot(dx, dy);
                
                // Prevent jittering if very close
                if (dist > 10) {
                    const speed = p.isMissile ? MISSILE_SPEED : NORMAL_AMMO_SPEED;
                    
                    let turnRate = p.isMissile 
                        ? MISSILE_BASE_TURN_RATE + (levelRef.current * MISSILE_LEVEL_TURN_BONUS) 
                        : NORMAL_AMMO_TURN_RATE;
                    
                    if (turnRate > 0.4) turnRate = 0.4;

                    const desiredVx = (dx / dist) * speed;
                    const desiredVy = (dy / dist) * speed;
                    
                    p.vx = p.vx * (1 - turnRate) + desiredVx * turnRate;
                    p.vy = p.vy * (1 - turnRate) + desiredVy * turnRate;
                    
                    // Re-normalize speed
                    const currentSpeed = Math.hypot(p.vx, p.vy);
                    if (currentSpeed > 0) {
                        p.vx = (p.vx / currentSpeed) * speed;
                        p.vy = (p.vy / currentSpeed) * speed;
                    }
                }
              }
          }
          
          p.x += p.vx;
          p.y += p.vy;

          if (p.isMissile && Math.random() > 0.5) {
              spawnParticles(p.x, p.y, '#fbbf24', 1, 'square');
          }

          if (p.isPlayerAmmo && bossRef.current) {
               const dist = Math.hypot(p.x - bossRef.current.x, p.y - bossRef.current.y);
               if (dist < bossRef.current.radius + p.radius) {
                   
                   if (p.isMissile) {
                       spawnParticles(p.x, p.y, '#ef4444', 30, 'square'); 
                       addFloatingText(p.x, p.y, "CRITICAL HIT!", "#ff0000", 40);
                       audioService.playExplosion();
                   } else {
                       spawnParticles(p.x, p.y, p.color, 10, 'sparkle');
                   }

                   damageBoss(p.damage);
                   p.damage = 0; 
               }
          } else if (!p.isPlayerAmmo) {
              const dist = Math.hypot(p.x - playerRef.current.head.x, p.y - playerRef.current.head.y);
              if (dist < PLAYER_RADIUS + p.radius) {
                   if (Date.now() > playerRef.current.invulnerableUntil) {
                       onGameOver(scoreRef.current);
                       playerRef.current.invulnerableUntil = Date.now() + 1000; // Immediate temporary invulnerability to prevent multi-trigger
                   }
                   p.damage = 0; 
              }
          }
      });
      
      projectilesRef.current = projectilesRef.current.filter(p => 
          p.damage > 0 && 
          p.x > -100 && p.x < MAP_WIDTH + 100 && p.y > -100 && p.y < MAP_HEIGHT + 100
      );
  };

  const updateBoss = () => {
      const boss = bossRef.current;
      if (!boss) return;

      const player = playerRef.current;
      const dx = player.head.x - boss.x;
      const dy = player.head.y - boss.y;
      const dist = Math.hypot(dx, dy);

      if (boss.state !== BossState.TRAPPED) {
        if (dist > 250) {
            boss.x += (dx / dist) * 2;
            boss.y += (dy / dist) * 2;
        }
      } else {
          boss.x += (Math.random() - 0.5) * 4;
          boss.y += (Math.random() - 0.5) * 4;
      }

      if (boss.attackCooldown > 0) boss.attackCooldown--;
      else {
          // audioService.playBossAttack(); // REMOVED AS REQUESTED TO FIX AUDIO NUISANCE
          boss.attackCooldown = Math.max(30, 100 - levelRef.current * 5);
          const angle = Math.atan2(dy, dx);
          const shots = levelRef.current > 3 ? 3 : 1;
          for(let i=0; i<shots; i++) {
              const offset = (i - (shots-1)/2) * 0.2;
              projectilesRef.current.push({
                  id: Math.random(),
                  x: boss.x,
                  y: boss.y,
                  vx: Math.cos(angle + offset) * 7,
                  vy: Math.sin(angle + offset) * 7,
                  radius: 8,
                  color: '#fff',
                  damage: 1,
                  isPlayerAmmo: false
              });
          }
      }
  };

  const damageBoss = (dmg: number) => {
      if (!bossRef.current) return;
      bossRef.current.hp -= dmg;
      if (bossRef.current.state !== BossState.TRAPPED) bossRef.current.state = BossState.HURT;
      setBossHp({ current: bossRef.current.hp, max: bossRef.current.maxHp });
      
      if (Math.random() > 0.8 || dmg > 1000) {
        addFloatingText(bossRef.current.x + (Math.random()-0.5)*40, bossRef.current.y - 50, `-${Math.floor(dmg)}`, dmg > 1000 ? '#ff0000' : '#fff', dmg > 1000 ? 30 : 20);
      }

      if (bossRef.current.hp <= 0) {
          onBossDefeated(); 
          spawnAmmoPack(bossRef.current.x, bossRef.current.y);
          scoreRef.current += 5000;
          spawnParticles(bossRef.current.x, bossRef.current.y, '#ffd700', 80, 'sparkle');
          bossRef.current = null;

          // Achievement Check: Kills
          sessionStatsRef.current.bossKills++;
          if (sessionStatsRef.current.bossKills === 1) {
              checkAchievement('first_blood');
          } else if (sessionStatsRef.current.bossKills === 10) {
              checkAchievement('boss_hunter');
          }
      }
  };

  const spawnAmmoPack = (x: number, y: number) => {
      itemsRef.current.push({
          ...AMMO_PACK_TEMPLATE,
          uniqueId: `ammo-${Date.now()}`,
          isCollected: false,
          position: { x, y },
          radius: 25,
          pulseOffset: 0,
          spawnTime: Date.now()
      });
  };

  const handleLevelUp = async (isBossDefeat = false) => {
      levelRef.current++;
      
      // Achievement Check: Level
      if (levelRef.current === 8) { // Updated to Level 8
          checkAchievement('high_level');
      }

      bossesSpawnedInLevelRef.current = 0; 
      nextLevelScoreRef.current += (LEVEL_SCORE_THRESHOLD_BASE + levelRef.current * 800);
      setUiLevel(levelRef.current);
      
      setLevelUpMessage(`LEVEL ${levelRef.current}`);
      setTimeout(() => setLevelUpMessage(null), 2500);
      audioService.playRankUp();

      generateGameData(levelRef.current).then(newData => {
          chemicalPoolRef.current = newData;
      });
  };

  const spawnParticles = (x: number, y: number, color: string, count: number, type: any = 'circle') => {
      for(let i=0; i<count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 5 + 2;
          particlesRef.current.push({
              x, y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 1.0,
              color,
              size: Math.random() * 6 + 2,
              type
          });
      }
  };

  const addFloatingText = (x: number, y: number, text: string, color: string, size = 16) => {
      setFloatingTexts(prev => [...prev, {
          id: Math.random(),
          x, y, text, life: 1.0, color, size
      }]);
  };

  // --- RENDERING HELPERS ---
  const drawIcon = (ctx: CanvasRenderingContext2D, item: GameItem) => {
      const { x, y } = item.position;
      const r = item.radius;
      
      ctx.save();
      ctx.translate(x, y);
      
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 2;
      const glassStroke = '#ffffffaa';
      
      let renderType = item.icon;
      if (item.icon === IconType.ALKALI_METAL || item.icon === IconType.ALKALINE_EARTH || item.icon === IconType.TRANSITION_METAL || item.icon === IconType.RARE_EARTH) {
          renderType = IconType.BEAKER;
      } else if (item.icon === IconType.NOBLE_GAS || item.icon === IconType.HALOGEN || item.icon === IconType.NON_METAL || item.icon === IconType.CYLINDER) {
          renderType = IconType.CYLINDER;
      } else if (item.icon === IconType.COMPOUND || item.icon === IconType.FLASK) {
          renderType = IconType.FLASK;
      } else if (item.icon === IconType.RADIOACTIVE || item.icon === IconType.TEST_TUBE) {
          renderType = IconType.TEST_TUBE;
      }

      switch(renderType) {
          case IconType.AMMO_PACK:
              ctx.fillStyle = '#1e293b';
              ctx.fillRect(-r, -r*0.7, r*2, r*1.4);
              ctx.strokeStyle = '#fbbf24';
              ctx.lineWidth = 2;
              ctx.strokeRect(-r, -r*0.7, r*2, r*1.4);
              ctx.fillStyle = '#fbbf24';
              ctx.beginPath();
              ctx.arc(0, 0, r*0.4, 0, Math.PI*2);
              ctx.fill();
              break;

          case IconType.BEAKER:
              ctx.fillStyle = item.color;
              ctx.beginPath();
              ctx.moveTo(-r*0.5, r*0.6); 
              ctx.lineTo(r*0.5, r*0.6);
              ctx.lineTo(r*0.55, 0); 
              ctx.lineTo(-r*0.55, 0);
              ctx.fill();
              ctx.strokeStyle = glassStroke;
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(-r*0.6, -r*0.6); 
              ctx.lineTo(-r*0.5, r*0.6); 
              ctx.quadraticCurveTo(-r*0.5, r*0.8, 0, r*0.8); 
              ctx.quadraticCurveTo(r*0.5, r*0.8, r*0.5, r*0.6); 
              ctx.lineTo(r*0.6, -r*0.6); 
              ctx.stroke();
              ctx.beginPath();
              ctx.ellipse(0, -r*0.6, r*0.6, r*0.1, 0, 0, Math.PI*2);
              ctx.stroke();
              ctx.beginPath();
              ctx.moveTo(-r*0.3, 0); ctx.lineTo(-r*0.1, 0);
              ctx.moveTo(-r*0.3, r*0.3); ctx.lineTo(-r*0.1, r*0.3);
              ctx.strokeStyle = '#ffffff88';
              ctx.stroke();
              break;

          case IconType.FLASK: 
              ctx.fillStyle = item.color;
              ctx.beginPath();
              ctx.moveTo(-r*0.5, r*0.7);
              ctx.lineTo(r*0.5, r*0.7);
              ctx.lineTo(r*0.2, -r*0.1);
              ctx.lineTo(-r*0.2, -r*0.1);
              ctx.fill();
              ctx.strokeStyle = glassStroke;
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(-r*0.25, -r*0.8); 
              ctx.lineTo(-r*0.25, -r*0.2); 
              ctx.lineTo(-r*0.6, r*0.7); 
              ctx.quadraticCurveTo(-r*0.6, r*0.9, 0, r*0.9); 
              ctx.quadraticCurveTo(r*0.6, r*0.9, r*0.6, r*0.7); 
              ctx.lineTo(r*0.25, -r*0.2);
              ctx.lineTo(r*0.25, -r*0.8); 
              ctx.stroke();
              ctx.beginPath();
              ctx.ellipse(0, -r*0.8, r*0.25, r*0.08, 0, 0, Math.PI*2);
              ctx.stroke();
              break;

          case IconType.TEST_TUBE:
              ctx.rotate(-Math.PI / 4); 
              ctx.fillStyle = item.color;
              ctx.beginPath();
              ctx.arc(0, r*0.4, r*0.25, 0, Math.PI, false); 
              ctx.lineTo(r*0.25, 0);
              ctx.lineTo(-r*0.25, 0);
              ctx.fill();
              ctx.strokeStyle = glassStroke;
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(-r*0.25, -r*0.8);
              ctx.lineTo(-r*0.25, r*0.4);
              ctx.arc(0, r*0.4, r*0.25, 0, Math.PI, false);
              ctx.lineTo(r*0.25, -r*0.8);
              ctx.stroke();
              break;

          case IconType.CYLINDER:
          default:
               ctx.fillStyle = item.color;
               ctx.fillRect(-r*0.4, -r*0.6, r*0.8, r*1.2);
               ctx.strokeStyle = glassStroke;
               ctx.lineWidth = 2;
               ctx.strokeRect(-r*0.4, -r*0.6, r*0.8, r*1.2);
               ctx.beginPath();
               ctx.moveTo(-r*0.4, -r*0.2); ctx.lineTo(-r*0.2, -r*0.2);
               ctx.moveTo(-r*0.4, 0); ctx.lineTo(-r*0.2, 0);
               ctx.moveTo(-r*0.4, r*0.2); ctx.lineTo(-r*0.2, r*0.2);
               ctx.stroke();
               break;
      }
      
      // Text Label (Formula)
      ctx.restore();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (settings.showChemicalNames) {
          ctx.fillText(item.formula, x, y + r + 12);
      }
  };

  const render = (ctx: CanvasRenderingContext2D, time: number) => {
      const player = playerRef.current;
      const cameraX = Math.max(0, Math.min(MAP_WIDTH, player.head.x)) - ctx.canvas.width / 2;
      const cameraY = Math.max(0, Math.min(MAP_HEIGHT, player.head.y)) - ctx.canvas.height / 2;
      
      // Draw BG
      const grad = ctx.createLinearGradient(0,0,0,ctx.canvas.height);
      const bgColors = theme.backgroundGradient.split(' '); 
      if (bgColors.length >= 2) {
          // Tailwind class parsing sim
          ctx.fillStyle = '#0f172a'; // Default slate-900
      } else {
          ctx.fillStyle = '#0f172a';
      }
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      ctx.save();
      ctx.translate(-cameraX, -cameraY);

      // Grid
      ctx.strokeStyle = theme.gridColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for(let x=0; x<=MAP_WIDTH; x+=100) { ctx.moveTo(x,0); ctx.lineTo(x, MAP_HEIGHT); }
      for(let y=0; y<=MAP_HEIGHT; y+=100) { ctx.moveTo(0,y); ctx.lineTo(MAP_WIDTH, y); }
      ctx.stroke();

      // Snake Body
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Halo if buffs active
      if (Date.now() < player.invulnerableUntil) {
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#fbbf24';
      } else if (Date.now() < player.speedBuffUntil) {
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#00ffff';
      }

      // Draw segments
      if (player.history.length > 0) {
          ctx.beginPath();
          ctx.moveTo(player.head.x, player.head.y);
          // Simplified rendering: draw spine
          for(const p of player.history) {
              ctx.lineTo(p.x, p.y);
          }
          ctx.strokeStyle = theme.primaryColor;
          ctx.lineWidth = 20 + (player.evolutionTier * 4);
          ctx.stroke();
          
          // Decoration pattern on snake
          ctx.strokeStyle = '#ffffff55';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 15]);
          ctx.stroke();
          ctx.setLineDash([]);
      }
      
      // Head
      ctx.save();
      ctx.translate(player.head.x, player.head.y);
      const currentAngle = Math.atan2(player.direction.y, player.direction.x);
      ctx.rotate(currentAngle);
      
      ctx.fillStyle = theme.primaryColor;
      ctx.beginPath();
      const visualHeadRadius = 15 + player.evolutionTier*2;
      ctx.arc(0, 0, visualHeadRadius, 0, Math.PI*2);
      ctx.fill();
      
      // --- DYNAMIC EYES ---
      const now = Date.now();
      // Random blink every few seconds
      const isBlinking = (now % 3000 < 150); 
      // Look direction offset based on turn (targetAngle - currentAngle)
      let lookOffset = player.targetAngle - currentAngle;
      while (lookOffset > Math.PI) lookOffset -= Math.PI * 2;
      while (lookOffset < -Math.PI) lookOffset += Math.PI * 2;
      const eyeShiftY = Math.max(-4, Math.min(4, lookOffset * 10));

      if (isBlinking) {
          // Draw closed eyes (lines)
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(6, -6); ctx.lineTo(10, -6);
          ctx.moveTo(6, 6); ctx.lineTo(10, 6);
          ctx.stroke();
      } else {
          // Draw open eyes
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(8, -6, 5, 0, Math.PI*2); // Left Eye White
          ctx.arc(8, 6, 5, 0, Math.PI*2); // Right Eye White
          ctx.fill();
          
          // Pupils moving with turn
          ctx.fillStyle = '#000';
          ctx.beginPath();
          ctx.arc(9, -6 + eyeShiftY * 0.5, 2, 0, Math.PI*2); // Left Pupil
          ctx.arc(9, 6 + eyeShiftY * 0.5, 2, 0, Math.PI*2); // Right Pupil
          ctx.fill();
          
          // Shine
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(10, -7 + eyeShiftY * 0.5, 1, 0, Math.PI*2);
          ctx.arc(10, 5 + eyeShiftY * 0.5, 1, 0, Math.PI*2);
          ctx.fill();
      }
      
      ctx.restore();

      ctx.shadowBlur = 0;

      // Items
      itemsRef.current.forEach(item => drawIcon(ctx, item));

      // --- BOSS RENDERING (NEW) ---
      if (bossRef.current) {
          const boss = bossRef.current;
          ctx.save();
          ctx.translate(boss.x, boss.y);
          
          const t = time * 0.002;
          const isHurt = boss.state === BossState.HURT;
          
          // 0. Hurt Glitch Effect (Shake)
          if (isHurt) {
             const shake = 5;
             ctx.translate((Math.random()-0.5)*shake, (Math.random()-0.5)*shake);
          }

          // 1. Rotating Shield Arcs
          const shieldRadius = boss.radius + 15;
          ctx.lineWidth = 4;
          // Outer Ring
          ctx.beginPath();
          ctx.strokeStyle = isHurt ? '#fff' : boss.color;
          ctx.globalAlpha = 0.6;
          ctx.arc(0, 0, shieldRadius, t, t + Math.PI * 1.5);
          ctx.stroke();
          // Inner Ring (Counter-rotate)
          ctx.beginPath();
          ctx.strokeStyle = boss.color;
          ctx.globalAlpha = 0.4;
          ctx.arc(0, 0, shieldRadius - 10, -t * 1.5, -t * 1.5 + Math.PI);
          ctx.stroke();
          ctx.globalAlpha = 1.0;

          // 2. Core Body
          ctx.fillStyle = '#0f172a'; // Dark core
          ctx.beginPath();
          ctx.arc(0, 0, boss.radius, 0, Math.PI * 2);
          ctx.fill();
          
          // Core Gradient Aura
          const gradient = ctx.createRadialGradient(0, 0, 10, 0, 0, boss.radius);
          gradient.addColorStop(0, '#fff');
          gradient.addColorStop(0.3, boss.color);
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.globalAlpha = 0.3 + Math.sin(t * 5) * 0.1; // Pulsing
          ctx.beginPath();
          ctx.arc(0, 0, boss.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;

          // 3. Orbiting Satellites (Electrons)
          const satelliteCount = 3;
          for(let i=0; i<satelliteCount; i++) {
              const angle = t * 2 + (i * (Math.PI * 2 / satelliteCount));
              const satX = Math.cos(angle) * (boss.radius + 5);
              const satY = Math.sin(angle) * (boss.radius + 5);
              ctx.fillStyle = '#fff';
              ctx.beginPath();
              ctx.arc(satX, satY, 4, 0, Math.PI * 2);
              ctx.fill();
              ctx.shadowColor = boss.color;
              ctx.shadowBlur = 10;
              ctx.stroke();
              ctx.shadowBlur = 0;
          }

          // 4. Face/Icon
          ctx.font = '80px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#fff';
          if (isHurt && Math.random() > 0.5) {
               ctx.globalAlpha = 0.5;
               ctx.fillText('⚡', 0, 0); // Glitch icon
          } else {
               ctx.fillText(boss.animalIcon, 0, 5);
          }
          ctx.globalAlpha = 1.0;

          // 5. Tech Health Ring (Segments)
          const segments = 20;
          const hpPct = boss.hp / boss.maxHp;
          const activeSegments = Math.ceil(segments * hpPct);
          const ringRadius = boss.radius + 25;
          
          ctx.lineWidth = 6;
          for(let i=0; i<segments; i++) {
              const startAngle = (i / segments) * Math.PI * 2 - Math.PI/2;
              const endAngle = ((i + 0.8) / segments) * Math.PI * 2 - Math.PI/2;
              
              ctx.beginPath();
              ctx.arc(0, 0, ringRadius, startAngle, endAngle);
              // Color based on HP level (Green -> Yellow -> Red)
              if (i < activeSegments) {
                  if (hpPct > 0.6) ctx.strokeStyle = '#22c55e'; // Green
                  else if (hpPct > 0.3) ctx.strokeStyle = '#eab308'; // Yellow
                  else ctx.strokeStyle = '#ef4444'; // Red
                  
                  ctx.shadowColor = ctx.strokeStyle;
                  ctx.shadowBlur = 5;
              } else {
                  ctx.strokeStyle = '#334155'; // Inactive grey
                  ctx.shadowBlur = 0;
              }
              ctx.stroke();
          }
          ctx.shadowBlur = 0;

          // Name Label
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 16px monospace';
          ctx.shadowColor = 'black';
          ctx.shadowBlur = 4;
          ctx.fillText(boss.name.toUpperCase(), 0, -boss.radius - 40);
          ctx.shadowBlur = 0;

          // Trapped Effect
          if (boss.state === BossState.TRAPPED) {
              ctx.strokeStyle = '#00ffff';
              ctx.lineWidth = 2;
              ctx.beginPath();
              for(let i=0; i<8; i++) {
                 const angle = (i/8) * Math.PI * 2 + t;
                 ctx.moveTo(Math.cos(angle)*boss.radius, Math.sin(angle)*boss.radius);
                 ctx.lineTo(Math.cos(angle)*(boss.radius+40), Math.sin(angle)*(boss.radius+40));
              }
              ctx.stroke();
          }

          ctx.restore();
      }

      // Projectiles
      projectilesRef.current.forEach(p => {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(Math.atan2(p.vy, p.vx));
          
          ctx.fillStyle = p.color;
          if (p.isMissile) {
               // Draw Rocket
               ctx.fillRect(-10, -5, 20, 10);
               ctx.fillStyle = '#fbbf24'; // Flame
               ctx.beginPath();
               ctx.moveTo(-10, -3); ctx.lineTo(-18, 0); ctx.lineTo(-10, 3);
               ctx.fill();
          } else if (p.isPlayerAmmo) {
              ctx.beginPath();
              ctx.arc(0, 0, p.radius, 0, Math.PI*2);
              ctx.fill();
          } else {
               // Boss bullets
               ctx.beginPath();
               ctx.arc(0, 0, p.radius, 0, Math.PI*2);
               ctx.fill();
          }
          ctx.restore();
      });

      // Particles
      particlesRef.current.forEach(p => {
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          if (p.type === 'square') ctx.fillRect(p.x, p.y, p.size, p.size);
          else ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
          ctx.fill();
          ctx.globalAlpha = 1;
      });

      // Floating Texts
      floatingTexts.forEach(ft => {
          ctx.fillStyle = ft.color;
          ctx.font = `bold ${ft.size || 16}px Arial`;
          ctx.fillText(ft.text, ft.x - cameraX, ft.y - cameraY);
          ft.y -= 1;
          ft.life -= 0.02;
      });
      setFloatingTexts(prev => prev.filter(ft => ft.life > 0));

      ctx.restore();
  };

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <canvas ref={canvasRef} className="block w-full h-full" />
      
      {/* HUD Layer */}
      <div className={`absolute inset-0 pointer-events-none flex flex-col justify-between transition-opacity duration-300 ${settings.showUI ? 'opacity-100' : 'opacity-0'}`}>
          
          {/* Top Section Container (Split Layout) */}
          <div className="relative w-full p-3 flex justify-between items-start z-10">
              
              {/* Left Column: Stats & Pause */}
              <div className="flex flex-col gap-2 items-start w-1/3">
                  <div className="flex gap-2 items-center pointer-events-auto">
                      {/* Pause Button */}
                      <button 
                        onClick={() => {
                            audioService.playButtonTap();
                            onPause();
                        }}
                        className="bg-slate-900/80 backdrop-blur w-10 h-10 rounded-xl border border-white/20 text-white flex items-center justify-center hover:bg-slate-800 active:scale-95 transition-all shadow-lg"
                      >
                          ⏸
                      </button>

                      {/* Mute Button - Moved Here */}
                      <button 
                        onClick={() => {
                            audioService.playButtonTap();
                            onToggleMute();
                        }}
                        className="bg-slate-900/80 backdrop-blur w-10 h-10 rounded-xl border border-white/20 text-white flex items-center justify-center hover:bg-slate-800 active:scale-95 transition-all shadow-lg"
                      >
                          {isMuted ? '🔇' : '🔊'}
                      </button>

                      {/* Score Badge */}
                      <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-xl border border-white/10 text-white font-mono shadow-lg hidden md:block">
                          <div className="text-[10px] text-slate-400 leading-none mb-1">SCORE</div>
                          <div className="text-xl font-bold text-cyan-400 leading-none">{Math.floor(uiScore).toLocaleString()}</div>
                      </div>
                  </div>
                  
                  {/* Mobile Score Compact */}
                  <div className="md:hidden bg-slate-900/80 backdrop-blur px-3 py-1 rounded-xl border border-white/10 text-white font-mono shadow-lg text-sm font-bold text-cyan-400">
                      {Math.floor(uiScore).toLocaleString()}
                  </div>

                  {/* Nickname Display - Moved to Left */}
                  <div className="bg-slate-900/50 backdrop-blur px-3 py-1 rounded-lg border border-white/5 text-slate-300 text-xs font-bold">
                     👤 {nickname}
                  </div>
              </div>

              {/* Right Column: Level, Revives, Reactions & Inventory */}
              <div className="flex flex-col gap-2 items-end w-1/3 pointer-events-auto relative">
                  
                  {/* HORIZONTAL DASHBOARD (Compact & Sleek) */}
                  <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md rounded-full p-1 border border-white/10 shadow-2xl">
                      
                      {/* Level Chip */}
                      <div className="flex items-center gap-1.5 pl-1 pr-3 py-0.5 bg-gradient-to-r from-yellow-500/20 to-transparent rounded-full border border-yellow-500/30">
                          <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-[8px] font-black text-black shadow-inner">LV</div>
                          <span className="text-xs font-black text-yellow-400 font-mono">{uiLevel}</span>
                      </div>

                      <div className="w-[1px] h-4 bg-white/10"></div>

                      {/* Lives Chip */}
                      <div className="flex items-center gap-1.5 pl-1 pr-3 py-0.5 bg-gradient-to-r from-red-500/20 to-transparent rounded-full border border-red-500/30">
                          <div className={`w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-[9px] shadow-inner ${revivesLeft <= 1 ? 'animate-ping' : ''}`}>❤️</div>
                          <span className="text-xs font-black text-white font-mono">{revivesLeft}</span>
                      </div>

                      <div className="w-[1px] h-4 bg-white/10"></div>

                      {/* Reactions Chip */}
                      <div className="flex items-center gap-1.5 pl-1 pr-3 py-0.5 bg-gradient-to-r from-purple-500/20 to-transparent rounded-full border border-purple-500/30">
                          <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-[9px] shadow-inner animate-[spin_10s_linear_infinite]">⚗️</div>
                          <span className="text-xs font-black text-white font-mono">{uiReactionCount}</span>
                      </div>
                  </div>
                  
                  {/* Inventory Panel - Tech Style (Compact) */}
                  <div className="bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-cyan-500/30 shadow-lg flex flex-col gap-1 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-6 h-6 bg-cyan-500/10 rounded-bl-full"></div>
                      
                      <div className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest border-b border-white/10 pb-1 mb-1 flex justify-between items-center px-1">
                          <span>物质分析</span>
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                      </div>
                      
                      {/* Grid Items - Filtered to remove 0 counts */}
                      <div className="grid grid-cols-3 gap-1 w-24">
                          {recentItems.filter(key => (inventoryRef.current.get(key) || 0) > 0).map((key) => (
                              <div key={key} className="bg-white/5 rounded aspect-square flex flex-col items-center justify-center relative border border-white/10 hover:border-cyan-500/50 transition-colors animate-in zoom-in duration-300">
                                  {/* Dynamic font size for long formula names */}
                                  <span className={`${key.length > 3 ? 'text-[7px]' : 'text-[9px]'} font-bold text-cyan-200 leading-none`}>{key}</span>
                                  <div className="absolute -bottom-1 -right-1 bg-slate-800 text-[7px] px-1 rounded text-white font-mono scale-90 border border-white/10">
                                      {inventoryRef.current.get(key) || 0}
                                  </div>
                              </div>
                          ))}
                          {/* Fill empty slots */}
                          {[...Array(Math.max(0, 9 - recentItems.filter(key => (inventoryRef.current.get(key) || 0) > 0).length))].map((_, i) => (
                              <div key={`empty-${i}`} className="bg-black/20 rounded aspect-square border border-dashed border-white/5"></div>
                          ))}
                      </div>
                  </div>

                   {/* SYNTHESIS RADAR (Dynamic Reaction Preview) */}
                   {reactionHints.length > 0 && (
                      <div className="mt-2 w-full max-w-[12rem] flex flex-col items-end gap-1 animate-in slide-in-from-right fade-in duration-300">
                          {reactionHints.map((hint, idx) => (
                              <div 
                                  key={idx} 
                                  className={`backdrop-blur-md border px-3 py-2 rounded-lg text-[10px] shadow-xl flex flex-col items-end gap-1 transition-all relative overflow-hidden
                                    ${hint.isReady 
                                      ? 'bg-gradient-to-r from-yellow-900/40 to-yellow-600/40 border-yellow-400/50 text-yellow-100 scale-105 origin-right animate-pulse' 
                                      : 'bg-slate-900/80 border-cyan-800/30 text-slate-400 opacity-90'
                                    }`}
                              >
                                  {hint.isReady && <div className="absolute inset-0 bg-yellow-400/5 animate-pulse"></div>}
                                  
                                  <div className="flex items-center gap-1 font-mono leading-none relative z-10">
                                      {hint.isReady ? (
                                          <span className="text-yellow-300 font-black tracking-widest uppercase text-[9px] flex items-center gap-1">
                                              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping"></span>
                                              反应就绪 READY
                                          </span>
                                      ) : (
                                          <span className="text-cyan-500/70 text-[8px] uppercase tracking-wider font-bold">Potential Reaction</span>
                                      )}
                                  </div>
                                  
                                  {/* Formula Preview */}
                                  <div className="flex items-center gap-1.5 text-right leading-tight relative z-10">
                                      <div className="flex items-center gap-0.5">
                                        {hint.haveIngredients.map((ing, i) => (
                                            <span key={`h-${i}`} className={`font-mono ${hint.isReady ? 'text-white font-bold' : 'text-cyan-300'}`}>{ing}</span>
                                        ))}
                                      </div>
                                      <span className="text-slate-500 font-light">+</span>
                                      <div className="flex items-center gap-0.5">
                                        {hint.missingIngredients.map((ing, i) => (
                                            <span key={`m-${i}`} className="text-red-400 opacity-60 font-mono italic">{ing}</span>
                                        ))}
                                      </div>
                                      <span className="text-slate-400">→</span>
                                      <span className={`font-bold font-mono ${hint.isReady ? 'text-yellow-300 text-xs' : 'text-slate-300'}`}>{hint.recipe.product}</span>
                                  </div>
                              </div>
                          ))}
                      </div>
                   )}

              </div>
          </div>

          {/* Equation Overlay (Center-Top, only for MAJOR reactions) */}
          {settings.showReactions && equationOverlay && Date.now() < equationOverlay.expiresAt && (
             <div className="absolute top-[22%] left-1/2 -translate-x-1/2 z-20 animate-in slide-in-from-top fade-in duration-300 pointer-events-none w-full max-w-sm px-4">
                  <div className="bg-black/60 backdrop-blur-md border border-cyan-500/30 px-5 py-3 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.2)] flex flex-col items-center gap-1 text-center transform hover:scale-105 transition-transform">
                      <div className="flex items-center gap-2 mb-1">
                          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                          <div className="text-[9px] font-bold text-cyan-300 uppercase tracking-widest">{equationOverlay.subText}</div>
                          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                      </div>
                      <div className="text-lg font-black text-white font-mono tracking-wide" dangerouslySetInnerHTML={{__html: equationOverlay.text}}></div>
                      <div className="text-[10px] text-slate-300 mt-0.5 italic opacity-80">{equationOverlay.phenomenon}</div>
                  </div>
             </div>
          )}

          {/* Trivia Popup (Left Side, Below HUD info) - Moved Up to top-36 to avoid joystick */}
          {settings.showTrivia && triviaOverlay && Date.now() < triviaOverlay.expiresAt && (
             <div className="absolute top-36 left-4 w-52 z-10 animate-in slide-in-from-left fade-in duration-500 pointer-events-none">
                 <div className="bg-slate-900/90 backdrop-blur-xl border-l-4 rounded-r-xl shadow-2xl p-3 relative overflow-hidden flex flex-col gap-2" style={{borderColor: triviaOverlay.color}}>
                     
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                             <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-slate-900 shadow-sm text-xs" style={{backgroundColor: triviaOverlay.color}}>
                                 {triviaOverlay.formula}
                             </div>
                             <h4 className="text-xs font-bold text-white leading-tight truncate max-w-[100px]">{triviaOverlay.name}</h4>
                        </div>
                        <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider">INFO</span>
                     </div>
                     
                     <p className="text-[10px] text-slate-300 leading-relaxed font-medium pl-1 border-l border-white/10">
                         {triviaOverlay.text}
                     </p>
                 </div>
             </div>
          )}

          {/* Center Screen Notifications (Level Up / Achievements - positioned higher to avoid overlap) */}
          {(levelUpMessage || showRankUp) && (
             <div className="absolute top-[12%] left-1/2 -translate-x-1/2 text-center pointer-events-none z-30 w-full flex flex-col items-center gap-2">
                 {levelUpMessage && (
                     <div className="animate-in zoom-in slide-in-from-top duration-500">
                         <div className="bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent px-8 py-1 border-y border-yellow-500/50 backdrop-blur-sm">
                             <h2 className="text-xl md:text-2xl font-black text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)] tracking-[0.3em] font-mono">{levelUpMessage}</h2>
                         </div>
                     </div>
                 )}
                 {showRankUp && (
                     <div className="animate-in zoom-in duration-500 mt-1">
                         <div className="bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 shadow-2xl flex flex-col items-center">
                             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">头衔晋升</div>
                             <div className="text-lg font-black tracking-widest" style={{color: currentRank.badgeColor}}>{currentRank.title}</div>
                         </div>
                     </div>
                 )}
             </div>
          )}

          {/* Max Rank Certificate Effect */}
          {showMaxRankCert && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 pointer-events-auto" onClick={() => setShowMaxRankCert(false)}>
                  <div className="bg-white text-slate-900 p-8 rounded-lg shadow-2xl max-w-md text-center transform scale-100 animate-in zoom-in duration-500 border-8 border-double border-yellow-500 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500"></div>
                      <div className="text-6xl mb-4">🎓</div>
                      <h2 className="text-3xl font-black mb-2 font-serif">荣誉证书</h2>
                      <p className="text-lg mb-6 text-slate-600">特此授予玩家 <span className="font-bold text-black">{nickname}</span></p>
                      <div className="text-2xl font-bold text-red-600 border-b-2 border-red-600 inline-block pb-1 mb-6">化学院士</div>
                      <p className="text-sm text-slate-500 italic">“你的智慧照亮了微观世界！”</p>
                      <button className="mt-8 px-6 py-2 bg-slate-900 text-white rounded hover:bg-slate-700">收藏荣誉</button>
                  </div>
              </div>
          )}

          {/* Controls (Bottom Layer) */}
          {settings.enableTouchControls && (
            <Controls 
                settings={settings}
                ammo={uiAmmo}
                onJoystickMove={(vec) => {
                    if (vec.x === 0 && vec.y === 0) return;
                    playerRef.current.targetAngle = Math.atan2(vec.y, vec.x);
                }} 
                onAction={(action) => {
                    const p = playerRef.current;
                    if (action === 'BOOST') p.currentSpeed = SNAKE_SPEED_MAX;
                    else if (action === 'BRAKE') p.currentSpeed = SNAKE_SPEED_MIN;
                    else if (action === 'SHOOT') {
                         if (!isPaused) {
                             handleShootingInput();
                         }
                    }
                    else {
                        p.currentSpeed = p.baseSpeed;
                        // isShootingRef removed, single click handled in handleShootingInput
                    }
                }}
            />
          )}
      </div>
    </div>
  );
};

export default GameEngine;