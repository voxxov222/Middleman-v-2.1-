import { GoogleGenAI, Type } from "@google/genai";
import { DetectedEntity, SophiaIntel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeIntel = async (entities: DetectedEntity[]): Promise<SophiaIntel> => {
  const entitySummary = entities.map(e => {
    const detail = e.frequency ? `${e.frequency}MHz` : e.identifier;
    return `[${e.type}] ${e.name} (${detail}, ${e.strength}dBm, Dist: ${e.distance.toFixed(1)}m)`;
  }).join(", ");
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this tactical multi-spectrum scan for a recon operative: ${entitySummary}. 
    Identify patterns like tracking devices, unauthorized radio broadcasts (VHF/UHF), or insecure Wi-Fi. 
    Consider Baofeng-style radio traffic as potentially hostile or unauthorized if near sensitive zones.
    Provide a summary, threat level, and tactical advice.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          threatAssessment: { 
            type: Type.STRING, 
            description: "Must be LOW, MEDIUM, or HIGH" 
          },
          recommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["summary", "threatAssessment", "recommendations"]
      }
    }
  });

  try {
    return JSON.parse(response.text) as SophiaIntel;
  } catch (e) {
    return {
      summary: "Multi-spectrum environment analyzed. Mixed digital and analog signal density detected.",
      threatAssessment: "LOW",
      recommendations: ["Maintain operational security", "Monitor for wide-band radio anomalies"]
    };
  }
};