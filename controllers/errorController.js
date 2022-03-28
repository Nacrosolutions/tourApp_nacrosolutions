const AppError = require("../utils/apiError");



const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateIdDB = err => {
  const value = Object.values(err.keyValue)[0];
  console.log(value);
  const message = `Duplicate field value ${value} . Please us another value`;



  return new AppError(message, 400);
};


const handleJWTError = err => {

  return new AppError('Invalid Token . please signUp again ', 401);
}


const handleExpiredToken = err => {
  return new AppError('Token have expired', 401)
}

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid Input Data ${errors.join('. ')}`;

  return new AppError(message, 400)
}


const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};


const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    // console.error('ERROR 💥', err);

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }
};


module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'Error'

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  }

  else if (process.env.NODE_ENV === 'production') {
    let error = Object.create(err);
    console.log(error);
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) {
      error = handleDuplicateIdDB(error);
    }

    if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }

    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError(error);
    }

    if (error.name === 'TokenExpiredError') {
      error = handleExpiredToken(error);
    }

    sendErrorProd(error, res);
  }

};

