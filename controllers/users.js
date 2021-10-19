const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const NotFoundError = require('../errors/not-found-err');
const ValidationError = require('../errors/validation-err');
const ConflictError = require('../errors/conflict-err');
const UnauthorizedError = require('../errors/unauthorized-err');
const { errorMessage } = require('../constants/constants');

const { JWT_SECRET = 'secret-key' } = process.env;

// module.exports._getUsers = (req, res, next) => {
//   User.find({})
//     .then((users) => res.status(200).send(users))
//     .catch(next);
// };

module.exports.getUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (user === null) {
        throw new NotFoundError(errorMessage.userNotFoundError);
      }
      res.status(200).send({ email: user.email, name: user.name, _id: user._id });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new ValidationError(errorMessage.userIdValidationError));
        return;
      }
      next(err);
    });
};

module.exports.updateUser = (req, res, next) => {
  const currentUser = req.user._id;
  const { email, name } = req.body;

  User.findByIdAndUpdate(currentUser, { $set: { email, name } }, { new: true, runValidators: true })
    .then((user) => {
      if (user === null) {
        throw new NotFoundError(errorMessage.userNotFoundError);
      }
      res.status(200).send({ email: user.email, name: user.name });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError(errorMessage.updateUserValidationError));
        return;
      }
      if (err.name === 'CastError') {
        next(new ValidationError(errorMessage.userIdValidationError));
        return;
      }
      next(err);
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    email, name, password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => {
      User.create({
        email, name, password: hash,
      })
        .then((user) => {
          const newUser = Object.assign(user, { password: undefined });
          res.status(200).send(newUser);
        })
        .catch((err) => {
          if (err.name === 'ValidationError') {
            next(new ValidationError(errorMessage.createUserValidationError));
            return;
          }
          if (err.name === 'MongoServerError' && err.code === 11000) {
            next(new ConflictError(errorMessage.conflictError));
            return;
          }
          next(err);
        });
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      if (user === null) {
        throw new NotFoundError(errorMessage.userNotFoundError);
      }
      res.status(200).send({ token: jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' }) });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new UnauthorizedError(errorMessage.wrongUnauthorizedError));
        return;
      }
      next(err);
    });
};
