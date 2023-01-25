const { Op } = require("sequelize");
const { logger } = require("../logger");

/**
 * Get contract by id
 * @returns single contract instance by specified identifier
 */
const getContractById = async (req, res) => {
  const { Contract } = req.app.get("models");
  const { id } = req.params;
  const { id: profileId } = req.profile;

  try {
    const contract = await Contract.findOne({
      where: {
        id,
        [Op.or]: {
          ClientId: profileId,
          ContractorId: profileId,
        },
      },
    });

    if (!contract) return res.status(404).end();

    return res.status(200).json(contract);
  } catch (error) {
    logger.error(error);
    // TODO: create dedicated error and pass it to next(), propagate at the top for the top level error handler
    return res.status(500).json({ message: "Unknown error: getting contract by id!" });
  }
};

/**
 * List contracts
 * @returns list of contracts belonging to a user (client or contractor)
 */
const listContracts = async (req, res) => {
  const { Contract } = req.app.get("models");

  try {
    const contracts = await Contract.findAll({
      where: {
        [Op.not]: {
          status: "terminated",
        },
        [Op.or]: {
          ClientId: req.profile.id,
          ContractorId: req.profile.id,
        },
      },
    });

    if (!contracts) {
      return res.status(404).json({ message: "No contracts found!" });
    }

    return res.status(200).json(contracts);
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: "Unknown error: listing contracts!" });
  }
};

module.exports = {
  getContractById,
  listContracts,
};
