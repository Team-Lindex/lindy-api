import express from 'express';
import {
  getAllStyleImages,
  getStyleImagesByStyle,
  getAllStylesWithImagesAndDescriptions,
} from '../controllers/styleImageController';

const router = express.Router();

// GET /api/style-images - Get all style images
router.get('/', getAllStyleImages);

// GET /api/style-images/all - Get all styles with images and descriptions
router.get('/all', getAllStylesWithImagesAndDescriptions);

// GET /api/style-images/:style - Get style images by style name
router.get('/:style', getStyleImagesByStyle);

export default router;
