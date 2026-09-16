import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../config/security.js';

export const authenticate = (req, res, next) => {
  const authorization = req.get('Authorization');
  const [scheme, token] = authorization ? authorization.split(' ') : [];

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    req.user = jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] });
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Authentication token expired' });
    }
    return res.status(401).json({ error: 'Invalid authentication token' });
  }
};

export const requireRole = (...allowedRoles) => {
  const normalizedRoles = allowedRoles.map((role) => role.toLowerCase());

  return (req, res, next) => {
    const role = req.user?.role?.toLowerCase();
    if (!role || !normalizedRoles.includes(role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

export const requirePatientAccess = (getPatientId) => (req, res, next) => {
  const requestedPatientId = getPatientId(req);
  const role = req.user?.role?.toLowerCase();

  if (role === 'patient' && req.user.patientId !== requestedPatientId) {
    return res.status(403).json({ error: 'Patients can access only their own data' });
  }

  if (!['patient', 'doctor', 'admin'].includes(role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  next();
};
