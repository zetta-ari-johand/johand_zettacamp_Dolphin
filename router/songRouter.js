const router = require('express').Router();
const songController = require('../controller/songController');

router.post('/api/v1/song/create', songController.createSong);
router.get('/api/v1/song/findAll', songController.getAllSong);
router.put('/api/v1/song/update/:id', songController.updateSong);
router.delete('/api/v1/song/delete/:id', songController.deleteSong);

module.exports = router;
