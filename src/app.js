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

// Balances

/**
 * Create Deposit for a client
 * @returns deposit request status
 */
app.post("/balances/deposit/:userId", getProfile, async (req, res) => {
  const { Job, Contract } = req.app.get("models");
  const { userId } = req.params;
  const amount = parseFloat(req.body.amount);

  /**
   * Requirement: ***POST*** `/balances/deposit/:userId` - Deposits money into the the the balance of a client, a client can't deposit more than 25% his total of jobs to pay. (at the deposit moment)
   *
   * NOTE: A bit confused about this requirement and its wording (despite the typos and grammar)
   * 1. Assume you can deposit to your own balance multiple times if the amount is < unpaidTotal + 25%?
   * 2. You cannot deposit more than 25% of your total unpaid jobs at once?!?
   */

  // TODO: implement proper input validation with Joi or something similar!
  if (!amount || amount === "NaN") {
    return res
      .status(400)
      .json({ message: "Please provide proper value for deposit amount!" });
  }

  if (parseInt(userId) !== parseInt(req.profile.id)) {
    return res
      .status(400)
      .json({ message: "You can only deposit to your own balance!" });
  }

  const tx = await sequelize.transaction();

  try {
    const unpaidJobs = await Job.findAll({
      where: {
        paid: null,
      },
      include: {
        model: Contract,
        where: {
          status: "in_progress",
          // [Op.not]: { // TODO: should be only jobs that are not terminated? [in_progress and new]?
          //   status: "terminated",
          // },
          ClientId: userId,
        },
      },
      transaction: tx,
    });

    if (!unpaidJobs || unpaidJobs.length === 0) {
      // TODO: should we allow depositing to balance even if there are no unpaid jobs? (e.g. to pay for future jobs as credit on our account)
      return res.status(404).json({ message: "No unpaid jobs found" });
    }

    const unpaidTotal = unpaidJobs.reduce((acc, job) => acc + job.price, 0);

    if (amount > unpaidTotal * 0.25) {
      return res.status(400).json({
        message: "Cannot deposit more than 25% of unpaid jobs total amount!",
        total: unpaidTotal,
      });
    }

    req.profile.balance = req.profile.balance + amount;
    await req.profile.save({ transaction: tx });

    await tx.commit();

    return res.status(200).json({ message: "Balance deposit successful" });
  } catch (error) {
    await tx.rollback();

    logger.error(error);
    return res
      .status(500)
      .json({ message: "Unknown error: Create balance deposit!" });
  }
});

module.exports = app;
