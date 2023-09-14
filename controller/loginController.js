const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

const user = {
  username: 'luwakwhitecoffe',
  password: 'kopinikmatnyamandiminum',
};

const usernameObj = user.username;
const passwordObj = user.password;

module.exports = {
  login: async (req, res, next) => {
    const { username, password } = req.body;
    try {
      // validation req.body
      const requiredValues = ['username', 'password'];
      for (const requiredValue of requiredValues) {
        if (!req.body[requiredValue]) {
          return res.status(422).json({
            status: true,
            message: `${requiredValue} is missing`,
          });
        }
      }
      // validation for username and password
      if (username === 'luwakwhitecoffe' && password === 'kopinikmatnyamandiminum') {
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '30m' }); // // generate token. {payload, secretkey, duration}
        res.json({ token }); // spawn token for validation
      } else {
        // handle error wrong username or pass
        res.status(401).json({
          status: true,
          message: 'Salah username sih kayaknya. atau passwordnya mungkin. Revisi aja lagi bre',
        });
      }
    } catch (error) {
      // error unexpected error
      console.log(error);
      res.status(500).json({
        status: false,
        data: {
          error: error.message,
          message: 'nganu, kayaknya itunya lagi begini jadi gabisa login',
        },
      });
    }
  },
};

// module.exports = {
//   login: (req, res, next) => {
//     const { username, password } = req.body;

//     // validation req.body
//     const requiredValues = ['username', 'password'];
//     for (const requiredValue of requiredValues) {
//       if (!req.body[requiredValue]) {
//         return res.status(422).json({
//           status: true,
//           message: `${requiredValue} is missing`,
//         });
//       }
//     }

//     // create a promise
//     const loginPromise = new Promise((resolve, reject) => {
//       // validate username and password match
//       if (username === usernameObj && password === passwordObj) {
//         // generate token
//         const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' }); // {payload, secretkey, duration}
//         resolve({ token }); // response
//       } else {
//         reject({
//           status: true,
//           message: 'Salah username sih kayaknya. atau passwordnya mungkin. Revisi aja lagi bre',
//         });
//       }
//     });

//     // handle the promise
//     loginPromise
//       .then((result) => {
//         res.json(result);
//       })
//       .catch((error) => {
//         res.status(500).json({
//           status: false,
//           data: {
//             error: error.message,
//             // message: 'nganu, kayaknya itunya lagi begini jadi gabisa login',
//           },
//         });
//       });
//   },
// };
