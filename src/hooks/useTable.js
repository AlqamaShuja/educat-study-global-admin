import { useState, useMemo } from "react";
import { useDebounce } from "./useDebounce";

const useTable = (initialData = [], initialConfig = {}) => {
  const {
    initialSort = { key: null, direction: "asc" },
    initialFilters = {},
    initialPageSize = 10,
  } = initialConfig;

  const [data, setData] = useState(initialData);
  const [sort, setSort] = useState(initialSort);
  const [filters, setFilters] = useState(initialFilters);
  const [selectedRows, setSelectedRows] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const debouncedSetFilters = useDebounce((newFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page on filter change
  }, 300);

  const handleSort = (key) => {
    setSort((prevSort) => ({
      key,
      direction:
        prevSort.key === key && prevSort.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleFilter = (filterKey, value) => {
    debouncedSetFilters((prevFilters) => ({
      ...prevFilters,
      [filterKey]: value,
    }));
  };

  const handleSelectRow = (rowId) => {
    setSelectedRows((prevSelected) =>
      prevSelected.includes(rowId)
        ? prevSelected.filter((id) => id !== rowId)
        : [...prevSelected, rowId]
    );
  };

  const handleSelectAll = (allRowIds) => {
    setSelectedRows((prevSelected) =>
      prevSelected.length === allRowIds.length ? [] : allRowIds
    );
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1) {
      setPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize) => {
    if (newSize > 0) {
      setPageSize(newSize);
      setPage(1);
    }
  };

  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply filters
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        result = result.filter((item) =>
          String(item[key])
            .toLowerCase()
            .includes(String(filters[key]).toLowerCase())
        );
      }
    });

    // Apply sorting
    if (sort.key) {
      result.sort((a, b) => {
        const aValue = a[sort.key];
        const bValue = b[sort.key];
        if (aValue < bValue) return sort.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sort.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, filters, sort]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  return {
    data: paginatedData,
    totalItems: filteredData.length,
    page,
    pageSize,
    sort,
    filters,
    selectedRows,
    setData,
    handleSort,
    handleFilter,
    handleSelectRow,
    handleSelectAll,
    handlePageChange,
    handlePageSizeChange,
  };
};

export default useTable;
