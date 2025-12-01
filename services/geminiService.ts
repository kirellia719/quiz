import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const getAIClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const GeminiService = {
  chat: async (message: string, base64Image?: string): Promise<string> => {
    try {
      const ai = getAIClient();
      const modelId = 'gemini-3-pro-preview';
      
      const contentParts: any[] = [];
      
      if (base64Image) {
        // Remove data URL prefix if present for clean base64
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
        contentParts.push({
            inlineData: {
                data: base64Data,
                mimeType: "image/png" // Assuming PNG or generic image handling by model
            }
        });
      }

      contentParts.push({ text: message });

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: modelId,
        contents: {
            parts: contentParts
        },
        config: {
            systemInstruction: "You are a helpful AI assistant for an educational quiz platform. You help students understand concepts and help teachers create questions. Keep answers concise.",
        }
      });

      return response.text || "No response generated.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error("Failed to communicate with AI.");
    }
  },

  analyzeImage: async (base64Image: string, prompt: string = "Analyze this image"): Promise<string> => {
    return GeminiService.chat(prompt, base64Image);
  }
};