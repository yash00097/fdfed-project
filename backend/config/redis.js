import Redis from "ioredis";

const isTestEnv = process.env.NODE_ENV === "test";
const redisUrl = process.env.REDIS_URL;
const redisHost = process.env.REDIS_HOST || "127.0.0.1";
const redisPort = Number(process.env.REDIS_PORT || 6379);
const redisPassword = process.env.REDIS_PASSWORD || undefined;
const useTls = process.env.REDIS_TLS === "true";

const commonOptions = {
  maxRetriesPerRequest: 1,
  lazyConnect: true,
  enableOfflineQueue: true,
  retryStrategy(times) {
    return Math.min(times * 200, 2000);
  },
};

const redis = isTestEnv
  ? {
      status: "end",
      get: async () => null,
      set: async () => "OK",
      del: async () => 0,
      scan: async () => ["0", []],
      call: async () => null,
      quit: async () => null,
    }
  : redisUrl
    ? new Redis(redisUrl, commonOptions)
    : new Redis({
        host: redisHost,
        port: redisPort,
        password: redisPassword,
        ...(useTls ? { tls: {} } : {}),
        ...commonOptions,
      });

const logTarget = redisUrl ? redisUrl.replace(/\/\/.*@/, "//***@") : `${redisHost}:${redisPort}`;

let isRedisReady = false;

if (!isTestEnv) {
  redis.on("connect", () => {
    console.log(`[redis] Connecting to ${logTarget}`);
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
}

export const connectRedis = async () => {
  if (isTestEnv) {
    return null;
  }

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
