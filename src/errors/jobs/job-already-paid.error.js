const BaseError = require("../base.error");

class JobAlreadyPaidError extends BaseError {
  constructor(message) {
    super(message);
    this.name = "JobAlreadyPaidError";
  }
}

module.exports = JobAlreadyPaidError;
