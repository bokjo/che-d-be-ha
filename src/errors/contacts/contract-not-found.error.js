const BaseError = require("../base.error");

class ContractNotFoundError extends BaseError {
  constructor(message) {
    super(message);
    this.name = "ContractNotFoundError";
  }
}

module.exports = ContractNotFoundError;
