const { Router } = require("express");

const { createBalanceDeposit } = require("../../controllers/balances.controller");

const balancesRouter = Router();

balancesRouter.post("/deposit/:userId", createBalanceDeposit);

module.exports = balancesRouter;
