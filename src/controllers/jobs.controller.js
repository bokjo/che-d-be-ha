const { Op } = require("sequelize");
const { logger } = require("../shared/logger");
const { sequelize } = require("../db/models/model");
const { ContractStatus, ProfileType } = require("../shared/enums");
const { handlePaginationInputs } = require("../shared/handle-pagination-inputs");
const {
  BaseError,
  InputValidationError,
  JobNotFoundError,
  JobAlreadyPaidError,
  BalanceInsufficientAmountError,
  CreateJobPaymentError,
  ListJobsError,
} = require("../errors");

/**
 * List all unpaid jobs for a user
 * @query page - page number - default 1
 * @query limit - number of items per page - default 10
 * @returns list all unpaid jobs for a user
 */
const listUnpaidJobs = async (req, res, next) => {
  const { page, limit } = handlePaginationInputs(req.query);

  try {
    const { Job, Contract } = req.app.get("models");
    const { id: profileId } = req.profile;

    const jobContracts = await Job.findAll({
      where: {
        paid: {
          [Op.or]: {
            [Op.eq]: false,
            [Op.is]: null,
          },
        },
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
      offset: (page - 1) * limit,
      limit,
    });

    if (!jobContracts) {
      // TODO: return empty array instead of throwing an error?
      return next(new JobNotFoundError("No unpaid jobs found!"));
    }

    return res.status(200).json(jobContracts);
  } catch (error) {
    logger.error({ listUnpaidJobsError: error });

    if (error instanceof BaseError) return next(error);

    return next(new ListJobsError("Failed to fetch unpaid jobs!"));
  }
};

/**
 * Create Payment for a job
 * @returns confirmation of payment message
 */
const createJobPayment = async (req, res, next) => {
  const { job_id } = req.params;

  if (!job_id || Number.isNaN(parseInt(job_id, 10))) {
    return next(new InputValidationError("Please provide valid job id!"));
  }

  const tx = await sequelize.transaction();

  try {
    const { Job, Contract, Profile } = req.app.get("models");
    const { id: profileId } = req.profile;

    const job = await Job.findOne({
      where: {
        id: job_id,
      },
      include: {
        model: Contract,
        where: {
          [Op.not]: {
            status: ContractStatus.TERMINATED,
          },
          ClientId: profileId,
        },
      },
      transaction: tx,
    });

    if (!job) {
      return next(new JobNotFoundError(`Job with id: ${job_id} not found!`));
    }

    if (job.paid) {
      return next(new JobAlreadyPaidError(`Job with id: ${job_id} already paid!`));
    }

    if (req.profile.balance < job.price) {
      return next(
        new BalanceInsufficientAmountError(
          `Insufficient funds in your balance! [currentBalance: ${req.profile.balance}]`,
        ),
      );
    }

    req.profile.balance -= job.price;

    await req.profile.save({ transaction: tx });

    const contractorToUpdate = await Profile.findOne({
      where: { id: job.Contract.ContractorId, type: ProfileType.CONTRACTOR },
      transaction: tx,
    });

    // TODO: handle decimals and potential rounding properly
    contractorToUpdate.balance += job.price;

    await contractorToUpdate.save({ transaction: tx });

    job.paid = true;
    job.paymentDate = new Date();

    await job.save({ transaction: tx });
    await tx.commit();

    // TODO: clarify and standardize the response format (DTOs needed)!
    return res.status(200).json({ message: `Payment successful for job with id: ${job_id}` });
  } catch (error) {
    await tx.rollback();

    logger.error({ createJobPaymentError: error });

    if (error instanceof BaseError) return next(error);

    return next(new CreateJobPaymentError("Failed to create job payment!"));
  }
};

module.exports = {
  listUnpaidJobs,
  createJobPayment,
};
