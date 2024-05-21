const BaseError = require("../base.error");

class CreateJobPaymentError extends BaseError {
  constructor(message) {
    super(message);
    this.name = "CreateJobPaymentError";
  }
}

module.exports = CreateJobPaymentError;
