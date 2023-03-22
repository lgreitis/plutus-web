import * as Tooltip from "@radix-ui/react-tooltip";

interface Props {
  icon: React.ReactNode;
  tooltipText: string;
  onClick?: () => void;
}

const TooltipIconButton = (props: Props) => {
  const { icon, tooltipText, onClick } = props;

  return (
    <Tooltip.Provider delayDuration={500}>
      <Tooltip.Root>
        <Tooltip.Trigger
          onClick={onClick}
          className="h-7 w-7 rounded-md p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          {icon}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className="rounded-sm bg-neutral-100 px-1 dark:bg-neutral-900">
            {tooltipText}
            <Tooltip.Arrow className="fill-neutral-100 dark:fill-neutral-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};

export default TooltipIconButton;
