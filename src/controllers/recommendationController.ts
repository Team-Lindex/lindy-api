import { Request, Response } from 'express';
import Transaction from '../models/Transaction';
import Product from '../models/Product';
import Favorite from '../models/Favorite';
import cacheManager from '../utils/cacheManager';
import logger from '../utils/logger';

/**
 * Get product recommendations for a specific customer
 * Uses purchase history, favorites, and style preferences to generate recommendations
 */
export const getPersonalizedRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerId = parseInt(req.params.customerId);
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Create a cache key for this recommendation
    const cacheKey = `recommendations_customer_${customerId}_limit_${limit}`;
    
    // Try to get from cache or generate new recommendations
    const recommendations = await cacheManager.getOrSet(
      cacheKey,
      async () => {
        logger.info(`Cache miss for ${cacheKey}, generating recommendations`);
        
        // Get customer's purchase history
        const transactions = await Transaction.find({ maskedCustomerId: customerId });
        
        if (transactions.length === 0) {
          return { 
            message: 'No purchase history found for this customer',
            recommendations: [] 
          };
        }
        
        // Get customer's favorites
        const favorites = await Favorite.find({ maskedCustomerId: customerId });
        
        // Extract product preferences
        const productGroups = new Map();
        const styles = new Map();
        const colors = new Map();
        const sizes = new Map();
        
        // Analyze purchase history
        transactions.forEach(transaction => {
          // Count product groups
          const group = transaction.productGroupName;
          productGroups.set(group, (productGroups.get(group) || 0) + 1);
          
          // Count styles
          const style = transaction.styleName;
          styles.set(style, (styles.get(style) || 0) + 1);
          
          // Count colors
          const color = transaction.colourGroup;
          colors.set(color, (colors.get(color) || 0) + 1);
          
          // Count sizes
          const size = transaction.sizeDesc;
          sizes.set(size, (sizes.get(size) || 0) + 1);
        });
        
        // Sort preferences by frequency
        const topProductGroups = [...productGroups.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(entry => entry[0]);
          
        const topStyles = [...styles.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(entry => entry[0]);
          
        const topColors = [...colors.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(entry => entry[0]);
          
        const topSizes = [...sizes.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(entry => entry[0]);
        
        // Get favorite product IDs
        const favoriteProductIds = favorites.map(fav => fav.variantId);
        
        // Find purchased product IDs to exclude from recommendations
        const purchasedProductIds = transactions.map(trans => trans.variantId);
        
        // Find products that match customer preferences but haven't been purchased yet
        const recommendedProducts = await Product.find({
          variantId: { $nin: purchasedProductIds },
          $or: [
            { productDescEN: { $regex: topProductGroups.join('|'), $options: 'i' } },
            { productDescSE: { $regex: topProductGroups.join('|'), $options: 'i' } },
          ]
        }).limit(limit);
        
        return {
          customerPreferences: {
            topProductGroups,
            topStyles,
            topColors,
            topSizes,
            favoriteCount: favorites.length,
            purchaseCount: transactions.length
          },
          recommendations: recommendedProducts
        };
      },
      1800 // Cache for 30 minutes
    );

    res.status(200).json({
      success: true,
      customerId,
      ...recommendations,
      fromCache: true
    });
  } catch (error) {
    logger.error(`Error generating recommendations: ${error}`);
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

/**
 * Get trending products based on recent purchases and favorites
 */
export const getTrendingProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Create a cache key for trending products
    const cacheKey = `trending_products_days_${days}_limit_${limit}`;
    
    // Try to get from cache or generate new trending products
    const trending = await cacheManager.getOrSet(
      cacheKey,
      async () => {
        logger.info(`Cache miss for ${cacheKey}, finding trending products`);
        
        // Calculate date threshold
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - days);
        
        // Find recent transactions
        const recentTransactions = await Transaction.find({
          dayDate: { $gte: dateThreshold }
        });
        
        // Find recent favorites
        const recentFavorites = await Favorite.find({
          dayDate: { $gte: dateThreshold }
        });
        
        // Count product occurrences
        const productCounts = new Map();
        
        // Count from transactions (higher weight)
        recentTransactions.forEach(transaction => {
          const id = transaction.variantId;
          productCounts.set(id, (productCounts.get(id) || 0) + 2); // Weight of 2 for purchases
        });
        
        // Count from favorites
        recentFavorites.forEach(favorite => {
          const id = favorite.variantId;
          productCounts.set(id, (productCounts.get(id) || 0) + 1); // Weight of 1 for favorites
        });
        
        // Get top product IDs
        const topProductIds = [...productCounts.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, limit)
          .map(entry => entry[0]);
        
        // Get product details
        const trendingProducts = await Product.find({
          variantId: { $in: topProductIds }
        });
        
        // Sort products by their trending score
        const sortedProducts = trendingProducts.sort((a, b) => {
          const scoreA = productCounts.get(a.variantId) || 0;
          const scoreB = productCounts.get(b.variantId) || 0;
          return scoreB - scoreA;
        });
        
        return {
          timeframe: `Last ${days} days`,
          products: sortedProducts.map(product => ({
            ...product.toObject(),
            trendingScore: productCounts.get(product.variantId) || 0
          }))
        };
      },
      3600 // Cache for 1 hour
    );

    res.status(200).json({
      success: true,
      ...trending,
      fromCache: true
    });
  } catch (error) {
    logger.error(`Error finding trending products: ${error}`);
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

/**
 * Get "similar products" recommendations
 */
export const getSimilarProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const variantId = req.params.variantId;
    const limit = parseInt(req.query.limit as string) || 5;
    
    // Create a cache key for similar products
    const cacheKey = `similar_products_${variantId}_limit_${limit}`;
    
    // Try to get from cache or find similar products
    const similarProducts = await cacheManager.getOrSet(
      cacheKey,
      async () => {
        logger.info(`Cache miss for ${cacheKey}, finding similar products`);
        
        // Get the source product
        const sourceProduct = await Product.findOne({ variantId });
        
        if (!sourceProduct) {
          return { 
            message: 'Source product not found',
            products: [] 
          };
        }
        
        // Extract keywords from product description
        const descriptionWords = [
          ...sourceProduct.productDescEN.toLowerCase().split(/\s+/),
          ...sourceProduct.productDescSE.toLowerCase().split(/\s+/)
        ]
        .filter(word => word.length > 3) // Filter out short words
        .filter(word => !['with', 'and', 'the', 'for', 'med', 'och', 'för'].includes(word)); // Filter common words
        
        // Find products with similar descriptions
        const similar = await Product.find({
          variantId: { $ne: variantId }, // Exclude the source product
          $or: [
            { productDescEN: { $regex: descriptionWords.join('|'), $options: 'i' } },
            { productDescSE: { $regex: descriptionWords.join('|'), $options: 'i' } }
          ]
        }).limit(limit);
        
        return {
          sourceProduct,
          similarProducts: similar
        };
      },
      3600 // Cache for 1 hour
    );

    res.status(200).json({
      success: true,
      ...similarProducts,
      fromCache: true
    });
  } catch (error) {
    logger.error(`Error finding similar products: ${error}`);
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};
