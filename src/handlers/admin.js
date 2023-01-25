const { Op } = require("sequelize");
const { logger } = require("../logger");
const { sequelize } = require("../model");

/**
 * Admin Best Profession
 * @returns most popular profession in a given time period
 */
const getBestProfession = async (req, res) => {
  const { Job, Contract, Profile } = req.app.get("models");
  const { start, end } = req.query;

  // TODO: parse the start and end dates and validate them properly!
  // TODO: check if start date is before end date!
  if (!start) {
    return res.status(400).json({
      message: "Please provide 'start' date as query parameter! [format: YYYY-MM-DD]",
    });
  }

  if (!end) {
    return res.status(400).json({
      message: "Please provide 'end' date as query parameter! [format: YYYY-MM-DD]",
    });
  }

  try {
    const [bestProfession] = await Job.findAll({
      where: {
        // TODO: change if start and end dates should be optional
        paid: true,
        createdAt: {
          // TODO: clarify requirement, date between [createdAt, updatedAt or paymentDate]?
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
    logger.error(error);
    return res.status(500).json({ message: "Unknown error: Admin Best Profession!" });
  }
};

/**
 * Admin Best Clients
 * @returns list of clients that paid the most for jobs in the query time period
 */
const listBestClients = async (req, res) => {
  const { Job, Contract, Profile } = req.app.get("models");
  // eslint-disable-next-line prefer-const
  let { start, end, limit } = req.query;

  // TODO: parse the start and end dates and validate them properly!
  // TODO: check if start date is before end date!
  if (!start) {
    return res.status(400).json({ message: "Please provide start date as query parameter!" });
  }

  if (!end) {
    return res.status(400).json({ message: "Please provide end date as query parameter!" });
  }

  if (!limit || parseInt(limit, 10) === "NaN" || limit < 1) {
    limit = 2;
  }

  try {
    const bestClients = await Job.findAll({
      attributes: [[sequelize.fn("sum", sequelize.col("price")), "paid"]],
      where: {
        // TODO: change if start and end dates should be optional
        paid: true,
        createdAt: {
          // TODO: clarify requirement, date between [createdAt, updatedAt or paymentDate]?
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
    logger.error(error);
    return res.status(500).json({ message: "Unknown error: Admin Best Clients!" });
  }
};

module.exports = {
  getBestProfession,
  listBestClients,
};
