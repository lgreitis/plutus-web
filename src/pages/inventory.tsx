import type { SortingState } from "@tanstack/react-table";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import clsx from "clsx";
import { useEffect, useState } from "react";
import InternalLayout from "src/components/layouts/internalLayout";
import Loader from "src/components/loader";
import type { RouterOutputs } from "src/utils/api";
import { api } from "src/utils/api";
import { serverSideRequireAuth } from "src/utils/serverSideRequireAuth";

export const getServerSideProps = serverSideRequireAuth;

// https://github.com/swkeever/headless-ui-combobox-demo/blob/main/pages/index.tsx for future research

const columnHelper = createColumnHelper<{
  marketHashName: string;
  price: number;
  trend7d: number;
}>();

const columns = [
  columnHelper.accessor("marketHashName", {
    cell: (info) => info.getValue(),
    header: () => <span>Name</span>,
  }),
  columnHelper.accessor("price", {
    cell: (info) => <span>{info.getValue().toFixed(2)}$</span>,
    header: () => <span>Price</span>,
  }),
  columnHelper.accessor("trend7d", {
    enableSorting: true,
    cell: (info) => <span>{info.getValue().toFixed(2)}%</span>,
    header: () => <span>Trend</span>,
  }),
];

type TableData = RouterOutputs["items"]["getItems"]["items"];

const Inventory = () => {
  const { data, isLoading } = api.items.getItems.useQuery();

  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: data?.items || [],
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });

  useEffect(() => {
    console.log(sorting);
  }, [sorting]);

  return (
    <InternalLayout showFilterCategories headerText="Inventory">
      <table className="w-full">
        <thead className="border-b border-neutral-600">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="text-left">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={clsx(
                    "pb-4",
                    header.column.getCanSort() && "cursor-pointer"
                  )}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  {{
                    asc: " 🔼",
                    desc: " 🔽",
                  }[header.column.getIsSorted() as string] ?? null}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b border-neutral-800 ">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="py-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {isLoading && <Loader className="pt-4" />}
    </InternalLayout>
  );
};

export default Inventory;
