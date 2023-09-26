const router = require('express').Router();
const playlistController = require('../controller/playlistController');

router.post('/api/v1/playlist/create', playlistController.createPlaylist);
router.post('/api/v1/playlist/create/genre', playlistController.createPlaylistByGenre);
router.get('/api/v1/playlist/getAll', playlistController.getPlaylist);
router.put('/api/v1/playlist/update/:id', playlistController.updatePlaylist);
router.delete('/api/v1/playlist/delete/:id', playlistController.deletePlaylist);

module.exports = router;
