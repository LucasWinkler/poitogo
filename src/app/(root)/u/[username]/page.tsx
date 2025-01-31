import { notFound } from "next/navigation";
import { users } from "@/server/data/users";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileView } from "@/components/profile/ProfileView";
import type { PublicProfileData } from "@/server/types/profile";
import { profileParamsSchema } from "@/lib/validations/profile";
import { ProfilePrivateView } from "@/components/profile/ProfilePrivateView";
import { Metadata } from "next";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export const generateMetadata = async ({
  params,
}: ProfilePageProps): Promise<Metadata> => {
  const validated = profileParamsSchema.safeParse({
    username: (await params).username,
  });

  if (!validated.success) {
    return {
      title: "Profile not found",
    };
  }

  const profile = await users.queries.getProfileMetadata(
    validated.data.username,
  );
  if (!profile) {
    return {
      title: "Profile not found",
    };
  }

  const { name, username, isPublic, isOwnProfile } = profile;

  const privateProfileTitle = `Private Profile (@${username})`;
  const publicProfileTitle = `${name} (@${username})`;

  return {
    title: isOwnProfile
      ? `${name} (@${username})`
      : isPublic
        ? publicProfileTitle
        : privateProfileTitle,
  };
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const validated = profileParamsSchema.safeParse({
    username: (await params).username,
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
    <article>
      <ProfileHeader
        user={publicProfile.user}
        isOwnProfile={publicProfile.isOwnProfile}
        totalLists={publicProfile.lists.metadata.totalItems}
        totalLikes={publicProfile.totalLikes}
      />
      <ProfileView
        username={publicProfile.user.username}
        isOwnProfile={publicProfile.isOwnProfile}
      />
    </article>
  );
}
