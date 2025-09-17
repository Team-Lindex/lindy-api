import { Request, Response } from 'express';
import WardrobeItem from '../models/WardrobeItem';
import cacheManager from '../utils/cacheManager';
import logger from '../utils/logger';
import mongoose from 'mongoose';

// Get all wardrobe items with pagination
export const getAllWardrobeItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const total = await WardrobeItem.countDocuments();
    const wardrobeItems = await WardrobeItem.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: wardrobeItems.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: wardrobeItems
    });
  } catch (error) {
    logger.error(`Error fetching wardrobe items: ${error}`);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get wardrobe items by user ID
export const getWardrobeItemsByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid user ID format'
      });
      return;
    }

    const cacheKey = `wardrobe_user_${userId}`;

    // Try to get from cache or fetch from database
    const wardrobeItems = await cacheManager.getOrSet(
      cacheKey,
      async () => {
        logger.info(`Cache miss for ${cacheKey}, fetching from database`);
        return await WardrobeItem.find({ userId });
      },
      300 // Cache for 5 minutes
    );

    // Return empty array instead of 404 when no items are found
    res.status(200).json({
      success: true,
      count: wardrobeItems ? wardrobeItems.length : 0,
      data: wardrobeItems || [],
      fromCache: true
    });
  } catch (error) {
    logger.error(`Error fetching wardrobe items by user ID: ${error}`);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get wardrobe items by type
export const getWardrobeItemsByType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type } = req.params;
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;

    const query: any = { type };
    if (userId !== undefined && !isNaN(userId)) {
      query.userId = userId;
    }

    const cacheKey = `wardrobe_type_${type}${userId !== undefined ? `_user_${userId}` : ''}`;

    // Try to get from cache or fetch from database
    const wardrobeItems = await cacheManager.getOrSet(
      cacheKey,
      async () => {
        logger.info(`Cache miss for ${cacheKey}, fetching from database`);
        return await WardrobeItem.find(query);
      },
      300 // Cache for 5 minutes
    );

    if (!wardrobeItems || wardrobeItems.length === 0) {
      res.status(404).json({
        success: false,
        error: `No wardrobe items found of type: ${type}`
      });
      return;
    }

    res.status(200).json({
      success: true,
      count: wardrobeItems.length,
      data: wardrobeItems,
      fromCache: true
    });
  } catch (error) {
    logger.error(`Error fetching wardrobe items by type: ${error}`);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get wardrobe items by tag
export const getWardrobeItemsByTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tag } = req.params;
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;

    const query: any = { tags: tag };
    if (userId !== undefined && !isNaN(userId)) {
      query.userId = userId;
    }

    const wardrobeItems = await WardrobeItem.find(query);

    if (!wardrobeItems || wardrobeItems.length === 0) {
      res.status(404).json({
        success: false,
        error: `No wardrobe items found with tag: ${tag}`
      });
      return;
    }

    res.status(200).json({
      success: true,
      count: wardrobeItems.length,
      data: wardrobeItems
    });
  } catch (error) {
    logger.error(`Error fetching wardrobe items by tag: ${error}`);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get wardrobe summary by user ID
export const getWardrobeSummaryByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid user ID format'
      });
      return;
    }

    const cacheKey = `wardrobe_summary_user_${userId}`;

    // Try to get from cache or fetch from database
    const summary = await cacheManager.getOrSet(
      cacheKey,
      async () => {
        logger.info(`Cache miss for ${cacheKey}, fetching from database`);

        // Get count by type
        const typeCounts = await WardrobeItem.aggregate([
          { $match: { userId } },
          { $group: { _id: '$type', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]);

        // Get all tags
        const tagsResult = await WardrobeItem.aggregate([
          { $match: { userId } },
          { $unwind: '$tags' },
          { $group: { _id: '$tags', count: { $sum: 1 } } },
          { $match: { _id: { $ne: '' } } },
          { $sort: { count: -1 } }
        ]);

        const totalItems = await WardrobeItem.countDocuments({ userId });

        return {
          totalItems,
          typeBreakdown: typeCounts.map(item => ({
            type: item._id,
            count: item.count,
            percentage: Math.round((item.count / totalItems) * 100)
          })),
          tags: tagsResult.map(tag => ({
            tag: tag._id,
            count: tag.count
          }))
        };
      },
      600 // Cache for 10 minutes
    );

    if (!summary || summary.totalItems === 0) {
      res.status(404).json({
        success: false,
        error: 'No wardrobe items found for this user'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: summary,
      fromCache: true
    });
  } catch (error) {
    logger.error(`Error fetching wardrobe summary by user ID: ${error}`);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Update wardrobe item by ID
export const updateWardrobeItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid item ID format'
      });
      return;
    }

    const { userId, imageUrl, type, tags } = req.body;

    // Build update object with only provided fields
    const updateData: any = {};
    if (userId !== undefined) updateData.userId = userId;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (type !== undefined) updateData.type = type;
    if (tags !== undefined) updateData.tags = tags;

    // Check if update data is empty
    if (Object.keys(updateData).length === 0) {
      res.status(400).json({
        success: false,
        error: 'No update data provided'
      });
      return;
    }

    // Find and update the wardrobe item
    const updatedItem = await WardrobeItem.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      res.status(404).json({
        success: false,
        error: 'Wardrobe item not found'
      });
      return;
    }

    // Clear related cache entries
    if (updatedItem.userId) {
      cacheManager.delete(`wardrobe_user_${updatedItem.userId}`);
      cacheManager.delete(`wardrobe_summary_user_${updatedItem.userId}`);
    }
    if (updatedItem.type) {
      cacheManager.delete(`wardrobe_type_${updatedItem.type}`);
    }
    
    // Return the updated item
    res.status(200).json({
      success: true,
      data: updatedItem
    });
  } catch (error) {
    logger.error(`Error updating wardrobe item: ${error}`);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
