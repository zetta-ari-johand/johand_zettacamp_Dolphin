const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

const checkAuth = (req, res, next) => {
  const auth = req.headers.authorization;

  // check if token is passed
  if (!auth) {
    return res.status(401).json({
      status: true,
      message: 'minta token listrik',
    });
  }

  // split token from bearer
  const token = auth.split(' ')[1];

  // verify
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

// const checkAuth = (req, res, next) => {
//   const auth = req.headers['authorization'];
//   if (!auth) {
//     return res.status(401).json({
//       status: true,
//       message: 'minta token listrik',
//     });
//   }
//   console.log(req.headers.authorization);
//   const token = auth.split(' ')[1];

//   jwt.verify(token, JWT_SECRET, (err, decoded) => {
//     if (err) {
//       if (err.name === 'TokenExpiredError') {
//         return res.status(401).json({
//           status: true,
//           message: 'Billing warnet abis',
//         });
//       } else {
//         return res.status(401).json({
//           status: true,
//           message: 'tetoot salah kode token',
//         });
//       }
//     }
//     req.user = decoded;
//     next();
//   });
// };

module.exports = checkAuth;
