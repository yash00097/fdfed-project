import Redis from "ioredis";

const redisHost = process.env.REDIS_HOST || "127.0.0.1";
const redisPort = Number(process.env.REDIS_PORT || 6379);

const redis = new Redis({
  host: redisHost,
  port: redisPort,
  maxRetriesPerRequest: 1,
  lazyConnect: true,
  enableOfflineQueue: true,
  retryStrategy(times) {
    return Math.min(times * 200, 2000);
  },
});

let isRedisReady = false;

redis.on("connect", () => {
  console.log(`[redis] Connecting to ${redisHost}:${redisPort}`);
});

redis.on("ready", () => {
  isRedisReady = true;
  console.log("[redis] Connected successfully");
});

redis.on("error", (error) => {
  isRedisReady = false;
  console.error("[redis] Connection error:", error.message);
});

redis.on("close", () => {
  isRedisReady = false;
  console.warn("[redis] Connection closed");
});

redis.on("reconnecting", () => {
  console.warn("[redis] Reconnecting...");
});

export const connectRedis = async () => {
  try {
    if (redis.status === "ready" || redis.status === "connecting") {
      return redis;
    }

    await redis.connect();
    return redis;
  } catch (error) {
    isRedisReady = false;
    console.error("[redis] Startup connection failed:", error.message);
    return null;
  }
};

export const isRedisAvailable = () => isRedisReady;

export default redis;
