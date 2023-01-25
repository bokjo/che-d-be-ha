const express = require("express");
const bodyParser = require("body-parser");

const { pinoHttp } = require("pino-http");
const { logger } = require("./logger");

const { sequelize } = require("./model");
const { getProfile, clientsAllowedOnly } = require("./middleware");

const ContractsHandler = require("./handlers/contracts");
const JobsHandler = require("./handlers/jobs");
const BalancesHandler = require("./handlers/balances");
const AdminHandler = require("./handlers/admin");

const app = express();
app.use(bodyParser.json());
app.use(pinoHttp({ logger }));
app.set("sequelize", sequelize);
app.set("models", sequelize.models);

// Contracts
app.get("/contracts/:id", getProfile, ContractsHandler.getContractById);
app.get("/contracts", getProfile, ContractsHandler.listContracts);

// Jobs
app.get("/jobs/unpaid", getProfile, JobsHandler.listUnpaidJobs);
app.post("/jobs/:job_id/pay", getProfile, clientsAllowedOnly, JobsHandler.createJobPayment);

// Balances
app.post("/balances/deposit/:userId", getProfile, BalancesHandler.createBalanceDeposit);

// Admin
app.get("/admin/best-profession", getProfile, AdminHandler.getBestProfession);
app.get("/admin/best-clients", getProfile, AdminHandler.listBestClients);

// Global error handler
// TODO: add global error handler

module.exports = app;
