import express from 'express';
import {
  getPersonalizedRecommendations,
  getTrendingProducts,
  getSimilarProducts,
} from '../controllers/recommendationController';
import {
  customerIdValidation,
  variantIdValidation,
  paginationValidation,
} from '../middleware/validationMiddleware';

const router = express.Router();

// GET /api/recommendations/customer/:customerId - Get personalized recommendations for a customer
router.get('/customer/:customerId', customerIdValidation, getPersonalizedRecommendations);

// GET /api/recommendations/trending - Get trending products
router.get('/trending', paginationValidation, getTrendingProducts);

// GET /api/recommendations/similar/:variantId - Get similar products
router.get('/similar/:variantId', variantIdValidation, getSimilarProducts);

export default router;
