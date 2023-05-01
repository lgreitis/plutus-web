import { useState } from "react";
import SidebarExpandButton from "src/components/buttons/sidebarExpandButton";
import InternalLayout from "src/components/layouts/internalLayout";
import HeaderText from "src/components/text/headerText";
import VisibilityPopover from "src/components/visibilityPopover";
import useDebounce from "src/hooks/useDebounce";
import SearchTable from "src/modules/search/searchTable";
import { searchVisibilityAtom } from "src/store";
import { serverSideRequireAuth } from "src/utils/serverSideRequireAuth";
import { searchVisibilityColumns } from "src/utils/visibilityColumns";

export const getServerSideProps = serverSideRequireAuth;

const Search = () => {
  const [searchString, setSearchString] = useState("");
  const debouncedSearchString = useDebounce(searchString, 250);

  return (
    <InternalLayout showFilterCategories>
      <div className="flex items-center">
        <SidebarExpandButton />
        <HeaderText>All items</HeaderText>
        <div className="flex-1 pl-2">
          <VisibilityPopover
            atom={searchVisibilityAtom}
            columns={searchVisibilityColumns}
          />
        </div>
        <input
          value={searchString}
          onChange={(e) => setSearchString(e.target.value)}
          placeholder="Search..."
          className="h-full rounded bg-neutral-50 px-2 ring-1 ring-inset ring-neutral-200 placeholder:text-neutral-500 focus:outline-none dark:bg-bg-dark dark:ring-neutral-800"
        />
      </div>
      <div className="flex flex-col gap-2">
        <SearchTable searchString={debouncedSearchString} />
      </div>
    </InternalLayout>
  );
};

export default Search;
