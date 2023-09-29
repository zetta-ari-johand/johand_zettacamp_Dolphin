const router = require('express').Router();
const purchaseBookRouter = require('./purchaseBookRouter');
const loginRouter = require('./loginRouter');
const fileRouter = require('./fileRouter');

router.use(purchaseBookRouter);
router.use(loginRouter);
router.use(fileRouter);

module.exports = router;
