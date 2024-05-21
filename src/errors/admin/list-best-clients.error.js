const BaseError = require("../base.error");

class ListBestClientsError extends BaseError {
  constructor(message) {
    super(message);
    this.name = "ListBestClientsError";
  }
}

module.exports = ListBestClientsError;
