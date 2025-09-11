import { Request, Response } from 'express';
import StyleImage from '../models/StyleImage';
import StyleDescription from '../models/StyleDescription';
import cacheManager from '../utils/cacheManager';
import logger from '../utils/logger';

// Get all style images
export const getAllStyleImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const styleImages = await StyleImage.find();

    res.status(200).json({
      success: true,
      count: styleImages.length,
      data: styleImages,
    });
  } catch (error) {
    logger.error(`Error fetching style images: ${error}`);
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// Get style images by style name
export const getStyleImagesByStyle = async (req: Request, res: Response): Promise<void> => {
  try {
    const style = req.params.style;
    const cacheKey = `style_images_${style}`;
    
    // Try to get from cache or fetch from database
    const result = await cacheManager.getOrSet(
      cacheKey,
      async () => {
        logger.info(`Cache miss for ${cacheKey}, fetching from database`);
        
        const styleImage = await StyleImage.findOne({ style });
        const styleDescription = await StyleDescription.findOne({ style });
        
        if (!styleImage) {
          return null;
        }
        
        return {
          styleImage,
          styleDescription
        };
      },
      600 // Cache for 10 minutes
    );
    
    if (!result) {
      res.status(404).json({
        success: false,
        error: 'Style images not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: result,
      fromCache: true
    });
  } catch (error) {
    logger.error(`Error fetching style images by style: ${error}`);
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// Get all styles with images and descriptions
export const getAllStylesWithImagesAndDescriptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const cacheKey = 'all_styles_with_images_and_descriptions';
    
    // Try to get from cache or fetch from database
    const result = await cacheManager.getOrSet(
      cacheKey,
      async () => {
        logger.info(`Cache miss for ${cacheKey}, fetching from database`);
        
        const styles = await StyleDescription.find().sort({ style: 1 });
        const styleImages = await StyleImage.find();
        
        // Create a map of style images by style name for quick lookup
        const styleImagesMap = styleImages.reduce((map, styleImage) => {
          map[styleImage.style] = styleImage.images;
          return map;
        }, {} as Record<string, string[]>);
        
        // Combine style descriptions with images
        const stylesWithImages = styles.map(style => ({
          style: style.style,
          description: style.styleDescription,
          keywords: style.styleKeywords,
          images: styleImagesMap[style.style] || []
        }));
        
        return stylesWithImages;
      },
      1800 // Cache for 30 minutes
    );

    res.status(200).json({
      success: true,
      count: result.length,
      data: result,
      fromCache: true
    });
  } catch (error) {
    logger.error(`Error fetching styles with images and descriptions: ${error}`);
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};
