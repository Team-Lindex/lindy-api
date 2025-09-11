import express from 'express';
import {
  getAllFavorites,
  getFavoritesByCustomerId,
  getFavoritesByVariantId,
  getFavoritesByDateRange,
} from '../controllers/favoriteController';

const router = express.Router();

// GET /api/favorites - Get all favorites (with pagination)
router.get('/', getAllFavorites);

// GET /api/favorites/date?startDate=value&endDate=value - Get favorites by date range
router.get('/date', getFavoritesByDateRange);

// GET /api/favorites/customer/:customerId - Get favorites by customer ID
router.get('/customer/:customerId', getFavoritesByCustomerId);

// GET /api/favorites/product/:variantId - Get favorites by variant ID
router.get('/product/:variantId', getFavoritesByVariantId);

export default router;
