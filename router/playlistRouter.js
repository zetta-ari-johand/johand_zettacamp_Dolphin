const router = require('express').Router();
const playlist = require('../controller/playlistController');

//middleware auth
const checkAuth = require('../middleware/jwtAuth');
router.use(checkAuth);

router.get('/api/v1/song/artist', playlist.byArtist);
router.get('/api/v1/song/genre', playlist.byGenres);
router.get('/api/v1/song/random', playlist.randomPlaylist);

module.exports = router;
