const { Op } = require("sequelize");
const { logger } = require("../shared/logger");
const { sequelize } = require("../db/models/model");
const { adminInputDateValidator } = require("../shared/validators");
const { BaseError, ListBestClientsError, GetBestProfessionError } = require("../errors");

// TODO: move to admin controller class
/**
 * Admin Best Profession
 * @returns most popular profession in a given time period
 */
const getBestProfession = async (req, res, next) => {
  const { start, end } = req.query;

  try {
    await adminInputDateValidator(start, end);

    const { Job, Contract, Profile } = req.app.get("models");

    // TODO: move to admin service/repository class
    const [bestProfession] = await Job.findAll({
      where: {
        paid: true,
        createdAt: {
          [Op.between]: [start, end],
        },
      },
      include: {
        model: Contract,
        include: {
          model: Profile,
          as: "Contractor",
          attributes: ["profession"],
        },
      },
      group: ["profession"],
      order: [[sequelize.fn("sum", sequelize.col("price")), "DESC"]],
      limit: 1,
    });

    const profession = bestProfession?.Contract?.Contractor?.profession ?? null;

    return res.status(200).json({ profession });
  } catch (error) {
    logger.error({ getBestProfessionError: error });

    // TODO: handle DB/Sequelize errors!

    if (error instanceof BaseError) return next(error);

    return next(new GetBestProfessionError(`Failed to fetch the best profession between ${start} and ${end}`));
  }
};

/**
 * Admin Best Clients
 * @returns list of clients that paid the most for jobs in the query time period
 */
const listBestClients = async (req, res, next) => {
  const { start, end } = req.query;

  try {
    await adminInputDateValidator(start, end);

    // TODO: move to validator/default handler and add page!
    let { limit } = req.query;
    if (!limit || Number.isNaN(parseInt(limit, 10)) || limit < 1) {
      limit = 2;
    }

    const { Job, Contract, Profile } = req.app.get("models");

    const bestClients = await Job.findAll({
      attributes: [[sequelize.fn("sum", sequelize.col("price")), "paid"]],
      where: {
        paid: true,
        createdAt: {
          [Op.between]: [start, end],
        },
      },
      include: {
        model: Contract,
        include: {
          model: Profile,
          as: "Client",
          attributes: ["id", [sequelize.literal("firstName || ' ' || lastName"), "fullName"]],
        },
      },
      group: ["Contract.Client.id"],
      order: [[sequelize.fn("sum", sequelize.col("price")), "DESC"]],
      limit,
    });

    const response = bestClients.map((client) => ({
      id: client.Contract.Client.id,
      fullName: client.Contract.Client.dataValues.fullName,
      paid: client.paid,
    }));

    return res.status(200).json(response);
  } catch (error) {
    logger.error({ listBestClientsError: error });

    // TODO: handleDB/Sequelize errors!

    if (error instanceof BaseError) return next(error);

    return next(new ListBestClientsError("Failed to fetch the best clients"));
  }
};

module.exports = {
  getBestProfession,
  listBestClients,
};
