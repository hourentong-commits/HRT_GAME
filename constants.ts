import { Chemical, HazardType, IconType, ReactionRecipe, Theme, Rank, GameItem } from './types';

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
export const LEVEL_SCORE_THRESHOLD_BASE = 2000;
export const BOSS_HP_PER_LEVEL = 1000;
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

// Game Data Fallback - Expanded Library
export const FALLBACK_CHEMICALS: Chemical[] = [
  // --- Basic Elements ---
  { id: 'H', name: '氢', formula: 'H', color: '#ffffff', description: '宇宙中最丰富的元素。', trivia: '它是宇宙中最轻的气体！', points: 10, hazard: HazardType.EXPLOSIVE, icon: IconType.CYLINDER, atomicNumber: 1 },
  { id: 'He', name: '氦', formula: 'He', color: '#ffd700', description: '惰性气体，用于气球。', trivia: '吸入它会让你的声音变尖！', points: 15, hazard: HazardType.NONE, icon: IconType.NOBLE_GAS, atomicNumber: 2 },
  { id: 'Li', name: '锂', formula: 'Li', color: '#ff00ff', description: '用于电池的轻金属。', trivia: '它是密度最小的金属，能浮在油上！', points: 20, hazard: HazardType.EXPLOSIVE, icon: IconType.ALKALI_METAL, atomicNumber: 3 },
  { id: 'C', name: '碳', formula: 'C', color: '#333333', description: '生命的基石。', trivia: '钻石和铅笔芯都是由它构成的！', points: 10, hazard: HazardType.NONE, icon: IconType.NON_METAL, atomicNumber: 6 },
  { id: 'N', name: '氮', formula: 'N', color: '#60a5fa', description: '空气的主要成分。', trivia: '液氮可以瞬间冻结玫瑰花！', points: 10, hazard: HazardType.NONE, icon: IconType.CYLINDER, atomicNumber: 7 },
  { id: 'O', name: '氧', formula: 'O', color: '#00ffff', description: '呼吸必需的气体。', trivia: '液态氧会被磁铁吸引！', points: 10, hazard: HazardType.EXPLOSIVE, icon: IconType.CYLINDER, atomicNumber: 8 },
  { id: 'F', name: '氟', formula: 'F', color: '#fef08a', description: '极度活泼的浅黄气体。', trivia: '它是所有元素中最霸道的氧化剂！', points: 60, hazard: HazardType.CORROSIVE, icon: IconType.HALOGEN, atomicNumber: 9 },
  { id: 'Na', name: '钠', formula: 'Na', color: '#fbbf24', description: '活泼金属，遇水爆炸。', trivia: '它软得可以用刀切开！', points: 30, hazard: HazardType.EXPLOSIVE, icon: IconType.ALKALI_METAL, atomicNumber: 11 },
  { id: 'Mg', name: '镁', formula: 'Mg', color: '#e2e8f0', description: '燃烧时发出耀眼白光。', trivia: '闪光灯里曾经用它来照明！', points: 25, hazard: HazardType.EXPLOSIVE, icon: IconType.ALKALI_METAL, atomicNumber: 12 },
  { id: 'Al', name: '铝', formula: 'Al', color: '#cbd5e1', description: '地壳中含量最丰富的金属。', trivia: '以前铝比金子还贵！', points: 20, hazard: HazardType.NONE, icon: IconType.TRANSITION_METAL, atomicNumber: 13 },
  { id: 'Si', name: '硅', formula: 'Si', color: '#94a3b8', description: '半导体芯片的材料。', trivia: '沙子(二氧化硅)里全是它！', points: 20, hazard: HazardType.NONE, icon: IconType.NON_METAL, atomicNumber: 14 },
  { id: 'P', name: '磷', formula: 'P', color: '#dc2626', description: '易燃非金属，分红磷白磷。', trivia: '白磷在空气中会自燃！', points: 35, hazard: HazardType.EXPLOSIVE, icon: IconType.NON_METAL, atomicNumber: 15 },
  { id: 'S', name: '硫', formula: 'S', color: '#facc15', description: '黄色晶体，有臭鸡蛋味。', trivia: '火山喷发口经常能找到它。', points: 25, hazard: HazardType.EXPLOSIVE, icon: IconType.NON_METAL, atomicNumber: 16 },
  { id: 'Cl', name: '氯', formula: 'Cl', color: '#a3e635', description: '黄绿色有毒气体。', trivia: '它曾被用于消毒饮用水！', points: 25, hazard: HazardType.CORROSIVE, icon: IconType.HALOGEN, atomicNumber: 17 },
  { id: 'K', name: '钾', formula: 'K', color: '#a855f7', description: '活泼金属，产生紫色火焰。', trivia: '香蕉里含有丰富的钾！', points: 35, hazard: HazardType.EXPLOSIVE, icon: IconType.ALKALI_METAL, atomicNumber: 19 },
  { id: 'Ca', name: '钙', formula: 'Ca', color: '#f1f5f9', description: '骨骼的主要成分。', trivia: '大理石和贝壳的主要成分都是它！', points: 15, hazard: HazardType.NONE, icon: IconType.ALKALI_METAL, atomicNumber: 20 },
  { id: 'Fe', name: '铁', formula: 'Fe', color: '#94a3b8', description: '工业的基础金属。', trivia: '血液是红色的就是因为含有铁！', points: 20, hazard: HazardType.NONE, icon: IconType.TRANSITION_METAL, atomicNumber: 26 },
  { id: 'Cu', name: '铜', formula: 'Cu', color: '#d97706', description: '良好的导电金属。', trivia: '自由女神像变绿是因为铜生锈了！', points: 25, hazard: HazardType.NONE, icon: IconType.TRANSITION_METAL, atomicNumber: 29 },
  { id: 'Zn', name: '锌', formula: 'Zn', color: '#e4e4e7', description: '蓝白色金属，用于电池。', trivia: '它是人体必需的微量元素！', points: 25, hazard: HazardType.NONE, icon: IconType.TRANSITION_METAL, atomicNumber: 30 },
  { id: 'Ag', name: '银', formula: 'Ag', color: '#e2e8f0', description: '导电性最好的金属。', trivia: '它有杀菌作用，古代用银针试毒！', points: 50, hazard: HazardType.NONE, icon: IconType.TRANSITION_METAL, atomicNumber: 47 },
  { id: 'I', name: '碘', formula: 'I', color: '#7e22ce', description: '紫黑色固体，升华成紫气。', trivia: '碘酒可以用来检测淀粉，会变蓝！', points: 30, hazard: HazardType.NONE, icon: IconType.HALOGEN, atomicNumber: 53 },
  { id: 'Ba', name: '钡', formula: 'Ba', color: '#16a34a', description: '焰色反应为黄绿色。', trivia: '由于密度大，钡餐用于胃部X光检查！', points: 40, hazard: HazardType.CORROSIVE, icon: IconType.ALKALI_METAL, atomicNumber: 56 },
  { id: 'Au', name: '金', formula: 'Au', color: '#fcd34d', description: '耐腐蚀的贵金属。', trivia: '一克黄金可以拉成3公里长的丝！', points: 100, hazard: HazardType.NONE, icon: IconType.TRANSITION_METAL, atomicNumber: 79 },
  { id: 'U', name: '铀', formula: 'U', color: '#22c55e', description: '放射性元素。', trivia: '一公斤铀的能量等于两万吨煤！', points: 100, hazard: HazardType.RADIOACTIVE, icon: IconType.RADIOACTIVE, atomicNumber: 92 },

  // --- Compounds (Acids, Bases, Salts) ---
  { id: 'H2SO4', name: '硫酸', formula: 'H2SO4', color: '#f59e0b', description: '工业之母，强酸。', trivia: '它具有强烈的脱水性，能把糖变黑碳！', points: 50, hazard: HazardType.CORROSIVE, icon: IconType.COMPOUND, atomicNumber: 0 },
  { id: 'HCl', name: '盐酸', formula: 'HCl', color: '#fcd34d', description: '胃酸的主要成分。', trivia: '浓盐酸打开瓶盖会冒白雾！', points: 30, hazard: HazardType.CORROSIVE, icon: IconType.COMPOUND, atomicNumber: 0 },
  { id: 'NaOH', name: '氢氧化钠', formula: 'NaOH', color: '#ffffff', description: '强碱，俗称烧碱。', trivia: '溶解时会放出大量的热！', points: 40, hazard: HazardType.CORROSIVE, icon: IconType.COMPOUND, atomicNumber: 0 },
  { id: 'CuSO4', name: '硫酸铜', formula: 'CuSO4', color: '#3b82f6', description: '蓝色晶体，俗称胆矾。', trivia: '游泳池里的蓝色往往是它！', points: 45, hazard: HazardType.CORROSIVE, icon: IconType.COMPOUND, atomicNumber: 0 },
  { id: 'AgNO3', name: '硝酸银', formula: 'AgNO3', color: '#fff', description: '重要的银盐。', trivia: '见光会分解变黑，手指碰到会变黑！', points: 50, hazard: HazardType.CORROSIVE, icon: IconType.COMPOUND, atomicNumber: 0 },
  { id: 'BaCl2', name: '氯化钡', formula: 'BaCl2', color: '#fff', description: '可溶性钡盐。', trivia: '虽然有毒，但用于制造绿色烟花！', points: 45, hazard: HazardType.CORROSIVE, icon: IconType.COMPOUND, atomicNumber: 0 },
  { id: 'Na2SO4', name: '硫酸钠', formula: 'Na2SO4', color: '#fff', description: '俗称元明粉。', trivia: '常用于制造玻璃和造纸！', points: 30, hazard: HazardType.NONE, icon: IconType.COMPOUND, atomicNumber: 0 },
  
  // --- New Salts for Ionic Reactions ---
  { id: 'Pb(NO3)2', name: '硝酸铅', formula: 'Pb(NO3)2', color: '#e5e7eb', description: '可溶性铅盐。', trivia: '虽然有毒，但它是制造黄色颜料的原料！', points: 55, hazard: HazardType.CORROSIVE, icon: IconType.COMPOUND, atomicNumber: 0 },
  { id: 'KI', name: '碘化钾', formula: 'KI', color: '#fefce8', description: '白色晶体。', trivia: '加碘盐里加的就是它（或碘酸钾）！', points: 35, hazard: HazardType.NONE, icon: IconType.COMPOUND, atomicNumber: 0 },
  { id: 'Na2CO3', name: '碳酸钠', formula: 'Na2CO3', color: '#fff', description: '俗称纯碱。', trivia: '它虽然叫“碱”，但其实是盐！', points: 25, hazard: HazardType.NONE, icon: IconType.COMPOUND, atomicNumber: 0 },
  { id: 'CaCl2', name: '氯化钙', formula: 'CaCl2', color: '#fff', description: '干燥剂原料。', trivia: '下雪天撒在路上融雪用的就是它！', points: 30, hazard: HazardType.NONE, icon: IconType.COMPOUND, atomicNumber: 0 },
  { id: 'FeCl3', name: '氯化铁', formula: 'FeCl3', color: '#b45309', description: '棕黄色溶液。', trivia: '它是印刷电路板的腐蚀剂！', points: 40, hazard: HazardType.CORROSIVE, icon: IconType.COMPOUND, atomicNumber: 0 },
  { id: 'MgCl2', name: '氯化镁', formula: 'MgCl2', color: '#fff', description: '卤水的主要成分。', trivia: '做豆腐点卤用的就是它！', points: 30, hazard: HazardType.NONE, icon: IconType.COMPOUND, atomicNumber: 0 },
  { id: 'NH4Cl', name: '氯化铵', formula: 'NH4Cl', color: '#fff', description: '农业氮肥。', trivia: '受热会分解成两种气体，冷却又结合！', points: 25, hazard: HazardType.NONE, icon: IconType.COMPOUND, atomicNumber: 0 },
  { id: 'CaO', name: '氧化钙', formula: 'CaO', color: '#fff', description: '俗称生石灰。', trivia: '它是自热火锅发热包的主要成分！', points: 20, hazard: HazardType.HOT, icon: IconType.COMPOUND, atomicNumber: 0 },
  { id: 'AlCl3', name: '氯化铝', formula: 'AlCl3', color: '#e2e8f0', description: '白色结晶粉末。', trivia: '用于止汗剂中抑制汗液分泌！', points: 30, hazard: HazardType.NONE, icon: IconType.COMPOUND, atomicNumber: 0 },
  { id: 'NaHCO3', name: '小苏打', formula: 'NaHCO3', color: '#fff', description: '发酵粉主要成分。', trivia: '受热分解产生二氧化碳，让面包蓬松！', points: 20, hazard: HazardType.NONE, icon: IconType.COMPOUND, atomicNumber: 0 },

  // --- Oxidizers, Organic & Special ---
  { id: 'KMnO4', name: '高锰酸钾', formula: 'KMnO4', color: '#86198f', description: '紫黑色固体，强氧化剂。', trivia: '在水中溶解会形成美丽的紫色溶液！', points: 60, hazard: HazardType.CORROSIVE, icon: IconType.COMPOUND, atomicNumber: 0 },
  { id: 'H2O2', name: '双氧水', formula: 'H2O2', color: '#ffffff', description: '强氧化剂，用于消毒。', trivia: '它是大象牙膏实验的关键原料！', points: 40, hazard: HazardType.CORROSIVE, icon: IconType.COMPOUND, atomicNumber: 0 },
  { id: 'HNO3', name: '硝酸', formula: 'HNO3', color: '#fef08a', description: '强酸，腐蚀性极强。', trivia: '见光分解会变黄，也就是“发烟硝酸”！', points: 55, hazard: HazardType.CORROSIVE, icon: IconType.COMPOUND, atomicNumber: 0 },
  { id: 'Fe2O3', name: '氧化铁', formula: 'Fe2O3', color: '#7f1d1d', description: '铁锈的主要成分。', trivia: '虽然是铁锈，但也是铝热反应的原料！', points: 30, hazard: HazardType.NONE, icon: IconType.COMPOUND, atomicNumber: 0 },
  { id: 'C2H5OH', name: '乙醇', formula: 'C2H5OH', color: '#ffffff', description: '俗称酒精。', trivia: '医用酒精浓度是75%哦！', points: 25, hazard: HazardType.EXPLOSIVE, icon: IconType.FLASK, atomicNumber: 0 },
  { id: 'C6H12O6', name: '葡萄糖', formula: 'C6H12O6', color: '#fff', description: '生命能量的来源。', trivia: '银镜反应需要它来还原银离子！', points: 20, hazard: HazardType.NONE, icon: IconType.COMPOUND, atomicNumber: 0 },
  { id: 'C12H22O11', name: '蔗糖', formula: 'C12H22O11', color: '#fff', description: '白糖的主要成分。', trivia: '浓硫酸能把它变成黑面包！', points: 20, hazard: HazardType.NONE, icon: IconType.COMPOUND, atomicNumber: 0 },
  { id: 'KClO3', name: '氯酸钾', formula: 'KClO3', color: '#fff', description: '强氧化剂。', trivia: '用于制造火柴和烟花！', points: 50, hazard: HazardType.EXPLOSIVE, icon: IconType.COMPOUND, atomicNumber: 0 },
];

