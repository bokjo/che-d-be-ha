// eslint-disable-next-line consistent-return
const clientsAllowedOnly = (req, res, next) => {
  if (req.profile.type !== "client") {
    return res.status(403).end();
  }

  next();
};

module.exports = { clientsAllowedOnly };
