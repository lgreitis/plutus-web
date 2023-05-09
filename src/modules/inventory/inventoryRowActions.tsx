import { StarIcon as StarIconSolid } from "@heroicons/react/20/solid";
import {
  PencilSquareIcon,
  StarIcon as StarIconOutline,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { toast } from "sonner";
import HeaderButton from "src/components/buttons/headerButton";
import ItemEditModal from "src/modules/modals/itemEditModal";
import { api } from "src/utils/api";

interface Props {
  favourite?: boolean;
  marketHashName: string;
  itemId: string;
  buyDate: Date;
  buyPrice?: number;
}

const InventoryRowActions = (props: Props) => {
  const apiContext = api.useContext();
  const [modalOpen, setModalOpen] = useState(false);

  const favouriteMutation = api.items.toggleItemToFavourite.useMutation({
    onSuccess: async (data) => {
      await apiContext.inventory.getTableData.invalidate();

      if (data.mutatedValue) {
        toast.success("Item added to favourites.");
      } else {
        toast.success("Item removed from favourites.");
      }
    },
    onError: () => {
      toast.error("Failed update favourite status.");
    },
  });

  return (
    <>
      <ItemEditModal
        marketHashName={props.marketHashName}
        itemId={props.itemId}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        buyDate={props.buyDate}
        buyPrice={props.buyPrice}
      />
      <div className="flex gap-2">
        <HeaderButton
          name={`Favourite ${props.marketHashName}`}
          onClick={() =>
            favouriteMutation.mutate({
              marketHashName: props.marketHashName,
            })
          }
        >
          {props.favourite ? (
            <StarIconSolid className="h-5 w-5" />
          ) : (
            <StarIconOutline className="h-5 w-5" />
          )}
        </HeaderButton>
        <HeaderButton
          name={`Edit ${props.marketHashName}`}
          onClick={() => setModalOpen(true)}
        >
          <PencilSquareIcon className="h-5 w-5" />
        </HeaderButton>
      </div>
    </>
  );
};

export default InventoryRowActions;
