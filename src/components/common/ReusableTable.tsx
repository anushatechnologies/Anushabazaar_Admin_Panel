import React from "react";

interface Column<T> {
  header: string;
  key: keyof T | string;
  render?: (item: T, index?: number) => React.ReactNode;
}

interface ReusableTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  emptyMessage?: string;
}

export default function ReusableTable<T extends { id: number | string }>({
  columns,
  data,
  loading,
  currentPage,
  totalPages,
  onPageChange,
  emptyMessage = "No Records Found",
}: ReusableTableProps<T>) {
  return (
    <div
      className="rounded-xl shadow-lg border overflow-x-auto w-full"
      style={{
        backgroundColor: "var(--card-bg)",
        borderColor: "var(--border-soft)",
      }}
    >
      <table className="w-full text-sm text-left">
        <thead
          style={{
            backgroundColor: "var(--border-soft)",
            color: "var(--text-color)",
          }}
        >
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-6 py-4 font-semibold">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-10"
                style={{ opacity: 0.6 }}
              >
                Loading...
              </td>
            </tr>
          )}

          {!loading && data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-10"
                style={{ opacity: 0.6 }}
              >
                {emptyMessage}
              </td>
            </tr>
          )}

          {!loading &&
            data.map((item, rowIdx) => (
              <tr
                key={item.id}
                className="border-b transition"
                style={{ borderColor: "var(--border-soft)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "rgba(150, 150, 150, 0.05)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="px-6 py-4">
                    {col.render
                      ? col.render(item, rowIdx)
                      : (item[col.key as keyof T] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 p-4">
          <button
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50 transition hover:opacity-80"
            style={{
              borderColor: "var(--border-soft)",
              color: "var(--text-color)",
            }}
          >
            Prev
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => onPageChange(i + 1)}
              className="px-3 py-1 border rounded transition"
              style={{
                borderColor: "var(--border-soft)",
                backgroundColor:
                  currentPage === i + 1
                    ? "var(--highlight-color)"
                    : "transparent",
                color: currentPage === i + 1 ? "#fff" : "var(--text-color)",
              }}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50 transition hover:opacity-80"
            style={{
              borderColor: "var(--border-soft)",
              color: "var(--text-color)",
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
