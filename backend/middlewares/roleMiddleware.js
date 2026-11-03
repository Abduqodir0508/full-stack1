const { errorResponse } = require('../utils/apiResponse');

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  return errorResponse(res, 403, 'Forbidden: Requires administrator privileges');
};

module.exports = {
  isAdmin,
};

