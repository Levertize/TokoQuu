import jwt from 'jsonwebtoken';

/**
 * JWT authentication validation middleware.
 * Checks incoming Request headers for a valid Authorization token.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware callback
 * @returns {Object} response
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Akses ditolak! Token otentikasi tidak ditemukan.' 
    });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_tokoquu_jwt_key_that_is_long_and_random');
    req.user = verified;
    next();
  } catch (err) {
    return res.status(403).json({ 
      success: false, 
      error: 'Sesi kedaluwarsa atau token tidak valid!' 
    });
  }
}
