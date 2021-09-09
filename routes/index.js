const router = require('express').Router();
const auth = require('../middlewares/auth');
const NotFoundError = require('../errors/not-found-err');
const { errorMessage } = require('../constants/constants');

const { login, createUser } = require('../controllers/users');
const { validateSignUp, validateSignIn, validateAuthorization } = require('../middlewares/validation');

router.post('/signin', validateSignIn, login);
router.post('/signup', validateSignUp, createUser);

router.use('/users', validateAuthorization, auth, require('./users'));
router.use('/movies', validateAuthorization, auth, require('./movies'));

router.use('*', (req, res, next) => next(new NotFoundError(errorMessage.pageNotFoundError)));

module.exports = router;
