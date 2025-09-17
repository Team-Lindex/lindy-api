import { VoltAgent, Agent, Memory, Tool, createTool } from "@voltagent/core";
import { honoServer } from "@voltagent/server-hono"; // HTTP server
import { LibSQLMemoryAdapter } from "@voltagent/libsql"; // For persistent memory
import { openai } from "@ai-sdk/openai"; // Example model
import { createPinoLogger } from "@voltagent/logger";
import { z } from "zod";
import WardrobeItem from "../models/WardrobeItem";
import { OpenAIVoiceProvider } from "@voltagent/voice";

import fs from "fs";

// Create logger (optional but recommended)
const logger = createPinoLogger({
  name: "my-agent",
  level: "info",
});

export const generateOutfitImage = async (input: any) => {
  try {
    console.log("Generating outfit image");
    
    // Handle both direct outfit object and args.outfit structure
    let outfit: any;
    
    if (input.outfit) {
      // If input has an outfit property, use that (from tool args)
      outfit = input.outfit;
      console.log("Using outfit from args.outfit");
    } else {
      // Otherwise assume the input itself is the outfit
      outfit = input;
      console.log("Using direct outfit object");
    }
    
    console.log("Outfit data:", JSON.stringify(outfit, null, 2));
    
    // Validate the outfit object structure
    if (!outfit || !outfit.outfit) {
      throw new Error("Invalid outfit object structure: missing outfit property");
    }
    
    const baseImage = "http://static1.squarespace.com/static/6128356161ec0a73d5d20b72/640b94750d178579a47a7be2/640b94870d178579a47a9119/1678480519448/line-of-movement.jpg?format=original";
    
    // Collect available image URLs with null checks
    const imageUrls = [];
    const itemCategories = [];
    
    // Check for top
    if (outfit.outfit.top && outfit.outfit.top.imageUrl) {
      imageUrls.push(outfit.outfit.top.imageUrl);
      itemCategories.push("top");
    }
    
    // Check for bottom
    if (outfit.outfit.bottom && outfit.outfit.bottom.imageUrl) {
      imageUrls.push(outfit.outfit.bottom.imageUrl);
      itemCategories.push("bottom");
    }
    
    // Check for accessory
    if (outfit.outfit.accessory && outfit.outfit.accessory.imageUrl) {
      imageUrls.push(outfit.outfit.accessory.imageUrl);
      itemCategories.push("accessory");
    }
    
    // Check if we have enough items to generate an image
    if (imageUrls.length < 2) {
      throw new Error("Not enough items with valid image URLs to generate an outfit image");
    }
    
    const imageRequest = {
      base_image_url: baseImage,
      item_image_urls: imageUrls,
      item_categories: itemCategories
    };
    
    console.log("Image request:", JSON.stringify(imageRequest, null, 2));
    console.log("Requesting image from API");
    
    const imageResponse = await axios.post('http://157.180.68.116:8000/generate-style', imageRequest);
    
    const filename = `outfit-image-${Date.now()}.png`;
    
    // Don't modify the original outfit object
    fs.writeFileSync(`temp/${filename}`, imageResponse.data.generated_image, "base64");
    
    return {
      url: `temp/${filename}`,
      success: true
    };
  } catch (error) {
    console.error("Error generating outfit image:", error);
    return {
      url: null,
      success: false,
      error: String(error)
    };
  }
}

const generatorTool = createTool({
  name: "generateOutfitImage",
  description: "Generate an image for an outfit based on the provided outfit data",
  parameters: z.object({
    outfit: z.any().describe("The outfit data object containing top, bottom, and accessory items with imageUrls"),
  }),
  execute: async (args) => {
    console.log("HERE 😀")
    console.log(args)
    try {
      // Call the generateOutfitImage function with the provided outfit data
      const result = await generateOutfitImage(args);
      
      // Check if the image generation was successful
      if (!result.success) {
        console.log("Image generation failed:", result.error);
        return {
          url: null,
          success: false,
          error: result.error
        };
      }
      
      return {
        url: result.url,
        success: true
      };
    } catch (error) {
      console.error("Error in generateOutfitImage tool:", error);
      return {
        url: null,
        success: false,
        error: String(error)
      };
    }
  },
});

