import express from 'express';
import {
  getAllPageViews,
  getPageViewsByCustomerId,
  getPageViewsByProductId,
  getPageViewAnalytics,
} from '../controllers/pageViewController';
import {
  paginationValidation,
  dateRangeValidation,
  customerIdValidation,
  variantIdValidation,
} from '../middleware/validationMiddleware';

const router = express.Router();

// GET /api/page-views - Get all page views (with pagination)
router.get('/', [...paginationValidation, ...dateRangeValidation], getAllPageViews);

// GET /api/page-views/analytics - Get page view analytics
router.get('/analytics', getPageViewAnalytics);

// GET /api/page-views/customer/:customerId - Get page views by customer ID
router.get('/customer/:customerId', [...customerIdValidation, ...paginationValidation], getPageViewsByCustomerId);

// GET /api/page-views/product/:variantId - Get page views by product ID
router.get('/product/:variantId', [...variantIdValidation, ...paginationValidation], getPageViewsByProductId);

export default router;
