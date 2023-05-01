import { Popover } from "@headlessui/react";
import type { Placement } from "@popperjs/core";
import { useState } from "react";
import { usePopper } from "react-popper";

interface Props {
  button: React.ReactNode;
  children?: React.ReactNode;
  placement?: Placement;
}

const ListPopover = (props: Props) => {
  const [referenceElement, setReferenceElement] =
    useState<HTMLButtonElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  );
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: props.placement,
  });

  return (
    <Popover className="relative">
      <>
        <Popover.Button
          ref={setReferenceElement}
          className="flex h-7 items-center gap-1 rounded-md px-1 hover:bg-neutral-100 focus:outline-none dark:hover:bg-neutral-800"
        >
          {props.button}
        </Popover.Button>
        <Popover.Panel
          ref={setPopperElement}
          className="z-50 flex flex-col divide-y divide-neutral-200 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:divide-neutral-900 dark:bg-bg-dark dark:ring-neutral-900"
          {...attributes.popper}
          style={styles.popper}
        >
          {props.children}
        </Popover.Panel>
      </>
    </Popover>
  );
};

export default ListPopover;
