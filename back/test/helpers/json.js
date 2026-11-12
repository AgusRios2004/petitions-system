// Cuenta cuántas veces aparece una clave, en cualquier nivel de un JSON.
function countKey(value, key) {
  if (Array.isArray(value)) return value.reduce((n, item) => n + countKey(item, key), 0);
  if (value && typeof value === 'object') {
    return Object.entries(value).reduce(
      (n, [k, v]) => n + (k === key ? 1 : 0) + countKey(v, key),
      0,
    );
  }
  return 0;
}

module.exports = { countKey };
