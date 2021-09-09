const jwt = require('jsonwebtoken');

const { SECRET_KEY } = require('../constants/config');

const UnauthorizedError = require('../errors/unauthorized-err');
const ForbiddenError = require('../errors/forbidden-err');
const { errorMessage } = require('../constants/constants');

const extractBearerToken = (header) => header.replace('Bearer ', '');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new ForbiddenError(errorMessage.authForbiddenError));
  }

  const token = extractBearerToken(authorization);
  let payload;

  try {
    payload = jwt.verify(token, SECRET_KEY);
  } catch (err) {
    return next(new UnauthorizedError(errorMessage.unauthorizedError));
  }

  req.user = payload;

  return next();
};
