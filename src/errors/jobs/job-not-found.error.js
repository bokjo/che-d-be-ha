const BaseError = require("../base.error");

class JobNotFoundError extends BaseError {
  constructor(message) {
    super(message);
    this.name = "JobNotFoundError";
  }
}

module.exports = JobNotFoundError;
