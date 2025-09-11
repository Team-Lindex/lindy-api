import { Request, Response } from 'express';
import StyleDescription from '../models/StyleDescription';

// Get all style descriptions
export const getAllStyleDescriptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const styleDescriptions = await StyleDescription.find();
    res.status(200).json({
      success: true,
      count: styleDescriptions.length,
      data: styleDescriptions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// Get single style description by ID
export const getStyleDescriptionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const styleDescription = await StyleDescription.findById(req.params.id);

    if (!styleDescription) {
      res.status(404).json({
        success: false,
        error: 'Style description not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: styleDescription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// Get style description by style name
export const getStyleDescriptionByName = async (req: Request, res: Response): Promise<void> => {
  try {
    const styleDescription = await StyleDescription.findOne({ style: req.params.style });

    if (!styleDescription) {
      res.status(404).json({
        success: false,
        error: 'Style description not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: styleDescription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// Search style descriptions by keywords
export const searchStyleDescriptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { keyword } = req.query;
    
    if (!keyword) {
      res.status(400).json({
        success: false,
        error: 'Please provide a keyword to search',
      });
      return;
    }

    const styleDescriptions = await StyleDescription.find({
      styleKeywords: { $regex: keyword, $options: 'i' },
    });

    res.status(200).json({
      success: true,
      count: styleDescriptions.length,
      data: styleDescriptions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};
