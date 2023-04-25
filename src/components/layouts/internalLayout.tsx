import Sidebar from "src/modules/sidebar/sidebar";

type Props = {
  children?: React.ReactNode;
  showFilterCategories?: boolean;
};

const InternalLayout = (props: Props) => {
  const { children, showFilterCategories } = props;

  return (
    <div className="bg-white dark:bg-bg-dark">
      <Sidebar showFilterCategories={showFilterCategories} />
      <main className="flex flex-1 flex-col md:pl-64">
        <div className="flex h-screen max-h-screen flex-col gap-6 px-4 py-4 md:px-9">
          {children}
        </div>
      </main>
    </div>
  );
};

export default InternalLayout;
