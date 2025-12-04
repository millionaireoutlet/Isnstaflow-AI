import { GoogleGenAI, Type } from "@google/genai";
import { PostMetadata, AnalysisResult } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

export const extractPostInfo = async (url: string): Promise<PostMetadata> => {
  const ai = getClient();
  
  // We use the search tool to find information about the public URL since we can't scrape it directly client-side.
  const model = "gemini-2.5-flash";
  
  const prompt = `
    I have an Instagram URL: ${url}.
    Please use Google Search to find details about this specific post.
    I need:
    1. The caption text (or a summary of it).
    2. The author's username.
    3. A description of the visual content if mentioned in search snippets.
    4. Any hashtags used.
    
    Return the data in a clean JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            caption: { type: Type.STRING },
            author: { type: Type.STRING },
            description: { type: Type.STRING },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as PostMetadata;
  } catch (error) {
    console.error("Gemini Search Error:", error);
    // Fallback if search fails or is blocked
    return {
      description: "Could not retrieve live data. The post might be private or very new.",
      author: "Unknown"
    };
  }
};

export const analyzeUploadedMedia = async (file: File): Promise<AnalysisResult> => {
  const ai = getClient();
  const model = "gemini-2.5-flash"; // Good for multimodal

  // Convert file to base64
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = result.split(',')[1]; 
        resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const prompt = `
    Analyze this social media content.
    Provide:
    1. A short engaging summary.
    2. The sentiment (Positive, Neutral, Negative).
    3. 5 viral hashtags relevant to this content.
    4. 3 creative ideas for a caption or follow-up content.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { mimeType: file.type, data: base64Data } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          sentiment: { type: Type.STRING, enum: ['Positive', 'Neutral', 'Negative'] },
          suggestedHashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
          contentIdeas: { type: Type.ARRAY, items: { type: Type.STRING } },
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Analysis failed");
  return JSON.parse(text) as AnalysisResult;
};
