const BaseError = require("../base.error");

class ListJobsError extends BaseError {
  constructor(message) {
    super(message);
    this.name = "ListJobsError";
  }
}

module.exports = ListJobsError;
