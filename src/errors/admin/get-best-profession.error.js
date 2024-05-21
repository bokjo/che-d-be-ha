const BaseError = require("../base.error");

class GetBestProfessionError extends BaseError {
  constructor(message) {
    super(message);
    this.name = "GetBestProfessionError";
  }
}

module.exports = GetBestProfessionError;
