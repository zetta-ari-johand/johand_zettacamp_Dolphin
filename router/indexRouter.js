const router = require('express').Router();
const purchaseBookRouter = require('./purchaseBookRouter');
const loginRouter = require('./loginRouter');

router.use(purchaseBookRouter);
router.use(loginRouter);

module.exports = router;
