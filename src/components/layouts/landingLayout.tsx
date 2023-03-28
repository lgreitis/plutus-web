import { CirclesBottom, CirclesTop } from "src/modules/hero/circles";

type Props = {
  children?: React.ReactNode;
};

const LandingLayout = (props: Props) => {
  return (
    <>
      <div className="isolate h-screen min-h-screen bg-white dark:bg-bg-dark">
        <CirclesTop />
        <CirclesBottom />
        {props.children}
      </div>
    </>
  );
};
export default LandingLayout;
