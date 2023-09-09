const router = require('express').Router();
const purchase = require('../controller/purchaseBookController');

//middleware auth
const checkAuth = require('../middleware/jwtAuth');

router.post('/api/v1/purchase-book', checkAuth, purchase.purchaseBook);

module.exports = router;
