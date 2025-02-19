"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ListCreateDialog } from "@/components/lists/ListCreateDialog";
import { ListEditDialog } from "@/components/lists/ListEditDialog";
import { ListDeleteDialog } from "@/components/lists/ListDeleteDialog";
import type { DbListWithPlacesCount } from "@/server/types/db";
import { ListCard } from "@/components/lists/ListCard";

interface ListsViewProps {
  lists: DbListWithPlacesCount[];
  username: string;
  isOwnProfile: boolean;
  totalPages: number;
  currentPage: number;
  totalLists: number;
}

export const ListsView = ({
  lists,
  username,
  isOwnProfile,
  totalPages,
  currentPage,
  totalLists,
}: ListsViewProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingList, setEditingList] = useState<DbListWithPlacesCount | null>(
    null,
  );
  const [deletingList, setDeletingList] =
    useState<DbListWithPlacesCount | null>(null);

  const hasLists = lists.length > 0;

  const createPageLink = (page: number) => `/u/${username}/lists?page=${page}`;

  const renderPaginationItems = () => {
    const items = [];
    const showEllipsisStart = currentPage > 3;
    const showEllipsisEnd = currentPage < totalPages - 2;

    items.push(
      <PaginationLink
        key="1"
        href={createPageLink(1)}
        isActive={currentPage === 1}
      >
        1
      </PaginationLink>,
    );

    if (showEllipsisStart) {
      items.push(<PaginationEllipsis key="ellipsis-start" />);
    }

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      if (i === 1 || i === totalPages) continue;
      items.push(
        <PaginationLink
          key={i}
          href={createPageLink(i)}
          isActive={currentPage === i}
        >
          {i}
        </PaginationLink>,
      );
    }

    if (showEllipsisEnd) {
      items.push(<PaginationEllipsis key="ellipsis-end" />);
    }

    if (totalPages > 1) {
      items.push(
        <PaginationLink
          key={totalPages}
          href={createPageLink(totalPages)}
          isActive={currentPage === totalPages}
        >
          {totalPages}
        </PaginationLink>,
      );
    }

    return items;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold">
          {isOwnProfile ? "My Lists" : `${username}'s Lists`}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {totalLists} List{totalLists === 1 ? "" : "s"}
        </p>
      </header>

      <section>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
          <div className="rounded-md border p-2">
            Search/filtering coming soon
          </div>
          {isOwnProfile && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus aria-hidden="true" className="mr-2 size-4" />
              New List
            </Button>
          )}
        </div>

        <ul
          className={cn(
            "mb-8",
            hasLists && "grid grid-cols-1 gap-6 xl:grid-cols-2",
          )}
        >
          {hasLists ? (
            lists.map((list) => (
              <ListCard
                key={list.id}
                list={list}
                username={username}
                isOwnProfile={isOwnProfile}
                showPrivacyBadge={isOwnProfile}
                onEdit={() => setEditingList(list)}
                onDelete={() => setDeletingList(list)}
              />
            ))
          ) : (
            <li className="py-8 text-center text-muted-foreground">
              No lists created yet.
            </li>
          )}
        </ul>

        <nav aria-label="Pagination">
          <Pagination>
            <PaginationContent>
              <PaginationPrevious
                href={createPageLink(currentPage - 1)}
                aria-disabled={currentPage <= 1}
                tabIndex={currentPage <= 1 ? -1 : 0}
                className={
                  currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                }
              />
              {renderPaginationItems()}
              <PaginationNext
                href={createPageLink(currentPage + 1)}
                aria-disabled={currentPage >= totalPages}
                tabIndex={currentPage >= totalPages ? -1 : 0}
                className={
                  currentPage >= totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationContent>
          </Pagination>
        </nav>
      </section>

      <ListCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
      {editingList && (
        <ListEditDialog
          list={editingList}
          open={!!editingList}
          onOpenChange={() => setEditingList(null)}
        />
      )}
      {deletingList && (
        <ListDeleteDialog
          listId={deletingList.id}
          listName={deletingList.name}
          open={!!deletingList}
          onOpenChange={() => setDeletingList(null)}
        />
      )}
    </div>
  );
};
