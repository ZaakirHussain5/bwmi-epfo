import { HelpWorkspace } from "@/components/help/HelpWorkspace";
import { getSessionEpfDataProvider } from "@/services/epf-data-provider";
import type { SupportTicketCategory } from "@/types/epf";

const supportedCategories: SupportTicketCategory[] = [
  "claim",
  "passbook",
  "profile",
  "account",
  "other",
];

export default async function HelpPage({
  searchParams,
}: {
  searchParams: Promise<{
    subject?: string;
    category?: string;
    description?: string;
  }>;
}) {
  const params = await searchParams;
  const requestedCategory = params.category;
  const category = supportedCategories.includes(requestedCategory as SupportTicketCategory)
    ? (requestedCategory as SupportTicketCategory)
    : undefined;
  const epfDataProvider = await getSessionEpfDataProvider();
  const [tickets, serviceStatus] = await Promise.all([
    epfDataProvider.getSupportTickets(),
    epfDataProvider.getServiceStatus(),
  ]);
  return (
    <HelpWorkspace
      initialTickets={tickets}
      initialServiceStatus={serviceStatus}
      ticketPrefill={{
        subject: params.subject,
        category,
        description: params.description,
      }}
    />
  );
}
