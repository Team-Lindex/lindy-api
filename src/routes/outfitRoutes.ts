import express from 'express';
import { generateOutfit } from '../controllers/outfitController';

const router = express.Router();

// POST /api/outfit/generate - Generate an outfit for a user based on their wardrobe and occasion
router.post('/generate', generateOutfit);

export default router;
