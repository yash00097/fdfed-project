import rateLimit from 'express-rate-limit';

// Rate limiter - 100 requests per hour per IP address
export const limiter = rateLimit({
    windowMs: 15 * 15 * 1000, // 1 hour
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after an hour',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
    