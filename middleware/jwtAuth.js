const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

const checkAuth = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    throw new Error('Authentication token missing');
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        throw new Error('Authentication token expired');
      } else {
        throw new Error('Invalid authentication token');
      }
    }
    req.user = decoded;
    next();
  });
};

module.exports = checkAuth;
