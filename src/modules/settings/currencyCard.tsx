import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { atom, useAtom } from "jotai";
import { Fragment, useEffect, useState } from "react";
import { toast } from "sonner";
import SubmitButton from "src/components/buttons/submitButton";
import CardContainer from "src/components/card/cardContainer";
import CardHeader from "src/components/card/cardHeader";
import CardSubheader from "src/components/card/cardSubheader";
import Loader from "src/components/loader";
import { api } from "src/utils/api";

const selectedCurrencyAtom = atom("");

const CurrencyCard = () => {
  const apiUtils = api.useContext();
  const { mutate, isLoading } = api.settings.updateCurrency.useMutation();
  const [selectedCurrency] = useAtom(selectedCurrencyAtom);

  return (
    <CardContainer>
      <CardHeader>Currency</CardHeader>
      <CardSubheader>
        Select your currency. This will convert all prices from USD to your
        selected currency.
      </CardSubheader>
      <div className="px-4">
        <CurrencyDropdown />
      </div>
      <div className="flex w-full items-center justify-end border-t border-neutral-200 bg-neutral-100 px-4 py-3  dark:border-neutral-800 dark:bg-neutral-900">
        <SubmitButton
          loading={isLoading}
          onClick={() => {
            if (!selectedCurrency) {
              return;
            }

            mutate(
              { currency: selectedCurrency },
              {
                onSuccess: () => {
                  void apiUtils.settings.getCurrentCurrency.invalidate();
                  toast.success("Your preferences have been saved.");
                },
              }
            );
          }}
        >
          Save
        </SubmitButton>
      </div>
    </CardContainer>
  );
};

const CurrencyDropdown = () => {
  const query = api.settings.getCurrencies.useQuery();
  const currentCurrencyQuery = api.settings.getCurrentCurrency.useQuery();
  const [selected, setSelected] = useState<typeof currentCurrencyQuery.data>({
    conversionCurrency: "",
    rate: 1,
  });

  useEffect(() => {
    if (currentCurrencyQuery.data) {
      setSelected(currentCurrencyQuery.data);
    }
  }, [currentCurrencyQuery.data]);

  const [, setSelectedCurrency] = useAtom(selectedCurrencyAtom);
  useEffect(() => {
    if (selected && selected.conversionCurrency) {
      setSelectedCurrency(selected.conversionCurrency);
    }
  }, [selected, setSelectedCurrency]);

  const disabled =
    query.isLoading ||
    currentCurrencyQuery.isLoading ||
    !selected?.conversionCurrency;

  if (!selected || !selected.conversionCurrency) {
    return <Loader />;
  }

  return (
    <div className="w-32">
      <Listbox value={selected} onChange={setSelected} disabled={disabled}>
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-black dark:bg-bg-dark  dark:ring-neutral-800 dark:focus:ring-white sm:text-sm sm:leading-6">
            <span className="block truncate dark:text-white">
              {selected.conversionCurrency}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-neutral-400 dark:text-neutral-600"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full  overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-bg-dark dark:ring-neutral-800 sm:text-sm">
              {query.data &&
                query.data.map((currency) => (
                  <Listbox.Option
                    key={currency.conversionCurrency}
                    className={({ active }) =>
                      clsx(
                        active
                          ? "bg-purple-400 text-white dark:bg-pink-800"
                          : "text-gray-900 dark:text-white",
                        "relative cursor-default select-none py-2 pl-8 pr-4"
                      )
                    }
                    value={currency}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={clsx(
                            selected ? "font-semibold" : "font-normal",
                            "block truncate"
                          )}
                        >
                          {currency.conversionCurrency}
                        </span>

                        {selected ? (
                          <span
                            className={clsx(
                              active ? "text-white" : "text-indigo-600",
                              "absolute inset-y-0 left-0 flex items-center pl-1.5"
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};

export default CurrencyCard;
