import { Popover } from "@headlessui/react";
import { CalendarIcon } from "@heroicons/react/24/outline";
import getSymbolFromCurrency from "currency-symbol-map";
import { useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { usePopper } from "react-popper";
import { toast } from "sonner";
import Loader from "src/components/loader";
import DefaultModal from "src/components/modal/defaultModal";
import ModalButton from "src/components/modal/modalButton";
import ModalCloseButton from "src/components/modal/modalCloseButton";
import { api } from "src/utils/api";

interface Props {
  open: boolean;
  onClose: () => void;
  marketHashName: string;
  itemId: string;
  buyDate: Date;
  buyPrice?: number;
}

const ItemEditModal = (props: Props) => {
  const { open, onClose: onCloseProp } = props;
  const query = api.settings.getCurrentCurrency.useQuery(undefined, {
    staleTime: Infinity,
  });
  const apiContext = api.useContext();
  const mutateItem = api.items.updateUserItem.useMutation({
    onSuccess: async () => {
      await apiContext.inventory.getTableData.invalidate();
      toast.success("Item updated.");
    },
  });

  const [date, setDate] = useState<Date>(props.buyDate);
  const [buyPrice, setBuyPrice] = useState<string | undefined>(
    props.buyPrice?.toString() ?? ""
  );

  const currencySymbol = useMemo(
    () => getSymbolFromCurrency(query.data?.conversionCurrency || "USD"),
    [query.data?.conversionCurrency]
  );

  const onClose = () => {
    setDate(props.buyDate);
    setBuyPrice(props.buyPrice?.toString() ?? "");
    onCloseProp();
  };

  return (
    <DefaultModal onClose={onClose} open={open}>
      <ModalCloseButton onClick={onClose} />
      <h1>{props.marketHashName}</h1>
      <div className="flex w-full">
        <div className="flex w-full flex-col items-start gap-5">
          <div className="flex w-full flex-col items-start gap-2">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              Buy date:
            </span>
            <BuyDate date={date} onChange={(date) => setDate(date)} />
          </div>
          <div className="flex w-full flex-col items-start gap-2">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              Buy price:
            </span>
            <div className="flex h-10 w-full overflow-hidden rounded-md ring-1 ring-neutral-200 dark:ring-neutral-600">
              <input
                value={buyPrice}
                onChange={(e) => {
                  let value = e.target.value;
                  value = value.replace(/[^\d.,]/g, "");
                  value = value.replace(/[.,]+/g, ".");
                  setBuyPrice(value);
                }}
                onBlur={(e) =>
                  setBuyPrice(parseFloat(e.target.value).toString())
                }
                className="mx-3 w-full bg-white focus:outline-none dark:bg-bg-dark"
              />
              {currencySymbol && (
                <div className="border-netural-200 flex h-full items-center justify-center border-l bg-neutral-100 px-4 dark:border-neutral-600 dark:bg-neutral-900">
                  {currencySymbol}
                </div>
              )}
            </div>
          </div>
          <div className="flex w-full gap-4">
            <ModalButton intent="secondary" onClick={onClose}>
              Cancel
            </ModalButton>
            <ModalButton
              onClick={() => {
                mutateItem.mutate({
                  buyDate: date,
                  buyPrice: parseFloat(buyPrice || "0") ?? null,
                  itemId: props.itemId,
                });
              }}
            >
              {mutateItem.isLoading ? <Loader /> : "Save"}
            </ModalButton>
          </div>
        </div>
      </div>
    </DefaultModal>
  );
};

interface BuyDateProps {
  date: Date;
  onChange: (date: Date) => void;
}

const BuyDate = (props: BuyDateProps) => {
  const [referenceElement, setReferenceElement] =
    useState<HTMLButtonElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  );
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "bottom",
    modifiers: [{ name: "offset", options: { offset: [0, 10] } }],
  });

  return (
    <Popover className="relative w-full">
      <>
        <Popover.Button
          as={ModalButton}
          ref={setReferenceElement}
          intent="secondary"
          className="flex items-center justify-center gap-2"
        >
          <CalendarIcon className="h-5 w-5" />
          {props.date ? props.date.toLocaleDateString() : "Select date..."}
        </Popover.Button>
        <Popover.Panel
          ref={setPopperElement}
          {...attributes.popper}
          style={styles.popper}
          className="w-fit rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:divide-neutral-900 dark:bg-bg-dark dark:ring-white dark:ring-opacity-5"
        >
          <DayPicker
            onSelect={(day) => {
              props.onChange(day ?? new Date());
            }}
            selected={props.date}
            mode="single"
            classNames={{
              caption: "flex items-center justify-between pb-4",
              button:
                "!cursor-pointer !border hover:border-black !rounded-md !font-normal !text-sm dark:hover:border-white",
              nav_button:
                "!border-none inline-flex !w-5 !h-5 !text-neutral-400 !transition hover:!text-black dark:hover:!text-white",
              caption_label: "!text-sm",
              head_cell: "!text-neutral-400 !font-normal !text-sm",
            }}
            modifiersClassNames={{
              selected:
                "!bg-black !rounded-md !text-white dark:!bg-white dark:!text-black",
              today: "!bg-blue-500 !rounded-md !text-white",
            }}
          />
        </Popover.Panel>
      </>
    </Popover>
  );
};

export default ItemEditModal;
