import { ProfileManager } from "@/components/profile/ProfileManager";
import { getSessionEpfDataProvider } from "@/services/epf-data-provider";

export default async function ProfilePage() {
  const epfDataProvider = await getSessionEpfDataProvider();
  const profile = await epfDataProvider.getProfile();
  return <ProfileManager initialProfile={profile} />;
}
