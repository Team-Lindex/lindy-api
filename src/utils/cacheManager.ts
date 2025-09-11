import logger from './logger';
import config from '../config/config';

interface CacheItem<T> {
  value: T;
  expiry: number;
}

class CacheManager {
  private cache: Map<string, CacheItem<any>>;
  private defaultTTL: number;

  constructor(defaultTTL = config.cache.standard) { // Use config for default TTL
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
    
    // Periodically clean expired items
    setInterval(() => this.cleanExpiredItems(), 60000); // Clean every minute
  }

  /**
   * Set a value in the cache
   * @param key Cache key
   * @param value Value to store
   * @param ttl Time to live in seconds
   */
  set<T>(key: string, value: T, ttl = this.defaultTTL): void {
    const expiry = Date.now() + ttl * 1000;
    this.cache.set(key, { value, expiry });
    logger.debug(`Cache: Set key "${key}" with TTL ${ttl}s`);
  }

  /**
   * Get a value from the cache
   * @param key Cache key
   * @returns The cached value or null if not found or expired
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    // Return null if item doesn't exist
    if (!item) {
      logger.debug(`Cache: Miss for key "${key}"`);
      return null;
    }
    
    // Return null if item is expired
    if (Date.now() > item.expiry) {
      logger.debug(`Cache: Expired for key "${key}"`);
      this.cache.delete(key);
      return null;
    }
    
    logger.debug(`Cache: Hit for key "${key}"`);
    return item.value as T;
  }

  /**
   * Remove an item from the cache
   * @param key Cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
    logger.debug(`Cache: Deleted key "${key}"`);
  }

  /**
   * Clear all items from the cache
   */
  clear(): void {
    this.cache.clear();
    logger.debug('Cache: Cleared all items');
  }

  /**
   * Get the number of items in the cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Clean expired items from the cache
   */
  private cleanExpiredItems(): void {
    const now = Date.now();
    let expiredCount = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
        expiredCount++;
      }
    }
    
    if (expiredCount > 0) {
      logger.debug(`Cache: Cleaned ${expiredCount} expired items`);
    }
  }

  /**
   * Get or set cache value with a callback function
   * @param key Cache key
   * @param callback Function to call if cache miss
   * @param ttl Time to live in seconds
   * @returns The cached or newly fetched value
   */
  async getOrSet<T>(key: string, callback: () => Promise<T>, ttl = this.defaultTTL): Promise<T> {
    // Try to get from cache first
    const cachedValue = this.get<T>(key);
    if (cachedValue !== null) {
      return cachedValue;
    }
    
    // If not in cache, call the callback
    try {
      const value = await callback();
      this.set(key, value, ttl);
      return value;
    } catch (error) {
      logger.error(`Cache: Error in getOrSet for key "${key}": ${error}`);
      throw error;
    }
  }
}

// Create a singleton instance
const cacheManager = new CacheManager();

export default cacheManager;
