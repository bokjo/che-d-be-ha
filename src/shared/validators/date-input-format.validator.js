function isValidDateFormat(date) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(date);
}
exports.isValidDateFormat = isValidDateFormat;
