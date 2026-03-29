import { Chemical, HazardType, IconType, ReactionRecipe, Theme, Rank, GameItem, Achievement } from './types';

// World
export const MAP_WIDTH = 1600;
export const MAP_HEIGHT = 1600;
export const PLAYER_RADIUS = 15;
export const ITEM_RADIUS = 15;

// Physics
export const SNAKE_SPEED_BASE = 3.5;
export const SNAKE_SPEED_MIN = 1.5;
export const SNAKE_SPEED_MAX = 7.0;
export const TURN_SMOOTHING = 0.1;
export const SEGMENT_SPACING = 6;
export const INITIAL_LENGTH = 15; 
export const GROWTH_PER_ITEM = 4;

// Evolution
export const SNAKE_EVOLUTION_THRESHOLD = 50; // Length required to evolve
export const SNAKE_RESET_LENGTH = 18;        // Length after evolution (shortened for better control)
export const EVOLUTION_SPEED_BONUS = 0.5;

// Gameplay
export const MAX_REVIVES = 5; // Initial lives set to 5
export const BOSSES_PER_REVIVE = 1; // Every 1 boss grants 1 life
export const LEVEL_SCORE_THRESHOLD_BASE = 3500; // Increased from 2000
export const BOSS_HP_PER_LEVEL = 1500; // Increased HP scaling
export const BOSS_ENCIRCLE_DPS = 10; 
export const MAX_BOSSES_PER_LEVEL = 2; // Limit bosses per level

// Combat
export const NORMAL_AMMO_DAMAGE = 150;
export const NORMAL_AMMO_SPEED = 15;
export const NORMAL_AMMO_TURN_RATE = 0.15; // Increased for better auto-targeting
export const MISSILE_AMMO_THRESHOLD = 50;
export const MISSILE_AMMO_COST = 20;
export const MISSILE_DAMAGE = 1500; // 10x Normal Damage
export const MISSILE_SPEED = 20; // Slightly faster
export const MISSILE_BASE_TURN_RATE = 0.2; // Much sharper turning
export const MISSILE_LEVEL_TURN_BONUS = 0.02; // How much sharper it turns per level
export const RAPID_FIRE_COOLDOWN = 10;
export const MISSILE_COOLDOWN = 30;

// NEW CONSTANTS - Difficulty Increased
export const PLAYER_RANKS: Rank[] = [
  { id: 'novice', title: '实验助理', minScore: 0, badgeColor: '#94a3b8' },
  { id: 'junior', title: '初级研究员', minScore: 1500, badgeColor: '#22d3ee' },
  { id: 'senior', title: '高级研究员', minScore: 6000, badgeColor: '#818cf8' },
  { id: 'expert', title: '化学专家', minScore: 15000, badgeColor: '#c084fc' },
  { id: 'master', title: '首席科学家', minScore: 35000, badgeColor: '#f472b6' },
  { id: 'legend', title: '化学院士', minScore: 80000, badgeColor: '#fbbf24' },
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_blood', title: '初露锋芒', description: '成功击败第 1 个 BOSS', icon: '⚔️' },
  { id: 'boss_hunter', title: '赏金猎人', description: '单局累计击败 10 个 BOSS', icon: '💀' }, // Hard condition
  { id: 'aqua_regia', title: '炼金术士', description: '首次合成“王水” (HNO3 + 3HCl)', icon: '⚗️' },
  { id: 'alkali_collection', title: '元素收藏家', description: '收集锂(Li)、钠(Na)、钾(K) 三种碱金属', icon: '🔥' },
  { id: 'high_level', title: '资深研究员', description: '在单局游戏中达到等级 8', icon: '🎓' }, // Increased from 5 to 8
];

export const AMMO_PACK_TEMPLATE: Chemical = {
  id: 'AMMO',
  name: '弹药包',
  formula: 'AMMO',
  color: '#fbbf24',
  description: '补给弹药',
  points: 0,
  hazard: HazardType.NONE,
  icon: IconType.AMMO_PACK,
  atomicNumber: 0
};

