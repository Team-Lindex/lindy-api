import { Request, Response } from 'express';
import { createOutfitWithText, generateOutfitImage, testOutfitAgent } from '../voltagent';
import logger from '../utils/logger';
import path from 'path';
import fs from 'fs';
import axios from 'axios';

// Create temp directory for audio files if it doesn't exist
const tempDir = path.join(__dirname, '../../temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

/**
 * Process text input to generate an outfit with audio response
 * @route POST /api/voice/text-outfit
 */
export const processTextForOutfit = async (req: any, res: Response): Promise<void> => {
  console.log("requesting outfit");
  try {
    // Validate request body
    const { userId, question } = req.body;
    
    if (!userId || isNaN(Number(userId))) {
      res.status(400).json({
        success: false,
        error: 'User ID is required and must be a number'
      });
      return;
    }

    if (!question || typeof question !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Question text is required'
      });
      return;
    }

    // Call the createOutfitWithText function
    const { outfit, audioResponse } = await createOutfitWithText(Number(userId), question);
    
    // Create a temporary file for the audio response
    const fileName = `outfit-response-${Date.now()}.mp3`;
    const filePath = path.join(tempDir, fileName);
    
    // Write the audio buffer to a temporary file
    fs.writeFileSync(filePath, audioResponse);
    
    // Generate an image for the outfit if it doesn't already have one
    let imageUrl = outfit.imageUrl;
    let imageError = outfit.imageError;
    
    if (!imageUrl && outfit.outfit) {
      console.log("Generating outfit image in controller");
      const imageResponse = await generateOutfitImage(outfit);
      
      if (imageResponse.success && imageResponse.url) {
        imageUrl = imageResponse.url;
      } else {
        imageError = imageResponse.error;
      }
    }
    
    // Return the outfit data, image URL, and audio file path
    res.status(200).json({
      success: true,
      data: {
        outfit: outfit.outfit,
        imageUrl,
        imageError,
        audioUrl: `/temp/${fileName}`
      }
    });
    
  } catch (error) {
    logger.error(`Error processing text for outfit: ${error}`);
    res.status(500).json({
      success: false,
      error: 'Error processing your outfit request',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
};


export const processTextForOutfitTest = async (req: any, res: Response): Promise<void> => {
  console.log("requesting outfit test");

  const result = await testOutfitAgent();

  res.status(200).json({
    success: true,
    data: result
  });
  
};

export const mockController = async (req: any, res: Response): Promise<void> => {
  console.log("requesting outfit");

  const outfits = [
    { imageUrl: "https://lindy-api.martinsson.io/temp/image1.png"},
    { imageUrl: "https://lindy-api.martinsson.io/temp/image2.png"},
    { imageUrl: "https://lindy-api.martinsson.io/temp/image3.png"},
  ]

  res.status(200).json({
    success: true,
    data: outfits
  });
}
  
