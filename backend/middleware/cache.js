import { createCacheKey, getCache, setCache } from "../utils/cache.js";
import { isRedisAvailable } from "../config/redis.js";

export const cacheResponse = (prefix, ttlSeconds = 60, keyResolver) => {
  return async (req, res, next) => {
    const cacheKey =
      typeof keyResolver === "function"
        ? keyResolver(req)
        : createCacheKey(prefix, {
            params: req.params,
            query: req.query,
          });

    res.locals.cacheKey = cacheKey;

    if (!isRedisAvailable()) {
      res.set("X-Cache", "BYPASS");
      return next();
    }

    try {
      const cachedPayload = await getCache(cacheKey);

      if (cachedPayload) {
        res.set("X-Cache", "HIT");
        return res.status(200).json(cachedPayload);
      }

      res.set("X-Cache", "MISS");
      const originalJson = res.json.bind(res);

      res.json = async (payload) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            await setCache(cacheKey, payload, ttlSeconds);
          } catch (error) {
            console.error(`[cache] Failed to store key ${cacheKey}:`, error.message);
          }
        }

        return originalJson(payload);
      };

      return next();
    } catch (error) {
      console.error(`[cache] Failed to read key ${cacheKey}:`, error.message);
      res.set("X-Cache", "ERROR");
      return next();
    }
  };
};
