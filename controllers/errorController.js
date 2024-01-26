const AppError = require('../utils/appError.js');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]; // undefind call
  console.log(value);

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  console.log(errors);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJwtError = () =>
  new AppError('Invalid token! Please log in again', 401);

const handleJwtExpiredError = () =>
  new AppError('Your token has expired! Please log in again', 401);

const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // RENDERED WEBSITE
    res.status(err.statusCode).render('error', {
      title: `Something went wrong`,
      msg: err.message,
    });
  }
};

const sendErrorProd = (err, req, res) => {
  //A) API
  if (req.originalUrl.startsWith('/api')) {
    //A) Opreational,trusted error : send message to client
    console.log(err.isOperational);
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    //B) Pogramming or other unknown error : don't leak error detalis
    // 1) Log Error
    console.error('ERROR 💥', err);

    // 2) Send Genric Message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
  // B) RENDERED WEBSITE
  //A) Opreational,trusted error : send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: `Something went wrong`,
      msg: err.message,
    });
  }
  //B) Pogramming or other unknown error : don't leak error detalis
  // 1) Log Error
  console.error('ERROR 💥', err);

  // 2) Send Genric Message
  return res.status(err.statusCode).render('error', {
    title: `Something went wrong`,
    msg: 'Please try again later.',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (error.kind === 'ObjectId') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error._message === 'Validation failed')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJwtError();
    if (error.name === 'TokenExpiredError') error = handleJwtExpiredError();

    sendErrorProd(error, req, res);
  }
};
