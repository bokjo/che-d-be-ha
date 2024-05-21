const BaseError = require("../base.error");

class BalanceInsufficientAmountError extends BaseError {
  constructor(message) {
    super(message);
    this.name = "BalanceInsufficientAmountError";
  }
}

module.exports = BalanceInsufficientAmountError;
