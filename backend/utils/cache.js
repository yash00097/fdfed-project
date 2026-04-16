import redis, { isRedisAvailable } from "../config/redis.js";

const sortObject = (value) => {
  if (Array.isArray(value)) {
    return value.map(sortObject);
  }

  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((accumulator, key) => {
        accumulator[key] = sortObject(value[key]);
        return accumulator;
      }, {});
  }

  return value;
};

export const createCacheKey = (prefix, payload = {}) => {
  const normalizedPayload = sortObject(payload);
  return `${prefix}:${JSON.stringify(normalizedPayload)}`;
};

export const getCache = async (key) => {
  if (!isRedisAvailable()) {
    return null;
  }

  const cachedValue = await redis.get(key);
  return cachedValue ? JSON.parse(cachedValue) : null;
};

export const setCache = async (key, value, ttlSeconds) => {
  if (!isRedisAvailable()) {
    return false;
  }

  await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  return true;
};

export const deleteCacheKey = async (key) => {
  if (!isRedisAvailable()) {
    return 0;
  }

  return redis.del(key);
};

export const clearCacheByPattern = async (pattern) => {
  if (!isRedisAvailable()) {
    return 0;
  }

  let cursor = "0";
  let deletedCount = 0;

  do {
    const [nextCursor, keys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
    cursor = nextCursor;

    if (keys.length > 0) {
      deletedCount += await redis.del(...keys);
    }
  } while (cursor !== "0");

  return deletedCount;
};

export const invalidateCarCache = async (carId) => {
  const deletionTasks = [
    clearCacheByPattern("cars:list:*"),
    clearCacheByPattern("cars:top-brands:*"),
  ];

  if (carId) {
    deletionTasks.push(deleteCacheKey(`cars:item:${carId}`));
  }

  await Promise.allSettled(deletionTasks);
};

export const userAnalyticsCacheKey = (userId) => `user:analytics:${userId}`;

export const userRequestsCacheKey = (userId) => `user:requests:${userId}`;

export const notificationsCacheKey = (userId) => `notifications:list:${userId}`;

export const unreadNotificationsCacheKey = (userId) =>
  `notifications:unread:${userId}`;

export const invalidateUserAnalyticsCache = async (userId) => {
  if (!userId) {
    return 0;
  }

  return deleteCacheKey(userAnalyticsCacheKey(userId));
};

export const invalidateUserRequestCache = async (userId) => {
  if (!userId) {
    return 0;
  }

  return deleteCacheKey(userRequestsCacheKey(userId));
};

export const invalidateNotificationCache = async (userId) => {
  if (!userId) {
    return 0;
  }

  const [listDeleted, unreadDeleted] = await Promise.all([
    deleteCacheKey(notificationsCacheKey(userId)),
    deleteCacheKey(unreadNotificationsCacheKey(userId)),
  ]);

  return listDeleted + unreadDeleted;
};

export const invalidateNotificationCacheForUsers = async (userIds = []) => {
  const uniqueIds = [...new Set(userIds.filter(Boolean).map(String))];

  await Promise.allSettled(
    uniqueIds.map((userId) => invalidateNotificationCache(userId))
  );
};
