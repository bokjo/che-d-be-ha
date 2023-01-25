const express = require("express");
const bodyParser = require("body-parser");

const { Op } = require("sequelize");
const { sequelize } = require("./model");
const { getProfile } = require("./middleware/getProfile");

const { logger } = require("./logger");
const { pinoHttp } = require("pino-http");

const app = express();
app.use(bodyParser.json());
app.use(pinoHttp({ logger }));
app.set("sequelize", sequelize);
app.set("models", sequelize.models);

// Contracts

/**
 * Get contract by id
 * @returns single contract instance by specified identifier
 */
app.get("/contracts/:id", getProfile, async (req, res) => {
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
    return res
      .status(500)
      .json({ message: "Unknown error getting contract by id!" });
  }
});

/**
 * List contracts
 * @returns list of contracts belonging to a user (client or contractor)
 */
app.get("/contracts", getProfile, async (req, res) => {
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
    return res
      .status(500)
      .json({ message: "Unknown error listing contracts!" });
  }
});

module.exports = app;
