import express from 'express';
import {
  getAllWardrobeItems,
  getWardrobeItemsByUserId,
  getWardrobeItemsByType,
  getWardrobeItemsByTag,
  getWardrobeSummaryByUserId,
  updateWardrobeItem
} from '../controllers/wardrobeController';

const router = express.Router();

// GET /api/wardrobe - Get all wardrobe items with pagination
router.get('/', getAllWardrobeItems);

// GET /api/wardrobe/user/:userId - Get wardrobe items by user ID
router.get('/user/:userId', getWardrobeItemsByUserId);

// GET /api/wardrobe/type/:type - Get wardrobe items by type
router.get('/type/:type', getWardrobeItemsByType);

// GET /api/wardrobe/tag/:tag - Get wardrobe items by tag
router.get('/tag/:tag', getWardrobeItemsByTag);

// GET /api/wardrobe/summary/:userId - Get wardrobe summary by user ID
router.get('/summary/:userId', getWardrobeSummaryByUserId);

// PUT /api/wardrobe/:id - Update a wardrobe item by ID
router.put('/:id', updateWardrobeItem);

export default router;