const wardrobeTool = createTool({
  name: "getUserWardrobe",
  description: "Fetch a user's wardrobe items based on their user ID",
  parameters: z.object({
    userId: z.number().describe("The user ID to fetch wardrobe items for"),
  }),
  execute: async (args) => {
    try {
      // Fetch wardrobe items for the specified user ID
      console.log(`Fetching wardrobe items for user ${args.userId}`);
      
      // Use lean() to get plain JavaScript objects instead of Mongoose documents
      const wardrobeItems = await WardrobeItem.find({ userId: args.userId }).lean();
      
      // Convert to a simplified format with only the necessary properties
      // and ensure all values are serializable
      const simplifiedItems = wardrobeItems.map(item => {
        // Convert MongoDB ObjectId to string
        const id = item._id ? item._id.toString() : '';
        
        return {
          id,
          imageUrl: item.imageUrl || '',
          type: item.type || '',
          tags: Array.isArray(item.tags) ? [...item.tags] : [] // Create a new array to ensure it's serializable
        };
      });
      
      // Return a plain object with serializable properties
      return {
        items: simplifiedItems,
        count: simplifiedItems.length,
        message: `Found ${simplifiedItems.length} wardrobe items for user ${args.userId}`
      };
    } catch (error) {
      console.error("Error in getUserWardrobe tool:", error);
      throw new Error(`Failed to fetch wardrobe items: ${error}`);
    }
  },
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

const openAIVoice = new OpenAIVoiceProvider({
  apiKey: process.env.OPENAI_API_KEY || '', // Ensure API key is set in environment variables
  ttsModel: "tts-1",
  voice: "alloy", // Available voices: alloy, echo, fable, onyx, nova, shimmer
});

// Define a simplified approach without using tools
// We'll fetch the wardrobe items directly in the createOutfit function
// This avoids potential data cloning issues with the Tool approach

export const outfitAgent = new Agent({
  name: "outfit-agent",
  instructions: `You are an outfit creation assistant. Your job is to create outfits for users based on their wardrobe and the occasion they specify.
  
You have access to the following tools:
- getUserWardrobe: Use this tool to fetch a user's wardrobe items by providing their user ID
- generateOutfitImage: Use this tool to generate an image for an outfit based on the outfit data

When provided with a user ID and an occasion, your task is to:

1. Use the getUserWardrobe tool to fetch the user's wardrobe items if they are not already provided

2. Select appropriate items for the occasion, including at minimum:
   - A top item (type contains "top", tags contains provided occasion)
   - A bottom item (type contains "bottoms", tags contains provided occasion) or a dress (type contains "dress", tags contains provided occasion)
   - An accessory item (type contains "accessory", tags contains provided occasion)
   - Optionally add a jacket (type contains "jacket", tags contains provided occasion) or bag (type contains "bag", tags contains provided occasion) if appropriate

   Be strict when selecting jackets and accessories, if you can not find a matching item by looking at the tags, return an empty object for that item.

3. Return your selections in JSON format with the following structure:
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

4. After creating the outfit, use the generateOutfitImage tool to generate an image for the outfit. You have to provide the JSON outfit data as a parameter to the tool.

5. Always return the response as valid JSON with this structure: {
outfits: [
  imageUrl: "the url to the generated image",
  outfit: "the outfit data"
]

}

Always return a valid JSON response.`,
  model: openai("gpt-4o-mini"),
  memory: new Memory({
    storage: new LibSQLMemoryAdapter({
      url: "file:./.voltagent/memory.db",
    }),
  }),
  tools: [generatorTool, wardrobeTool], // Register tools with the outfitAgent
});

export const askAgent = async (question: string) => {
  console.log(question);
  return await agent.generateText(question);
};

export const testOutfitAgent = async () => {
  const prompt = `
I need you to create an outfit for user with ID 1 for a business meeting.

Please follow these steps:
1. Use the getUserWardrobe tool to fetch the user's wardrobe items
2. Select appropriate items for the occasion from the wardrobe
3. Return a complete outfit with at least a top, bottom (or dress), and accessory
4. Use the generateOutfitImage tool to generate an image for the outfit
5. Make sure to explain why the outfit works well for the occasion

Your response must include valid JSON with the structure:
{
  "outfits": [
    {
      "imageUrl": "url to generated image",
      "outfit": { /* outfit data with top, bottom, accessory, etc. */ }
    }
  ]
}
`;

  console.log("Sending prompt to outfit agent:", prompt);
  const result = await outfitAgent.generateText(prompt);
  console.log("Got result from outfit agent");
  return result;
};

// Define the type for wardrobe tool response
interface WardrobeToolResponse {
  items: Array<{
    id: string;
    imageUrl: string;
    type: string;
    tags: string[];
  }>;
  count: number;
  message: string;
}

export const createOutfit = async (userId: number, occasion: string) => {
  console.log(`Creating outfit for user ${userId} for occasion: ${occasion}`);

  try {
    // Create a prompt that instructs the agent to use the tools
    const prompt = `
I need you to create an outfit for user with ID ${userId} for a ${occasion}.

Please follow these steps:
1. Use the getUserWardrobe tool to fetch the user's wardrobe items
2. Select appropriate items for the occasion from the wardrobe
3. Return a complete outfit with at least a top, bottom (or dress), and accessory
4. Use the generateOutfitImage tool to generate an image for the outfit
5. Make sure to explain why the outfit works well for the occasion

Include the image URL in your response if the image generation is successful.
`;

    // Use generateText to get a response from the agent
    const result = await outfitAgent.generateText(prompt);
    console.log(result)

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
      let outfitData;

      if (markdownJsonMatch && markdownJsonMatch[1]) {
        // Found JSON in markdown code block
        const jsonStr = markdownJsonMatch[1].trim();
        outfitData = JSON.parse(jsonStr);
      } else {
        // If no markdown code block, try to find raw JSON
        const jsonMatch = responseText.match(/\{[\s\S]*?\}(?=\s*$|$)/);
        if (jsonMatch) {
          const jsonStr = jsonMatch[0];
          outfitData = JSON.parse(jsonStr);
        } else {
          // If no JSON found, create a structured response with the text
          return {
            outfit: {},
            occasion: occasion,
            description: responseText,
            error: "No valid JSON found in response"
          };
        }
      }

      // The agent will handle image generation using the tools
      // If the agent didn't generate an image, we'll do it here as a fallback
      if (outfitData && outfitData.outfit && 
          ((outfitData.outfit.top && outfitData.outfit.bottom) || outfitData.outfit.dress) && 
          outfitData.outfit.accessory && 
          !outfitData.imageUrl) {
        
        console.log("Generating outfit image as fallback");
        const imageResult = await generateOutfitImage(outfitData);
        
        if (imageResult.success && imageResult.url) {
          outfitData.imageUrl = imageResult.url;
        } else {
          console.log("Fallback image generation failed:", imageResult.error);
          outfitData.imageError = imageResult.error || "Unknown error during image generation";
        }
      }
      
      return outfitData;
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

// Import the stream module properly
import { Readable } from 'stream';
import axios from "axios";

// Voice transcription function - converts audio to text
export const transcribeAudio = async (audioBuffer: Buffer): Promise<string> => {
  try {
    // Create a readable stream from the buffer
    const audioStream = new Readable();
    audioStream.push(audioBuffer);
    audioStream.push(null); // Signal the end of the stream

    // Use the OpenAI voice provider to transcribe the audio
    const transcription = await openAIVoice.listen(audioStream);
    return transcription as string;
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw new Error(`Failed to transcribe audio: ${error}`);
  }
};

// Text-to-speech function - converts text to audio
export const textToSpeech = async (text: string): Promise<Buffer> => {
  try {
    // Use the OpenAI voice provider to generate speech
    const audioStream = await openAIVoice.speak(text);

    // Convert the stream to a buffer
    return streamToBuffer(audioStream);
  } catch (error) {
    console.error("Error generating speech:", error);
    throw new Error(`Failed to generate speech: ${error}`);
  }
};

// Helper function to convert a ReadableStream to a Buffer
async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];

    stream.on('data', (chunk) => {
      chunks.push(Buffer.from(chunk));
    });

    stream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });

    stream.on('error', (err) => {
      reject(err);
    });
  });
}

