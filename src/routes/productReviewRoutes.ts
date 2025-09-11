import express from 'express';
import {
  getAllProductReviews,
  getProductReviewsByProductId,
  getTopRatedProducts,
} from '../controllers/productReviewController';
import {
  paginationValidation,
  variantIdValidation,
} from '../middleware/validationMiddleware';

const router = express.Router();

// GET /api/reviews - Get all product reviews (with pagination)
router.get('/', paginationValidation, getAllProductReviews);

// GET /api/reviews/top-rated - Get top rated products
router.get('/top-rated', paginationValidation, getTopRatedProducts);

// GET /api/reviews/product/:variantId - Get reviews by product ID
router.get('/product/:variantId', variantIdValidation, getProductReviewsByProductId);

export default router;
