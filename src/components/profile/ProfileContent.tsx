"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useListsInfinite } from "@/hooks/useLists";
import { ListCard } from "./ListCard";
import { Loader2, Plus } from "lucide-react";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import type { DbListWithPlacesCount } from "@/server/db/schema";
import { useState } from "react";
import CreateListDialog from "./CreateListDialog";
import { DeleteListDialog } from "./DeleteListDialog";
import EditListDialog from "./EditListDialog";
import { Button } from "../ui/button";

interface ProfileContentProps {
  username: string;
  isOwnProfile: boolean;
  bio: string | null;
}

export const ProfileContent = ({
  username,
  isOwnProfile,
  bio,
}: ProfileContentProps) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useListsInfinite(username);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingList, setEditingList] = useState<DbListWithPlacesCount | null>(
    null,
  );
  const [deletingList, setDeletingList] =
    useState<DbListWithPlacesCount | null>(null);
  const [activeTab, setActiveTab] = useState<"lists" | "likes">("lists");

  const loadMoreRef = useInfiniteScroll({
    onLoadMore: async () => {
      await fetchNextPage();
    },
    hasNextPage: !!hasNextPage,
    isLoading: isFetchingNextPage,
  });

  const allLists =
    data?.pages.flatMap((page, pageIndex) =>
      page.items.map((item) => ({
        ...item,
        key: `${item.id}-${pageIndex}`,
      })),
    ) ?? [];

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      {bio && (
        <div className="mb-8">
          <p className="whitespace-pre-wrap text-muted-foreground">{bio}</p>
        </div>
      )}
      <Tabs
        defaultValue="lists"
        onValueChange={(value) => setActiveTab(value as "lists" | "likes")}
      >
        <div className="mb-8 flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="lists">Lists</TabsTrigger>
            <TabsTrigger value="likes">Likes</TabsTrigger>
          </TabsList>

          {isOwnProfile && activeTab === "lists" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="mr-2 size-4" />
              New List
            </Button>
          )}
        </div>
        <TabsContent value="lists">
          {status === "pending" ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : status === "error" ? (
            <div className="py-8 text-center text-muted-foreground">
              Error loading lists
            </div>
          ) : (
            <div className="space-y-4">
              {allLists.map((list) => (
                <ListCard
                  key={list.key}
                  list={list}
                  username={username}
                  isOwnProfile={isOwnProfile}
                  onEdit={() => setEditingList(list)}
                  onDelete={() => setDeletingList(list)}
                  showPrivacyBadge
                />
              ))}

              <div ref={loadMoreRef} className="h-8 w-full">
                {hasNextPage ? (
                  isFetchingNextPage ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="flex justify-center py-4">
                      <span className="text-sm text-muted-foreground">
                        Scroll for more lists
                      </span>
                    </div>
                  )
                ) : allLists.length > 0 ? (
                  <div className="flex justify-center py-4">
                    <span className="text-sm text-muted-foreground">
                      No more lists to load
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="likes"></TabsContent>
      </Tabs>
      {isOwnProfile && activeTab === "lists" && (
        <CreateListDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        />
      )}
      {editingList && (
        <EditListDialog
          list={editingList}
          open={!!editingList}
          onOpenChange={() => setEditingList(null)}
        />
      )}
      {deletingList && (
        <DeleteListDialog
          listId={deletingList.id}
          listName={deletingList.name}
          open={!!deletingList}
          onOpenChange={() => setDeletingList(null)}
        />
      )}
    </div>
  );
};
