const BaseError = require("../base.error");

class ListContactsError extends BaseError {
  constructor(message) {
    super(message);
    this.name = "ListContactsError";
  }
}

module.exports = ListContactsError;