export const REACTION_RECIPES: ReactionRecipe[] = [
  // --- Synthesis (Combination) ---
  { 
    inputs: [{formula: 'H', count: 1}, {formula: 'Cl', count: 1}], 
    product: 'HCl', 
    productName: '盐酸',
    reactionType: '化合反应',
    phenomenon: '苍白色火焰，瓶口有白雾',
    color: '#fef08a', 
    power: 300, 
    ammoYield: 5,
    equation: 'H₂ + Cl₂ → 2HCl',
    buff: { type: 'SPEED', value: 1.5, duration: 5000 }
  },
  { 
    inputs: [{formula: 'Na', count: 1}, {formula: 'Cl', count: 1}], 
    product: 'NaCl', 
    productName: '氯化钠',
    reactionType: '化合反应',
    phenomenon: '剧烈燃烧，产生大量白烟',
    color: '#ffffff', 
    power: 200, 
    ammoYield: 3,
    equation: '2Na + Cl₂ → 2NaCl'
  },
  { 
    inputs: [{formula: 'H', count: 2}, {formula: 'O', count: 1}], 
    product: 'H2O', 
    productName: '水',
    reactionType: '化合反应',
    phenomenon: '淡蓝色火焰，放出热量',
    color: '#3b82f6', 
    power: 150, 
    ammoYield: 2,
    equation: '2H₂ + O₂ → 2H₂O',
    buff: { type: 'HEAL', value: 20 }
  },
  
  // --- Spectacular Visual Reactions ---
  // Black Bread (Dehydration of Sugar)
  { 
    inputs: [{formula: 'C12H22O11', count: 1}, {formula: 'H2SO4', count: 2}], 
    product: 'C', 
    productName: '黑面包实验', 
    reactionType: '脱水反应', 
    phenomenon: '体积迅速膨胀，生成黑色疏松固体', 
    color: '#1a1a1a', 
    power: 800, 
    ammoYield: 25, 
    equation: 'C₁₂H₂₂O₁₁ (H₂SO₄)→ 12C + 11H₂O',
    buff: { type: 'INVINCIBLE', value: 1, duration: 5000 }
  },
  // Sugar Snake (Pharaoh's Serpent variant)
  { 
    inputs: [{formula: 'C12H22O11', count: 1}, {formula: 'NaHCO3', count: 1}], 
    product: 'C', 
    productName: '法老之蛇', 
    reactionType: '燃烧分解', 
    phenomenon: '燃烧生成巨大的黑色蛇状物', 
    color: '#44403c', 
    power: 700, 
    ammoYield: 20, 
    equation: 'C₁₂H₂₂O₁₁ + 2NaHCO₃ → ...', 
    buff: { type: 'SPEED', value: 2, duration: 4000 }
  },
  // Thermite
  { 
    inputs: [{formula: 'Al', count: 2}, {formula: 'Fe2O3', count: 1}], 
    product: 'Fe', 
    productName: '铝热反应', 
    reactionType: '置换反应', 
    phenomenon: '剧烈燃烧，产生熔融铁水', 
    color: '#ef4444', 
    power: 1000, 
    ammoYield: 30, 
    equation: '2Al + Fe₂O₃ → 2Fe + Al₂O₃', 
    buff: { type: 'INVINCIBLE', value: 1, duration: 8000 } 
  },
  // Permanganate Volcano
  { 
    inputs: [{formula: 'KMnO4', count: 2}, {formula: 'H2O2', count: 3}], 
    product: 'O2', 
    productName: '紫火山', 
    reactionType: '氧化还原', 
    phenomenon: '剧烈反应，产生大量紫色蒸汽', 
    color: '#a21caf', 
    power: 900, 
    ammoYield: 30, 
    equation: '2KMnO₄ + 3H₂O₂ → 2MnO₂ + 3O₂ + 2KOH + 2H₂O' 
  },
  // Silver Mirror
  { 
    inputs: [{formula: 'AgNO3', count: 2}, {formula: 'C6H12O6', count: 1}], 
    product: 'Ag', 
    productName: '银镜反应', 
    reactionType: '氧化还原', 
    phenomenon: '试管壁上附着光亮的银层', 
    color: '#e2e8f0', 
    power: 600, 
    ammoYield: 15, 
    equation: 'R-CHO + 2Ag(NH₃)₂OH → 2Ag↓ + ...' 
  },
  // Elephant Toothpaste (Simplified: H2O2 + KI -> O2)
  { 
    inputs: [{formula: 'H2O2', count: 2}, {formula: 'KI', count: 1}], 
    product: 'O2', 
    productName: '大象牙膏', 
    reactionType: '催化分解', 
    phenomenon: '催化分解，产生巨大泡沫柱', 
    color: '#fff', 
    power: 600, 
    ammoYield: 20, 
    equation: '2H₂O₂ (KI)→ 2H₂O + O₂↑',
    buff: { type: 'SPEED', value: 3, duration: 5000 }
  },
  // Aqua Regia
  { 
    inputs: [{formula: 'HCl', count: 3}, {formula: 'HNO3', count: 1}], 
    product: 'AuCl3', 
    productName: '王水', 
    reactionType: '混合溶解', 
    phenomenon: '能溶解黄金的腐蚀性液体', 
    color: '#f59e0b', 
    power: 1200, 
    ammoYield: 40, 
    equation: 'HNO₃ + 3HCl → NOCl + Cl₂ + 2H₂O' 
  },
  // Explosive Mixture
  { 
    inputs: [{formula: 'KClO3', count: 2}, {formula: 'C', count: 3}], 
    product: 'KCl', 
    productName: '黑火药原料', 
    reactionType: '氧化还原', 
    phenomenon: '剧烈爆炸，火星四射', 
    color: '#000', 
    power: 800, 
    ammoYield: 25, 
    equation: '2KClO₃ + 3C → 2KCl + 3CO₂↑' 
  },
  
  // --- Ionic Reactions ---
  // Golden Rain
  { 
    inputs: [{formula: 'Pb(NO3)2', count: 1}, {formula: 'KI', count: 2}], 
    product: 'PbI2', 
    productName: '碘化铅',
    reactionType: '沉淀反应',
    phenomenon: '生成金黄色亮片状沉淀(黄金雨)',
    color: '#fbbf24', 
    power: 800, 
    ammoYield: 20,
    equation: 'Pb(NO₃)₂ + 2KI → PbI₂↓ + 2KNO₃',
    buff: { type: 'INVINCIBLE', value: 1, duration: 6000 }
  },
  // Calcium Carbonate Precip
  { 
    inputs: [{formula: 'CaCl2', count: 1}, {formula: 'Na2CO3', count: 1}], 
    product: 'CaCO3', 
    productName: '碳酸钙',
    reactionType: '复分解反应',
    phenomenon: '溶液瞬间变浑浊，产生白色沉淀',
    color: '#f3f4f6', 
    power: 350, 
    ammoYield: 8,
    equation: 'CaCl₂ + Na₂CO₃ → CaCO₃↓ + 2NaCl'
  },
  // Ferric Hydroxide
  { 
    inputs: [{formula: 'FeCl3', count: 1}, {formula: 'NaOH', count: 3}], 
    product: 'Fe(OH)3', 
    productName: '氢氧化铁',
    reactionType: '沉淀反应',
    phenomenon: '生成红褐色絮状沉淀',
    color: '#b91c1c', 
    power: 500, 
    ammoYield: 12,
    equation: 'FeCl₃ + 3NaOH → Fe(OH)₃↓ + 3NaCl',
    buff: { type: 'HEAL', value: 40 }
  },
  // Magnesium Hydroxide
  { 
    inputs: [{formula: 'MgCl2', count: 1}, {formula: 'NaOH', count: 2}], 
    product: 'Mg(OH)2', 
    productName: '氢氧化镁',
    reactionType: '沉淀反应',
    phenomenon: '生成白色胶状沉淀',
    color: '#fff', 
    power: 400, 
    ammoYield: 8,
    equation: 'MgCl₂ + 2NaOH → Mg(OH)₂↓ + 2NaCl'
  },
  // Silver Chloride
  { 
    inputs: [{formula: 'AgNO3', count: 1}, {formula: 'NaCl', count: 1}], 
    product: 'AgCl', 
    productName: '氯化银',
    reactionType: '沉淀反应',
    phenomenon: '生成白色凝乳状沉淀，不溶于酸',
    color: '#e5e7eb', 
    power: 450, 
    ammoYield: 10,
    equation: 'AgNO₃ + NaCl → AgCl↓ + NaNO₃'
  },
  // Carbon Dioxide Generation
  { 
    inputs: [{formula: 'Na2CO3', count: 1}, {formula: 'HCl', count: 2}], 
    product: 'CO2', 
    productName: '二氧化碳',
    reactionType: '复分解反应',
    phenomenon: '产生大量无色气泡',
    color: '#d1d5db', 
    power: 300, 
    ammoYield: 15, 
    equation: 'Na₂CO₃ + 2HCl → 2NaCl + H₂O + CO₂↑',
    buff: { type: 'SPEED', value: 2, duration: 3000 }
  },
  // Ammonia Generation
  { 
    inputs: [{formula: 'NH4Cl', count: 1}, {formula: 'NaOH', count: 1}], 
    product: 'NH3', 
    productName: '氨气',
    reactionType: '复分解反应',
    phenomenon: '产生有刺激性气味的气体',
    color: '#bfdbfe', 
    power: 400, 
    ammoYield: 10,
    equation: 'NH₄Cl + NaOH → NaCl + H₂O + NH₃↑'
  },
  // Copper Hydroxide
  { 
    inputs: [{formula: 'CuSO4', count: 1}, {formula: 'NaOH', count: 2}], 
    product: 'Cu(OH)2', 
    productName: '氢氧化铜',
    reactionType: '沉淀反应',
    phenomenon: '生成蓝色絮状沉淀',
    color: '#3b82f6', 
    power: 450, 
    ammoYield: 10,
    equation: 'CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄'
  },
  // Barium Sulfate
  { 
    inputs: [{formula: 'BaCl2', count: 1}, {formula: 'H2SO4', count: 1}], 
    product: 'BaSO4', 
    productName: '硫酸钡',
    reactionType: '沉淀反应',
    phenomenon: '生成既不溶于水也不溶于酸的白色沉淀',
    color: '#fff', 
    power: 550, 
    ammoYield: 12,
    equation: 'BaCl₂ + H₂SO₄ → BaSO₄↓ + 2HCl',
    buff: { type: 'INVINCIBLE', value: 1, duration: 4000 }
  },
  // Calcium Hydroxide
  { 
    inputs: [{formula: 'CaO', count: 1}, {formula: 'H2O', count: 1}], 
    product: 'Ca(OH)2', 
    productName: '氢氧化钙',
    reactionType: '化合反应',
    phenomenon: '放出大量热，水沸腾',
    color: '#fff', 
    power: 300, 
    ammoYield: 6,
    equation: 'CaO + H₂O → Ca(OH)₂'
  },
  // Aluminum Hydroxide
  { 
    inputs: [{formula: 'AlCl3', count: 1}, {formula: 'NaOH', count: 3}], 
    product: 'Al(OH)3', 
    productName: '氢氧化铝',
    reactionType: '沉淀反应',
    phenomenon: '生成白色胶状沉淀',
    color: '#e2e8f0', 
    power: 450, 
    ammoYield: 9,
    equation: 'AlCl₃ + 3NaOH → Al(OH)₃↓ + 3NaCl'
  },
  // Rust Removal
  { 
    inputs: [{formula: 'Fe2O3', count: 1}, {formula: 'HCl', count: 6}], 
    product: 'FeCl3', 
    productName: '除锈反应', 
    reactionType: '复分解反应', 
    phenomenon: '铁锈消失，溶液变黄', 
    color: '#b45309', 
    power: 400, 
    ammoYield: 12, 
    equation: 'Fe₂O₃ + 6HCl → 2FeCl₃ + 3H₂O' 
  },

  // --- Displacement (Legacy) ---
  { 
    inputs: [{formula: 'Fe', count: 1}, {formula: 'CuSO4', count: 1}], 
    product: 'FeSO4', 
    productName: '硫酸亚铁',
    reactionType: '置换反应',
    phenomenon: '铁表面覆盖红色金属，溶液变浅绿',
    color: '#86efac', 
    power: 400, 
    ammoYield: 8,
    equation: 'Fe + CuSO₄ → FeSO₄ + Cu',
    buff: { type: 'HEAL', value: 25 }
  },
  { 
    inputs: [{formula: 'Zn', count: 1}, {formula: 'H2SO4', count: 1}], 
    product: 'ZnSO4', 
    productName: '硫酸锌',
    reactionType: '置换反应',
    phenomenon: '产生大量气泡(氢气)',
    color: '#e4e4e7', 
    power: 350, 
    ammoYield: 10,
    equation: 'Zn + H₂SO₄ → ZnSO₄ + H₂↑'
  },
  { 
    inputs: [{formula: 'Cu', count: 1}, {formula: 'AgNO3', count: 2}], 
    product: 'Cu(NO3)2', 
    productName: '硝酸铜',
    reactionType: '置换反应',
    phenomenon: '铜表面析出银白晶体，溶液变蓝',
    color: '#3b82f6', 
    power: 600, 
    ammoYield: 15,
    equation: 'Cu + 2AgNO₃ → Cu(NO₃)₂ + 2Ag',
    buff: { type: 'SPEED', value: 2, duration: 4000 }
  },
  // --- Dangerous ---
  { 
    inputs: [{formula: 'H', count: 1}, {formula: 'F', count: 1}], 
    product: 'HF', 
    productName: '氟化氢',
    reactionType: '化合反应',
    phenomenon: '冷暗处发生爆炸',
    color: '#fef08a', 
    power: 800, 
    ammoYield: 20,
    equation: 'H₂ + F₂ → 2HF',
    buff: { type: 'SPEED', value: 2.5, duration: 2000 }
  }
];

