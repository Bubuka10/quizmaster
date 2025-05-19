import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';

function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      message: 'Hozzáférés megtagadva, hiányzó token. Elvárt formátum: Bearer <token>' 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'A token lejárt, kérjük jelentkezzen be újra.' });
    }
    return res.status(401).json({ message: 'Érvénytelen token.' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(401).json({ message: 'Hozzáférés megtagadva, csak adminisztrátorok számára elérhető.' });
  }
  next();
}

export { requireAuth, requireAdmin };
