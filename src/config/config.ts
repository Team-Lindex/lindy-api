import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

// Environment
const NODE_ENV = process.env.NODE_ENV || 'development';

// Define configuration for different environments
interface EnvironmentConfig {
  port: number;
  mongoUri: string;
  jwtSecret?: string;
  jwtExpire?: string;
  logLevel: string;
  corsOrigin: string | string[];
  rateLimits: {
    standard: {
      windowMs: number;
      max: number;
    };
    auth: {
      windowMs: number;
      max: number;
    };
    analytics: {
      windowMs: number;
      max: number;
    };
  };
  cache: {
    standard: number;
    short: number;
    long: number;
  };
}

interface Config {
  development: EnvironmentConfig;
  test: EnvironmentConfig;
  production: EnvironmentConfig;
}

// Configuration object
const config: Config = {
  development: {
    port: parseInt(process.env.PORT || '3000', 10),
    mongoUri: process.env.MONGODB_URI || 'mongodb://root:rootpassword@localhost:27017/?authMechanism=DEFAULT',
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-key',
    jwtExpire: '1d',
    logLevel: 'debug',
    corsOrigin: '*',
    rateLimits: {
      standard: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000, // Higher limit for development
      },
      auth: {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 50, // Higher limit for development
      },
      analytics: {
        windowMs: 5 * 60 * 1000, // 5 minutes
        max: 100, // Higher limit for development
      },
    },
    cache: {
      standard: 300, // 5 minutes
      short: 60, // 1 minute
      long: 3600, // 1 hour
    },
  },
  test: {
    port: parseInt(process.env.PORT || '3000', 10),
    mongoUri: process.env.TEST_MONGODB_URI || 'mongodb://root:rootpassword@localhost:27017/lindy-api-test',
    jwtSecret: 'test-secret-key',
    jwtExpire: '1d',
    logLevel: 'error',
    corsOrigin: '*',
    rateLimits: {
      standard: {
        windowMs: 15 * 60 * 1000,
        max: 1000,
      },
      auth: {
        windowMs: 60 * 60 * 1000,
        max: 50,
      },
      analytics: {
        windowMs: 5 * 60 * 1000,
        max: 100,
      },
    },
    cache: {
      standard: 60, // Shorter cache for testing
      short: 10,
      long: 300,
    },
  },
  production: {
    port: parseInt(process.env.PORT || '3000', 10),
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/lindy-api',
    jwtSecret: process.env.JWT_SECRET,
    jwtExpire: process.env.JWT_EXPIRE || '7d',
    logLevel: 'warn',
    corsOrigin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['https://yourdomain.com'],
    rateLimits: {
      standard: {
        windowMs: 15 * 60 * 1000,
        max: 100, // Stricter limit for production
      },
      auth: {
        windowMs: 60 * 60 * 1000,
        max: 10, // Stricter limit for production
      },
      analytics: {
        windowMs: 5 * 60 * 1000,
        max: 30, // Stricter limit for production
      },
    },
    cache: {
      standard: 600, // 10 minutes
      short: 300, // 5 minutes
      long: 86400, // 24 hours
    },
  },
};

// Export the configuration for the current environment
export default config[NODE_ENV as keyof Config];