// Text-based outfit creation function with audio response
export const createOutfitWithText = async (userId: number, questionText: string): Promise<{ outfit: any, audioResponse: Buffer }> => {
  try {
    // Extract the occasion from the text
    // This is a simple implementation - in a real app, you might want to use NLP to extract the occasion
    const occasion = questionText.replace(/^.*?for\s+(?:a|an)\s+(.+?)(?:\.|$)/i, '$1').trim();

    // Generate the outfit using the existing function
    const outfitResponse = await createOutfit(userId, occasion);

    // Create a spoken response
    let responseText = "";
    if (outfitResponse.error && !outfitResponse.outfit) {
      responseText = `I'm sorry, I couldn't create an outfit for ${occasion}. ${outfitResponse.error}`;
    } else {
      responseText = `For your ${occasion}, I recommend an outfit with `;

      if (outfitResponse.outfit.top) {
        responseText += `a ${outfitResponse.outfit.top.type} for your top, `;
      }

      if (outfitResponse.outfit.bottom) {
        responseText += `${outfitResponse.outfit.bottom.type} for your bottom, `;
      } else if (outfitResponse.outfit.dress) {
        responseText += `a ${outfitResponse.outfit.dress.type}, `;
      }

      if (outfitResponse.outfit.accessory) {
        responseText += `and a ${outfitResponse.outfit.accessory.type} as an accessory. `;
      }

      if (outfitResponse.outfit.jacket) {
        responseText += `Don't forget to add a ${outfitResponse.outfit.jacket.type}. `;
      }

      if (outfitResponse.outfit.bag) {
        responseText += `Complete the look with a ${outfitResponse.outfit.bag.type}. `;
      }

      if (outfitResponse.description) {
        responseText += outfitResponse.description;
      }
    }

    // Convert the text response to speech
    const audioResponse = await textToSpeech(responseText);

    // Return both the outfit data and the audio response
    return {
      outfit: outfitResponse,
      audioResponse
    };
  } catch (error) {
    console.error("Error in text-based outfit creation:", error);
    throw new Error(`Failed to process text request: ${error}`);
  }
};

