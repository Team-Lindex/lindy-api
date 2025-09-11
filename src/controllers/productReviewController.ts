import { Request, Response } from 'express';
import ProductReview from '../models/ProductReview';
import Product from '../models/Product';
import cacheManager from '../utils/cacheManager';
import logger from '../utils/logger';

// Get all product reviews with pagination and filtering
export const getAllProductReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const page = parseInt(req.query.page as string) || 1;
    const skip = (page - 1) * limit;
    const sortField = (req.query.sortField as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 1 : -1;
    
    // Build filter object based on query parameters
    const filter: any = {};
    
    // Filter by variant ID
    if (req.query.variantId) {
      filter.variantId = req.query.variantId;
    }
    
    // Filter by minimum score
    if (req.query.minScore) {
      filter.score = { $gte: parseInt(req.query.minScore as string) };
    }
    
    // Filter by maximum score
    if (req.query.maxScore) {
      if (filter.score) {
        filter.score.$lte = parseInt(req.query.maxScore as string);
      } else {
        filter.score = { $lte: parseInt(req.query.maxScore as string) };
      }
    }

    const reviews = await ProductReview.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit);
      
    const total = await ProductReview.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: reviews.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      filters: Object.keys(filter).length > 0 ? filter : 'None',
      data: reviews,
    });
  } catch (error) {
    logger.error(`Error fetching product reviews: ${error}`);
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// Get product reviews by product ID
export const getProductReviewsByProductId = async (req: Request, res: Response): Promise<void> => {
  try {
    const variantId = req.params.variantId;
    const cacheKey = `product_reviews_${variantId}`;
    
    // Try to get from cache or fetch from database
    const result = await cacheManager.getOrSet(
      cacheKey,
      async () => {
        logger.info(`Cache miss for ${cacheKey}, fetching from database`);
        
        const reviews = await ProductReview.find({ variantId }).sort({ createdAt: -1 });
        const product = await Product.findOne({ variantId });
        
        // Calculate average score
        const totalScore = reviews.reduce((sum, review) => sum + review.score, 0);
        const averageScore = reviews.length > 0 ? totalScore / reviews.length : 0;
        
        // Calculate score distribution
        const scoreDistribution = {
          5: reviews.filter(review => review.score === 5).length,
          4: reviews.filter(review => review.score === 4).length,
          3: reviews.filter(review => review.score === 3).length,
          2: reviews.filter(review => review.score === 2).length,
          1: reviews.filter(review => review.score === 1).length,
        };
        
        return {
          product,
          reviews,
          stats: {
            totalReviews: reviews.length,
            averageScore: parseFloat(averageScore.toFixed(1)),
            scoreDistribution
          }
        };
      },
      600 // Cache for 10 minutes
    );

    res.status(200).json({
      success: true,
      data: result,
      fromCache: true
    });
  } catch (error) {
    logger.error(`Error fetching product reviews by product ID: ${error}`);
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// Get top rated products
export const getTopRatedProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const minReviews = parseInt(req.query.minReviews as string) || 3;
    const cacheKey = `top_rated_products_limit${limit}_minReviews${minReviews}`;
    
    // Try to get from cache or generate new analytics
    const topRated = await cacheManager.getOrSet(
      cacheKey,
      async () => {
        logger.info(`Cache miss for ${cacheKey}, generating top rated products`);
        
        // Aggregate to get average scores and review counts
        const productRatings = await ProductReview.aggregate([
          { $group: { 
            _id: '$variantId', 
            averageScore: { $avg: '$score' },
            reviewCount: { $sum: 1 }
          }},
          { $match: { reviewCount: { $gte: minReviews } } },
          { $sort: { averageScore: -1, reviewCount: -1 } },
          { $limit: limit }
        ]);
        
        // Get product details for the top rated products
        const productIds = productRatings.map(item => item._id);
        const products = await Product.find({ variantId: { $in: productIds } });
        
        // Merge product details with ratings
        return productRatings.map(item => {
          const product = products.find(p => p.variantId === item._id);
          return {
            variantId: item._id,
            averageScore: parseFloat(item.averageScore.toFixed(1)),
            reviewCount: item.reviewCount,
            productDetails: product || null
          };
        });
      },
      1800 // Cache for 30 minutes
    );

    res.status(200).json({
      success: true,
      count: topRated.length,
      data: topRated,
      fromCache: true
    });
  } catch (error) {
    logger.error(`Error generating top rated products: ${error}`);
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};