export const BOSS_TEMPLATES = [
  { minLevel: 1, name: '巨型噬菌体', icon: '🦠', color: '#ef4444' },
  { minLevel: 3, name: '辐射变异兽', icon: '🦂', color: '#a855f7' },
  { minLevel: 6, name: '炼金合成兽', icon: '🐲', color: '#fbbf24' },
  { minLevel: 10, name: '熵增魔王', icon: '👹', color: '#000000' },
];

export const THEMES: Theme[] = [
  { 
    id: 'tech', 
    name: '未来科技', 
    snakeHeadIcon: '🤖', 
    backgroundGradient: 'to bottom, #0f172a, #1e293b', 
    gridColor: 'rgba(6, 182, 212, 0.1)', 
    primaryColor: '#06b6d4', 
    particleStyle: 'square' 
  },
  { 
    id: 'nature', 
    name: '自然生机', 
    snakeHeadIcon: '🐸', 
    backgroundGradient: 'to bottom, #052e16, #14532d', 
    gridColor: 'rgba(34, 197, 94, 0.1)', 
    primaryColor: '#22c55e', 
    particleStyle: 'circle' 
  },
  { 
    id: 'magic', 
    name: '魔法炼金', 
    snakeHeadIcon: '🔮', 
    backgroundGradient: 'to bottom, #2e1065, #581c87', 
    gridColor: 'rgba(192, 132, 252, 0.1)', 
    primaryColor: '#a855f7', 
    particleStyle: 'sparkle' 
  },
  { 
    id: 'retro', 
    name: '像素复古', 
    snakeHeadIcon: '👾', 
    backgroundGradient: 'to bottom, #1a1a1a, #000000', 
    gridColor: 'rgba(255, 255, 255, 0.15)', 
    primaryColor: '#ef4444', 
    particleStyle: 'square' 
  },
];

