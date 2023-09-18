const router = require('express').Router();
const fileController = require('../controller/fileController');

router.post('/api/v1/file/write', fileController.writeFile);
router.get('/api/v1/file/read', fileController.readFile);
// router.get('/api/v1/loop', purchase.loopWithoutAwait);

module.exports = router;
