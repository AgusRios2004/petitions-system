/**
 * Middleware de manejo de errores centralizado.
 * Este middleware se debe registrar DESPUÉS de todas las rutas en app.js.
 */
const errorHandler = (err, req, res, next) => {
  // Log del error para debugging. En producción, se podría usar un logger más avanzado.
  console.error('\n--- ERROR CAPTURADO ---');
  console.error(err.stack);
  console.error('-----------------------\n');

  // Si el error tiene un statusCode definido, se usa. Si no, es un error interno (500).
  const statusCode = err.statusCode || 500;

  // Si el error tiene un mensaje, se usa. Si no, se pone un mensaje genérico.
  const message = err.message || 'Ha ocurrido un error interno en el servidor.';

  // Se envía una respuesta JSON estandarizada.
  res.status(statusCode).json({
    status: 'error',
    message,
  });
};

module.exports = errorHandler;
