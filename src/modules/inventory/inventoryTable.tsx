import {
  ArrowUpIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import type { SortingState } from "@tanstack/react-table";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import clsx from "clsx";
import { useAtom } from "jotai";
import { useMemo, useState } from "react";
import CurrencyField from "src/components/currencyField";
import Loader from "src/components/loader";
import ColorCell from "src/components/table/colorCell";
import GenericHeader from "src/components/table/genericHeader";
import ItemNameCell from "src/components/table/itemNameCell";
import { filterAtom, visibilityAtom } from "src/store";
import type { RouterOutputs } from "src/utils/api";
import { api } from "src/utils/api";

type TableData = RouterOutputs["inventory"]["getTableData"]["items"];

const columnHelper = createColumnHelper<TableData[0]>();

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
  columnHelper.accessor("dateAdded", {
    cell: (info) => <span>{info.getValue().toLocaleDateString()}</span>,
    header: () => <GenericHeader>Date Added</GenericHeader>,
  }),
  columnHelper.accessor("buyPrice", {
    cell: (info) => <span>{info.getValue()}</span>,
    // cell: ({ getValue, row }) => {
    //   const initialValue = getValue();
    //   const apiUtils = api.useContext();
    //   const { mutate } = api.inventory.updateItemInfo.useMutation();
    //   // eslint-disable-next-line react-hooks/rules-of-hooks
    //   const [value, setValue] = useState(initialValue?.toString());
    //   // eslint-disable-next-line react-hooks/rules-of-hooks
    //   const [edit, setEdit] = useState(false);
    //   // eslint-disable-next-line react-hooks/rules-of-hooks
    //   const inputRef = useRef<HTMLInputElement>(null);

    //   // eslint-disable-next-line react-hooks/rules-of-hooks
    //   useEffect(() => {
    //     if (inputRef.current && edit) {
    //       inputRef.current.focus();
    //     }
    //   }, [inputRef, edit]);

    //   const updatePrice = () => {
    //     // mutate(
    //     //   {
    //     //     id: row.original.id,
    //     //     buyPrice: parseFloat(value || "0"),
    //     //   },
    //     //   {
    //     //     onSuccess: (data) => {
    //     //       toast.success("Data updated");
    //     //       // void apiUtils.inventory.getTableData.invalidate();
    //     //       void apiUtils.inventory.getInventoryWorth.invalidate();
    //     //       apiUtils.inventory.getTableData.setData(
    //     //         undefined,
    //     //         (tableData) => {
    //     //           if (!tableData) {
    //     //             return tableData;
    //     //           }
    //     //           const find = tableData.items.find(
    //     //             (el) => el.id === row.original.id
    //     //           );
    //     //           if (!find) {
    //     //             return tableData;
    //     //           }
    //     //           const filtered = tableData.items.filter(
    //     //             (el) => el.id !== row.original.id
    //     //           );
    //     //           filtered.push({ ...find, buyPrice: data.buyPrice });
    //     //           return { ...tableData, items: filtered };
    //     //         }
    //     //       );
    //     //     },
    //     //   }
    //     // );
    //   };

    //   return (
    //     <div
    //       className="w-full"
    //       onClick={(e) => {
    //         if (e.detail === 2) setEdit(true);
    //       }}
    //       onBlur={() => {
    //         setEdit(false);
    //       }}
    //     >
    //       {edit ? (
    //         <input
    //           ref={inputRef}
    //           className="h-12 w-20 bg-white dark:bg-bg-dark"
    //           value={value || ""}
    //           onChange={(e) => setValue(e.target.value)}
    //           onBlur={updatePrice}
    //         />
    //       ) : (
    //         <CurrencyField noConvert value={initialValue || 0.0} />
    //       )}
    //     </div>
    //   );
    // },
    header: () => <GenericHeader>Buy Price</GenericHeader>,
  }),
  columnHelper.accessor("price", {
    cell: (info) => <CurrencyField value={info.getValue()} />,
    header: () => <GenericHeader>Price</GenericHeader>,
  }),
  columnHelper.accessor("quantity", {
    cell: (info) => <span>{info.getValue()}</span>,
    header: () => <GenericHeader>Qty.</GenericHeader>,
  }),
  columnHelper.accessor("worth", {
    cell: (info) => <CurrencyField value={info.getValue()} />,
    header: () => <GenericHeader>Worth</GenericHeader>,
  }),
  columnHelper.accessor("trend7d", {
    cell: (info) => <ColorCell value={info.getValue()}>%</ColorCell>,
    header: () => <GenericHeader>Trend 7d</GenericHeader>,
  }),
];

// TODO: super hacky, but this is the acutal solution?
// https://github.com/TanStack/table/issues/4566
// What the hell tanstack query???
const emptyArray: TableData = [];

const InventoryTable = () => {
  const [filters] = useAtom(filterAtom);
  const toFilter = useMemo(() => {
    return Object.keys(
      Object.fromEntries(Object.entries(filters).filter(([, value]) => value))
    );
  }, [filters]);

  const { data, isLoading } = api.inventory.getTableData.useQuery({
    filters: toFilter,
  });

  const [sorting, setSorting] = useState<SortingState>([
    { desc: true, id: "worth" },
  ]);

  const [visibility, setVisibility] = useAtom(visibilityAtom);

  const table = useReactTable({
    data: data?.items || emptyArray,
    columns,
    state: {
      columnVisibility: visibility,
      sorting,
    },
    onColumnVisibilityChange: setVisibility,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return <Loader />;
  }

  if (!isLoading && data && data?.items.length === 0 && !toFilter.length) {
    return (
      <div className="flex w-full flex-col items-center">
        <ExclamationTriangleIcon className="h-20 w-20" />
        <h1 className="text-3xl font-semibold">Your inventory is empty!</h1>
        <span className="text-neutral-500">
          Press the refresh button to fetch the items from your Steam inventory.
        </span>
      </div>
    );
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
  );
};

export default InventoryTable;
