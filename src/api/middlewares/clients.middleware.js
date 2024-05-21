const { ProfileType } = require("../../shared/enums");

// eslint-disable-next-line consistent-return
const clientsAllowedOnly = (req, res, next) => {
  if (req.profile.type !== ProfileType.CLIENT) {
    return res.status(403).end();
  }

  next();
};

module.exports = { clientsAllowedOnly };
