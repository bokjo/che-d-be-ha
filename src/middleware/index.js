const { getProfile } = require("./getProfile");
const { clientsAllowedOnly } = require("./clientsAllowedOnly");
const { adminsAllowedOnly } = require("./adminsAllowedOnly");

module.exports = {
  getProfile,
  clientsAllowedOnly,
  adminsAllowedOnly,
};
