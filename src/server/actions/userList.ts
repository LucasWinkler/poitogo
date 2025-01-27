"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "@/server/auth/session";
import userLists from "@/server/data/userLists";
import type { CreateListInput, EditListInput } from "@/lib/validations/list";

export const createUserList = async (
  data: Omit<CreateListInput, "image"> & { image?: string },
) => {
  try {
    const session = await getServerSession();
    if (!session) throw new Error("Unauthorized");

    const list = await userLists.mutations.create({
      name: data.name,
      description: data.description,
      colour: data.colour,
      isPublic: data.isPublic ?? false,
      userId: session.user.id,
      image: data.image,
    });

    revalidatePath(`/u/${session.user.username}`);
    return { data: list };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
};

export const updateUserList = async (
  listId: string,
  data: EditListInput & { image?: string | null },
) => {
  try {
    const session = await getServerSession();
    if (!session) {
      return { error: "Not authenticated" };
    }

    const list = await userLists.queries.getById(listId);
    if (!list) {
      return { error: "List not found" };
    }

    if (list.userId !== session.user.id) {
      return { error: "Not authorized" };
    }

    if (
      list.isDefault &&
      (data.name !== list.name || data.description !== list.description)
    ) {
      return { error: "Cannot modify name or description of default list" };
    }

    const updatedList = await userLists.mutations.update(listId, {
      name: data.name,
      description: data.description,
      colour: data.colour,
      isPublic: data.isPublic,
      image: data.image,
    });

    revalidatePath(`/u/${session.user.username}`);
    return { data: updatedList };
  } catch (error) {
    console.error("Failed to update list:", error);
    return { error: "Failed to update list" };
  }
};

export const deleteUserList = async (listId: string) => {
  try {
    const session = await getServerSession();
    if (!session) {
      return { error: "Not authenticated" };
    }

    const list = await userLists.queries.getById(listId);
    if (!list) {
      return { error: "List not found" };
    }

    if (list.userId !== session.user.id) {
      return { error: "Not authorized" };
    }

    if (list.isDefault) {
      return { error: "Cannot delete default list" };
    }

    await userLists.mutations.delete(listId);
    revalidatePath(`/u/${session.user.username}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete list:", error);
    return { error: "Failed to delete list" };
  }
};

export const updateUserLists = async ({
  placeId,
  selectedLists,
}: {
  placeId: string;
  selectedLists: string[];
}) => {
  try {
    const session = await getServerSession();
    if (!session) throw new Error("Unauthorized");

    const result = await userLists.mutations.updateSelectedLists(
      session.user.id,
      placeId,
      selectedLists,
    );

    if (!result.success) {
      return { error: "Failed to update lists" };
    }

    const updatedLists = await userLists.queries.getAllByUserIdWithPlaces(
      session.user.id,
    );

    return { data: updatedLists };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
};
