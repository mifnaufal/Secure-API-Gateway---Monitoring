const trackActivity = (action) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = (body) => {
      const activity = {
        timestamp: new Date().toISOString(),
        action,
        userId: req.user?.id || req.body?.username || null,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        success: res.statusCode < 400,
        service: 'auth',
      };

      // Log activity (in production, send to centralized logging)
      console.log(JSON.stringify({ type: 'activity', ...activity }));

      // Send to monitoring service
      if (process.env.MONITORING_SERVICE_URL) {
        fetch(`${process.env.MONITORING_SERVICE_URL}/monitoring/activity`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(activity),
        }).catch(() => {});
      }

      return originalJson(body);
    };

    next();
  };
};

module.exports = { trackActivity };
