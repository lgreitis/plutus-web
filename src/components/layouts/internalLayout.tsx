import Sidebar from "src/components/sidebar/sidebar";

type Props = {
  children?: React.ReactNode;
  headerText?: string;
  showFilterCategories?: boolean;
};

const InternalLayout = (props: Props) => {
  const { children, headerText, showFilterCategories } = props;

  return (
    <div className=" bg-white dark:bg-bg-dark">
      <Sidebar showFilterCategories={showFilterCategories} />
      <main className="flex flex-1 flex-col md:pl-64">
        <div className="flex h-screen max-h-screen flex-col gap-6 px-9 py-7">
          <h1 className="text-2xl font-semibold">{headerText}</h1>
          {children}
        </div>
      </main>
    </div>
  );
};

export default InternalLayout;
