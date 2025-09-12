import { VoltAgent, Agent, Memory, Tool } from "@voltagent/core";
import { honoServer } from "@voltagent/server-hono"; // HTTP server
import { LibSQLMemoryAdapter } from "@voltagent/libsql"; // For persistent memory
import { openai } from "@ai-sdk/openai"; // Example model
import { createPinoLogger } from "@voltagent/logger";
import { z } from "zod";
import WardrobeItem from "../models/WardrobeItem";

// Create logger (optional but recommended)
const logger = createPinoLogger({
  name: "my-agent",
  level: "info",
});

// Define a simple agent
export const agent = new Agent({
  name: "my-agent",
  instructions: "A helpful assistant that answers questions without using tools",
  // VoltAgent uses ai-sdk directly - pick any ai-sdk model
  model: openai("gpt-4o"),
  // Optional: Add persistent memory (remove this to use default in-memory storage)
  memory: new Memory({
    storage: new LibSQLMemoryAdapter({
      url: "file:./.voltagent/memory.db",
    }),
  }),
});

// Define a simplified approach without using tools
// We'll fetch the wardrobe items directly in the createOutfit function
// This avoids potential data cloning issues with the Tool approach

export const outfitAgent = new Agent({
  name: "outfit-agent",
  instructions: `You are an outfit creation assistant. Your job is to create outfits for users based on their wardrobe and the occasion they specify.
  
I will provide you with a list of wardrobe items and an occasion. Your task is to:
1. Select appropriate items for the occasion, including at minimum:
   - A top item (type contains "top")
   - A bottom item (type contains "bottoms") or a dress (type contains "dress")
   - An accessory item (type contains "accessory")
   - Optionally add a jacket (type contains "jacket") or bag (type contains "bag") if appropriate
2. Return your selections in JSON format with the following structure:
   {
     "outfit": {
       "top": { "id": "item-id", "imageUrl": "url", "type": "type" },
       "bottom": { "id": "item-id", "imageUrl": "url", "type": "type" } OR "dress": { "id": "item-id", "imageUrl": "url", "type": "type" },
       "accessory": { "id": "item-id", "imageUrl": "url", "type": "type" },
       "jacket": { "id": "item-id", "imageUrl": "url", "type": "type" } (optional),
       "bag": { "id": "item-id", "imageUrl": "url", "type": "type" } (optional)
     },
     "occasion": "the occasion",
     "description": "brief description of why these items work well together"
   }

If the user doesn't have appropriate items for the occasion, suggest what they might need to purchase.
Always return a valid JSON response.`,
  model: openai("gpt-4o"),
  memory: new Memory({
    storage: new LibSQLMemoryAdapter({
      url: "file:./.voltagent/memory.db",
    }),
  }),
});

export const askAgent = async (question: string) => {
  console.log(question);
  return await agent.generateText(question);
};

export const createOutfit = async (userId: number, occasion: string) => {
  console.log(`Creating outfit for user ${userId} for occasion: ${occasion}`);
  
  try {
    // Fetch wardrobe items directly
    const wardrobeItems = await WardrobeItem.find({ userId });
    
    // Convert to a simplified format to avoid data cloning issues
    const simplifiedItems = wardrobeItems.map(item => ({
      id: item._id ? item._id.toString() : '',
      imageUrl: item.imageUrl || '',
      type: item.type || ''
    }));
    
    // Create a prompt with the wardrobe items included
    const prompt = `
I need an outfit for a ${occasion}.

Here are the available wardrobe items:
${JSON.stringify(simplifiedItems, null, 2)}

Please create an outfit using these items that would be appropriate for the occasion.
`;
    
    // Use generateText to get a response from the agent
    const result = await outfitAgent.generateText(prompt);
    
    // Extract text content from the result
    let responseText = '';
    if (result && typeof result === 'object' && result.content && Array.isArray(result.content) && result.content.length > 0) {
      const firstContent = result.content[0];
      if (typeof firstContent === 'object' && firstContent !== null && 'text' in firstContent) {
        responseText = String(firstContent.text);
      }
    }
    
    if (!responseText) {
      return {
        outfit: {},
        occasion: occasion,
        description: "Could not generate outfit response",
        error: "Empty response from AI"
      };
    }
    
    // Extract JSON from the response text
    try {
      // First, try to extract JSON from markdown code blocks
      const markdownJsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      
      if (markdownJsonMatch && markdownJsonMatch[1]) {
        // Found JSON in markdown code block
        const jsonStr = markdownJsonMatch[1].trim();
        const outfitData = JSON.parse(jsonStr);
        return outfitData;
      }
      
      // If no markdown code block, try to find raw JSON
      const jsonMatch = responseText.match(/\{[\s\S]*?\}(?=\s*$|$)/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const outfitData = JSON.parse(jsonStr);
        return outfitData;
      }
      
      // If no JSON found, create a structured response with the text
      return {
        outfit: {},
        occasion: occasion,
        description: responseText,
        error: "No valid JSON found in response"
      };
    } catch (jsonError) {
      console.error("Error parsing outfit JSON:", jsonError);
      return {
        outfit: {},
        occasion: occasion,
        description: responseText,
        error: "Failed to parse JSON response"
      };
    }
  } catch (error) {
    console.error("Error generating outfit:", error);
    return {
      outfit: {},
      occasion: occasion,
      description: "An error occurred while generating the outfit.",
      error: String(error)
    };
  }
};
