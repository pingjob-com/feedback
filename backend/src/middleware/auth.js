import { verifyToken } from '../utils/jwt.js';
import { errorResponse } from '../utils/errors.js';

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, 'Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return errorResponse(res, 401, 'Invalid or expired token');
    }

    req.user = decoded;
    next();
  } catch (error) {
    errorResponse(res, 500, 'Authentication error');
  }
};

export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, 'User not authenticated');
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return errorResponse(res, 403, 'Insufficient permissions');
    }

    next();
  };
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return errorResponse(res, 403, 'Admin access required');
  }
  next();
};