// Conexión para los tests (NODE_ENV=test). NUNCA lee DB_NAME, DB_USER ni
// MYSQL_URL: los tests no pueden tocar la base de desarrollo aunque exista un
// .env cargado.
//
// - Por defecto: SQLite en un archivo temporal por archivo de test (lo crea y
//   lo borra back/test/setup.js). No necesita ningún servicio.
// - Con TEST_DB_DIALECT=mysql: una MySQL de test (PRD §4, E0). El nombre de la
//   base tiene que terminar en "_test"; setup.js le agrega el número de worker
//   y la recrea en cada archivo de test.
const { Sequelize } = require('sequelize');

const dialect = process.env.TEST_DB_DIALECT || 'sqlite';
let sequelize;

if (dialect === 'sqlite') {
  if (!process.env.TEST_DB_STORAGE) {
    throw new Error('TEST_DB_STORAGE no está definido: los tests se corren con `npm test` (ver back/test/setup.js).');
  }
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.TEST_DB_STORAGE,
    logging: false,
    // SQLite no tiene bloqueo de fila (ignora FOR UPDATE). BEGIN IMMEDIATE
    // serializa las transacciones de escritura, que es lo más parecido.
    transactionType: 'IMMEDIATE',
  });
  sequelize.addHook('afterConnect', (connection) => {
    connection.configure('busyTimeout', 10000);
  });
} else if (dialect === 'mysql') {
  const name = process.env.TEST_DB_NAME_EFECTIVO;
  if (!name || !/_test(_w\d+)?$/.test(name)) {
    throw new Error('La base de test de MySQL tiene que terminar en "_test" (TEST_DB_NAME).');
  }
  sequelize = new Sequelize(name, process.env.TEST_DB_USER, process.env.TEST_DB_PASSWORD, {
    host: process.env.TEST_DB_HOST || '127.0.0.1',
    port: process.env.TEST_DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
  });
} else {
  throw new Error(`TEST_DB_DIALECT no soportado: ${dialect}`);
}

module.exports = sequelize;
