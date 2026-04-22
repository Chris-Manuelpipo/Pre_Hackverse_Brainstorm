function paginate({ total, page, limit }) {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page:        parseInt(page),
    limit:       parseInt(limit),
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

module.exports = { paginate };
