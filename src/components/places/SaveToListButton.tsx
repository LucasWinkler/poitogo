"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SaveToListDropdown } from "./SaveToListDropdown";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";

interface SaveToListButtonProps {
  placeId: string;
}

export const SaveToListButton = ({ placeId }: SaveToListButtonProps) => {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (open && !session) {
      toast.error("Please sign in to save places to lists");
      return;
    }
    setIsDropdownOpen(open);
  };

  return (
    <SaveToListDropdown
      placeId={placeId}
      open={isDropdownOpen}
      onOpenChange={handleOpenChange}
    >
      <Button
        variant="secondary"
        size="icon"
        className="size-8 bg-background/80 backdrop-blur hover:bg-background/90"
        onClick={(e) => e.preventDefault()}
      >
        <Bookmark aria-hidden="true" />
        <span className="sr-only">Save to list(s)</span>
      </Button>
    </SaveToListDropdown>
  );
};
