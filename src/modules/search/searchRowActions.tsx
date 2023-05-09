import { StarIcon as StarIconSolid } from "@heroicons/react/20/solid";
import { StarIcon as StarIconOutline } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import HeaderButton from "src/components/buttons/headerButton";
import { api } from "src/utils/api";

interface Props {
  favourite?: boolean;
  marketHashName: string;
}

const SearchRowActions = (props: Props) => {
  const apiContext = api.useContext();

  const favouriteMutation = api.items.toggleItemToFavourite.useMutation({
    onSuccess: async (data) => {
      await apiContext.search.allItems.invalidate();

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
    <div className="flex">
      <HeaderButton
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
    </div>
  );
};

export default SearchRowActions;
