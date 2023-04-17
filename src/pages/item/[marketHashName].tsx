import { faSteam } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { format } from "date-fns";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import CurrencyField from "src/components/currencyField";
import InternalLayout from "src/components/layouts/internalLayout";
import Loader from "src/components/loader";
import HeaderText from "src/components/text/headerText";
import { getServerAuthSession } from "src/server/auth";
import { prisma } from "src/server/db";
import { api } from "src/utils/api";

const ItemChart = dynamic(() => import("src/modules/charts/itemChart"), {
  ssr: false,
});

const ranges = [
  {
    key: "week",
    title: "Week",
  },
  {
    key: "month",
    title: "Month",
  },
  {
    key: "year",
    title: "Year",
  },
  {
    key: "all",
    title: "All",
  },
] as const;

export const getServerSideProps: GetServerSideProps<{
  exists: boolean;
}> = async (context) => {
  const session = await getServerAuthSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const steamAccount = await prisma.account.findFirst({
    where: { userId: session.user.id, provider: "steam" },
  });

  if (!steamAccount || !steamAccount.steamid) {
    return {
      redirect: {
        destination: "/link-steam-account",
        permanent: false,
      },
    };
  }

  const marketHashName = context.query["marketHashName"]?.toString();

  const item = await prisma.item.findUnique({
    where: { marketHashName: marketHashName },
    select: { id: true },
  });

  if (!item) {
    return { props: { exists: false } };
  }

  return { props: { exists: true } };
};

const ItemPage = ({
  exists,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const { marketHashName } = router.query;
  const [range, setRange] = useState<"month" | "week" | "year" | "all">(
    "month"
  );
  const itemInfoQuery = api.items.getItem.useQuery(
    {
      marketHashName: marketHashName?.toString() || "",
    },
    { enabled: exists }
  );
  const query = api.items.getItemStatistics.useQuery(
    {
      marketHashName: marketHashName?.toString() || "",
      range: range,
    },
    { enabled: exists, refetchOnWindowFocus: false }
  );
  const [axisData, setAxisData] = useState<
    { dateMin: Date; dateMax: Date } | undefined
  >();

  useEffect(() => {
    setAxisData(undefined);
  }, [query.data]);

  if (!exists) {
    return (
      <InternalLayout>
        <div className="flex w-full flex-col items-center justify-center pt-10">
          <ExclamationTriangleIcon className="h-20 w-20" />
          <h1 className="text-3xl font-semibold">404!</h1>
          <span className="text-neutral-500">
            We can&apos;t find this item :(
          </span>
        </div>
      </InternalLayout>
    );
  }

  return (
    <InternalLayout>
      <HeaderText className="flex flex-col items-center gap-2 md:flex-row">
        <span>{marketHashName}</span>
        <Link
          href={`https://steamcommunity.com/market/listings/730/${encodeURIComponent(
            marketHashName?.toString() || ""
          )}`}
          target="_blank"
          className="flex h-7 w-7 items-center gap-1 rounded-md px-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <FontAwesomeIcon icon={faSteam} className="h-5 w-5" />
        </Link>
        <div className="flex-1"></div>
        <div className="flex w-1/4 min-w-max justify-between divide-x divide-neutral-800 rounded border border-neutral-800">
          {ranges.map((el) => (
            <button
              type="button"
              key={el.key}
              onClick={() => {
                setRange(el.key);
              }}
              className={clsx(
                range === el.key && "bg-neutral-200  dark:bg-neutral-800",
                "w-full p-1 text-sm text-neutral-800 transition-all hover:bg-neutral-200  dark:text-neutral-200  dark:hover:bg-neutral-800"
              )}
            >
              {el.title}
            </button>
          ))}
        </div>
      </HeaderText>
      <div className="flex flex-col gap-5">
        <div className="flex w-full flex-1 rounded-md border border-neutral-200 p-4 dark:border-neutral-800">
          <Image
            src={`https://community.akamai.steamstatic.com/economy/image/${
              itemInfoQuery.data?.icon || ""
            }/360fx360f`}
            width={176}
            height={176}
            className="h-44 w-44"
            alt=""
          />
          <div className="ml-4 flex gap-4 border-l border-neutral-200 pl-4 dark:border-neutral-800">
            {/* TODO: */}
            <div className="flex flex-col justify-between ">
              <span>
                Latest price:{" "}
                <CurrencyField value={itemInfoQuery.data?.lastPrice || 0} />
              </span>
              <span>
                volume24h:{" "}
                <CurrencyField
                  value={itemInfoQuery.data?.ItemStatistics?.volume24h || 0}
                />
              </span>
            </div>
            {/* <div className="flex flex-col justify-between ">
              <span>Market volume:</span>
              <span>Sales this week:</span>
              <span>Sales this month:</span>
              <span>Sales this year:</span>
            </div> */}
            {/* <div className="flex flex-col justify-between">
              <span>Median price this week:</span>
              <span>Median price this month:</span>
              <span>Median price this year:</span>
            </div> */}
            <div className="flex flex-col justify-between">
              <span>
                Change day:{" "}
                {itemInfoQuery.data?.ItemStatistics?.change24h.toFixed(2)}%
              </span>
              <span>
                Change week:{" "}
                {itemInfoQuery.data?.ItemStatistics?.change7d.toFixed(2)}%
              </span>
              <span>
                Change month:{" "}
                {itemInfoQuery.data?.ItemStatistics?.change30d.toFixed(2)}%
              </span>
              {/* <span>Change year:</span> */}
            </div>
          </div>
        </div>
        <div className="flex w-full flex-1 flex-col gap-4 rounded-md border border-neutral-200 p-4 dark:border-neutral-800">
          {query.data && !query.isFetching ? (
            <>
              {query.data.length > 0 ? (
                <>
                  <div className="h-64">
                    <ItemChart
                      data={query.data}
                      onZoom={(dateMin, dateMax) => {
                        setAxisData({ dateMin, dateMax });
                      }}
                    />
                  </div>
                  <XAxis data={query.data} axisData={axisData} />
                </>
              ) : (
                <div className="flex h-64 w-full flex-col items-center justify-center">
                  <ExclamationTriangleIcon className="h-20 w-20" />
                  <h1 className="text-3xl font-semibold">No data!</h1>
                  <span className="text-neutral-500">
                    We can&apos;t find any historical data about this item.
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="flex h-64 justify-center">
              <Loader />
            </div>
          )}
        </div>
      </div>
    </InternalLayout>
  );
};

interface XAxisProps {
  data: { date: Date }[];
  axisData?: { dateMin: Date; dateMax: Date };
}

const XAxis = (props: XAxisProps) => {
  const { data, axisData } = props;
  if (!data[0]) {
    return null;
  }

  return (
    <div className="-mt-4 flex justify-between">
      <span className="pl-1 text-sm text-neutral-500">
        {format(axisData?.dateMin || data[0].date, "dd LLL, yyyy")}
      </span>
      <span className="pr-1 text-sm text-neutral-500">
        {format(
          axisData?.dateMax || data[data.length - 1]?.date || new Date(),
          "dd LLL, yyyy"
        )}
      </span>
    </div>
  );
};

export default ItemPage;