// --- COMPLETE PERIODIC TABLE DATA (1-118) ---
// Columns (Group) and Rows (Period) added for layout
export const FULL_PERIODIC_TABLE = [
  { z: 1, symbol: 'H', name: '氢', mass: '1.008', group: 1, period: 1, category: 'nonmetal' },
  { z: 2, symbol: 'He', name: '氦', mass: '4.0026', group: 18, period: 1, category: 'noble-gas' },
  { z: 3, symbol: 'Li', name: '锂', mass: '6.94', group: 1, period: 2, category: 'alkali-metal' },
  { z: 4, symbol: 'Be', name: '铍', mass: '9.0122', group: 2, period: 2, category: 'alkaline-earth' },
  { z: 5, symbol: 'B', name: '硼', mass: '10.81', group: 13, period: 2, category: 'metalloid' },
  { z: 6, symbol: 'C', name: '碳', mass: '12.011', group: 14, period: 2, category: 'nonmetal' },
  { z: 7, symbol: 'N', name: '氮', mass: '14.007', group: 15, period: 2, category: 'nonmetal' },
  { z: 8, symbol: 'O', name: '氧', mass: '15.999', group: 16, period: 2, category: 'nonmetal' },
  { z: 9, symbol: 'F', name: '氟', mass: '18.998', group: 17, period: 2, category: 'halogen' },
  { z: 10, symbol: 'Ne', name: '氖', mass: '20.180', group: 18, period: 2, category: 'noble-gas' },
  { z: 11, symbol: 'Na', name: '钠', mass: '22.990', group: 1, period: 3, category: 'alkali-metal' },
  { z: 12, symbol: 'Mg', name: '镁', mass: '24.305', group: 2, period: 3, category: 'alkaline-earth' },
  { z: 13, symbol: 'Al', name: '铝', mass: '26.982', group: 13, period: 3, category: 'post-transition' },
  { z: 14, symbol: 'Si', name: '硅', mass: '28.085', group: 14, period: 3, category: 'metalloid' },
  { z: 15, symbol: 'P', name: '磷', mass: '30.974', group: 15, period: 3, category: 'nonmetal' },
  { z: 16, symbol: 'S', name: '硫', mass: '32.06', group: 16, period: 3, category: 'nonmetal' },
  { z: 17, symbol: 'Cl', name: '氯', mass: '35.45', group: 17, period: 3, category: 'halogen' },
  { z: 18, symbol: 'Ar', name: '氩', mass: '39.948', group: 18, period: 3, category: 'noble-gas' },
  { z: 19, symbol: 'K', name: '钾', mass: '39.098', group: 1, period: 4, category: 'alkali-metal' },
  { z: 20, symbol: 'Ca', name: '钙', mass: '40.078', group: 2, period: 4, category: 'alkaline-earth' },
  { z: 21, symbol: 'Sc', name: '钪', mass: '44.956', group: 3, period: 4, category: 'transition' },
  { z: 22, symbol: 'Ti', name: '钛', mass: '47.867', group: 4, period: 4, category: 'transition' },
  { z: 23, symbol: 'V', name: '钒', mass: '50.942', group: 5, period: 4, category: 'transition' },
  { z: 24, symbol: 'Cr', name: '铬', mass: '51.996', group: 6, period: 4, category: 'transition' },
  { z: 25, symbol: 'Mn', name: '锰', mass: '54.938', group: 7, period: 4, category: 'transition' },
  { z: 26, symbol: 'Fe', name: '铁', mass: '55.845', group: 8, period: 4, category: 'transition' },
  { z: 27, symbol: 'Co', name: '钴', mass: '58.933', group: 9, period: 4, category: 'transition' },
  { z: 28, symbol: 'Ni', name: '镍', mass: '58.693', group: 10, period: 4, category: 'transition' },
  { z: 29, symbol: 'Cu', name: '铜', mass: '63.546', group: 11, period: 4, category: 'transition' },
  { z: 30, symbol: 'Zn', name: '锌', mass: '65.38', group: 12, period: 4, category: 'transition' },
  { z: 31, symbol: 'Ga', name: '镓', mass: '69.723', group: 13, period: 4, category: 'post-transition' },
  { z: 32, symbol: 'Ge', name: '锗', mass: '72.630', group: 14, period: 4, category: 'metalloid' },
  { z: 33, symbol: 'As', name: '砷', mass: '74.922', group: 15, period: 4, category: 'metalloid' },
  { z: 34, symbol: 'Se', name: '硒', mass: '78.971', group: 16, period: 4, category: 'nonmetal' },
  { z: 35, symbol: 'Br', name: '溴', mass: '79.904', group: 17, period: 4, category: 'halogen' },
  { z: 36, symbol: 'Kr', name: '氪', mass: '83.798', group: 18, period: 4, category: 'noble-gas' },
  { z: 37, symbol: 'Rb', name: '铷', mass: '85.468', group: 1, period: 5, category: 'alkali-metal' },
  { z: 38, symbol: 'Sr', name: '锶', mass: '87.62', group: 2, period: 5, category: 'alkaline-earth' },
  { z: 39, symbol: 'Y', name: '钇', mass: '88.906', group: 3, period: 5, category: 'transition' },
  { z: 40, symbol: 'Zr', name: '锆', mass: '91.224', group: 4, period: 5, category: 'transition' },
  { z: 41, symbol: 'Nb', name: '铌', mass: '92.906', group: 5, period: 5, category: 'transition' },
  { z: 42, symbol: 'Mo', name: '钼', mass: '95.95', group: 6, period: 5, category: 'transition' },
  { z: 43, symbol: 'Tc', name: '锝', mass: '(98)', group: 7, period: 5, category: 'transition' },
  { z: 44, symbol: 'Ru', name: '钌', mass: '101.07', group: 8, period: 5, category: 'transition' },
  { z: 45, symbol: 'Rh', name: '铑', mass: '102.91', group: 9, period: 5, category: 'transition' },
  { z: 46, symbol: 'Pd', name: '钯', mass: '106.42', group: 10, period: 5, category: 'transition' },
  { z: 47, symbol: 'Ag', name: '银', mass: '107.87', group: 11, period: 5, category: 'transition' },
  { z: 48, symbol: 'Cd', name: '镉', mass: '112.41', group: 12, period: 5, category: 'transition' },
  { z: 49, symbol: 'In', name: '铟', mass: '114.82', group: 13, period: 5, category: 'post-transition' },
  { z: 50, symbol: 'Sn', name: '锡', mass: '118.71', group: 14, period: 5, category: 'post-transition' },
  { z: 51, symbol: 'Sb', name: '锑', mass: '121.76', group: 15, period: 5, category: 'metalloid' },
  { z: 52, symbol: 'Te', name: '碲', mass: '127.60', group: 16, period: 5, category: 'metalloid' },
  { z: 53, symbol: 'I', name: '碘', mass: '126.90', group: 17, period: 5, category: 'halogen' },
  { z: 54, symbol: 'Xe', name: '氙', mass: '131.29', group: 18, period: 5, category: 'noble-gas' },
  { z: 55, symbol: 'Cs', name: '铯', mass: '132.91', group: 1, period: 6, category: 'alkali-metal' },
  { z: 56, symbol: 'Ba', name: '钡', mass: '137.33', group: 2, period: 6, category: 'alkaline-earth' },
  { z: 57, symbol: 'La', name: '镧', mass: '138.91', group: 3, period: 6, category: 'lanthanide' },
  { z: 58, symbol: 'Ce', name: '铈', mass: '140.12', group: 4, period: 9, category: 'lanthanide' }, // Period 9 for compact rendering mapping
  { z: 59, symbol: 'Pr', name: '镨', mass: '140.91', group: 5, period: 9, category: 'lanthanide' },
  { z: 60, symbol: 'Nd', name: '钕', mass: '144.24', group: 6, period: 9, category: 'lanthanide' },
  { z: 61, symbol: 'Pm', name: '钷', mass: '(145)', group: 7, period: 9, category: 'lanthanide' },
  { z: 62, symbol: 'Sm', name: '钐', mass: '150.36', group: 8, period: 9, category: 'lanthanide' },
  { z: 63, symbol: 'Eu', name: '铕', mass: '151.96', group: 9, period: 9, category: 'lanthanide' },
  { z: 64, symbol: 'Gd', name: '钆', mass: '157.25', group: 10, period: 9, category: 'lanthanide' },
  { z: 65, symbol: 'Tb', name: '铽', mass: '158.93', group: 11, period: 9, category: 'lanthanide' },
  { z: 66, symbol: 'Dy', name: '镝', mass: '162.50', group: 12, period: 9, category: 'lanthanide' },
  { z: 67, symbol: 'Ho', name: '钬', mass: '164.93', group: 13, period: 9, category: 'lanthanide' },
  { z: 68, symbol: 'Er', name: '铒', mass: '167.26', group: 14, period: 9, category: 'lanthanide' },
  { z: 69, symbol: 'Tm', name: '铥', mass: '168.93', group: 15, period: 9, category: 'lanthanide' },
  { z: 70, symbol: 'Yb', name: '镱', mass: '173.05', group: 16, period: 9, category: 'lanthanide' },
  { z: 71, symbol: 'Lu', name: '镥', mass: '174.97', group: 17, period: 9, category: 'lanthanide' },
  { z: 72, symbol: 'Hf', name: '铪', mass: '178.49', group: 4, period: 6, category: 'transition' },
  { z: 73, symbol: 'Ta', name: '钽', mass: '180.95', group: 5, period: 6, category: 'transition' },
  { z: 74, symbol: 'W', name: '钨', mass: '183.84', group: 6, period: 6, category: 'transition' },
  { z: 75, symbol: 'Re', name: '铼', mass: '186.21', group: 7, period: 6, category: 'transition' },
  { z: 76, symbol: 'Os', name: '锇', mass: '190.23', group: 8, period: 6, category: 'transition' },
  { z: 77, symbol: 'Ir', name: '铱', mass: '192.22', group: 9, period: 6, category: 'transition' },
  { z: 78, symbol: 'Pt', name: '铂', mass: '195.08', group: 10, period: 6, category: 'transition' },
  { z: 79, symbol: 'Au', name: '金', mass: '196.97', group: 11, period: 6, category: 'transition' },
  { z: 80, symbol: 'Hg', name: '汞', mass: '200.59', group: 12, period: 6, category: 'transition' },
  { z: 81, symbol: 'Tl', name: '铊', mass: '204.38', group: 13, period: 6, category: 'post-transition' },
  { z: 82, symbol: 'Pb', name: '铅', mass: '207.2', group: 14, period: 6, category: 'post-transition' },
  { z: 83, symbol: 'Bi', name: '铋', mass: '208.98', group: 15, period: 6, category: 'post-transition' },
  { z: 84, symbol: 'Po', name: '钋', mass: '(209)', group: 16, period: 6, category: 'metalloid' },
  { z: 85, symbol: 'At', name: '砹', mass: '(210)', group: 17, period: 6, category: 'halogen' },
  { z: 86, symbol: 'Rn', name: '氡', mass: '(222)', group: 18, period: 6, category: 'noble-gas' },
  { z: 87, symbol: 'Fr', name: '钫', mass: '(223)', group: 1, period: 7, category: 'alkali-metal' },
  { z: 88, symbol: 'Ra', name: '镭', mass: '(226)', group: 2, period: 7, category: 'alkaline-earth' },
  { z: 89, symbol: 'Ac', name: '锕', mass: '(227)', group: 3, period: 7, category: 'actinide' },
  { z: 90, symbol: 'Th', name: '钍', mass: '232.04', group: 4, period: 10, category: 'actinide' }, // Period 10 for actinide row
  { z: 91, symbol: 'Pa', name: '镤', mass: '231.04', group: 5, period: 10, category: 'actinide' },
  { z: 92, symbol: 'U', name: '铀', mass: '238.03', group: 6, period: 10, category: 'actinide' },
  { z: 93, symbol: 'Np', name: '镎', mass: '(237)', group: 7, period: 10, category: 'actinide' },
  { z: 94, symbol: 'Pu', name: '钚', mass: '(244)', group: 8, period: 10, category: 'actinide' },
  { z: 95, symbol: 'Am', name: '镅', mass: '(243)', group: 9, period: 10, category: 'actinide' },
  { z: 96, symbol: 'Cm', name: '锔', mass: '(247)', group: 10, period: 10, category: 'actinide' },
  { z: 97, symbol: 'Bk', name: '锫', mass: '(247)', group: 11, period: 10, category: 'actinide' },
  { z: 98, symbol: 'Cf', name: '锎', mass: '(251)', group: 12, period: 10, category: 'actinide' },
  { z: 99, symbol: 'Es', name: '锿', mass: '(252)', group: 13, period: 10, category: 'actinide' },
  { z: 100, symbol: 'Fm', name: '镄', mass: '(257)', group: 14, period: 10, category: 'actinide' },
  { z: 101, symbol: 'Md', name: '钔', mass: '(258)', group: 15, period: 10, category: 'actinide' },
  { z: 102, symbol: 'No', name: '锘', mass: '(259)', group: 16, period: 10, category: 'actinide' },
  { z: 103, symbol: 'Lr', name: '铹', mass: '(262)', group: 17, period: 10, category: 'actinide' },
  { z: 104, symbol: 'Rf', name: '𬬻', mass: '(267)', group: 4, period: 7, category: 'transition' },
  { z: 105, symbol: 'Db', name: '𬭊', mass: '(268)', group: 5, period: 7, category: 'transition' },
  { z: 106, symbol: 'Sg', name: '𬭳', mass: '(269)', group: 6, period: 7, category: 'transition' },
  { z: 107, symbol: 'Bh', name: '𬭛', mass: '(270)', group: 7, period: 7, category: 'transition' },
  { z: 108, symbol: 'Hs', name: '𬭶', mass: '(277)', group: 8, period: 7, category: 'transition' },
  { z: 109, symbol: 'Mt', name: '⛷', mass: '(278)', group: 9, period: 7, category: 'transition' },
  { z: 110, symbol: 'Ds', name: '⚰', mass: '(281)', group: 10, period: 7, category: 'transition' },
  { z: 111, symbol: 'Rg', name: '𬬭', mass: '(282)', group: 11, period: 7, category: 'transition' },
  { z: 112, symbol: 'Cn', name: '🚋', mass: '(285)', group: 12, period: 7, category: 'transition' },
  { z: 113, symbol: 'Nh', name: 'nihonium', mass: '(286)', group: 13, period: 7, category: 'post-transition' }, // Simplified
  { z: 114, symbol: 'Fl', name: 'fl', mass: '(289)', group: 14, period: 7, category: 'post-transition' },
  { z: 115, symbol: 'Mc', name: 'mc', mass: '(290)', group: 15, period: 7, category: 'post-transition' },
  { z: 116, symbol: 'Lv', name: 'lv', mass: '(293)', group: 16, period: 7, category: 'post-transition' },
  { z: 117, symbol: 'Ts', name: 'ts', mass: '(294)', group: 17, period: 7, category: 'halogen' },
  { z: 118, symbol: 'Og', name: 'og', mass: '(294)', group: 18, period: 7, category: 'noble-gas' },
];

