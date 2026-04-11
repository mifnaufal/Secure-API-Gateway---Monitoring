const axios = require('axios');

const proxyToService = (baseUrl, pathPrefix) => {
  return async (req, res) => {
    try {
      // Build the target URL
      const targetPath = req.originalUrl.replace('/api', pathPrefix);
      const url = `${baseUrl}${targetPath}`;

      // Forward the request with headers
      const headers = {
        ...req.headers,
        'x-request-id': req.requestId,
        'x-forwarded-for': req.ip,
        'x-user-id': req.user?.id,
        'x-user-role': req.user?.role,
        host: undefined, // Remove host header
      };

      const response = await axios({
        method: req.method,
        url,
        data: req.body,
        params: req.query,
        headers,
        validateStatus: () => true, // Don't throw on any status
      });

      // Forward response headers
      Object.entries(response.headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });

      res.status(response.status).json(response.data);
    } catch (error) {
      console.error(`[Proxy Error] ${error.message}`);
      res.status(502).json({
        error: {
          message: 'Service unavailable',
          code: 'SERVICE_UNAVAILABLE',
          requestId: req.requestId,
        },
      });
    }
  };
};

module.exports = { proxyToService };
