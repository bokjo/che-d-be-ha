// Base
const BaseError = require("./base.error");

// Shared
const AuthenticationError = require("./shared/authentication.error");
const MissingArgumentError = require("./shared/missing-argument.error");
const InputValidationError = require("./shared/input-validation.error");

// Admin
const ListBestClientsError = require("./admin/list-best-clients.error");
const GetBestProfessionError = require("./admin/get-best-profession.error");

// Balances
const BalanceNotFoundError = require("./balances/balance-not-found.error");
const CreateBalanceError = require("./balances/create-balance.error");
const BalanceDepositAmountError = require("./balances/balance-deposit-amount.error");
const BalanceInsufficientAmountError = require("./balances/balance-insufficient-amount.error");

// Contracts
const ListContactsError = require("./contacts/list-contacts.error");
const ContractNotFoundError = require("./contacts/contract-not-found.error");
const GetContractError = require("./contacts/get-contract.error");

// Jobs
const JobNotFoundError = require("./jobs/job-not-found.error");
const JobAlreadyPaidError = require("./jobs/job-already-paid.error");
const CreateJobPaymentError = require("./jobs/create-job-payment.error");
const ListJobsError = require("./jobs/list-jobs.error");

module.exports = {
  BaseError,

  AuthenticationError,
  MissingArgumentError,
  InputValidationError,

  ListBestClientsError,
  GetBestProfessionError,

  BalanceNotFoundError,
  CreateBalanceError,
  BalanceDepositAmountError,
  BalanceInsufficientAmountError,

  ListContactsError,
  ContractNotFoundError,
  GetContractError,

  JobNotFoundError,
  JobAlreadyPaidError,
  CreateJobPaymentError,
  ListJobsError,
};
