// middlewares/response.js
exports.success = (res, data, message = 'OK', statusCode = 200) => {
  res.status(statusCode).json({ status: 'success', message, data });
};

exports.error = (res, message = 'Error interno', statusCode = 500, errors = null) => {
  res.status(statusCode).json({ status: 'error', message, errors });
};
