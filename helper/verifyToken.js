const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

const verifyToken = (token) => {
  try {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        throw new Error(err);
      }
    });
  } catch (error) {
    throw new Error(`Error verifying token: ${error.message}`);
  }
};

module.exports = verifyToken;
