const BaseError = require("../base.error");

class MissingArgumentError extends BaseError {
  constructor(message) {
    super(message);
    this.name = "MissingArgumentError";
  }
}

module.exports = MissingArgumentError;
