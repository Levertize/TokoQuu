/**
 * Global Express error handling middleware.
 * Intercepts unhandled synchronous or asynchronous server failures.
 * @param {Error} err - Error object
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next callback
 * @returns {void}
 */
export function errorHandler(err, req, res, next) {
  console.error('Unhandled Server Error:', err);
  
  const status = err.status || 500;
  const message = err.message || 'Terjadi kesalahan internal pada server!';
  
  res.status(status).json({
    success: false,
    error: message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}