export const REACTION_RECIPES: ReactionRecipe[] = [
  {
    inputs: [{ formula: 'H', count: 2 }, { formula: 'O', count: 1 }],
    product: 'H2O',
    productName: '水',
    reactionType: '化合反应',
    phenomenon: '产生淡蓝色火焰',
    color: '#3b82f6',
    power: 100,
    ammoYield: 5,
    equation: '2H₂ + O₂ → 2H₂O',
    buff: { type: 'HEAL', value: 10 }
  },
  {
    inputs: [{ formula: 'Na', count: 1 }, { formula: 'Cl', count: 1 }],
    product: 'NaCl',
    productName: '氯化钠',
    reactionType: '化合反应',
    phenomenon: '产生大量白烟',
    color: '#fef3c7',
    power: 150,
    ammoYield: 10,
    equation: '2Na + Cl₂ → 2NaCl'
  },
  {
    inputs: [{ formula: 'C', count: 1 }, { formula: 'O', count: 2 }],
    product: 'CO2',
    productName: '二氧化碳',
    reactionType: '氧化反应',
    phenomenon: '剧烈燃烧发光',
    color: '#94a3b8',
    power: 120,
    ammoYield: 8,
    equation: 'C + O₂ → CO₂'
  },
  {
      inputs: [{formula: 'H', count: 1}, {formula: 'Cl', count: 1}],
      product: 'HCl',
      productName: '盐酸',
      reactionType: '化合反应',
      phenomenon: '工业制酸',
      color: '#a3e635',
      power: 200,
      ammoYield: 15,
      equation: 'H₂ + Cl₂ → 2HCl',
      buff: { type: 'SPEED', value: 0, duration: 5000 }
  },
  {
      inputs: [{formula: 'Mg', count: 1}, {formula: 'O', count: 1}],
      product: 'MgO',
      productName: '氧化镁',
      reactionType: '化合反应',
      phenomenon: '发出耀眼白光',
      color: '#ffffff',
      power: 250,
      ammoYield: 12,
      equation: '2Mg + O₂ → 2MgO',
      buff: { type: 'SPEED', value: 0, duration: 4000 }
  },
  {
      inputs: [{formula: 'Fe', count: 1}, {formula: 'S', count: 1}],
      product: 'FeS',
      productName: '硫化亚铁',
      reactionType: '化合反应',
      phenomenon: '生成黑色固体',
      color: '#3f3f46',
      power: 180,
      ammoYield: 10,
      equation: 'Fe + S → FeS'
  },
  {
      inputs: [{formula: 'H', count: 1}, {formula: 'F', count: 1}],
      product: 'HF',
      productName: '氢氟酸',
      reactionType: '化合反应',
      phenomenon: '剧烈腐蚀玻璃',
      color: '#84cc16',
      power: 300,
      ammoYield: 20,
      equation: 'H₂ + F₂ → 2HF'
  },
  {
      inputs: [{formula: 'S', count: 1}, {formula: 'O', count: 2}],
      product: 'SO2',
      productName: '二氧化硫',
      reactionType: '氧化反应',
      phenomenon: '燃烧蓝紫色火焰',
      color: '#60a5fa',
      power: 200,
      ammoYield: 15,
      equation: 'S + O₂ → SO₂'
  },
  {
      inputs: [{formula: 'C', count: 1}, {formula: 'S', count: 2}],
      product: 'CS2',
      productName: '二硫化碳',
      reactionType: '化合反应',
      phenomenon: '生成易燃液体',
      color: '#facc15',
      power: 220,
      ammoYield: 18,
      equation: 'C + 2S → CS₂'
  },
  {
      inputs: [{formula: 'N', count: 1}, {formula: 'H', count: 3}],
      product: 'NH3',
      productName: '氨气',
      reactionType: '合成氨',
      phenomenon: '刺激性气味',
      color: '#22d3ee',
      power: 280,
      ammoYield: 25,
      equation: 'N₂ + 3H₂ ⇌ 2NH₃',
      buff: { type: 'HEAL', value: 15 }
  },
  {
      inputs: [{formula: 'Zn', count: 1}, {formula: 'HCl', count: 2}],
      product: 'ZnCl2',
      productName: '氯化锌',
      reactionType: '置换反应',
      phenomenon: '产生氢气气泡',
      color: '#cbd5e1',
      power: 350,
      ammoYield: 30,
      equation: 'Zn + 2HCl → ZnCl₂ + H₂'
  },
  {
      inputs: [{formula: 'Na', count: 2}, {formula: 'H2O', count: 2}],
      product: 'NaOH',
      productName: '氢氧化钠',
      reactionType: '置换反应',
      phenomenon: '水面剧烈游动',
      color: '#e2e8f0',
      power: 400,
      ammoYield: 35,
      equation: '2Na + 2H₂O → 2NaOH + H₂'
  },
  {
      inputs: [{formula: 'K', count: 2}, {formula: 'H2O', count: 2}],
      product: 'KOH',
      productName: '氢氧化钾',
      reactionType: '置换反应',
      phenomenon: '燃烧紫色火焰',
      color: '#c084fc',
      power: 450,
      ammoYield: 40,
      equation: '2K + 2H₂O → 2KOH + H₂'
  },
  {
      inputs: [{formula: 'C', count: 1}, {formula: 'H', count: 4}],
      product: 'CH4',
      productName: '甲烷',
      reactionType: '化合反应',
      phenomenon: '天然气成分',
      color: '#38bdf8',
      power: 150,
      ammoYield: 12,
      equation: 'C + 2H₂ → CH₄'
  },
  {
      inputs: [{formula: 'Ca', count: 1}, {formula: 'H2O', count: 2}],
      product: 'Ca(OH)2',
      productName: '氢氧化钙',
      reactionType: '置换反应',
      phenomenon: '生成熟石灰',
      color: '#f1f5f9',
      power: 300,
      ammoYield: 25,
      equation: 'Ca + 2H₂O → Ca(OH)₂ + H₂'
  },
  {
      inputs: [{formula: 'HNO3', count: 1}, {formula: 'HCl', count: 3}],
      product: 'AquaRegia', 
      productName: '王水',
      reactionType: '危险配制',
      phenomenon: '溶解黄金',
      color: '#fbbf24',
      power: 1000,
      ammoYield: 100,
      equation: 'HNO₃ + 3HCl → Cl₂ + NOCl + 2H₂O',
      buff: { type: 'INVINCIBLE', value: 0, duration: 8000 }
  }
];

