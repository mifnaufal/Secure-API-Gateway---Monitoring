const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          message: 'Authentication required',
          code: 'AUTHENTICATION_REQUIRED',
        },
      });
    }

    const userRole = req.user.role;

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        error: {
          message: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
        },
      });
    }

    next();
  };
};

const requireAdmin = (req, res, next) => {
  return requireRole(['admin'])(req, res, next);
};

const requireAdminOrManager = (req, res, next) => {
  return requireRole(['admin', 'manager'])(req, res, next);
};

module.exports = {
  requireRole,
  requireAdmin,
  requireAdminOrManager,
};
