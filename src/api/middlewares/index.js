const { getProfile } = require("./profile.middleware");
const { clientsAllowedOnly } = require("./clients.middleware");
const { adminsAllowedOnly } = require("./admins.middleware");
const { errorHandler } = require("./error-handler.middleware");

module.exports = {
  getProfile,
  clientsAllowedOnly,
  adminsAllowedOnly,
  errorHandler,
};
