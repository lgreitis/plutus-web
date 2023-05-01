import {
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import clsx from "clsx";
import { useAtom } from "jotai";
import { useMemo, useState } from "react";
import PaginationButton from "src/components/buttons/paginationButton";
import CurrencyField from "src/components/currencyField";
import Loader from "src/components/loader";
import ColorCell from "src/components/table/colorCell";
import GenericHeader from "src/components/table/genericHeader";
import ItemNameCell from "src/components/table/itemNameCell";
import SearchRowActions from "src/modules/search/searchRowActions";
import { filterAtom, searchVisibilityAtom } from "src/store";
import type { RouterOutputs } from "src/utils/api";
import { api } from "src/utils/api";

type TableData = RouterOutputs["search"]["allItems"]["items"];

const columnHelper = createColumnHelper<TableData[0]>();

const getSortByValue = (val?: string) => {
  const toTest = [
    "marketHashName",
    "volume24h",
    "volume7d",
    "change24h",
    "change7d",
    "change30d",
    "lastPrice",
  ] as const;

  if (toTest.includes(val as (typeof toTest)[number])) {
    return val as (typeof toTest)[number];
  }

  return "volume24h";
};

const columns = [
  columnHelper.accessor("marketHashName", {
    cell: (info) => (
      <ItemNameCell
        image={info.row.original.icon}
        borderColor={info.row.original.borderColor || "D2D2D2"}
        marketHashName={info.row.original.marketHashName}
      />
    ),
    header: () => <GenericHeader>Item</GenericHeader>,
  }),
  columnHelper.accessor("lastPrice", {
    cell: (info) => <CurrencyField value={info.getValue()} />,
    header: () => <GenericHeader>Price</GenericHeader>,
  }),
  columnHelper.accessor("volume24h", {
    cell: (info) => <CurrencyField value={info.getValue()} />,
    header: () => <GenericHeader>Volume 24h</GenericHeader>,
  }),
  columnHelper.accessor("volume7d", {
    cell: (info) => <CurrencyField value={info.getValue()} />,
    header: () => <GenericHeader>Volume 7d</GenericHeader>,
  }),
  columnHelper.accessor("change24h", {
    cell: (info) => <ColorCell value={info.getValue()}>%</ColorCell>,
    header: () => <GenericHeader>Trend 24h</GenericHeader>,
  }),
  columnHelper.accessor("change7d", {
    cell: (info) => <ColorCell value={info.getValue()}>%</ColorCell>,
    header: () => <GenericHeader>Trend 7d</GenericHeader>,
  }),
  columnHelper.accessor("change30d", {
    cell: (info) => <ColorCell value={info.getValue()}>%</ColorCell>,
    header: () => <GenericHeader>Trend 30d</GenericHeader>,
  }),
  columnHelper.display({
    id: "actions",
    cell: (props) => (
      <SearchRowActions
        key={props.row.original.marketHashName}
        favourite={props.row.original.favourite}
        marketHashName={props.row.original.marketHashName}
      />
    ),
  }),
];

interface Props {
  searchString?: string;
}

const SearchTable = (props: Props) => {
  const [sorting, setSorting] = useState<SortingState>([
    { desc: true, id: "volume24h" },
  ]);

  const [visibility, setVisibility] = useAtom(searchVisibilityAtom);

  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [filters] = useAtom(filterAtom);
  const toFilter = useMemo(() => {
    return Object.keys(
      Object.fromEntries(Object.entries(filters).filter(([, value]) => value))
    );
  }, [filters]);

  const { data, isFetching } = api.search.allItems.useQuery(
    {
      sortBy: getSortByValue(sorting[0]?.id),
      desc: sorting[0]?.desc,
      pageIndex,
      pageSize,
      filters: toFilter,
      searchString: props.searchString,
    },
    { keepPreviousData: true }
  );

  const defaultData = useMemo(() => [], []);

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const table = useReactTable({
    data: data?.items || defaultData,
    columns,
    state: {
      sorting,
      pagination,
      columnVisibility: visibility,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setVisibility,
    manualSorting: true,
    manualPagination: true,
  });

  return (
    <div>
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
                        ? ""
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
      <div className="flex items-center justify-between pt-2">
        <span>
          Showing {pageSize * pageIndex + 1} to{" "}
          {pageSize * pageIndex + pageSize} of {data?.count} results
        </span>
        <div className="flex gap-2">
          {isFetching && <Loader />}
          <PaginationButton
            onClick={() => table.previousPage()}
            disabled={pageIndex === 0}
          >
            <ChevronLeftIcon className="h-4 w-4 text-black dark:text-white" />
          </PaginationButton>
          <PaginationButton
            onClick={() => table.nextPage()}
            disabled={pageSize * pageIndex + pageSize >= (data?.count || 0)}
          >
            <ChevronRightIcon className="h-4 w-4 text-black dark:text-white" />
          </PaginationButton>
        </div>
      </div>
    </div>
  );
};
export default SearchTable;
