import { Request, Response } from 'express';
import PageView from '../models/PageView';
import Product from '../models/Product';
import cacheManager from '../utils/cacheManager';
import logger from '../utils/logger';

// Get all page views with pagination and filtering
export const getAllPageViews = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const page = parseInt(req.query.page as string) || 1;
    const skip = (page - 1) * limit;
    
    // Build filter object based on query parameters
    const filter: any = {};
    
    // Filter by customer ID
    if (req.query.customerId) {
      filter.maskedCustomerId = parseInt(req.query.customerId as string);
    }
    
    // Filter by variant ID
    if (req.query.variantId) {
      filter.variantId = req.query.variantId;
    }
    
    // Date range filter
    if (req.query.startDate && req.query.endDate) {
      filter.dayDate = {
        $gte: new Date(req.query.startDate as string),
        $lte: new Date(req.query.endDate as string),
      };
    } else if (req.query.startDate) {
      filter.dayDate = { $gte: new Date(req.query.startDate as string) };
    } else if (req.query.endDate) {
      filter.dayDate = { $lte: new Date(req.query.endDate as string) };
    }

    const pageViews = await PageView.find(filter)
      .sort({ dayDate: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await PageView.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: pageViews.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      filters: Object.keys(filter).length > 0 ? filter : 'None',
      data: pageViews,
    });
  } catch (error) {
    logger.error(`Error fetching page views: ${error}`);
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// Get page views by customer ID
export const getPageViewsByCustomerId = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerId = parseInt(req.params.customerId);
    const limit = parseInt(req.query.limit as string) || 50;
    const page = parseInt(req.query.page as string) || 1;
    const skip = (page - 1) * limit;
    
    const pageViews = await PageView.find({ maskedCustomerId: customerId })
      .sort({ dayDate: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await PageView.countDocuments({ maskedCustomerId: customerId });

    res.status(200).json({
      success: true,
      count: pageViews.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      data: pageViews,
    });
  } catch (error) {
    logger.error(`Error fetching page views by customer ID: ${error}`);
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// Get page views by product ID
export const getPageViewsByProductId = async (req: Request, res: Response): Promise<void> => {
  try {
    const variantId = req.params.variantId;
    const limit = parseInt(req.query.limit as string) || 50;
    const page = parseInt(req.query.page as string) || 1;
    const skip = (page - 1) * limit;
    
    const pageViews = await PageView.find({ variantId })
      .sort({ dayDate: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await PageView.countDocuments({ variantId });

    res.status(200).json({
      success: true,
      count: pageViews.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      data: pageViews,
    });
  } catch (error) {
    logger.error(`Error fetching page views by product ID: ${error}`);
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// Get page view analytics
export const getPageViewAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const cacheKey = 'page_view_analytics';
    
    // Try to get from cache or generate new analytics
    const analytics = await cacheManager.getOrSet(
      cacheKey,
      async () => {
        logger.info(`Cache miss for ${cacheKey}, generating analytics`);
        
        // Get most viewed products
        const mostViewedProducts = await PageView.aggregate([
          { $group: { _id: '$variantId', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ]);
        
        // Get product details for the most viewed products
        const productIds = mostViewedProducts.map(item => item._id);
        const products = await Product.find({ variantId: { $in: productIds } });
        
        // Merge product details with view counts
        const productsWithViewCounts = mostViewedProducts.map(item => {
          const product = products.find(p => p.variantId === item._id);
          return {
            variantId: item._id,
            viewCount: item.count,
            productDetails: product || null
          };
        });
        
        // Get view counts by date
        const viewsByDate = await PageView.aggregate([
          { $group: { 
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$dayDate' } },
            count: { $sum: 1 }
          }},
          { $sort: { _id: -1 } },
          { $limit: 30 }
        ]);
        
        return {
          mostViewedProducts: productsWithViewCounts,
          viewsByDate
        };
      },
      1800 // Cache for 30 minutes
    );

    res.status(200).json({
      success: true,
      data: analytics,
      fromCache: true
    });
  } catch (error) {
    logger.error(`Error generating page view analytics: ${error}`);
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};
