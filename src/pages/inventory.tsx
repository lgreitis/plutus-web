import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table";
import InternalLayout from "src/components/layouts/internalLayout";
import Loader from "src/components/loader";
import { api } from "src/utils/api";

// type Person = {
//   firstName: string;
//   lastName: string;
//   age: number;
//   visits: number;
//   status: string;
//   progress: number;
// };

// const defaultData: Person[] = [
//   {
//     firstName: "tanner",
//     lastName: "linsley",
//     age: 24,
//     visits: 100,
//     status: "In Relationship",
//     progress: 50,
//   },
//   {
//     firstName: "tandy",
//     lastName: "miller",
//     age: 40,
//     visits: 40,
//     status: "Single",
//     progress: 80,
//   },
//   {
//     firstName: "joe",
//     lastName: "dirte",
//     age: 45,
//     visits: 20,
//     status: "Complicated",
//     progress: 10,
//   },
// ];

const columnHelper = createColumnHelper<{
  name: string;
  price: number;
}>();

const columns = [
  columnHelper.accessor("name", {
    cell: (info) => info.getValue(),
    header: () => <span>Name</span>,
  }),
  columnHelper.accessor("price", {
    cell: (info) => <span>{info.getValue().toFixed(2)}$</span>,
    header: () => <span>Price</span>,
  }),

  // columnHelper.accessor("firstName", {
  //   cell: (info) => info.getValue(),
  //   footer: (info) => info.column.id,
  // }),
  // columnHelper.accessor((row) => row.lastName, {
  //   id: "lastName",
  //   cell: (info) => <i>{info.getValue()}</i>,
  //   header: () => <span>Last Name</span>,
  //   footer: (info) => info.column.id,
  // }),
  // columnHelper.accessor("age", {
  //   header: () => "Age",
  //   cell: (info) => info.renderValue(),
  //   footer: (info) => info.column.id,
  // }),
  // columnHelper.accessor("visits", {
  //   header: () => <span>Visits</span>,
  //   footer: (info) => info.column.id,
  // }),
  // columnHelper.accessor("status", {
  //   header: "Status",
  //   footer: (info) => info.column.id,
  // }),
  // columnHelper.accessor("progress", {
  //   header: "Profile Progress",
  //   footer: (info) => info.column.id,
  // }),
];

const Inventory = () => {
  const { data, isLoading } = api.items.getItems.useQuery();
  // const [data, setData] = useState(() => [...defaultData]);
  console.log(data, Date.now());
  const table = useReactTable({
    data: data?.items || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <InternalLayout showFilterCategories headerText="Inventory">
      <table className="w-full">
        <thead className="border-b border-neutral-600">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="text-left">
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="pb-4">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
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
