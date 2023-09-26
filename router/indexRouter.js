const router = require('express').Router();
const songRouter = require('./songRouter');
const playlistRouter = require('./playlistRouter');

router.use(songRouter);
router.use(playlistRouter);
module.exports = router;
