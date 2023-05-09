import {
  ExclamationTriangleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { useRouter } from "next/router";
import SidebarExpandButton from "src/components/buttons/sidebarExpandButton";
import InternalLayout from "src/components/layouts/internalLayout";
import Loader from "src/components/loader";
import HeaderText from "src/components/text/headerText";
import OverviewModules from "src/modules/overview/overviewModules";
import { api } from "src/utils/api";

const UserPage = () => {
  const router = useRouter();
  const { userId } = router.query;

  const { data, error, isLoading, isError } = api.user.getUser.useQuery(
    {
      userId: userId?.toString() ?? "",
    },
    { retry: false }
  );

  if (
    (isError && error && error.data && error.data?.code === "NOT_FOUND") ||
    (!isLoading && !data?.user)
  ) {
    return (
      <InternalLayout>
        <div className="flex w-full flex-col items-center justify-center pt-10">
          <ExclamationTriangleIcon className="h-20 w-20" />
          <h1 className="text-3xl font-semibold">404!</h1>
          <span className="text-neutral-500">
            We couldn&apos;t find this user
          </span>
        </div>
      </InternalLayout>
    );
  }

  if (isLoading || !data || !data.user) {
    return (
      <InternalLayout>
        <Loader />
      </InternalLayout>
    );
  }

  return (
    <InternalLayout>
      <div className="flex items-center">
        <SidebarExpandButton />
        {data.user.image ? (
          <Image
            className="inline-block h-16 w-16 rounded-full"
            src={data.user.image}
            alt={data.user.name || ""}
            height="64"
            width="64"
          />
        ) : (
          <UserCircleIcon className="h-16 w-16 rounded-full text-neutral-400" />
        )}
        <div className="flex-1 pl-2">
          <HeaderText>{data.user.name}&apos;s profile</HeaderText>
        </div>
      </div>
      <OverviewModules userId={userId?.toString() ?? ""} />
    </InternalLayout>
  );
};

export default UserPage;
