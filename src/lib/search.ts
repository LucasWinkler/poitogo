import type { Place, PlaceSearchResponse } from "@/types";
import { getPlacePhotoUrl } from "@/lib/place";
import { toast } from "sonner";
import { SearchFilters } from "@/hooks/useSearch";
import { LocationCoords } from "@/contexts/LocationContext";

const processPlacePhotos = async (places: Place[]): Promise<Place[]> => {
  try {
    const results = await Promise.all(
      places.map(async (place) => {
        try {
          if (!place.photos?.[0]) {
            return place;
          }

          const photoRes = await fetch(getPlacePhotoUrl(place.photos[0].name));
          if (!photoRes.ok) {
            return place;
          }

          const { widthPx, heightPx } = place.photos[0];

          return {
            ...place,
            image: {
              url: getPlacePhotoUrl(place.photos[0].name),
              blurDataURL: photoRes.headers.get("x-blur-data") || "",
              width: widthPx,
              height: heightPx,
            },
          };
        } catch (error) {
          console.warn(`Failed to process photo for place ${place.id}:`, error);
          return place;
        }
      }),
    );

    return results;
  } catch (error) {
    console.error("Failed to process photos:", error);
    return places;
  }
};

export async function searchPlacesClient(
  query: string,
  size: number,
  coords: LocationCoords,
  filters?: SearchFilters,
): Promise<PlaceSearchResponse | null> {
  try {
    const searchParams = new URLSearchParams({
      q: query,
      minRating: filters?.minRating?.toString() || "",
      openNow: filters?.openNow?.toString() || "",
      radius: filters?.radius?.toString() || "",
      size: size.toString(),
      lat: coords.latitude?.toString() || "",
      lng: coords.longitude?.toString() || "",
    });

    const res = await fetch(`/api/places/search?${searchParams.toString()}`);
    if (!res.ok) {
      if (res.status === 429) {
        toast.error("Please wait a moment before searching again");
        return null;
      }
      throw new Error("Failed to fetch results");
    }

    const data = (await res.json()) as PlaceSearchResponse;
    if (!data.places) return null;

    const placesWithPhotos = await processPlacePhotos(data.places);
    return { ...data, places: placesWithPhotos };
  } catch (error) {
    console.error("Failed to search:", error);
    return null;
  }
}
