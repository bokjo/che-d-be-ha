const BaseError = require("../base.error");

class InputValidationError extends BaseError {
  constructor(message) {
    super(message);
    this.name = "InputValidationError";
  }
}

module.exports = InputValidationError;
