const { AuthenticationError } = require("../../errors");

const getProfile = async (req, res, next) => {
  try {
    let profileId = req.get("profile_id");

    if (!profileId || Number.isNaN(parseInt(profileId, 10))) profileId = 0;

    const { Profile } = req.app.get("models");

    const profile = await Profile.findOne({
      where: { id: profileId },
    });

    if (!profile) {
      return next(new AuthenticationError("Unauthorized"));
    }

    req.profile = profile;
    return next();
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

module.exports = { getProfile };
