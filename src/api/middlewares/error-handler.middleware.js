const {
  AuthenticationError,
  InputValidationError,
  GetBestProfessionError,
  ListBestClientsError,
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
} = require("../../errors");

const errorHandler = (err, req, res, next) => {
  // Bad Request 400
  if (
    err instanceof InputValidationError ||
    err instanceof BalanceDepositAmountError ||
    err instanceof BalanceInsufficientAmountError ||
    err instanceof JobAlreadyPaidError
  ) {
    return res.status(400).json({
      code: 400,
      status: "BAD_REQUEST_ERROR",
      message: err.message,
    });
  }

  // Unauthorized 401
  if (err instanceof AuthenticationError) {
    return res.status(401).json({
      code: 401,
      status: "UNAUTHORIZED",
      message: err.message,
    });
  }

  // Not Found 404
  if (err instanceof BalanceNotFoundError || err instanceof JobNotFoundError || err instanceof ContractNotFoundError) {
    return res.status(404).json({
      code: 404,
      status: "NOT_FOUND_ERROR",
      message: err.message,
    });
  }

  // Internal Server Error 500
  if (
    err instanceof InputValidationError ||
    err instanceof GetBestProfessionError ||
    err instanceof ListBestClientsError ||
    err instanceof CreateBalanceError ||
    err instanceof ListContactsError ||
    err instanceof GetContractError ||
    err instanceof CreateJobPaymentError ||
    err instanceof ListJobsError
  ) {
    return res.status(500).json({
      code: 500,
      status: "UNKNOWN_ERROR",
      message: err.message,
    });
  }

  return res.status(500).json({
    code: 500,
    status: "UNKNOWN_ERROR",
    message: "Internal Server Error",
  });
};

module.exports = {
  errorHandler,
};