// Game Data Fallback - Expanded Library
export const FALLBACK_CHEMICALS: Chemical[] = [
  { id: '1', name: '氢', formula: 'H', color: '#ef4444', description: '宇宙中最丰富的元素', points: 10, hazard: HazardType.EXPLOSIVE, icon: IconType.NON_METAL, atomicNumber: 1 },
  { id: '2', name: '氦', formula: 'He', color: '#a855f7', description: '惰性气体，用来充气球', points: 20, hazard: HazardType.NONE, icon: IconType.NOBLE_GAS, atomicNumber: 2 },
  { id: '3', name: '锂', formula: 'Li', color: '#ef4444', description: '电池的重要成分', points: 30, hazard: HazardType.EXPLOSIVE, icon: IconType.ALKALI_METAL, atomicNumber: 3 },
  { id: '6', name: '碳', formula: 'C', color: '#64748b', description: '生命的基础元素', points: 15, hazard: HazardType.NONE, icon: IconType.NON_METAL, atomicNumber: 6 },
  { id: '7', name: '氮', formula: 'N', color: '#3b82f6', description: '空气中含量最多', points: 15, hazard: HazardType.NONE, icon: IconType.NON_METAL, atomicNumber: 7 },
  { id: '8', name: '氧', formula: 'O', color: '#06b6d4', description: '呼吸必须的气体', points: 15, hazard: HazardType.EXPLOSIVE, icon: IconType.NON_METAL, atomicNumber: 8 },
  { id: '9', name: '氟', formula: 'F', color: '#84cc16', description: '腐蚀性极强', points: 40, hazard: HazardType.CORROSIVE, icon: IconType.HALOGEN, atomicNumber: 9 },
  { id: '11', name: '钠', formula: 'Na', color: '#eab308', description: '遇水剧烈反应', points: 30, hazard: HazardType.EXPLOSIVE, icon: IconType.ALKALI_METAL, atomicNumber: 11 },
  { id: '12', name: '镁', formula: 'Mg', color: '#e2e8f0', description: '燃烧发出耀眼白光', points: 35, hazard: HazardType.NONE, icon: IconType.ALKALINE_EARTH, atomicNumber: 12 },
  { id: '16', name: '硫', formula: 'S', color: '#facc15', description: '火山口的黄色晶体', points: 25, hazard: HazardType.EXPLOSIVE, icon: IconType.NON_METAL, atomicNumber: 16 },
  { id: '17', name: '氯', formula: 'Cl', color: '#22c55e', description: '泳池消毒的味道', points: 35, hazard: HazardType.CORROSIVE, icon: IconType.HALOGEN, atomicNumber: 17 },
  { id: '19', name: '钾', formula: 'K', color: '#a855f7', description: '香蕉里富含钾', points: 35, hazard: HazardType.EXPLOSIVE, icon: IconType.ALKALI_METAL, atomicNumber: 19 },
  { id: '20', name: '钙', formula: 'Ca', color: '#f1f5f9', description: '骨骼和牙齿的成分', points: 30, hazard: HazardType.NONE, icon: IconType.ALKALINE_EARTH, atomicNumber: 20 },
  { id: '26', name: '铁', formula: 'Fe', color: '#f97316', description: '工业的骨骼', points: 50, hazard: HazardType.NONE, icon: IconType.TRANSITION_METAL, atomicNumber: 26 },
  { id: '29', name: '铜', formula: 'Cu', color: '#d97706', description: '优良的导电体', points: 50, hazard: HazardType.NONE, icon: IconType.TRANSITION_METAL, atomicNumber: 29 },
  { id: '30', name: '锌', formula: 'Zn', color: '#94a3b8', description: '电池负极材料', points: 45, hazard: HazardType.NONE, icon: IconType.TRANSITION_METAL, atomicNumber: 30 },
  { id: '79', name: '金', formula: 'Au', color: '#fbbf24', description: '昂贵的贵金属', points: 100, hazard: HazardType.NONE, icon: IconType.TRANSITION_METAL, atomicNumber: 79 },
  { id: '92', name: '铀', formula: 'U', color: '#10b981', description: '核能的来源', points: 500, hazard: HazardType.RADIOACTIVE, icon: IconType.RADIOACTIVE, atomicNumber: 92 },
  { id: 'cmp1', name: '水', formula: 'H2O', color: '#3b82f6', description: '生命之源', points: 20, hazard: HazardType.NONE, icon: IconType.COMPOUND, atomicNumber: 0 },
  { id: 'cmp2', name: '盐酸', formula: 'HCl', color: '#84cc16', description: '胃酸的主要成分', points: 40, hazard: HazardType.CORROSIVE, icon: IconType.COMPOUND, atomicNumber: 0 },
  { id: 'cmp3', name: '硝酸', formula: 'HNO3', color: '#f43f5e', description: '强氧化性酸', points: 60, hazard: HazardType.CORROSIVE, icon: IconType.COMPOUND, atomicNumber: 0 },
];