const requestLogger = (req, res, next) => {
  const start = Date.now();
  const requestId = req.requestId;
  const { method, originalUrl, ip } = req;

  // Log when response finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logEntry = {
      timestamp: new Date().toISOString(),
      requestId,
      method,
      url: originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip,
      userAgent: req.headers['user-agent'],
      userId: req.user?.id || null,
      service: 'gateway',
    };

    // Console log (in production, send to centralized logging system)
    console.log(JSON.stringify(logEntry));

    // Send to monitoring service
    if (process.env.MONITORING_SERVICE_URL) {
      fetch(`${process.env.MONITORING_SERVICE_URL}/monitoring/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry),
      }).catch(() => {}); // Silent fail if monitoring is down
    }
  });

  next();
};

module.exports = { requestLogger };
