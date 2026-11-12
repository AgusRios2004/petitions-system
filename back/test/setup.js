// Corre antes de cada archivo de test (jest.setupFilesAfterEnv).
// Deja una base vacía y descartable por archivo, y cierra todo al final.
const fs = require('fs');
const os = require('os');
const path = require('path');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';
process.env.JWT_EXPIRES = '1h';

const dialect = process.env.TEST_DB_DIALECT || 'sqlite';
let tmpDir;

if (dialect === 'sqlite') {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'jobfinder-test-'));
  process.env.TEST_DB_STORAGE = path.join(tmpDir, 'test.sqlite');
} else {
  const base = process.env.TEST_DB_NAME || '';
  if (!/_test$/.test(base)) {
    throw new Error('TEST_DB_NAME tiene que terminar en "_test": los tests recrean esa base.');
  }
  process.env.TEST_DB_NAME_EFECTIVO = `${base}_w${process.env.JEST_WORKER_ID || 1}`;
}

beforeAll(async () => {
  if (dialect !== 'mysql') return;
  const mysql = require('mysql2/promise');
  const connection = await mysql.createConnection({
    host: process.env.TEST_DB_HOST || '127.0.0.1',
    port: process.env.TEST_DB_PORT || 3306,
    user: process.env.TEST_DB_USER,
    password: process.env.TEST_DB_PASSWORD,
  });
  const name = process.env.TEST_DB_NAME_EFECTIVO;
  await connection.query(`DROP DATABASE IF EXISTS \`${name}\``);
  await connection.query(`CREATE DATABASE \`${name}\``);
  await connection.end();
});

afterAll(async () => {
  const { stopApp } = require('./helpers/app');
  await stopApp();
  if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true });
});
