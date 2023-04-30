import SidebarExpandButton from "src/components/buttons/sidebarExpandButton";
import InternalLayout from "src/components/layouts/internalLayout";
import HeaderText from "src/components/text/headerText";
import SearchTable from "src/modules/search/searchTable";
import { serverSideRequireAuth } from "src/utils/serverSideRequireAuth";

export const getServerSideProps = serverSideRequireAuth;

const Search = () => {
  return (
    <InternalLayout showFilterCategories>
      <div className="flex items-center">
        <SidebarExpandButton />
        <HeaderText className="flex-1">All items</HeaderText>
        <input
          placeholder="Search..."
          className="h-full rounded bg-neutral-200 px-2 ring-1 ring-inset placeholder:text-neutral-500 focus:outline-none dark:bg-bg-dark dark:ring-neutral-800"
        />
      </div>
      <div className="flex flex-col gap-2">
        <SearchTable />
      </div>
    </InternalLayout>
  );
};

export default Search;