// Voice-based outfit creation function
export const createOutfitWithVoice = async (userId: number, audioBuffer: Buffer): Promise<{ outfit: any, audioResponse: Buffer }> => {
  try {
    // Step 1: Transcribe the audio to text
    const transcription = await transcribeAudio(audioBuffer);

    // Step 2: Extract the occasion from the transcription
    // This is a simple implementation - in a real app, you might want to use NLP to extract the occasion
    const occasion = transcription.replace(/^.*?for\s+(?:a|an)\s+(.+?)(?:\.|$)/i, '$1').trim();

    // Step 3: Generate the outfit using the existing function
    const outfitResponse = await createOutfit(userId, occasion);

    // Step 4: Create a spoken response
    let responseText = "";
    if (outfitResponse.error && !outfitResponse.outfit) {
      responseText = `I'm sorry, I couldn't create an outfit for ${occasion}. ${outfitResponse.error}`;
    } else {
      responseText = `For your ${occasion}, I recommend an outfit with `;

      if (outfitResponse.outfit.top) {
        responseText += `a ${outfitResponse.outfit.top.type} for your top, `;
      }

      if (outfitResponse.outfit.bottom) {
        responseText += `${outfitResponse.outfit.bottom.type} for your bottom, `;
      } else if (outfitResponse.outfit.dress) {
        responseText += `a ${outfitResponse.outfit.dress.type}, `;
      }

      if (outfitResponse.outfit.accessory) {
        responseText += `and a ${outfitResponse.outfit.accessory.type} as an accessory. `;
      }

      if (outfitResponse.outfit.jacket) {
        responseText += `Don't forget to add a ${outfitResponse.outfit.jacket.type}. `;
      }

      if (outfitResponse.outfit.bag) {
        responseText += `Complete the look with a ${outfitResponse.outfit.bag.type}. `;
      }

      if (outfitResponse.description) {
        responseText += outfitResponse.description;
      }
    }

    // Step 5: Convert the text response to speech
    const audioResponse = await textToSpeech(responseText);

    // Return both the outfit data and the audio response
    return {
      outfit: outfitResponse,
      audioResponse
    };
  } catch (error) {
    console.error("Error in voice-based outfit creation:", error);
    throw new Error(`Failed to process voice request: ${error}`);
  }
};
