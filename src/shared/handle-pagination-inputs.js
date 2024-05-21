function handlePaginationInputs(queryParams) {
  let { page, limit } = queryParams;

  page = parseInt(page, 10);
  limit = parseInt(limit, 10);

  if (!page || page < 1 || Number.isNaN(page)) page = 1;
  if (!limit || limit < 1 || Number.isNaN(limit)) limit = 10;

  return { page, limit };
}

module.exports = {
  handlePaginationInputs,
};
