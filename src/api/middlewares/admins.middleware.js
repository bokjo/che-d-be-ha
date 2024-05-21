// eslint-disable-next-line consistent-return
const adminsAllowedOnly = (req, res, next) => {
  // TODO: temporary, add proper authentication middleware with JWT

  const admin = req.headers["x-admin-key"];

  // TODO: temporary, add proper role based endpoint access
  if (!admin || admin !== 42) {
    return res.status(403).end();
  }

  req.isAdmin = true;
  next();
};

module.exports = { adminsAllowedOnly };
