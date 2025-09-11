import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { connectDB, disconnectDB } from '../config/database';
import StyleDescription from '../models/StyleDescription';
import StyleImage from '../models/StyleImage';
import Product from '../models/Product';
import Favorite from '../models/Favorite';
import Customer from '../models/Customer';
import Transaction from '../models/Transaction';
import PageView from '../models/PageView';
import ProductReview from '../models/ProductReview';
import mongoose from 'mongoose';
import logger from './logger';

// Function to parse CSV files
const parseCSV = (filePath: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

// Import Style Descriptions
const importStyleDescriptions = async (): Promise<void> => {
  try {
    const filePath = path.join(__dirname, '../../datafiles/Style_descriptions.csv');
    const data = await parseCSV(filePath);
    
    logger.info(`Importing ${data.length} style descriptions...`);
    
    for (const item of data) {
      const styleDescription = {
        style: item.STYLE,
        styleDescription: item.STYLE_DESCRIPTION,
        styleKeywords: item.STYLE_KEYWORDS ? item.STYLE_KEYWORDS.split(',').map((keyword: string) => keyword.trim()) : [],
      };
      
      await StyleDescription.findOneAndUpdate(
        { style: styleDescription.style },
        styleDescription,
        { upsert: true, new: true }
      );
    }
    
    logger.info('Style descriptions imported successfully');
  } catch (error) {
    logger.error(`Error importing style descriptions: ${error}`);
  }
};

// Import Style Images
const importStyleImages = async (): Promise<void> => {
  try {
    const filePath = path.join(__dirname, '../../datafiles/Style_images.csv');
    const data = await parseCSV(filePath);
    
    logger.info(`Importing ${data.length} style images...`);
    
    // Clear existing style images before importing
    await StyleImage.deleteMany({});
    
    for (const item of data) {
      // Extract all image URLs from the row
      const imageUrls = [
        item.IMG_0,
        item.IMG_1,
        item.IMG_2,
        item.IMG_3,
        item.IMG_4,
        item.IMG_5,
        item.IMG_6,
        item.IMG_7,
      ].filter(url => url && url.trim() !== '');
      
      // Create unique image URLs (in case there are duplicates)
      const uniqueImageUrls = [...new Set(imageUrls)];
      
      const styleImage = {
        style: item.STYLE,
        images: uniqueImageUrls,
      };
      
      await StyleImage.create(styleImage);
    }
    
    logger.info('Style images imported successfully');
  } catch (error) {
    logger.error(`Error importing style images: ${error}`);
  }
};

// Import Products
const importProducts = async (): Promise<void> => {
  try {
    const filePath = path.join(__dirname, '../../datafiles/Products.csv');
    const data = await parseCSV(filePath);
    
    console.log(`Importing ${data.length} products...`);
    
    for (const item of data) {
      const product = {
        variantId: item.VARIANT_ID,
        productLink: item.PRODUCT_LINK,
        productImageLink: item.PRODUCT_IMAGE_LINK,
        modelImageLink: item.MODEL_IMAGE_LINK,
        productDescSE: item.PRODUCT_DESC_SE,
        productDescEN: item.PRODUCT_DESC_EN,
      };
      
      await Product.findOneAndUpdate(
        { variantId: product.variantId },
        product,
        { upsert: true, new: true }
      );
    }
    
    console.log('Products imported successfully');
  } catch (error) {
    console.error('Error importing products:', error);
  }
};

// Import Favorites
const importFavorites = async (): Promise<void> => {
  try {
    const filePath = path.join(__dirname, '../../datafiles/Favorites.csv');
    const data = await parseCSV(filePath);
    
    console.log(`Importing ${data.length} favorites...`);
    
    // Clear existing favorites before importing
    await Favorite.deleteMany({});
    
    for (const item of data) {
      const favorite = {
        dayDate: new Date(item.DAY_DATE),
        maskedCustomerId: parseInt(item.MASKED_CUSTOMER_ID),
        variantId: item.VARIANT_ID,
      };
      
      await Favorite.create(favorite);
    }
    
    console.log('Favorites imported successfully');
  } catch (error) {
    console.error('Error importing favorites:', error);
  }
};

// Import Customers
const importCustomers = async (): Promise<void> => {
  try {
    const filePath = path.join(__dirname, '../../datafiles/customers.csv');
    const data = await parseCSV(filePath);
    
    console.log(`Importing ${data.length} customers...`);
    
    // Clear existing customers before importing
    await Customer.deleteMany({});
    
    for (const item of data) {
      const customer = {
        customerId: parseInt(item.CUSTOMER_ID),
        firstName: item.FIRST_NAME,
        lastName: item.LAST_NAME,
      };
      
      await Customer.create(customer);
    }
    
    console.log('Customers imported successfully');
  } catch (error) {
    console.error('Error importing customers:', error);
  }
};

// Import Transactions
const importTransactions = async (): Promise<void> => {
  try {
    const filePath = path.join(__dirname, '../../datafiles/Transactions.csv');
    const data = await parseCSV(filePath);
    
    logger.info(`Importing ${data.length} transactions...`);
    
    // Clear existing transactions before importing
    await Transaction.deleteMany({});
    
    for (const item of data) {
      const transaction = {
        dayDate: new Date(item.DAY_DATE),
        maskedCustomerId: parseInt(item.MASKED_CUSTOMER_ID),
        variantId: item.VARIANT_ID,
        businessAreaName: item.BUSINESS_AREA_NAME,
        productGroupName: item.PRODUCT_GROUP_NAME,
        styleName: item.STYLE_NAME,
        colourGroup: item.COLOUR_GROUP,
        sizeDesc: item.SIZE_DESC,
      };
      
      await Transaction.create(transaction);
    }
    
    logger.info('Transactions imported successfully');
  } catch (error) {
    logger.error(`Error importing transactions: ${error}`);
  }
};

// Import Page Views
const importPageViews = async (): Promise<void> => {
  try {
    const filePath = path.join(__dirname, '../../datafiles/Page_views.csv');
    const data = await parseCSV(filePath);
    
    logger.info(`Importing ${data.length} page views...`);
    
    // Clear existing page views before importing
    await PageView.deleteMany({});
    
    // Use batch processing for better performance
    const batchSize = 1000;
    const batches = [];
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize).map(item => ({
        dayDate: new Date(item.DAY_DATE),
        maskedCustomerId: parseInt(item.MASKED_CUSTOMER_ID),
        variantId: item.VARIANT_ID,
      }));
      
      batches.push(PageView.insertMany(batch));
    }
    
    await Promise.all(batches);
    
    logger.info('Page views imported successfully');
  } catch (error) {
    logger.error(`Error importing page views: ${error}`);
  }
};

