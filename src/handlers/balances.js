const { logger } = require("../logger");
const { sequelize } = require("../model");

/**
 * Create Deposit for a client
 * @returns deposit request status
 */
const createBalanceDeposit = async (req, res) => {
  const { Job, Contract } = req.app.get("models");
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

  // TODO: implement proper input validation with Joi or something similar!
  if (!amount || amount === "NaN") {
    return res.status(400).json({ message: "Please provide proper value for deposit amount!" });
  }

  if (parseInt(userId, 10) !== parseInt(req.profile.id, 10)) {
    return res.status(400).json({ message: "You can only deposit to your own balance!" });
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

    req.profile.balance += amount;
    await req.profile.save({ transaction: tx });

    await tx.commit();

    return res.status(200).json({ message: "Balance deposit successful" });
  } catch (error) {
    await tx.rollback();

    logger.error(error);
    return res.status(500).json({ message: "Unknown error: Create balance deposit!" });
  }
};

module.exports = {
  createBalanceDeposit,
};