export const AMMO_PACK_TEMPLATE: GameItem = {
    uniqueId: 'ammo',
    id: 'AMMO',
    name: '弹药包',
    formula: 'AMMO',
    color: '#fbbf24',
    description: '补给弹药',
    points: 0,
    hazard: HazardType.NONE,
    icon: IconType.AMMO_PACK,
    position: {x:0, y:0},
    isCollected: false,
    radius: 20,
    pulseOffset: 0,
    spawnTime: 0
};

export const BOSS_TEMPLATES = [
    { minLevel: 1, name: "疯狂实验兔", color: "#fca5a5", icon: "🐰" },
    { minLevel: 2, name: "绝命毒师·狐", color: "#f97316", icon: "🦊" },
    { minLevel: 3, name: "炼金术士·鸮", color: "#64748b", icon: "🦉" },
    { minLevel: 4, name: "爆破专家·鹰", color: "#92400e", icon: "🦅" },
    { minLevel: 5, name: "辐射变异·熊", color: "#8b5cf6", icon: "🐻" },
    { minLevel: 6, name: "暗黑物质·豹", color: "#facc15", icon: "🐆" },
    { minLevel: 7, name: "元素领主·龙", color: "#ef4444", icon: "🐲" }
];

export const PLAYER_RANKS: Rank[] = [
    { id: 'novice', title: '实验员', minScore: 0, badgeColor: '#94a3b8' },
    { id: 'assistant', title: '助理研究员', minScore: 2000, badgeColor: '#22d3ee' },
    { id: 'researcher', title: '研究员', minScore: 6000, badgeColor: '#4ade80' },
    { id: 'professor', title: '教授', minScore: 15000, badgeColor: '#facc15' },
    { id: 'nobel', title: '诺贝尔奖得主', minScore: 30000, badgeColor: '#f472b6' },
    { id: 'academician', title: '化学院士', minScore: 50000, badgeColor: '#ef4444' }
];

export const THEMES: Theme[] = [
  { id: 'tech', name: '未来实验室', snakeHeadIcon: '💠', backgroundGradient: 'from-slate-900 to-slate-950', gridColor: '#1e293b', primaryColor: '#22d3ee', particleStyle: 'circle' },
  { id: 'nature', name: '有机森林', snakeHeadIcon: '🌿', backgroundGradient: 'from-green-900 to-slate-900', gridColor: '#14532d', primaryColor: '#4ade80', particleStyle: 'square' },
  { id: 'magic', name: '炼金术士', snakeHeadIcon: '🔮', backgroundGradient: 'from-purple-900 to-slate-900', gridColor: '#581c87', primaryColor: '#d8b4fe', particleStyle: 'sparkle' },
  { id: 'fire', name: '烈焰熔炉', snakeHeadIcon: '🔥', backgroundGradient: 'from-red-900 to-slate-900', gridColor: '#7f1d1d', primaryColor: '#fca5a5', particleStyle: 'circle' }
];