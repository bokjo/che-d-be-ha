class BaseError extends Error {
  constructor(...args) {
    super(...args);
    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(this.message).stack;
    }
  }
}

module.exports = BaseError;
