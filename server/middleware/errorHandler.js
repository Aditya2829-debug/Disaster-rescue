// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  console.error(err.stack);

  let status = err.status || 500;
  let message = err.message || 'Internal server error';

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  // JWT Errors
  if (err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Token expired, please login again';
  }
  if (err.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Invalid token';
  }

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
