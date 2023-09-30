const router = require('express').Router();
const authController = require('../controller/loginController');

router.post('/api/v1/login', authController.login);

module.exports = router;
