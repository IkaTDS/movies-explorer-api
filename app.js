const joiErrors = require('celebrate').errors;
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { login, createUser } = require('./controllers/users');
const auth = require('./middlewares/auth');
const NotFoundError = require('./errors/not-found-err');
const errors = require('./errors/errors');
const { validateSignUp, validateSignIn, validateAuthorization } = require('./middlewares/validation');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { PORT = 3000 } = process.env;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

const app = express();

const options = {
  origin: [
    'http://irakliy-diplom.nomoredomains.club',
    'https://irakliy-diplom.nomoredomains.club',
  ],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  allowedHeaders: ['Content-Type', 'origin', 'Authorization'],
};
app.use('*', cors(options));

app.use(bodyParser.json());
app.use(helmet());

mongoose.connect('mongodb://localhost:27017/moviesdb');

app.use(requestLogger);
app.use(limiter);

app.post('/signin', validateSignIn, login);
app.post('/signup', validateSignUp, createUser);

app.use('/users', validateAuthorization, auth, require('./routes/users'));
app.use('/movies', validateAuthorization, auth, require('./routes/movies'));

app.use(errorLogger);

app.use('*', (req, res, next) => next(new NotFoundError('Страница не существует')));

app.use(joiErrors());
app.use((err, req, res, next) => {
  errors(err, req, res, next);
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
