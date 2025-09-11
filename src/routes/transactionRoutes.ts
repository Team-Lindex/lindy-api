import express from 'express';
import {
  getAllTransactions,
  getTransactionsByCustomerId,
  getTransactionsByVariantId,
  getTransactionsByDateRange,
  getTransactionsByProductGroup,
  getProductGroupAnalytics,
  getCustomerPurchaseAnalytics,
  getSalesTrends,
} from '../controllers/transactionController';
import {
  paginationValidation,
  dateRangeValidation,
  customerIdValidation,
  variantIdValidation,
  productGroupValidation,
  salesTrendsPeriodValidation,
} from '../middleware/validationMiddleware';

const router = express.Router();

// GET /api/transactions - Get all transactions (with pagination)
router.get('/', paginationValidation, getAllTransactions);

// GET /api/transactions/date?startDate=value&endDate=value - Get transactions by date range
router.get('/date', dateRangeValidation, getTransactionsByDateRange);

// GET /api/transactions/customer/:customerId - Get transactions by customer ID
router.get('/customer/:customerId', customerIdValidation, getTransactionsByCustomerId);

// GET /api/transactions/product/:variantId - Get transactions by variant ID
router.get('/product/:variantId', variantIdValidation, getTransactionsByVariantId);

// GET /api/transactions/group/:productGroup - Get transactions by product group
router.get('/group/:productGroup', productGroupValidation, getTransactionsByProductGroup);

// GET /api/transactions/analytics/product-groups - Get product group sales analytics
router.get('/analytics/product-groups', dateRangeValidation, getProductGroupAnalytics);

// GET /api/transactions/analytics/customer-purchases - Get customer purchase analytics
router.get('/analytics/customer-purchases', paginationValidation, getCustomerPurchaseAnalytics);

// GET /api/transactions/analytics/sales-trends - Get sales trends by time period
router.get('/analytics/sales-trends', [...dateRangeValidation, ...salesTrendsPeriodValidation], getSalesTrends);

export default router;
