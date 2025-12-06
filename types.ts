
export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  vx: number;
  vy: number;
}

export enum GameStatus {
  IDLE = 'IDLE',
  SETUP = 'SETUP',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
}

export enum HazardType {
  NONE = 'NONE',
  EXPLOSIVE = 'EXPLOSIVE',
  HOT = 'HOT',
  CORROSIVE = 'CORROSIVE',
  WALL = 'WALL',
  RADIOACTIVE = 'RADIOACTIVE'
}

export enum IconType {
  BEAKER = 'BEAKER',           // 烧杯
  FLASK = 'FLASK',             // 锥形瓶
  TEST_TUBE = 'TEST_TUBE',     // 试管
  CYLINDER = 'CYLINDER',       // 量筒/集气瓶
  BURNER = 'BURNER',           // 酒精灯
  ALKALI_METAL = 'ALKALI_METAL',
  TRANSITION_METAL = 'TRANSITION_METAL',
  NON_METAL = 'NON_METAL',
  NOBLE_GAS = 'NOBLE_GAS',
  HALOGEN = 'HALOGEN',
  RADIOACTIVE = 'RADIOACTIVE',
  RARE_EARTH = 'RARE_EARTH',
  COMPOUND = 'COMPOUND',
  AMMO_PACK = 'AMMO_PACK'      // 弹药包
}

export interface Chemical {
  id: string;
  name: string;
  formula: string;
  color: string;
  description: string;
  trivia?: string; // New: Fun fact text
  points: number;
  hazard: HazardType;
  icon: IconType;
  atomicNumber?: number;
}

export interface GameItem extends Chemical {
  uniqueId: string;
  position: Position;
  isCollected: boolean;
  radius: number;
  pulseOffset: number;
  spawnTime: number;
}

export interface Player {
  head: Position;
  direction: Position;
  targetAngle: number;
  length: number;
  history: Position[];
  baseSpeed: number;
  currentSpeed: number;
  health: number;
  isDashing: boolean;
  invulnerableUntil: number;
  ammo: number; 
  evolutionTier: number; // 0: Normal, 1: Advanced, 2: Master, etc.
  speedBuffUntil: number; // Timestamp until speed buff expires
}

export interface ReactionRecipe {
  inputs: { formula: string; count: number }[];
  product: string;
  productName: string;
  reactionType: string; // Type of reaction (e.g. Neutralization)
  phenomenon: string; // Visual description of the reaction
  color: string;
  power: number;
  ammoYield: number; 
  equation: string; // Balanced chemical equation string
  buff?: {
    type: 'SPEED' | 'HEAL' | 'INVINCIBLE';
    value: number;
    duration?: number; // ms
  };
}

export enum BossState {
  IDLE = 'IDLE',
  CHASE = 'CHASE',
  ATTACK = 'ATTACK',
  HURT = 'HURT',
  TRAPPED = 'TRAPPED' 
}

export interface Boss {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  radius: number;
  state: BossState;
  color: string;
  name: string;
  animalIcon: string; // New: Animal avatar (Emoji)
  angle: number;
  attackCooldown: number;
  trappedTimer: number; 
}

export interface Projectile {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  damage: number;
  isPlayerAmmo: boolean;
  isMissile?: boolean;
  target?: Boss;
}

export interface Theme {
  id: string;
  name: string;
  snakeHeadIcon: string;
  backgroundGradient: string;
  gridColor: string;
  primaryColor: string;
  particleStyle: 'circle' | 'square' | 'sparkle';
}

export interface UserProfile {
  nickname: string;
  themeId: string;
  bestScore: number;
  hasCompletedTutorial: boolean; // New Flag
}

export interface GameSettings {
  bgmVolume: number;
  sfxVolume: number;
  controlOpacity: number;
  showChemicalNames: boolean;
  showTrivia: boolean;    // New: Toggle Fun Facts
  showReactions: boolean; // New: Toggle Reaction Overlay
  showUI: boolean;        // New: Toggle Main HUD
  enableTouchControls: boolean; // New: Toggle On-screen controls
}

export interface Rank {
  id: string;
  title: string;
  minScore: number;
  badgeColor: string;
}

export enum TutorialStep {
  NONE = 0,
  WELCOME_MOVE = 1,
  COLLECT_ELEMENT = 2,
  REACTION_INTRO = 3,
  COMBAT_SHOOT = 4,
  COMPLETED = 5
}
