import express from 'express';
import {
  getAllProducts,
  getProductByVariantId,
  searchProducts,
} from '../controllers/productController';

const router = express.Router();

// GET /api/products - Get all products (with pagination)
router.get('/', getAllProducts);

// GET /api/products/search?query=value - Search products by description
router.get('/search', searchProducts);

// GET /api/products/:variantId - Get product by variant ID
router.get('/:variantId', getProductByVariantId);

export default router;
