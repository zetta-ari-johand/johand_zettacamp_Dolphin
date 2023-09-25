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
router.get('/api/v1/bookshelves/insert-id', purchase.addBookShelves);
router.post('/api/v1/bookshelves/find', purchase.getBookShelves);
router.post('/api/v1/bookshelves/update', purchase.updateBookShelves);
router.post('/api/v1/bookshelves/delete', purchase.deleteBookShelves);

module.exports = router;
