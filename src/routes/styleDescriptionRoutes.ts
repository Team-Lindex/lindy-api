import express from 'express';
import {
  getAllStyleDescriptions,
  getStyleDescriptionById,
  getStyleDescriptionByName,
  searchStyleDescriptions,
} from '../controllers/styleDescriptionController';

const router = express.Router();

// GET /api/styles - Get all style descriptions
router.get('/', getAllStyleDescriptions);

// GET /api/styles/search?keyword=value - Search style descriptions by keyword
router.get('/search', searchStyleDescriptions);

// GET /api/styles/:id - Get style description by ID
router.get('/id/:id', getStyleDescriptionById);

// GET /api/styles/:style - Get style description by style name
router.get('/:style', getStyleDescriptionByName);

export default router;
