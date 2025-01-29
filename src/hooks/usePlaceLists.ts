import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { getListsForPlaceCard } from "@/lib/api/lists";
import { updateSavedPlaces } from "@/server/actions/savedPlace";
import type { ListForPlaceCard } from "@/types";
import { useMemo } from "react";

export const usePlaceLists = (
  placeId: string,
  isAuthenticated: boolean,
  initialLists?: ListForPlaceCard[],
) => {
  const queryClient = useQueryClient();

  const { data: lists, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.PLACE_LISTS, placeId],
    queryFn: () => getListsForPlaceCard(placeId),
    initialData: initialLists,
    enabled: isAuthenticated,
  });

  const selectedListIds = useMemo(
    () =>
      new Set(lists?.filter((list) => list.isSelected).map((list) => list.id)),
    [lists],
  );

  const { mutate: updateLists, isPending } = useMutation({
    mutationFn: (selectedListIds: string[]) =>
      updateSavedPlaces({ placeId, selectedLists: selectedListIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PLACE_LISTS, placeId],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.USER_LISTS],
      });
    },
  });

  return {
    lists: lists ?? [],
    selectedListIds,
    isLoading: isLoading && isAuthenticated,
    isPending,
    updateLists,
  };
};
