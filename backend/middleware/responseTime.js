export const responseTime = (req, res, next) => {
  const start = process.hrtime.bigint();
  const originalEnd = res.end.bind(res);

  res.end = (...args) => {
    const durationInMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    if (!res.headersSent) {
      res.setHeader("X-Response-Time-ms", durationInMs.toFixed(2));
    }

    return originalEnd(...args);
  };

  next();
};
