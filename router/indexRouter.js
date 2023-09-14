const router = require('express').Router();
const loginRouter = require('./loginRouter');
const fileRouter = require('./fileRouter');
const playlistRouter = require('./playlistRouter');

router.use(loginRouter);
router.use(fileRouter);
router.use(playlistRouter);

module.exports = router;
