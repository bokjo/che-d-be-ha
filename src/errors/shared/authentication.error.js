const BaseError = require("../base.error");

class AuthenticationError extends BaseError {
  constructor(message) {
    super(message);
    this.name = "AuthenticationError";
  }
}

module.exports = AuthenticationError;
