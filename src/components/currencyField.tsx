import { useMemo } from "react";
import { api } from "src/utils/api";

interface Props {
  value: number;
  className?: string;
  noConvert?: boolean;
  title?: string;
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
    <span className={props.className} title={props.title}>
      {numberFormatter.format(
        !props.noConvert ? props.value * (query.data?.rate || 1) : props.value
      )}
    </span>
  );
};

export default CurrencyField;
