/**
 * Express middleware builder for Zod payload validations on request body.
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware function
 */
export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: 'Data input tidak valid!',
      details: result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message
      }))
    });
  }
  // Assign the verified data payload to req.body
  req.body = result.data;
  next();
};
