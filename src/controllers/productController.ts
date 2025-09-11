import { Request, Response } from 'express';
import Product from '../models/Product';
import cacheManager from '../utils/cacheManager';
import logger from '../utils/logger';

// Get all products with caching
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const page = parseInt(req.query.page as string) || 1;
    const skip = (page - 1) * limit;
    
    // Create a cache key based on pagination parameters
    const cacheKey = `products_page${page}_limit${limit}`;
    
    // Try to get from cache or fetch from database
    const result = await cacheManager.getOrSet(
      cacheKey,
      async () => {
        logger.info(`Cache miss for ${cacheKey}, fetching from database`);
        const products = await Product.find().skip(skip).limit(limit);
        const total = await Product.countDocuments();
        
        return {
          products,
          total,
          pagination: {
            total,
            page,
            pages: Math.ceil(total / limit),
          },
        };
      },
      300 // Cache for 5 minutes
    );

    res.status(200).json({
      success: true,
      count: result.products.length,
      pagination: result.pagination,
      data: result.products,
      fromCache: true,
    });
  } catch (error) {
    logger.error(`Error fetching products: ${error}`);
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// Get single product by variant ID with caching
export const getProductByVariantId = async (req: Request, res: Response): Promise<void> => {
  try {
    const variantId = req.params.variantId;
    const cacheKey = `product_${variantId}`;
    
    // Try to get from cache or fetch from database
    const product = await cacheManager.getOrSet(
      cacheKey,
      async () => {
        logger.info(`Cache miss for ${cacheKey}, fetching from database`);
        return await Product.findOne({ variantId });
      },
      600 // Cache for 10 minutes
    );

    if (!product) {
      res.status(404).json({
        success: false,
        error: 'Product not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
      fromCache: true,
    });
  } catch (error) {
    logger.error(`Error fetching product by variantId: ${error}`);
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// Search products by description
export const searchProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.query;
    
    if (!query) {
      res.status(400).json({
        success: false,
        error: 'Please provide a search query',
      });
      return;
    }

    const products = await Product.find({
      $or: [
        { productDescSE: { $regex: query, $options: 'i' } },
        { productDescEN: { $regex: query, $options: 'i' } },
      ],
    });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};
