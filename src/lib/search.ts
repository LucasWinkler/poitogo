import type { Place, PlaceSearchResponse } from "@/types";
import { getPlacePhotoUrl } from "./utils";

const processPlacePhotos = async (places: Place[]): Promise<Place[]> => {
  try {
    const results = await Promise.all(
      places.map(async (place) => {
        try {
          if (!place.photos?.[0]) {
            return place;
          }

          // Fetch the photo with blur data
          const photoRes = await fetch(getPlacePhotoUrl(place.photos[0].name));
          if (!photoRes.ok) {
            return place;
          }

          // Get image dimensions from the photo metadata
          const { widthPx, heightPx } = place.photos[0];

          return {
            ...place,
            image: {
              url: getPlacePhotoUrl(place.photos[0].name),
              // We'll get blur data from response headers
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
  coords?: { latitude: number | null; longitude: number | null },
): Promise<PlaceSearchResponse | null> {
  try {
    const searchParams = new URLSearchParams({
      q: query,
      size: size.toString(),
    });

    if (coords?.latitude && coords?.longitude) {
      searchParams.append("lat", coords.latitude.toString());
      searchParams.append("lng", coords.longitude.toString());
    }

    const res = await fetch(`/api/places/search?${searchParams.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch results");

    const data = await res.json();
    if (!data.places) return null;

    // Process photos for each place
    const placesWithPhotos = await processPlacePhotos(data.places);
    return { ...data, places: placesWithPhotos };
  } catch (error) {
    console.error("Failed to search:", error);
    return null;
  }
}
