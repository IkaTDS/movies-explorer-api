const router = require('express').Router();
// const { validateCardCreation, validateCardId } = require('../middlewares/validation');

const {
  getMovies, createMovie, deleteMovie,
} = require('../controllers/movies');

router.get('/', getMovies);
router.post('/', createMovie);
router.delete('/:movieId', deleteMovie);

module.exports = router;
