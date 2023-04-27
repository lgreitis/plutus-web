import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import React, { forwardRef, useState } from "react";

const button = cva(
  ["h-10 w-full rounded border px-3 text-sm transition-all duration-150"],
  {
    variants: {
      intent: {
        primary: [
          "border-black",
          "bg-black",
          "text-white",
          "hover:bg-white",
          "hover:text-black",
          "dark:border-white",
          "dark:bg-white",
          "dark:text-black",
          "hover:dark:bg-bg-dark",
          "hover:dark:text-white",
        ],
        secondary: [
          "border-neutral-200",
          "bg-white",
          "text-neutral-500",
          "hover:text-black",
          "hover:border-black",
          "dark:border-neutral-600",
          "dark:bg-bg-dark",
          "dark:text-neutral-400",
          "hover:dark:text-white",
          "hover:dark:border-white",
        ],
      },
      click: {
        true: ["!bg-neutral-300", "dark:!bg-neutral-700"],
      },
    },
    defaultVariants: {
      intent: "primary",
      click: false,
    },
  }
);

export interface ModalButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {}

const ModalButton = forwardRef<HTMLButtonElement, ModalButtonProps>(
  function ModalButton({ className, intent, ...props }, ref) {
    const [click, setClick] = useState(false);

    return (
      <button
        className={button({
          intent,
          click,
          className,
        })}
        {...props}
        onMouseDown={(e) => {
          e.button === 0 && setClick(true);
        }}
        onMouseUp={() => setClick(false)}
        ref={ref}
      />
    );
  }
);

export default ModalButton;