// Import Product Reviews
const importProductReviews = async (): Promise<void> => {
  try {
    const filePath = path.join(__dirname, '../../datafiles/Product_Reviews.csv');
    const data = await parseCSV(filePath);
    
    logger.info(`Importing ${data.length} product reviews...`);
    
    // Clear existing product reviews before importing
    await ProductReview.deleteMany({});
    
    for (const item of data) {
      const review = {
        variantId: item.VARIANT_ID,
        review: item.REVIEW,
        score: parseInt(item.SCORE),
      };
      
      await ProductReview.create(review);
    }
    
    logger.info('Product reviews imported successfully');
  } catch (error) {
    logger.error(`Error importing product reviews: ${error}`);
  }
};

// Main import function
const importAllData = async (): Promise<void> => {
  try {
    await connectDB();
    logger.info('Starting data import...');
    
    await importStyleDescriptions();
    await importStyleImages();
    await importProducts();
    await importFavorites();
    await importCustomers();
    await importTransactions();
    await importPageViews();
    await importProductReviews();
    
    logger.info('All data imported successfully');
  } catch (error) {
    logger.error(`Error importing data: ${error}`);
  } finally {
    await disconnectDB();
  }
};

// Run the import if this file is executed directly
if (require.main === module) {
  importAllData()
    .then(() => {
      console.log('Import process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Import process failed:', error);
      process.exit(1);
    });
}

export { 
  importAllData, 
  importStyleDescriptions, 
  importStyleImages,
  importProducts, 
  importFavorites, 
  importCustomers, 
  importTransactions,
  importPageViews,
  importProductReviews 
};
