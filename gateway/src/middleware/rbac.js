const requireRole = (role) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: { message: 'Authentication required', code: 'UNAUTHORIZED' },
    });
  }

  if (req.user.role !== role && req.user.role !== 'admin') {
    return res.status(403).json({
      error: { message: 'Insufficient permissions', code: 'FORBIDDEN' },
    });
  }

  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      error: { message: 'Admin access required', code: 'ADMIN_ONLY' },
    });
  }
  next();
};

module.exports = { requireRole, requireAdmin };
