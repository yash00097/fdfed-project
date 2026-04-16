import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redis from "./redis.js";

export const redisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  passOnStoreError: true,
  message: "Too many requests from this IP, please try again in a few minutes.",
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix: "rate-limit:",
  }),
});
