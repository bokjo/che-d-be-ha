const { Router } = require("express");

const { getContractById, listContracts } = require("../../controllers/contracts.controller");

const contractsRouter = Router();

contractsRouter.get("/:id", getContractById);
contractsRouter.get("/", listContracts);

module.exports = contractsRouter;
