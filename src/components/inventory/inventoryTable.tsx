import { ArrowUpIcon } from "@heroicons/react/24/outline";
import type { SortingState } from "@tanstack/react-table";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import clsx from "clsx";
import Image from "next/image";
import { useState } from "react";
import Loader from "src/components/loader";
import type { RouterOutputs } from "src/utils/api";
import { api } from "src/utils/api";

type TableData = RouterOutputs["items"]["getTableData"]["items"];

const columnHelper = createColumnHelper<TableData[0]>();

const columns = [
  columnHelper.accessor("marketHashName", {
    cell: (info) => (
      <div className="flex items-center gap-1 md:gap-3">
        {
          <Image
            src={`https://community.akamai.steamstatic.com/economy/image/${info.row.original.icon}/360fx360f`}
            width={48}
            height={48}
            className="h-12 w-12 rounded-xl border border-neutral-200 dark:border-neutral-800"
            alt=""
          />
        }
        {info.row.original.marketHashName}{" "}
        <span className="text-neutral-500">
          {"\u00d7"}
          {info.row.original.quantity}
        </span>
      </div>
    ),
    header: () => <span>Item</span>,
  }),
  columnHelper.accessor("price", {
    cell: (info) => <span>{info.getValue().toFixed(2)}$</span>,
    header: () => <span>Price</span>,
  }),
  columnHelper.accessor("worth", {
    cell: (info) => <span>{info.getValue().toFixed(2)}$</span>,
    header: () => <span>Worth</span>,
  }),
  columnHelper.accessor("trend7d", {
    cell: (info) => (
      <span
        className={clsx(
          info.getValue() > 0 && "text-green-400",
          info.getValue() < 0 && "text-red-400"
        )}
      >
        {info.getValue().toFixed(2)}%
      </span>
    ),
    header: () => <span>Trend</span>,
  }),
];

// TODO: super hacky, but this is the acutal solution?
// https://github.com/TanStack/table/issues/4566
// What the hell tanstack query???
const emptyArray: TableData = [];

const InventoryTable = () => {
  const { data, isLoading } = api.items.getTableData.useQuery();
  const [sorting, setSorting] = useState<SortingState>([
    { desc: true, id: "price" },
  ]);

  const table = useReactTable({
    data: data?.items || emptyArray,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return <Loader />;
  }

  return (
    <table className="w-full border-separate border-spacing-0">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                scope="col"
                key={header.id}
                className={clsx(
                  "sticky top-0 z-10 h-14 border-b border-neutral-200 bg-white bg-opacity-75 text-base font-semibold backdrop-blur-sm backdrop-filter dark:border-neutral-800 dark:bg-bg-dark dark:bg-opacity-75",
                  header.column.getCanSort() && "cursor-pointer"
                )}
                onClick={header.column.getToggleSortingHandler()}
              >
                <div
                  className={clsx(
                    "flex items-center",
                    header.column.getCanSort() && !header.column.getIsSorted()
                      ? "pr-4"
                      : "gap-1"
                  )}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  {header.column.getIsSorted() && (
                    <ArrowUpIcon
                      className={clsx(
                        "inline-block h-3 w-3 rotate-0 transition-all duration-200",
                        (header.column.getIsSorted() as string) === "asc"
                          ? "rotate-0"
                          : "rotate-180"
                      )}
                    />
                  )}
                </div>
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className="py-2">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default InventoryTable;
