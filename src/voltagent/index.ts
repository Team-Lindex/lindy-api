import { VoltAgent, Agent, Memory, Tool } from "@voltagent/core";
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

export const generateOutfitImage = async (outfit: any) => {
  console.log("Generating outfit image")
  console.log(outfit)

  const baseImage = "http://static1.squarespace.com/static/6128356161ec0a73d5d20b72/640b94750d178579a47a7be2/640b94870d178579a47a9119/1678480519448/line-of-movement.jpg?format=original"
//"https://i8.amplience.net/i/Lindex/3003139_80_PS_MF/menstrosa-med-medium-absorption-hog-midja-female-engineering?w=1200&h=1600&fmt=auto&qlt=90&fmt.jp2.qlt=50&sm=c"
      const imageRequest = 
        {
          base_image_url: baseImage,
          item_image_urls: [outfit.outfit.top.imageUrl, outfit.outfit.bottom.imageUrl, outfit.outfit.accessory.imageUrl],
          item_categories: [
            "top", "bottom", "accessory"
          ]
        }

        console.log(imageRequest)
  
      console.log("requesting image");
       const imageResponse = await axios.post('http://157.180.68.116:8000/generate-style', imageRequest);

       const filename = `outfit-image-${Date.now()}.png`;

       outfit.imageResponse = imageResponse.data;
       fs.writeFileSync(`temp/${filename}`, imageResponse.data.generated_image, "base64");
  
  return {url: `temp/${filename}`}
}

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
  
I will provide you with a list of wardrobe items and an occasion. Your task is to:
1. Select appropriate items for the occasion, including at minimum:
   - A top item (type contains "top", tags contains provided occasion)
   - A bottom item (type contains "bottoms", tags contains provided occasion) or a dress (type contains "dress", tags contains provided occasion)
   - An accessory item (type contains "accessory", tags contains provided occasion)
   - Optionally add a jacket (type contains "jacket", tags contains provided occasion) or bag (type contains "bag", tags contains provided occasion) if appropriate

   Be strict when selecting jackets and accessories, if you can not find a matching item by looking at the tags, return an empty object for that item.

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
  model: openai("gpt-4o-mini"),
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
    console.log("Fetching wardrobe items for user")
    const wardrobeItems = await WardrobeItem.find({ userId });
    console.log("Wardrobe items fetched for user", wardrobeItems);

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
        return outfitData
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
