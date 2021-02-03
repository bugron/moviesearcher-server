const router = require('express').Router();
const authMiddleware = require('./middlewares/auth');
const omdbMiddleware = require('./middlewares/omdb');

router.get('/api/search', authMiddleware, omdbMiddleware);

module.exports = router;
