const { Router } = require("express");

const { getBestProfession, listBestClients } = require("../../controllers/admin.controller");

const adminRouter = Router();

adminRouter.get("/best-profession", getBestProfession);
adminRouter.get("/best-clients", listBestClients);

module.exports = adminRouter;
