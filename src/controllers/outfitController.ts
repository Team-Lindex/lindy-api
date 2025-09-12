import { Request, Response } from 'express';
import { createOutfit } from '../voltagent';
import logger from '../utils/logger';
import WardrobeItem from '../models/WardrobeItem';

// Define interface for the request body
interface OutfitRequestBody {
  userId: number;
  occasion: string;
}

/**
 * Generate an outfit for a user based on their wardrobe and occasion
 * @route POST /api/outfit/generate
 */
export const generateOutfit = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const { userId, occasion } = req.body as OutfitRequestBody;
    
    if (!userId || typeof userId !== 'number') {
      res.status(400).json({
        success: false,
        error: 'User ID is required and must be a number'
      });
      return;
    }

    if (!occasion || typeof occasion !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Occasion is required and must be a string'
      });
      return;
    }

    // Check if user has wardrobe items
    const wardrobeItems = await WardrobeItem.find({ userId });
    if (!wardrobeItems || wardrobeItems.length === 0) {
      res.status(404).json({
        success: false,
        error: `No wardrobe items found for user with ID ${userId}. Please add items to the wardrobe first.`
      });
      return;
    }

    // Call the createOutfit function
    const outfit = await createOutfit(userId, occasion);
    
    // Check if the outfit has an error field
    if (outfit.error) {
      logger.warn(`Outfit generation warning: ${outfit.error}`);
      
      // Still return a 200 response, but include the error in the response
      res.status(200).json({
        success: true,
        data: outfit,
        warning: outfit.error
      });
      return;
    }
    
    // Return the successful response
    res.status(200).json({
      success: true,
      data: outfit
    });
  } catch (error) {
    logger.error(`Error generating outfit: ${error}`);
    res.status(500).json({
      success: false,
      error: 'Error processing your outfit request',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
};
