import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult, ResourceType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeContent = async (
  title: string,
  contentRaw: string,
  type: ResourceType
): Promise<AIAnalysisResult> => {
  const modelId = "gemini-2.5-flash";

  const prompt = `
    You are an expert knowledge curator helping a user organize their digital library.
    Analyze the following content metadata.
    
    Type: ${type}
    Title: ${title}
    Content/Description: ${contentRaw}

    Please provide:
    1. A concise summary (max 2 sentences) capturing the core value.
    2. A list of 3-5 relevant tags (keywords) for categorization.

    IMPORTANT: Please respond in Simplified Chinese (简体中文).

    Return the result in strict JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "A short, insightful summary of the content in Simplified Chinese.",
            },
            suggestedTags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of relevant tags in Simplified Chinese.",
            },
          },
          required: ["summary", "suggestedTags"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini");
    }

    const result = JSON.parse(text) as AIAnalysisResult;
    return result;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback if AI fails
    return {
      summary: "暂时无法生成摘要。",
      suggestedTags: ["未分类"],
    };
  }
};