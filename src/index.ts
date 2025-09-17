import express, { Express, Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { connectDB } from './config/database';
import { errorHandler, notFound } from './middleware/errorMiddleware';
import { basicLimiter, analyticsLimiter } from './middleware/rateLimitMiddleware';
import morganMiddleware from './middleware/morganMiddleware';
import logger from './utils/logger';
import swaggerSpec from './config/swagger';
import config from './config/config';

// Import routes
import styleDescriptionRoutes from './routes/styleDescriptionRoutes';
import styleImageRoutes from './routes/styleImageRoutes';
import productRoutes from './routes/productRoutes';
import favoriteRoutes from './routes/favoriteRoutes';
import customerRoutes from './routes/customerRoutes';
import transactionRoutes from './routes/transactionRoutes';
import recommendationRoutes from './routes/recommendationRoutes';
import pageViewRoutes from './routes/pageViewRoutes';
import productReviewRoutes from './routes/productReviewRoutes';
import wardrobeRoutes from './routes/wardrobeRoutes';
import agentRoutes from './routes/agentRoutes';
import outfitRoutes from './routes/outfitRoutes';
import voiceRoutes from './routes/voiceRoutes';

// Initialize VoltAgent
import './voltagent';

// Initialize express app
const app: Express = express();
const PORT = config.port;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the temp directory
app.use('/temp', express.static(path.join(__dirname, '../temp')));

// Apply HTTP request logging
app.use(morganMiddleware);

// Apply basic rate limiter to all requests
app.use(basicLimiter);

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// API Routes
app.use('/api/styles', styleDescriptionRoutes);
app.use('/api/style-images', styleImageRoutes);
app.use('/api/products', productRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/page-views', pageViewRoutes);
app.use('/api/reviews', productReviewRoutes);
app.use('/api/wardrobe', wardrobeRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/outfit', outfitRoutes);
app.use('/api/voice', voiceRoutes);

// Apply stricter rate limiting to analytics endpoints
app.use('/api/transactions/analytics', analyticsLimiter);
app.use('/api/recommendations', analyticsLimiter);
app.use('/api/page-views/analytics', analyticsLimiter);
app.use('/api/reviews/top-rated', analyticsLimiter);

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to Lindy API',
    endpoints: {
      styles: '/api/styles',
      styleImages: '/api/style-images',
      products: '/api/products',
      favorites: '/api/favorites',
      customers: '/api/customers',
      transactions: '/api/transactions',
      recommendations: '/api/recommendations',
      pageViews: '/api/page-views',
      reviews: '/api/reviews',
      wardrobe: '/api/wardrobe',
      agent: '/api/agent',
      outfit: '/api/outfit',
    },
    documentation: '/api-docs',
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  logger.debug(`Environment configuration loaded: ${JSON.stringify({
    port: config.port,
    logLevel: config.logLevel,
    corsOrigin: config.corsOrigin,
    rateLimits: config.rateLimits
  }, null, 2)}`);
});

export default app;
