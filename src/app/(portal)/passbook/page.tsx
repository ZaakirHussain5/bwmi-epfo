import { PassbookExplorer } from "@/components/passbook/PassbookExplorer";
import { getSessionEpfDataProvider } from "@/services/epf-data-provider";

export default async function PassbookPage() {
  const epfDataProvider = await getSessionEpfDataProvider();
  const entries = await epfDataProvider.getPassbook();
  return <PassbookExplorer entries={entries} />;
}
