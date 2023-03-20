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
import InternalLayout from "src/components/layouts/internalLayout";
import Loader from "src/components/loader";
import InventoryFetchModal from "src/components/modals/inventoryFetchModal";
import type { RouterOutputs } from "src/utils/api";
import { api } from "src/utils/api";
import { serverSideRequireAuth } from "src/utils/serverSideRequireAuth";

export const getServerSideProps = serverSideRequireAuth;

// https://github.com/swkeever/headless-ui-combobox-demo/blob/main/pages/index.tsx for future research

type TableData = RouterOutputs["items"]["getTableData"]["items"];

const columnHelper = createColumnHelper<TableData[0]>();

const columns = [
  columnHelper.accessor("icon", {
    cell: (info) => (
      <Image
        src={`https://community.akamai.steamstatic.com/economy/image/${info.getValue()}/360fx360f`}
        width={48}
        height={48}
        alt={info.getValue()}
      />
    ),
    size: 48,
    maxSize: 48,
    header: () => <span></span>,
    enableSorting: false,
  }),
  columnHelper.accessor("marketHashName", {
    cell: (info) => info.getValue(),
    header: () => <span>Name</span>,
  }),
  columnHelper.accessor("price", {
    cell: (info) => <span>{info.getValue().toFixed(2)}$</span>,
    header: () => <span>Price</span>,
  }),
  columnHelper.accessor("trend7d", {
    cell: (info) => <span>{info.getValue().toFixed(2)}%</span>,
    header: () => <span>Trend</span>,
  }),
];

const Inventory = () => {
  const { data, isLoading } = api.items.getTableData.useQuery();

  const [sorting, setSorting] = useState<SortingState>([
    { desc: true, id: "price" },
  ]);

  const table = useReactTable({
    data: data?.items || [],
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const [modalOpen, setModalOpen] = useState(false);

  return (
    <InternalLayout showFilterCategories headerText="Inventory">
      <button
        type="button"
        onClick={() => {
          setModalOpen(true);
        }}
      >
        Fetch inventory
      </button>
      {modalOpen && (
        <InventoryFetchModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
          }}
        />
      )}
      <div className="inline-block min-w-full overflow-scroll align-middle">
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
                        header.column.getCanSort() &&
                          !header.column.getIsSorted()
                          ? "pr-5"
                          : "gap-2"
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
                    {/* {{
                      asc: <ArrowUpIcon className="inline-block h-4 w-4" />,
                      desc: <ArrowDownIcon className="inline-block h-4 w-4" />,
                    }[header.column.getIsSorted() as string] ?? null} */}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b border-neutral-800">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="py-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isLoading && <Loader className="pt-4" />}
    </InternalLayout>
  );
};

export default Inventory;
