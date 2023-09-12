const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

// module.exports = {
//   login: async (req, res, next) => {
//     const { username, password } = req.body;
//     try {
//       if (username === 'luwakwhitecoffe' && password === 'kopinikmatnyamandiminum') {
//         const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '30m' });
//         res.json({ token });
//       } else {
//         res.status(401).json({
//           status: true,
//           message: 'siapa namanya. dimana rumahnya. HOI',
//         });
//       }
//     } catch (error) {
//       res.status(500).json({
//         status: false,
//         data: {
//           error: error.message,
//           message: 'nganu, kayaknya itunya lagi begini jadi gabisa login',
//         },
//       });
//     }
//   },
// };

module.exports = {
  login: (req, res, next) => {
    const { username, password } = req.body;

    // create a promise
    const loginPromise = new Promise((resolve, reject) => {
      if (username === 'luwakwhitecoffe' && password === 'kopinikmatnyamandiminum') {
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '30m' });
        resolve({ token });
      } else {
        reject({
          status: true,
          message: 'siapa namanya. dimana rumahnya. HOI',
        });
      }
    });

    // handle the promise
    loginPromise
      .then((result) => {
        res.json(result);
      })
      .catch((error) => {
        res.status(500).json({
          status: false,
          data: {
            error: error.message,
            // message: 'nganu, kayaknya itunya lagi begini jadi gabisa login',
          },
        });
      });
  },
};
