export const buildPagination = ({ page = 1, limit = 10, total = 0 }) => {
  const currentPage = Math.max(Number(page) || 1, 1);
  const pageSize = Math.max(Number(limit) || 10, 1);
  const pages = Math.ceil(total / pageSize);

  return {
    page: currentPage,
    limit: pageSize,
    total,
    pages,
    hasNextPage: currentPage < pages,
    hasPrevPage: currentPage > 1,
  };
};