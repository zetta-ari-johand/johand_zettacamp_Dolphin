const router = require('express').Router();
const purchase = require('../controller/purchaseBookController');

//middleware auth
const checkAuth = require('../middleware/jwtAuth');

router.post('/api/v1/purchase-book', checkAuth, purchase.purchaseBook);
router.post('/api/v1/book/insert', purchase.createBook);
router.post('/api/v1/book/find', purchase.findBook);
router.post('/api/v1/book/update', purchase.updateBook);
router.post('/api/v1/book/remove', purchase.deleteBook);
router.post('/api/v1/author/insert', purchase.addAuthor);

module.exports = router;
