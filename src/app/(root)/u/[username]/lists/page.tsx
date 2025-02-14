import { notFound } from "next/navigation";
import { users } from "@/server/data/users";
import { profileParamsSchema } from "@/lib/validations/profile";
import type { PublicProfileData } from "@/server/types/profile";
import { ListsView } from "@/components/lists/ListsView";
import { ProfilePrivateView } from "@/components/profile/ProfilePrivateView";

export const dynamic = "force-dynamic";
export const revalidate = 60;

interface ListsPageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function ListsPage({
  params,
  searchParams,
}: ListsPageProps) {
  const validated = profileParamsSchema.safeParse({
    username: (await params).username,
    page: (await searchParams).page,
    limit: 10,
  });

  if (!validated.success) {
    notFound();
  }

  const profile = await users.queries.getProfile(validated.data);

  if (!profile) {
    notFound();
  }

  if ("type" in profile && profile.type === "private") {
    return <ProfilePrivateView username={profile.username} />;
  }

  const publicProfile = profile as PublicProfileData;

  return (
    <ListsView
      lists={publicProfile.lists.items}
      username={validated.data.username}
      isOwnProfile={publicProfile.isOwnProfile}
      totalPages={publicProfile.lists.metadata.totalPages}
      currentPage={validated.data.page}
      totalLists={publicProfile.lists.metadata.totalItems}
    />
  );
}
