const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

module.exports = {
  login: async (req, res, next) => {
    const { username, password } = req.body;

    if (username === 'luwakwhitecoffe' && password === 'kopinikmatnyamandiminum') {
      const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '2m' });
      res.json({ token });
    } else {
      res.status(401).json({
        status: true,
        message: 'siapa namanya. dimana rumahnya. HOI',
      });
    }
  },
};
