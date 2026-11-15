// Elige la conexión: en tests, una base aparte y descartable
// (database.test.js); en cualquier otro caso, la de siempre (database.js).
module.exports = process.env.NODE_ENV === 'test'
  ? require('./database.test')
  : require('./database');
