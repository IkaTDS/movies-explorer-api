const joiErrors = require('celebrate').errors;
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const errors = require('./errors/errors');
const { limiter } = require('./middlewares/limiter');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const routes = require('./routes');
const { PORT, DB } = require('./constants/config');

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

mongoose.connect(DB);

app.use(routes);

app.use(requestLogger);
app.use(limiter);

app.use(errorLogger);

app.use(joiErrors());
app.use((err, req, res, next) => {
  errors(err, req, res, next);
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
