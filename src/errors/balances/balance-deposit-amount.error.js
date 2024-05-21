const BaseError = require("../base.error");

class BalanceDepositAmountError extends BaseError {
  constructor(message) {
    super(message);
    this.name = "BalanceDepositAmountError";
  }
}

module.exports = BalanceDepositAmountError;
