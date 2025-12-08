class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409; // 409 Conflict
  }
}

module.exports = { ConflictError };
