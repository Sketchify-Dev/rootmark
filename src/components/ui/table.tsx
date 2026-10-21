import type { ReactNode } from "react";

export function DataTable({
  columns,
  children,
  className = "",
}: {
  columns: { key: string; label: string; className?: string; align?: "left" | "right" }[];
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="data-table w-full border-collapse text-[13px]">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`label whitespace-nowrap px-2 py-2 font-medium ${
                  column.align === "right" ? "text-right" : "text-left"
                } ${column.className ?? ""}`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
