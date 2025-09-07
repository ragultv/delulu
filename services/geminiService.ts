// Fix: Removed unused Modality import.
import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { ComicPanelData } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const panelGenerationSystemInstruction = `You are a children’s comic creator assistant. Your job is to take a short script and transform it into a sequence of comic panels with consistent characters and scenes.

**CRITICAL RULE: Character and scene consistency is the most important goal.** The characters and background MUST look identical in every panel, unless the script explicitly states a change.

Follow these steps precisely:
1.  **Define Core Visuals (ONCE):** Before processing any panels, you must first establish a single, definitive, and detailed visual description for each character and the main scene.
    *   Example Character Definition: "Gigi is a young girl with curly brown hair in pigtails, wearing blue-and-white striped pajamas with a red superhero cape."
    *   Example Scene Definition: "A grassy hill at night. The background is a dark blue sky full of twinkling stars and a friendly crescent moon. The lighting and camera angle should remain consistent."
2.  **Break the Story into Panels:** A new panel should be created for each conversational exchange (typically 2 lines of dialogue).
3.  **Generate JSON for each Panel:** You must output structured JSON. Each object in the JSON array represents a panel. For each panel:
    *   You are **FORBIDDEN** from changing the core visual definitions from step 1. You MUST use the **exact same scene and character descriptions** in the prompt for every single panel. Do not improvise or alter them.
    *   The STYLE must always be: "children’s comic, colorful, playful, funny, safe".
    *   Create a detailed \`image_generation_prompt\`. This prompt is critical and MUST combine:
        *   **MANDATORY: "Create a perfect square image (1:1 aspect ratio) with equal width and height dimensions."**
        *   The required STYLE.
        *   The **consistent scene description** from step 1 (including notes on lighting/angle).
        *   The **consistent character descriptions** from step 1 for every character present in the panel.
        *   A description of the characters' specific actions, expressions, and locations in the panel (e.g., 'Gigi is on the left, pointing up excitedly. Bobo is on the right, looking amazed.').
        *   Instructions for speech balloons for each line of dialogue, pointing to the correct character. Example: "Add a speech balloon for Gigi saying 'Wow, a shooting star!'".
        *   **MANDATORY: "Ensure perfectly square format (1:1 ratio) with no cropping of important elements."**

Your final output must be ONLY the JSON array, with no explanations, markdown formatting, or any other text. The JSON object for each panel must include:
   - panel: a number for the panel order.
   - scene: the consistent scene string.
   - style: the consistent style string.
   - dialogues: an array of objects for the dialogue in that panel.
   - image_generation_prompt: the detailed, combined string prompt.`;

const responseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      panel: {
        type: Type.INTEGER,
        description: "The panel number, starting from 1."
      },
      scene: {
        type: Type.STRING,
        description: "A vivid, kid-friendly description of the scene."
      },
      style: {
        type: Type.STRING,
        description: "The art style, which should always be 'children’s comic, colorful, playful, funny, safe'."
      },
      dialogues: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            character: { type: Type.STRING },
            text: { type: Type.STRING }
          },
          required: ["character", "text"]
        }
      },
      image_generation_prompt: {
        type: Type.STRING,
        description: "A detailed visual prompt for an image generation model. It must include scene, style, characters, and instructions for speech balloons with the exact dialogue text."
      }
    },
    required: ["panel", "scene", "style", "dialogues", "image_generation_prompt"]
  }
};


export const generateComicPanels = async (script: string): Promise<ComicPanelData[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: script,
      config: {
        systemInstruction: panelGenerationSystemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsedData = JSON.parse(jsonText);
    
    // Basic validation
    if (!Array.isArray(parsedData)) {
      throw new Error("Invalid response format: expected an array of panels.");
    }
    
    return parsedData as ComicPanelData[];

  } catch (error) {
    console.error("Error generating comic panels:", error);
    throw new Error("Failed to parse comic panel data from the API.");
  }
};


export const generateChatResponse = async (userMessage: string): Promise<string> => {
  try {
    const chatSystemInstruction = `You are a friendly AI assistant for a comic generator app. Your role is to:
1. Acknowledge user's comic script requests enthusiastically
2. Provide helpful guidance on comic script formatting
3. Explain what you'll do when generating comics
4. Be encouraging and creative

When a user sends a comic script, respond naturally as if you're about to generate their comic. Keep responses concise and friendly.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userMessage,
      config: {
        systemInstruction: chatSystemInstruction,
      },
    });

    return response.text.trim();

  } catch (error) {
    console.error("Error generating chat response:", error);
    throw new Error("Failed to generate chat response from the API.");
  }
};

// Fix: Add missing `generateChatResponseStream` function to support streaming chat.
export const generateChatResponseStream = async function* (userMessage: string): AsyncGenerator<string> {
  try {
    const chatSystemInstruction = `You are a friendly AI assistant for a comic generator app. Your role is to:
1. Acknowledge user's comic script requests enthusiastically
2. Provide helpful guidance on comic script formatting
3. Explain what you'll do when generating comics
4. Be encouraging and creative

When a user sends a comic script, respond naturally as if you're about to generate their comic. Keep responses concise and friendly.`;

    const response = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: userMessage,
      config: {
        systemInstruction: chatSystemInstruction,
      },
    });

    for await (const chunk of response) {
      yield chunk.text;
    }

  } catch (error) {
    console.error("Error generating streaming chat response:", error);
    throw new Error("Failed to generate streaming chat response from the API.");
  }
};

// Fix: Using `generateImages` with `imagen-4.0-generate-001` for image generation from a text prompt, as per the guidelines.
export const generatePanelImage = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
          parts: [
            { text: prompt }
          ]
        },
        config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });
    
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        const mimeType = part.inlineData.mimeType;
        return `data:${mimeType};base64,${base64ImageBytes}`;
      }
    }
    
    throw new Error("No image was generated.");

  } catch (error) {
     console.error("Error generating image:", error);
     throw new Error("Failed to generate image from the API.");
  }
};