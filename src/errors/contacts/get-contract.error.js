const BaseError = require("../base.error");

class GetContractError extends BaseError {
  constructor(message) {
    super(message);
    this.name = "GetContractError";
  }
}

module.exports = GetContractError;
