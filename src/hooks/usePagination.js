import { useState } from 'react';

const usePagination = (initialPage = 1, initialPageSize = 10) => {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const handlePageChange = (newPage) => {
    if (newPage >= 1) {
      setPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize) => {
    if (newSize > 0) {
      setPageSize(newSize);
      setPage(1); // Reset to first page when page size changes
    }
  };

  const getPaginationParams = () => ({
    page,
    pageSize,
    offset: (page - 1) * pageSize,
  });

  return {
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    getPaginationParams,
  };
};

export default usePagination;
