const BaseError = require("../base.error");

class CreateBalanceError extends BaseError {
  constructor(message) {
    super(message);
    this.name = "CreateBalanceError";
  }
}

module.exports = CreateBalanceError;
