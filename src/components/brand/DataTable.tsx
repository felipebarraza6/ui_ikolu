import type { ReactNode } from "react";
import { text } from "@/lib/records";

export type DataColumn = {
  key: string;
  label: string;
  render?: (_row: Record<string, unknown>) => ReactNode;
};

export function DataTable({
  rows,
  columns,
  empty = "Sin registros.",
}: {
  rows: Record<string, unknown>[];
  columns: DataColumn[];
  empty?: string;
}) {
  if (!rows.length) return <p className="text-sm text-muted-foreground">{empty}</p>;

  const cell = (row: Record<string, unknown>, column: DataColumn) =>
    column.render ? column.render(row) : text(row, [column.key]);

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-[11px] uppercase tracking-wider text-muted-foreground">
              {columns.map((column) => (
                <th key={column.key} className="px-2 py-2 font-bold">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={String(row.id ?? row.pk ?? index)} className="border-b last:border-0">
                {columns.map((column) => (
                  <td key={column.key} className="px-2 py-2 align-top">
                    {cell(row, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 md:hidden">
        {rows.map((row, index) => (
          <article key={String(row.id ?? row.pk ?? index)} className="rounded-lg border p-3">
            {columns.map((column) => (
              <div key={column.key} className="flex items-start justify-between gap-3 py-1 text-sm">
                <span className="text-muted-foreground">{column.label}</span>
                <span className="text-right font-bold">{cell(row, column)}</span>
              </div>
            ))}
          </article>
        ))}
      </div>
    </>
  );
}
