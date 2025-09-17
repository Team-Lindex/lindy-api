import { Request, Response } from 'express';
import { createOutfitWithVoice, generateOutfitImage } from '../voltagent';
import logger from '../utils/logger';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for audio file uploads
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only audio files
    const filetypes = /mp3|wav|m4a|ogg|webm/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Error: File upload only supports audio formats (mp3, wav, m4a, ogg, webm)'));
  }
});

// Create temp directory for audio files if it doesn't exist
const tempDir = path.join(__dirname, '../../temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

/**
 * Process voice input to generate an outfit
 * @route POST /api/voice/outfit
 */
export const processVoiceForOutfit = async (req: any, res: Response): Promise<void> => {
  try {
    // Validate request body
    const userId = Number(req.body.userId);
    
    if (isNaN(userId)) {
      res.status(400).json({
        success: false,
        error: 'User ID is required and must be a number'
      });
      return;
    }

    // Check if audio file was uploaded
    if (!req.file || !req.file.buffer) {
      res.status(400).json({
        success: false,
        error: 'Audio file is required'
      });
      return;
    }

    // Process the audio file
    const audioBuffer = req.file.buffer;
    
    // Call the createOutfitWithVoice function
    const { outfit, audioResponse } = await createOutfitWithVoice(userId, audioBuffer);
    
    // Create a temporary file for the audio response
    const fileName = `outfit-response-${Date.now()}.mp3`;
    const filePath = path.join(tempDir, fileName);
    
    // Write the audio buffer to a temporary file
    fs.writeFileSync(filePath, audioResponse);
    
    // Generate an image for the outfit if it doesn't already have one
    let imageUrl = outfit.imageUrl;
    let imageError = outfit.imageError;
    
    if (!imageUrl && outfit.outfit) {
      console.log("Generating outfit image in voice controller");
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
    logger.error(`Error processing voice for outfit: ${error}`);
    res.status(500).json({
      success: false,
      error: 'Error processing your voice request',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
};
