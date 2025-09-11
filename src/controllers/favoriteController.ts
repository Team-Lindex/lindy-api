import { Request, Response } from 'express';
import Favorite from '../models/Favorite';

// Get all favorites
export const getAllFavorites = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const page = parseInt(req.query.page as string) || 1;
    const skip = (page - 1) * limit;

    const favorites = await Favorite.find().skip(skip).limit(limit);
    const total = await Favorite.countDocuments();

    res.status(200).json({
      success: true,
      count: favorites.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      data: favorites,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// Get favorites by customer ID
export const getFavoritesByCustomerId = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerId = parseInt(req.params.customerId);
    const favorites = await Favorite.find({ maskedCustomerId: customerId });

    res.status(200).json({
      success: true,
      count: favorites.length,
      data: favorites,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// Get favorites by variant ID
export const getFavoritesByVariantId = async (req: Request, res: Response): Promise<void> => {
  try {
    const variantId = req.params.variantId;
    const favorites = await Favorite.find({ variantId });

    res.status(200).json({
      success: true,
      count: favorites.length,
      data: favorites,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// Get favorites by date range
export const getFavoritesByDateRange = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      res.status(400).json({
        success: false,
        error: 'Please provide both startDate and endDate',
      });
      return;
    }

    const favorites = await Favorite.find({
      dayDate: {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      },
    });

    res.status(200).json({
      success: true,
      count: favorites.length,
      data: favorites,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};
