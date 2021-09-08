// const joiErrors = require('celebrate').errors;
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { login, createUser } = require('./controllers/users');
const auth = require('./middlewares/auth');

const NotFoundError = require('./errors/not-found-err');
const errors = require('./errors/errors');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { PORT = 3000 } = process.env;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

const app = express();

app.use(bodyParser.json());
app.use(helmet());

mongoose.connect('mongodb://localhost:27017/bitfilmsdb');

app.use(requestLogger);
app.use(limiter);

app.post('/signin', login);
app.post('/signup', createUser);

app.use('/users', auth, require('./routes/users'));
app.use('/movies', auth, require('./routes/movies'));

app.use(errorLogger);

app.use('*', (req, res, next) => next(new NotFoundError('Страница не существует')));

// app.use(joiErrors());
app.use((err, req, res, next) => {
  errors(err, req, res, next);
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
