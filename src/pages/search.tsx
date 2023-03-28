import Image from "next/image";
import Link from "next/link";
import InternalLayout from "src/components/layouts/internalLayout";
import Loader from "src/components/loader";
import HeaderText from "src/components/text/headerText";
import { api } from "src/utils/api";
import { serverSideRequireAuth } from "src/utils/serverSideRequireAuth";

export const getServerSideProps = serverSideRequireAuth;

const Search = () => {
  const { data, mutate, isLoading } = api.search.findItem.useMutation();

  return (
    <InternalLayout>
      <HeaderText>All items</HeaderText>
      <input
        className="block w-full rounded-md border-0 p-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 focus-visible:outline-none dark:bg-bg-dark dark:text-white dark:ring-neutral-800 sm:text-sm sm:leading-6"
        placeholder="Search..."
        onChange={(e) => {
          mutate({ searchString: e.target.value.trim().replace(" ", " & ") });
        }}
      />
      {isLoading && <Loader />}
      <div className="flex flex-col gap-2">
        {data &&
          data.items.map((el) => (
            <Link
              href={`/item/${el.marketHashName}`}
              key={el.id}
              className="flex w-full items-center gap-2 rounded-md border border-neutral-200 px-2 dark:border-neutral-800"
            >
              <Image
                src={`https://community.akamai.steamstatic.com/economy/image/${el.icon}/360fx360f`}
                width={48}
                height={48}
                alt={el.marketHashName}
              />
              <div className="flex-1">{el.marketHashName}</div>
              <span>{el.latestPrice.toFixed(2)}$</span>
            </Link>
          ))}
      </div>
    </InternalLayout>
  );
};

export default Search;
