const router = require('express').Router();
const purchase = require('../controller/purchaseBookController');

//middleware auth
const checkAuth = require('../middleware/jwtAuth');

router.post('/api/v1/purchase-book', checkAuth, purchase.purchaseBook);
router.get('/api/v1/loop/await', purchase.loopWithAwait);
router.get('/api/v1/loop', purchase.loopWithoutAwait);

module.exports = router;
