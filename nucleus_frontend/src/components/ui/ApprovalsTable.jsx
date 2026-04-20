import React, { useState, useMemo } from "react";

export default function Table({
  data,
  columns,
  searchPlaceholder = "Search...",
  itemsPerPageOptions = [5, 10, 20, 50],
  defaultItemsPerPage = 10,
  className = "",
}) {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);

  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    return data.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(search.toLowerCase()),
      ),
    );
  }, [data, search]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];
      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, page, itemsPerPage]);

  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" },
    );
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  const getRowClassName = (row, index) => {
    const priority = row.priority?.toLowerCase();
    const role = row.role?.toLowerCase();
    const shouldHighlight =
      priority === "high" || priority === "critical" || role === "alumni";

    if (shouldHighlight) return "bg-red-200 hover:bg-red-300";
    return index % 2 === 0
      ? "bg-white hover:bg-indigo-50"
      : "bg-indigo-50/40 hover:bg-indigo-100";
  };

  return (
    <div
      className={`w-full rounded-2xl border border-indigo-100 bg-white shadow-lg ${className}`}
    >
      {/* Search + Controls */}
      <div className="flex flex-col gap-3 px-4 py-4 bg-indigo-50 border-b border-indigo-100 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder={searchPlaceholder}
          className="w-full rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:border-indigo-700 transition sm:w-64"
        />

        <div className="flex items-center gap-2 text-gray-700 text-sm">
          <span className="font-medium text-indigo-700">Rows per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setPage(1);
            }}
            className="rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:border-indigo-700 transition"
          >
            {itemsPerPageOptions.map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="block sm:hidden">
        {paginatedData.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">No data found</div>
        ) : (
          <div className="px-4 py-4 space-y-4">
            {paginatedData.map((row, i) => (
              <div
                key={i}
                className={`rounded-xl border border-indigo-100 p-4 shadow-sm ${getRowClassName(row, i)}`}
              >
                <div className="space-y-3">
                  {columns.map((col) => {
                    const isActionColumn =
                      String(col.key).toLowerCase().includes("action") ||
                      String(col.header).toLowerCase().includes("action");

                    return (
                      <div
                        key={String(col.key)}
                        className="grid grid-cols-[110px_minmax(0,1fr)] gap-3 items-start"
                      >
                        <span className="text-[11px] uppercase tracking-wider text-gray-500">
                          {col.header}
                        </span>
                        <div
                          className={`text-sm text-gray-800 ${
                            isActionColumn
                              ? "flex items-center justify-start gap-3"
                              : "text-right"
                          }`}
                        >
                          {col.render
                            ? col.render(row[col.key], row)
                            : String(row[col.key] ?? "")}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="hidden sm:block w-full overflow-x-auto overscroll-x-contain touch-pan-x [-webkit-overflow-scrolling:touch]">
        <table className="min-w-[820px] w-full border-collapse text-xs text-gray-700 sm:text-sm">
          <thead>
            <tr className="bg-indigo-800 text-white uppercase text-[11px] tracking-wider sm:text-xs">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`px-3 py-3 font-semibold text-left sm:px-5 sm:py-4 ${
                    col.className || ""
                  } ${
                    col.sortable
                      ? "cursor-pointer select-none hover:bg-indigo-800 transition"
                      : ""
                  }`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && sortConfig.key === col.key && (
                      <span className="text-indigo-200 text-xs">
                        {sortConfig.direction === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-8 text-center text-gray-500"
                >
                  No data found
                </td>
              </tr>
            ) : (
              paginatedData.map((row, i) => (
                <tr
                  key={i}
                  className={`transition-all duration-150 ${getRowClassName(row, i)}`}
                >
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={`px-3 py-3 border-b border-indigo-50 sm:px-5 sm:py-4 ${
                        col.className || ""
                      }`}
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : String(row[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-3 px-4 py-4 border-t border-indigo-100 bg-indigo-50 text-gray-700 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <span className="font-medium text-indigo-700">
          Page {page} of {totalPages || 1}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="rounded-lg px-4 py-1.5 border border-indigo-200 bg-white hover:bg-indigo-100 hover:border-indigo-300 transition disabled:opacity-40"
          >
            Prev
          </button>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages || totalPages === 0}
            className="rounded-lg px-4 py-1.5 border border-indigo-200 bg-white hover:bg-indigo-100 hover:border-indigo-300 transition disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
