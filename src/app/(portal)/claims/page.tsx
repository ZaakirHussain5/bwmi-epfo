import { ClaimsWorkspace } from "@/components/claims/ClaimsWorkspace";
import { getSessionEpfDataProvider } from "@/services/epf-data-provider";

export default async function ClaimsPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; draftId?: string }>;
}) {
  const params = await searchParams;
  const epfDataProvider = await getSessionEpfDataProvider();
  const [claims, profile, summary] = await Promise.all([
    epfDataProvider.getClaims(),
    epfDataProvider.getProfile(),
    epfDataProvider.getMemberSummary(),
  ]);
  return (
    <ClaimsWorkspace
      initialClaims={claims}
      initialProfile={profile}
      initialHealth={summary.accountHealth}
      autoStart={params.start === "1"}
      resumeDraftId={params.draftId}
    />
  );
}
