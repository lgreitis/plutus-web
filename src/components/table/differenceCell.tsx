import clsx from "clsx";
import { useMemo } from "react";
import { api } from "src/utils/api";

interface Props {
  className?: string;
  buyPrice: number;
  quantity: number;
  price: number;
}

const DifferenceCell = (props: Props) => {
  const { buyPrice, quantity, price } = props;
  const query = api.settings.getCurrentCurrency.useQuery(undefined, {
    staleTime: Infinity,
  });

  const numberFormatter = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: query.data?.conversionCurrency || "USD",
      }),
    [query.data?.conversionCurrency]
  );

  const difference = useMemo(() => {
    if (query.data) {
      return price * query.data.rate * quantity - buyPrice * quantity;
    }

    return 0;
  }, [buyPrice, quantity, price, query.data]);

  return (
    <span
      className={clsx(
        props.className,
        difference > 0 && "text-green-400",
        difference < 0 && "text-red-400"
      )}
    >
      {numberFormatter.format(difference)}
    </span>
  );
};

export default DifferenceCell;
