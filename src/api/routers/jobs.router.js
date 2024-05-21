const { Router } = require("express");

const { listUnpaidJobs, createJobPayment } = require("../../controllers/jobs.controller");

const jobsRouter = Router();

jobsRouter.get("/unpaid", listUnpaidJobs);
jobsRouter.post("/:job_id/pay", createJobPayment);

module.exports = jobsRouter;
