const { Op } = require("sequelize");
const { logger } = require("../shared/logger");
const { ContractStatus } = require("../shared/enums");
const { handlePaginationInputs } = require("../shared/handle-pagination-inputs");
const {
  BaseError,
  InputValidationError,
  ListContactsError,
  ContractNotFoundError,
  GetContractError,
} = require("../errors");

/**
 * Get contract by id
 * @returns single contract instance by specified identifier
 */
const getContractById = async (req, res, next) => {
  const { id } = req.params;

  if (!id || Number.isNaN(parseInt(id, 10))) {
    return next(new InputValidationError("Please provide valid contract id!"));
  }

  try {
    const { id: profileId } = req.profile;
    const { Contract } = req.app.get("models");

    const contract = await Contract.findOne({
      where: {
        id,
        [Op.or]: {
          ClientId: profileId,
          ContractorId: profileId,
        },
      },
    });

    if (!contract) {
      return next(new ContractNotFoundError(`Contract with id: ${id} not found!`));
    }

    return res.status(200).json(contract);
  } catch (error) {
    logger.error({ getContractByIdError: error });

    if (error instanceof BaseError) return next(error);

    return next(new GetContractError(`Failed to fetch contract with id: ${id}`));
  }
};

/**
 * List contracts
 * @query page - page number - default 1
 * @query limit - number of items per page - default 10
 * @returns list of contracts belonging to a user (client or contractor)
 */
const listContracts = async (req, res, next) => {
  const { page, limit } = handlePaginationInputs(req.query);

  try {
    const { Contract } = req.app.get("models");

    const contracts = await Contract.findAll({
      where: {
        [Op.not]: {
          status: ContractStatus.TERMINATED,
        },
        [Op.or]: {
          ClientId: req.profile.id,
          ContractorId: req.profile.id,
        },
      },
      offset: (page - 1) * limit,
      limit,
    });

    if (!contracts) {
      // TODO: return empty list instead of 404?
      return next(new ContractNotFoundError("No contracts found!"));
    }

    return res.status(200).json(contracts);
  } catch (error) {
    logger.error({ listContractsError: error });

    if (error instanceof BaseError) return next(error);

    return next(new ListContactsError("Failed to fetch contracts!"));
  }
};

module.exports = {
  getContractById,
  listContracts,
};
