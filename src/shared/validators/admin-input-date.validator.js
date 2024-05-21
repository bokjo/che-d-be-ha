const { isValidDateFormat } = require("./date-input-format.validator");
const { InputValidationError } = require("../../errors");

const adminInputDateValidator = async (start, end) => {
  if (!start || !isValidDateFormat(start)) {
    throw new InputValidationError("Please provide 'start' date as query parameter! [format: YYYY-MM-DD]");
  }

  if (!end || !isValidDateFormat(end)) {
    throw new InputValidationError("Please provide 'end' date as query parameter! [format: YYYY-MM-DD]");
  }

  if (+new Date(start) > +new Date(end)) {
    throw new InputValidationError("'start' date should be before 'end' date!");
  }

  return true;
};

module.exports = {
  adminInputDateValidator,
};
