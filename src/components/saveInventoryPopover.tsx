import { ArrowDownTrayIcon, DocumentIcon } from "@heroicons/react/24/outline";
import { useAtom } from "jotai";
import jsPDF from "jspdf";
import type { RowInput } from "jspdf-autotable";
import autoTable from "jspdf-autotable";
import { useSession } from "next-auth/react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import ListPopover from "src/components/listPopover";
import Loader from "src/components/loader";
import { filterAtom, visibilityAtom } from "src/store";
import { api } from "src/utils/api";
import { inventoryVisibilityColumns } from "src/utils/visibilityColumns";
import { utils, writeFileXLSX } from "xlsx";

const shouldRenderCol = (record: Record<string, boolean>, key: string) => {
  if (
    ((record[key] && record[key]?.valueOf() === true) ||
      record[key] === undefined) &&
    key !== "actions"
  ) {
    return true;
  }
  return false;
};

const getTextColor = (value: number) => {
  return value > 0 ? "#16a34a" : value < 0 ? "#dc2626" : "#333333";
};

const SaveInventoryPopover = () => {
  const session = useSession();
  const [filters] = useAtom(filterAtom);
  const [visibility] = useAtom(visibilityAtom);
  const toFilter = useMemo(() => {
    return Object.keys(
      Object.fromEntries(Object.entries(filters).filter(([, value]) => value))
    );
  }, [filters]);

  const { data } = api.inventory.getTableData.useQuery({
    filters: toFilter,
  });
  const currencyQuery = api.settings.getCurrentCurrency.useQuery(undefined, {
    staleTime: Infinity,
  });

  const cols = useMemo(() => {
    const res: string[] = [];
    res.push("Item");

    inventoryVisibilityColumns.map((el) => {
      if (shouldRenderCol(visibility, el.key)) {
        res.push(el.label.replace("Quantity", "Qty."));
      }
    });

    return res;
  }, [visibility]);

  const [loading, setLoading] = useState({ excel: false, pdf: false });

  const saveExcel = useCallback(() => {
    if (!data?.items || !currencyQuery.data) {
      toast.error("Failed to fetch your inventory, please try again later");
      return;
    }

    setLoading((p) => ({ ...p, excel: true }));

    const formatter = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyQuery.data.conversionCurrency || "USD",
    });

    const rate = currencyQuery.data.rate;

    const ws = utils.json_to_sheet(
      data.items.map((el) => {
        const selected = {
          item: el.marketHashName,
          dateAdded: el.dateAdded,
          buyPrice: formatter.format(el.buyPrice ?? 0),
          price: formatter.format(el.price * rate),
          quantity: el.quantity,
          worth: formatter.format(el.worth * rate),
          difference: formatter.format(
            el.price * rate * el.quantity - (el.buyPrice ?? 0) * el.quantity
          ),
          trend7d: `${el.trend7d.toFixed(2)}%`,
        };
        const obj: { [key: string]: string | number | boolean | Date | null } =
          {};
        Object.entries(selected).forEach(([key, el]) => {
          if (shouldRenderCol(visibility, key)) {
            obj[key] = el;
          }
        });

        return obj;
      })
    );

    const wb = utils.book_new();

    utils.book_append_sheet(wb, ws, "Inventory");

    writeFileXLSX(
      wb,
      `${
        session.data?.user.name ?? "user"
      }'s_inventory_${new Date().toLocaleDateString()}.xlsx`
    );

    setLoading((p) => ({ ...p, excel: false }));
  }, [session.data?.user.name, data?.items, visibility, currencyQuery.data]);

  const savePdf = useCallback(() => {
    try {
      setLoading((p) => ({ ...p, pdf: true }));

      const doc = new jsPDF();

      doc.addFont("Inter-Semibold.ttf", "Inter", "bold");
      doc.addFont("Inter-Normal.ttf", "Inter", "normal");
      doc.setFont("Inter", "bold");
      doc.addImage("/plutus.png", "png", 5, 5, 10, 10);
      doc.text("Plutus", 17, 13);
      doc.setFont("Inter", "normal");

      const width = doc.internal.pageSize.getWidth();

      doc.text(
        `${session.data?.user.name ?? "User"}'s Inventory`,
        width / 2,
        12.5,
        {
          align: "center",
        }
      );

      if (!data?.items || !currencyQuery.data) {
        toast.error("Failed to fetch your inventory, please try again later");
        return;
      }

      const formatter = new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currencyQuery.data.conversionCurrency || "USD",
      });

      const rate = currencyQuery.data.rate;

      autoTable(doc, {
        headStyles: {
          fillColor: "#000000",
          font: "Inter",
          fontStyle: "bold",
        },
        bodyStyles: { font: "Inter", fontStyle: "normal" },
        margin: { top: 20 },
        head: [cols],
        body: data.items
          .sort((a, b) => b.worth - a.worth)
          .map((el) => {
            const res: RowInput = [];
            res.push({
              content: el.marketHashName.replace("★ ", ""),
              styles: {
                textColor: `#${
                  el.borderColor === null
                    ? "333333"
                    : el.borderColor
                        .replace("FFD700", "eab308")
                        .replace("D2D2D2", "333333")
                }`,
              },
            });

            if (shouldRenderCol(visibility, "dateAdded")) {
              res.push(el.dateAdded.toLocaleDateString());
            }
            if (shouldRenderCol(visibility, "buyPrice")) {
              res.push(formatter.format(el.buyPrice ?? 0));
            }
            if (shouldRenderCol(visibility, "price")) {
              res.push(formatter.format(el.price * rate));
            }
            if (shouldRenderCol(visibility, "quantity")) {
              res.push(el.quantity);
            }
            if (shouldRenderCol(visibility, "worth")) {
              res.push(formatter.format(el.worth * rate));
            }
            if (shouldRenderCol(visibility, "difference")) {
              const difference =
                el.price * rate * el.quantity -
                (el.buyPrice ?? 0) * el.quantity;

              res.push({
                content: formatter.format(difference),
                styles: {
                  textColor: getTextColor(difference),
                },
              });
            }
            if (shouldRenderCol(visibility, "trend7d")) {
              res.push({
                content: `${el.trend7d.toFixed(2)}%`,
                styles: {
                  textColor: getTextColor(el.trend7d),
                },
              });
            }

            return res;
          }),
      });

      doc.save(
        `${
          session.data?.user.name ?? "user"
        }'s_inventory_${new Date().toLocaleDateString()}`
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF, please try again later");
    }

    setLoading((p) => ({ ...p, pdf: false }));
  }, [
    session.data?.user.name,
    data?.items,
    visibility,
    currencyQuery.data,
    cols,
  ]);

  return (
    <ListPopover
      placement="bottom-start"
      button={
        <div className="flex items-center gap-1">
          <ArrowDownTrayIcon className="h-5 w-5" /> Export
        </div>
      }
    >
      <button
        type="button"
        className="flex select-none items-center gap-2 whitespace-nowrap px-2 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        onClick={() => {
          void savePdf();
        }}
      >
        <DocumentIcon className="h-5 w-5" />
        {loading.pdf ? <Loader /> : "Export as PDF"}
      </button>
      <button
        type="button"
        className="flex select-none items-center gap-2 whitespace-nowrap px-2 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        onClick={() => {
          void saveExcel();
        }}
      >
        <DocumentIcon className="h-5 w-5" />
        {loading.excel ? <Loader /> : "Export as EXCEL"}
      </button>
    </ListPopover>
  );
};

export default SaveInventoryPopover;
