import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redis from "./redis.js";

const isTestEnv = process.env.NODE_ENV === "test";

// Handle Redis sendCommand safely so it silently fails if Redis throws connection errors
const safeSendCommand = async (...args) => {
  try {
    return await redis.call(...args);
  } catch (error) {
    if (args[0] === 'SCRIPT' && args[1] === 'LOAD') {
      // Mock the SHA1 return for loadIncrementScript if Redis is unavailable
      return "mocked-sha1-due-to-redis-error";
    }
    throw error;
  }
};

export const redisLimiter = isTestEnv
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
      passOnStoreError: true,
      message: "Too many requests from this IP, please try again in a few minutes.",
      store: new RedisStore({
        sendCommand: safeSendCommand,
        prefix: "rate-limit:",
      }),
    });
