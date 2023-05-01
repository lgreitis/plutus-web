import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import InternalLayout from "src/components/layouts/internalLayout";
import Loader from "src/components/loader";
import XAxis from "src/modules/charts/XAxis";
import ItemHeader from "src/modules/item/itemHeader";
import ItemStatisticsGrid from "src/modules/item/itemStatisticsGrid";
import { getServerAuthSession } from "src/server/auth";
import { prisma } from "src/server/db";
import { api } from "src/utils/api";

const ItemChart = dynamic(() => import("src/modules/charts/itemChart"), {
  ssr: false,
});

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
      {itemInfoQuery.data && (
        <ItemHeader
          marketHashName={marketHashName?.toString() || ""}
          itemType={itemInfoQuery.data.type}
          onRangeChange={(key) => setRange(key)}
          range={range}
        />
      )}
      <div className="flex flex-col gap-5">
        {itemInfoQuery.data && <ItemStatisticsGrid data={itemInfoQuery.data} />}
        <div className="flex w-full flex-1 flex-col gap-4 rounded-md border border-neutral-200 p-4 dark:border-neutral-800">
          {query.data && itemInfoQuery.data && !query.isFetching ? (
            <>
              {query.data.length > 0 ? (
                <>
                  <div className="h-64">
                    <ItemChart
                      data={query.data}
                      buyPrice={itemInfoQuery.data.buyPrice || undefined}
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

export default ItemPage;
