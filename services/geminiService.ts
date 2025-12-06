
import { GoogleGenAI, Type } from "@google/genai";
import { Chemical, HazardType, IconType } from '../types';
import { FALLBACK_CHEMICALS } from '../constants';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

// Helper to get a random subset of fallback data to make offline levels feel varied
const getFallbackData = (level: number) => {
  // Shuffle the fallback list
  const shuffled = [...FALLBACK_CHEMICALS].sort(() => 0.5 - Math.random());
  
  // Select a subset based on level. 
  // Level 1: 20 items. Level 10: 40 items.
  const count = Math.min(20 + level * 2, shuffled.length);
  return shuffled.slice(0, count);
};

export const generateGameData = async (level: number, playerStats: Record<string, number> = {}): Promise<Chemical[]> => {
  const ai = getAiClient();
  
  if (!ai) {
    console.warn("No API Key found. Using offline mode.");
    return getFallbackData(level);
  }

  // --- Dynamic Difficulty Logic ---
  let scope = "";
  let hazardProfile = "";
  let compoundFocus = "";
  
  if (level === 1) {
    scope = "仅限前20号元素 (H-Ca)。适合新手。";
    hazardProfile = "无危险性 (HazardType.NONE)。";
    compoundFocus = "不生成化合物。";
  } else if (level <= 3) {
    scope = "主族元素 + 常见过渡金属 (Fe, Cu, Zn)。";
    hazardProfile = "引入少量易爆物品 (HazardType.EXPLOSIVE)，如碱金属。";
    compoundFocus = "包含常见生活化合物 (H2O, NaCl, CO2)。";
  } else if (level <= 6) {
    scope = "全周期表常见元素。";
    hazardProfile = "增加腐蚀性 (CORROSIVE) 和 易爆性。";
    compoundFocus = "包含酸碱盐 (H2SO4, NaOH, CaCO3) 和氧化物。";
  } else {
    scope = "全周期表，包含稀土 (Lanthanides) 和 放射性元素 (Actinides)。";
    hazardProfile = "高危险性！大量放射性 (RADIOACTIVE), 高温 (HOT), 剧毒/腐蚀。";
    compoundFocus = "复杂的有机/无机化合物 (C6H12O6, KMnO4, TNT等)。";
  }

  // Adaptive Bias
  const totalCollected = Object.values(playerStats).reduce((a, b) => a + b, 0);
  let adaptiveInstruction = "";

  if (totalCollected > 0) {
     const compoundCount = playerStats[IconType.COMPOUND] || 0;
     const metalCount = (playerStats[IconType.TRANSITION_METAL] || 0) + (playerStats[IconType.ALKALI_METAL] || 0);
     
     if (level >= 4 && (compoundCount / totalCollected) < 0.2) {
         adaptiveInstruction += " 玩家收集的化合物较少，请本关额外生成 5-8 个不同的化合物 (IconType.COMPOUND)。";
     }
     
     if ((metalCount / totalCollected) > 0.5) {
         adaptiveInstruction += " 玩家已经收集了很多金属，本关请多生成非金属 (NON_METAL) 和 卤素 (HALOGEN)。";
     }
  }

  const prompt = `
    作为游戏策划，请为第 ${level} 关生成 20-25 个化学物品数据。
    
    难度配置:
    - 元素范围: ${scope}
    - 危险程度: ${hazardProfile}
    - 化合物要求: ${compoundFocus}
    - 动态调整: ${adaptiveInstruction}

    数据规范:
    1. **id**: 唯一字符串 (e.g. "L${level}-Na")。
    2. **name**: 中文名称 (e.g. "硫酸")。
    3. **formula**: 化学式 (e.g. "H₂SO₄")。
    4. **color**: 代表颜色 (Hex String)。
    5. **description**: 有趣的简短科普描述 (小学生易懂)。
    6. **trivia**: 一个非常有趣的冷知识 (不超过2句话，例如"它能让声音变尖！")。
    7. **points**: 分数 (10-500)，越稀有/危险分数越高。
    8. **hazard**: 必须是以下之一 [${Object.values(HazardType).join(', ')}]。
    9. **icon**: 必须是以下之一 [${Object.values(IconType).join(', ')}]。
       - 化合物必须设为 COMPOUND。
    10. **atomicNumber**: 元素填原子序数，化合物填 0。

    请以 JSON 数组格式返回。
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              formula: { type: Type.STRING },
              color: { type: Type.STRING },
              description: { type: Type.STRING },
              trivia: { type: Type.STRING },
              points: { type: Type.INTEGER },
              hazard: { type: Type.STRING, enum: Object.values(HazardType) },
              icon: { type: Type.STRING, enum: Object.values(IconType) },
              atomicNumber: { type: Type.INTEGER }
            },
            required: ["id", "name", "formula", "color", "description", "trivia", "points", "hazard", "icon"],
          },
        },
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text) as Chemical[];
      return data;
    }
    
    return getFallbackData(level);
  } catch (error: any) {
    // Specifically handle Permission (403) and Quota (429) errors gracefully
    if (error.status === 403 || error.code === 403 || 
        error.status === 429 || error.code === 429 ||
        (error.message && (error.message.includes('permission') || error.message.includes('quota') || error.message.includes('RESOURCE_EXHAUSTED')))) {
        console.warn(`Gemini API Error (${error.status || error.code}). Using Offline Mode.`);
    } else {
        console.error("Gemini API Error:", error);
    }
    return getFallbackData(level);
  }
};
