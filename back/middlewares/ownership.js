// Utilidades de dueño: errores con statusCode y parseo de ids.
const httpError = (statusCode, message) => Object.assign(new Error(message), { statusCode });

// Devuelve el id como entero positivo o null si no es numérico.
const parseId = (raw) => (/^\d+$/.test(String(raw)) ? Number(raw) : null);

module.exports = { httpError, parseId };
