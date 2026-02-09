
import { GoogleGenAI, Type } from "@google/genai";
import { IMAGE_GUIDELINES, TEXT_GUIDELINES } from "./GUIDELINES";
import { ModerationResult, SafetyStatus } from "./types";

const ai = new GoogleGenAI({ apiKey: CHANGE_THIS });

export const moderateImage = async (
  imageBase64: string
): Promise<ModerationResult> => {
  const enabledGuidelines = IMAGE_GUIDELINES
    .filter(g => g.enabled)
    .map(g => `${g.name}: ${g.description}`)
    .join('\n');

  const prompt = `
    You are a professional AI Content Moderator for a major social media platform.
    Analyze the provided image against these specific Community Guidelines:
    ${enabledGuidelines}

    Instructions:
    1. Be objective and thorough.
    2. Determine if the image is SAFE, needs a WARNING, or must be BLOCKED.
    3. Assign a safety score (0-100), where 100 is perfectly safe and 0 is extremely hazardous.
    4. Provide a detailed explanation for your decision.
    5. List specific violations if any exist.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: imageBase64.split(',')[1],
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: {
              type: Type.STRING,
              description: 'The overall safety status: SAFE, WARNING, or BLOCKED',
            },
            score: {
              type: Type.NUMBER,
              description: 'Safety score from 0 to 100',
            },
            violations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  severity: { type: Type.STRING, description: 'low, medium, or high' },
                  reason: { type: Type.STRING },
                },
              },
            },
          },
          required: ['status', 'score'],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    return {
      status: result.status as SafetyStatus || SafetyStatus.BLOCKED,
      score: result.score || 0,
      violations: result.violations || [],
    };
  } catch (error) {
    console.error("Moderation Error:", error);
    return {
      status: SafetyStatus.BLOCKED,
      score: 0,
      violations: [],
    };
  }
}

export const moderateText = async (
  message: string
): Promise<ModerationResult> => {
  const enabledGuidelines = TEXT_GUIDELINES
    .filter(g => g.enabled)
    .map(g => `${g.name}: ${g.description}`)
    .join('\n');

  const prompt = `
You are a professional AI Content Moderator for a major social media platform.

Analyze the following user-generated TEXT against these Community Guidelines:
${enabledGuidelines}

Text to analyze:
"""
${message}
"""

Instructions:
1. Be objective and thorough.
2. Determine if the text is SAFE, needs a WARNING, or must be BLOCKED.
3. Assign a safety score (0-100).
4. Provide a clear explanation.
5. List specific violations if any exist.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING },
            score: { type: Type.NUMBER },
            violations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  severity: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
              },
            },
          },
          required: ["status", "score"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");

    return {
      status: result.status as SafetyStatus || SafetyStatus.BLOCKED,
      score: result.score ?? 0,
      violations: result.violations ?? [],
    };
  } catch (error) {
    console.error("Text Moderation Error:", error);
    return {
      status: SafetyStatus.BLOCKED,
      score: 0,
      violations: [],
    };
  }
}

