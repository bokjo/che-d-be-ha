const BaseError = require("../base.error");

class BalanceNotFoundError extends BaseError {
  constructor(message) {
    super(message);
    this.name = "BalanceNotFoundError";
  }
}

module.exports = BalanceNotFoundError;
