import { DashboardWorkspace } from "@/components/dashboard/DashboardWorkspace";
import { buildAccountHealthReport } from "@/features/account-health/engine";
import { hasOtpVerifiedFromCookies } from "@/lib/auth/session";
import { getSessionEpfDataProvider } from "@/services/epf-data-provider";

export default async function DashboardPage() {
  const epfDataProvider = await getSessionEpfDataProvider();
  const [summary, claims, profile, passbook, serviceStatus, otpVerified] = await Promise.all([
    epfDataProvider.getMemberSummary(),
    epfDataProvider.getClaims(),
    epfDataProvider.getProfile(),
    epfDataProvider.getPassbook(),
    epfDataProvider.getServiceStatus(),
    hasOtpVerifiedFromCookies(),
  ]);
  const accountHealth = buildAccountHealthReport({
    summary,
    profile,
    passbook,
    claims,
    otpVerified,
  });

  return (
    <DashboardWorkspace
      summary={summary}
      claims={claims}
      accountHealth={accountHealth}
      serviceStatus={serviceStatus}
    />
  );
}
