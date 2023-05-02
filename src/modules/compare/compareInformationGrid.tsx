import Image from "next/image";
import CurrencyField from "src/components/currencyField";
import ColorCell from "src/components/table/colorCell";
import type { RouterOutputs } from "src/utils/api";

type Data = RouterOutputs["items"]["getItemCompare"]["item1"];

interface Props {
  data: Data;
}

const CompareInformationGrid = (props: Props) => {
  const { data } = props;

  return (
    <div className="grid grid-flow-dense grid-cols-1 gap-2 md:gap-4 lg:grid-cols-2 xl:grid-cols-3">
      <div className="row-span-2 flex aspect-square items-center justify-center rounded-md border border-neutral-200 dark:border-neutral-800 xl:max-h-72">
        <Image
          src={`https://community.akamai.steamstatic.com/economy/image/${
            data.icon || ""
          }/360fx360f`}
          width={360}
          height={360}
          className="aspect-auto h-full w-full"
          alt=""
        />
      </div>
      <div className="h-full rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
        <Field label="Latest price:">
          <CurrencyField value={data.lastPrice || 0} />
        </Field>
      </div>
      <div className="flex h-full justify-between rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
        <Field label="Buy price:">
          {data.buyPrice ? <CurrencyField value={data.buyPrice || 0} /> : "---"}
        </Field>
      </div>
      <div className="col-span-full flex h-full flex-col justify-between rounded-md border border-neutral-200 p-3 dark:border-neutral-800 lg:col-span-2 lg:flex-row">
        <Field label="Volume this day:">
          <CurrencyField value={data.ItemStatistics?.volume24h || 0} />
        </Field>
        <Field label="Volume this week:">
          <CurrencyField value={data.ItemStatistics?.volume7d || 0} />
        </Field>
      </div>
      <div className="col-span-full flex h-full flex-col justify-between rounded-md border border-neutral-200 p-3 dark:border-neutral-800 lg:flex-row">
        <Field label="Change day:">
          <ColorCell value={data.ItemStatistics?.change24h || 0}>%</ColorCell>
        </Field>
        <Field label="Change week:">
          <ColorCell value={data.ItemStatistics?.change7d || 0}>%</ColorCell>
        </Field>
        <Field label="Change month:">
          <ColorCell value={data.ItemStatistics?.change30d || 0}>%</ColorCell>
        </Field>
      </div>
    </div>
  );
};

interface FieldProps {
  label?: string;
  children?: React.ReactNode;
}

const Field = (props: FieldProps) => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center lg:items-start ">
      <span className="text-sm text-neutral-400 xl:text-base">
        {props.label}
      </span>
      <span className="break-all text-3xl">{props.children}</span>
    </div>
  );
};

export default CompareInformationGrid;
