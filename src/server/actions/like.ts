"use server";

import { revalidateTag } from "next/cache";
import { getServerSession } from "../auth/session";
import { likes } from "@/server/data/likes";

export const toggleLike = async (placeId: string) => {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const result = await likes.mutations.toggle(session.user.id, placeId);
  revalidateTag("user-likes");
  revalidateTag(`like-${session.user.id}-${placeId}`);
  revalidateTag(`user-${session.user.id}-likes-statuses`);
  return result;
};
