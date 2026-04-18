// Licensed under MIT - DevForum Project
import { Redis } from "@upstash/redis";
import { env } from "./env";

// Lazy initialization for edge compatibility
let redisInstance: Redis | null = null;

export function getRedis(): Redis | null {
  if (!env.REDIS_URL) return null;
  
  if (!redisInstance) {
    redisInstance = new Redis({
      url: env.REDIS_URL,
      token: env.REDIS_URL?.split("@")[0]?.split("://")[1],
    });
  }
  
  return redisInstance;
}

export async function cacheWithFallback<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  const redis = getRedis();
  
  if (!redis) {
    return fetcher();
  }
  
  try {
    const cached = await redis.get<T>(key);
    if (cached) return cached;
    
    const fresh = await fetcher();
    await redis.set(key, fresh, { ex: ttlSeconds });
    return fresh;
  } catch (error) {
    console.warn("Redis cache miss/error, falling back:", error);
    return fetcher();
  }
}

export async function invalidatePattern(pattern: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.warn("Failed to invalidate cache pattern:", error);
  }
}