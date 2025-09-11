import { Request, Response } from 'express';
import Transaction from '../models/Transaction';
import mongoose from 'mongoose';

// Get all transactions with pagination and filtering
export const getAllTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const page = parseInt(req.query.page as string) || 1;
    const skip = (page - 1) * limit;
    const sortField = (req.query.sortField as string) || 'dayDate';
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 1 : -1;
    
    // Build filter object based on query parameters
    const filter: any = {};
    
    // Filter by business area
    if (req.query.businessArea) {
      filter.businessAreaName = { $regex: req.query.businessArea, $options: 'i' };
    }
    
    // Filter by product group
    if (req.query.productGroup) {
      filter.productGroupName = { $regex: req.query.productGroup, $options: 'i' };
    }
    
    // Filter by style name
    if (req.query.styleName) {
      filter.styleName = { $regex: req.query.styleName, $options: 'i' };
    }
    
    // Filter by color group
    if (req.query.colorGroup) {
      filter.colourGroup = { $regex: req.query.colorGroup, $options: 'i' };
    }
    
    // Filter by size
    if (req.query.size) {
      filter.sizeDesc = { $regex: req.query.size, $options: 'i' };
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

    const transactions = await Transaction.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit);
      
    const total = await Transaction.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: transactions.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      filters: Object.keys(filter).length > 0 ? filter : 'None',
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// Get transactions by customer ID
export const getTransactionsByCustomerId = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerId = parseInt(req.params.customerId);
    const transactions = await Transaction.find({ maskedCustomerId: customerId });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// Get transactions by variant ID
export const getTransactionsByVariantId = async (req: Request, res: Response): Promise<void> => {
  try {
    const variantId = req.params.variantId;
    const transactions = await Transaction.find({ variantId });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// Get transactions by date range
export const getTransactionsByDateRange = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      res.status(400).json({
        success: false,
        error: 'Please provide both startDate and endDate',
      });
      return;
    }

    const transactions = await Transaction.find({
      dayDate: {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      },
    });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// Get transactions by product group
export const getTransactionsByProductGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const productGroup = req.params.productGroup;
    const transactions = await Transaction.find({ 
      productGroupName: { $regex: productGroup, $options: 'i' } 
    });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// Get product group sales analytics
export const getProductGroupAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date('2020-01-01');
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
    
    const analytics = await Transaction.aggregate([
      {
        $match: {
          dayDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$productGroupName',
          count: { $sum: 1 },
          uniqueCustomers: { $addToSet: '$maskedCustomerId' }
        }
      },
      {
        $project: {
          productGroup: '$_id',
          count: 1,
          uniqueCustomerCount: { $size: '$uniqueCustomers' },
          _id: 0
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      count: analytics.length,
      timeRange: { startDate, endDate },
      data: analytics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// Get customer purchase analytics
export const getCustomerPurchaseAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    
    const analytics = await Transaction.aggregate([
      {
        $group: {
          _id: '$maskedCustomerId',
          purchaseCount: { $sum: 1 },
          productGroups: { $addToSet: '$productGroupName' },
          styles: { $addToSet: '$styleName' },
          lastPurchase: { $max: '$dayDate' }
        }
      },
      {
        $project: {
          customerId: '$_id',
          purchaseCount: 1,
          productGroupCount: { $size: '$productGroups' },
          styleCount: { $size: '$styles' },
          lastPurchase: 1,
          _id: 0
        }
      },
      { $sort: { purchaseCount: -1 } },
      { $limit: limit }
    ]);

    res.status(200).json({
      success: true,
      count: analytics.length,
      data: analytics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// Get sales trends by time period
export const getSalesTrends = async (req: Request, res: Response): Promise<void> => {
  try {
    const period = (req.query.period as string) || 'month';
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date('2020-01-01');
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
    
    let dateFormat;
    switch(period) {
      case 'day':
        dateFormat = { $dateToString: { format: '%Y-%m-%d', date: '$dayDate' } };
        break;
      case 'week':
        dateFormat = { 
          $dateToString: { 
            format: '%Y-W%U', 
            date: '$dayDate' 
          } 
        };
        break;
      case 'year':
        dateFormat = { $dateToString: { format: '%Y', date: '$dayDate' } };
        break;
      case 'month':
      default:
        dateFormat = { $dateToString: { format: '%Y-%m', date: '$dayDate' } };
        break;
    }
    
    const trends = await Transaction.aggregate([
      {
        $match: {
          dayDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: dateFormat,
          count: { $sum: 1 },
          uniqueCustomers: { $addToSet: '$maskedCustomerId' }
        }
      },
      {
        $project: {
          timePeriod: '$_id',
          salesCount: '$count',
          uniqueCustomerCount: { $size: '$uniqueCustomers' },
          _id: 0
        }
      },
      { $sort: { timePeriod: 1 } }
    ]);

    res.status(200).json({
      success: true,
      count: trends.length,
      period,
      timeRange: { startDate, endDate },
      data: trends,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};
