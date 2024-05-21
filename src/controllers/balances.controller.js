const { Op } = require("sequelize");
const { logger } = require("../shared/logger");
const { sequelize } = require("../db/models/model");
const { ContractStatus } = require("../shared/enums");
const {
  BaseError,
  InputValidationError,
  CreateBalanceError,
  BalanceDepositAmountError,
  JobNotFoundError,
} = require("../errors");

/**
 * Create Deposit for a client
 * @returns deposit request status
 */
const createBalanceDeposit = async (req, res, next) => {
  const { userId } = req.params;
  const amount = parseFloat(req.body.amount);

  /**
   * Requirement:
   * ***POST*** `/balances/deposit/:userId`
   * Deposits money into the the the balance of a client,
   * a client can't deposit more than 25% his total of jobs to pay. (at the deposit moment)
   *
   * NOTE: A bit confused about this requirement and its wording (despite the typos and grammar)
   * 1. Assume you can deposit to your own balance multiple times if the amount is < unpaidTotal + 25%?
   * 2. You cannot deposit more than 25% of your total unpaid jobs at once?!?
   */

  // TODO: move to shared validators
  if (Number.isNaN(amount)) {
    return next(new InputValidationError("Please provide proper numeric value for deposit amount!"));
  }

  if (amount <= 0) {
    return next(new InputValidationError("Deposit amount should be greater than 0!"));
  }

  if (parseInt(userId, 10) !== parseInt(req.profile.id, 10)) {
    return next(new InputValidationError("You can only deposit to your own account balance!"));
  }

  const tx = await sequelize.transaction();

  try {
    const { Job, Contract } = req.app.get("models");

    const unpaidJobs = await Job.findAll({
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
          // TODO: should be only jobs that are not terminated? [in_progress and new]?
          status: ContractStatus.IN_PROGRESS,
          ClientId: userId,
        },
      },
      transaction: tx,
    });

    if (!unpaidJobs || unpaidJobs.length === 0) {
      // TODO: should we allow depositing to balance even if there are no unpaid jobs? (e.g. to pay for future jobs as credit on our account)
      return next(new JobNotFoundError("No unpaid jobs found!"));
    }

    const unpaidTotal = unpaidJobs.reduce((acc, job) => acc + job.price, 0);

    if (amount > unpaidTotal * 0.25) {
      return next(
        new BalanceDepositAmountError(
          `Cannot deposit more than 25% of unpaid jobs total amount! [currentUnpaidTotal: ${unpaidTotal}]`,
        ),
      );
    }

    req.profile.balance += amount;
    await req.profile.save({ transaction: tx });

    await tx.commit();

    return res.status(200).json({ message: `Successfully deposited ${amount} to your account!` });
  } catch (error) {
    await tx.rollback();

    logger.error({ createBalanceDepositError: error });

    if (error instanceof BaseError) return next(error);

    return next(new CreateBalanceError("Failed to create balance deposit!"));
  }
};

module.exports = {
  createBalanceDeposit,
};
