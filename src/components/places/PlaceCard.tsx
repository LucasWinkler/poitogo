import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MapPin, Star, BookmarkPlus, Plus, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type PlaceCardProps = {
  place: {
    id: string;
    name: string;
    address: string;
    photo?: string;
    rating?: number;
    userRatingCount?: number;
    priceLevel?: number;
    savedToLists?: string[]; // Array of list IDs this place is saved to
  };
  onSave?: (placeId: string, listIds: string[]) => Promise<void>;
  userLists?: Array<{ id: string; name: string; createdAt: Date }>;
};

const tempUserLists = [
  { id: "1", name: "Favorites", createdAt: new Date() },
  { id: "2", name: "Restaurants", createdAt: new Date() },
  { id: "3", name: "Shopping", createdAt: new Date() },
  { id: "4", name: "Travel", createdAt: new Date() },
  { id: "5", name: "Travel", createdAt: new Date() },
  { id: "6", name: "Travel", createdAt: new Date() },
  { id: "7", name: "Travel", createdAt: new Date() },
  { id: "8", name: "Travel", createdAt: new Date() },
  { id: "9", name: "Travel", createdAt: new Date() },
  { id: "10", name: "Travel", createdAt: new Date() },
];

export const PlaceCard = ({
  place,
  onSave,
  // userLists = [],
}: PlaceCardProps) => {
  const [imageUrl, setImageUrl] = useState<string>();
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectedLists, setSelectedLists] = useState<Set<string>>(
    new Set(place.savedToLists || []),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isCreateListOpen, setIsCreateListOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    let objectUrl: string | undefined;

    const loadImage = async () => {
      if (place.photo && !imageError) {
        try {
          const response = await fetch(
            `/api/places/photo/${encodeURIComponent(place.photo)}`,
          );
          if (!response.ok) throw new Error("Failed to load image");

          const blob = await response.blob();
          objectUrl = URL.createObjectURL(blob);
          setImageUrl(objectUrl);
        } catch (err) {
          console.error("Error loading image:", err);
          setImageError(true);
        }
      }
    };

    loadImage();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [place.photo, imageError]);

  const renderPriceLevel = (level?: number) => {
    if (!level) return null;
    return "$$$$".slice(0, level);
  };

  const handleSaveToLists = async () => {
    setIsSaving(true);
    try {
      await onSave?.(place.id, Array.from(selectedLists));
      setIsDropdownOpen(false);
      setSelectedLists(new Set([]));
      toast.success("Saved to selected lists");
    } catch {
      toast.error("Failed to save place");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateList = () => {
    // TODO: Implement create new list
    setIsCreateListOpen(false);
    setNewListName("");
  };

  return (
    <div className="group relative">
      <Link href={`/place/${place.id}`} className="block">
        <Card className="overflow-hidden transition-all hover:shadow-lg">
          <div className="relative aspect-[3/2] overflow-hidden bg-muted">
            {imageUrl && !imageError ? (
              <>
                <Image
                  src={imageUrl}
                  alt={place.name}
                  fill
                  className={`object-cover transition-all duration-200 ${
                    imageLoaded ? "opacity-100" : "opacity-0"
                  } group-hover:scale-105`}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  onLoad={() => setImageLoaded(true)}
                />
                {!imageLoaded ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="size-10 animate-spin" />
                  </div>
                ) : null}
              </>
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div
              className="absolute right-2 top-2"
              onClick={(e) => e.preventDefault()}
            >
              <DropdownMenu
                open={isDropdownOpen}
                onOpenChange={setIsDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="size-10 bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 [&_svg]:size-5"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <BookmarkPlus />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <div className="flex items-center justify-between p-2">
                    <p className="text-base font-medium">Save Place</p>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsCreateListOpen(true)}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                  {tempUserLists.length > 0 ? <DropdownMenuSeparator /> : null}
                  <div
                    className={cn(
                      tempUserLists.length > 0 ? "px-2 py-1.5" : "p-0",
                    )}
                  >
                    <ScrollArea
                      type="always"
                      className="h-[120px] pr-4 md:h-[160px]"
                    >
                      {tempUserLists
                        .sort(
                          (a, b) =>
                            b.createdAt.getTime() - a.createdAt.getTime(),
                        )
                        .map((list) => (
                          <label
                            key={list.id}
                            htmlFor={`list-${list.id}`}
                            className={cn(
                              "mb-2 flex w-full cursor-pointer select-none items-center space-x-2 rounded-md px-2 py-1.5 transition-colors active:bg-accent/60",
                              selectedLists.has(list.id) && "bg-accent/40",
                              "[@media(hover:hover)]:hover:bg-accent/60",
                            )}
                            onClick={() => {
                              const newSelected = new Set(selectedLists);
                              if (selectedLists.has(list.id)) {
                                newSelected.delete(list.id);
                              } else {
                                newSelected.add(list.id);
                              }
                              setSelectedLists(newSelected);
                            }}
                          >
                            <Checkbox
                              id={`list-${list.id}`}
                              checked={selectedLists.has(list.id)}
                              onCheckedChange={(checked) => {
                                const newSelected = new Set(selectedLists);
                                if (checked) {
                                  newSelected.add(list.id);
                                } else {
                                  newSelected.delete(list.id);
                                }
                                setSelectedLists(newSelected);
                              }}
                              className="size-4 rounded-[4px] border-2 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                            />
                            <span className="text-sm font-medium leading-none transition-colors [@media(hover:hover)]:group-hover:text-primary">
                              {list.name}
                            </span>
                          </label>
                        ))}
                    </ScrollArea>
                  </div>
                  <DropdownMenuSeparator />
                  <div className="p-2">
                    <Button
                      size="sm"
                      className="w-full"
                      disabled={isSaving || selectedLists.size === 0}
                      onClick={handleSaveToLists}
                    >
                      {isSaving ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <BookmarkPlus className="size-4" />
                      )}
                      Save to {selectedLists.size > 1 && selectedLists.size}{" "}
                      {selectedLists.size > 1 ? "Lists" : "List"}
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <CardHeader className="space-y-2 p-4">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="line-clamp-1 text-lg">
                {place.name}
              </CardTitle>
              {renderPriceLevel(place.priceLevel) && (
                <span className="text-sm font-medium text-muted-foreground">
                  {renderPriceLevel(place.priceLevel)}
                </span>
              )}
            </div>
            {place.rating && (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center">
                  <Star className="size-4 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1 font-medium">{place.rating}</span>
                  <span className="ml-0.5 text-sm text-muted-foreground">
                    /<span className="ml-0.5">5</span>
                  </span>
                </div>

                {place.userRatingCount && (
                  <span className="text-sm text-muted-foreground">
                    ({place.userRatingCount.toLocaleString()} reviews)
                  </span>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" />
              <span className="line-clamp-2">{place.address}</span>
            </div>
          </CardContent>
        </Card>
      </Link>

      <Dialog open={isCreateListOpen} onOpenChange={setIsCreateListOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New List</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="List name"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateListOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateList}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
