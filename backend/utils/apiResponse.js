/**
 * Standard API Response Utilities
 */

const successResponse = (res, statusCode = 200, message = 'Success', data = null, meta = null) => {
  const payload = {
    success: true,
    message,
    ...(data !== null && { data }),
    ...(meta !== null && { meta }),
  };
  return res.status(statusCode).json(payload);
};

const errorResponse = (res, statusCode = 500, message = 'Internal Server Error', error = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error ? (typeof error === 'string' ? error : error.message || error) : null,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};

