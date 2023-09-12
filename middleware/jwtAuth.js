const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

const checkAuth = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({
      status: true,
      message: 'minta token listrik',
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: true,
          message: 'Billing warnet abis',
        });
      } else {
        return res.status(401).json({
          status: true,
          message: 'tetoot salah kode token',
        });
      }
    }
    req.user = decoded;
    next();
  });
};

module.exports = checkAuth;
