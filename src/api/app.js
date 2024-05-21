const express = require("express");
const { pinoHttp } = require("pino-http");

const { logger } = require("../shared/logger");

const { sequelize } = require("../db/models/model");
const { getProfile, errorHandler } = require("./middlewares");

// Routers
const { adminRouter, balancesRouter, contractsRouter, jobsRouter } = require("./routers");

const app = express();
app.use(express.json());
app.use(pinoHttp({ logger }));
app.set("sequelize", sequelize);
app.set("models", sequelize.models);
app.set("logger", logger);

// Admin
app.use("/admin", adminRouter);

// Balances
app.use("/balances", getProfile, balancesRouter);

// Contracts
app.use("/contracts", getProfile, contractsRouter);

// Jobs
app.use("/jobs", getProfile, jobsRouter);

// Global error handler
app.use(errorHandler);

module.exports = app;
