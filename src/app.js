const express = require("express");
const bodyParser = require("body-parser");

const { Op } = require("sequelize");
const { sequelize } = require("./model");
const { getProfile, clientsAllowedOnly } = require("./middleware");

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
      .json({ message: "Unknown error: getting contract by id!" });
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
      .json({ message: "Unknown error: listing contracts!" });
  }
});

// Jobs

/**
 * List all unpaid jobs for a user
 * @returns list all unpaid jobs for a user
 */
app.get("/jobs/unpaid", getProfile, async (req, res) => {
  const { Job, Contract } = req.app.get("models");
  const { id: profileId } = req.profile;

  try {
    const contracts = await Job.findAll({
      where: {
        paid: null,
      },
      include: {
        model: Contract,
        where: {
          [Op.or]: {
            ClientId: profileId,
            ContractorId: profileId,
          },
        },
      },
    });

    if (!contracts) {
      return res.status(404).json({ message: "No unpaid jobs found!" });
    }

    return res.status(200).json(contracts);
  } catch (error) {
    logger.error(error);
    return res
      .status(500)
      .json({ message: "Unknown error: listing unpaid jobs!" });
  }
});

/**
 * Create Payment for a job
 * @returns list all unpaid jobs for a user
 */
app.post(
  "/jobs/:job_id/pay",
  getProfile,
  clientsAllowedOnly,
  async (req, res) => {
    const { Job, Contract, Profile } = req.app.get("models");
    const { job_id } = req.params;
    const { id: profileId } = req.profile;

    const tx = await sequelize.transaction();

    try {
      const job = await Job.findOne({
        where: {
          id: job_id,
        },
        include: {
          model: Contract,
          where: {
            [Op.not]: {
              status: "terminated",
            },
            ClientId: profileId,
          },
        },
        transaction: tx,
      });

      if (!job) {
        return res
          .status(404)
          .json({ message: `Job with id: ${job_id} not found` });
      }

      if (job.paid) {
        return res
          .status(400)
          .json({ message: `Job with id: ${job_id} already paid` });
      }

      if (req.profile.balance < job.amount) {
        return res.status(400).json({
          message: "Insufficient funds in your balance!",
          balance: req.profile.balance,
        });
      }

      // TODO: handle decimals and potential rounding properly
      req.profile.balance = req.profile.balance - job.price;

      await req.profile.save({ transaction: tx });

      const contractorToUpdate = await Profile.findOne({
        where: { id: job.Contract.ContractorId, type: "contractor" },
        transaction: tx,
      });

      // TODO: handle decimals and potential rounding properly
      contractorToUpdate.balance = contractorToUpdate.balance + job.price;

      await contractorToUpdate.save({ transaction: tx });

      job.paid = 1;
      job.paymentDate = new Date();
      await job.save({ transaction: tx });
      await tx.commit();

      // TODO: clarify and standardize the response format (DTOs needed)!
      return res
        .status(200)
        .json({ message: `Payment successful for job with id: ${job_id}` });
    } catch (error) {
      await tx.rollback();
      logger.error(error);
      return res
        .status(500)
        .json({ message: "Unknown error: Create Job Payment!" });
    }
  }
);

module.exports = app;
