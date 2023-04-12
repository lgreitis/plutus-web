import { useMemo } from "react";
import { api } from "src/utils/api";

interface Props {
  value: number;
  className?: string;
}

const CurrencyField = (props: Props) => {
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

  return (
    <span className={props.className}>
      {numberFormatter.format(props.value * (query.data?.rate || 1))}
    </span>
  );
};

export default CurrencyField;
