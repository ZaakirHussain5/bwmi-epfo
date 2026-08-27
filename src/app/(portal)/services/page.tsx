import { ServicesCatalog } from "@/components/services/ServicesCatalog";
import { getSessionEpfDataProvider } from "@/services/epf-data-provider";

export default async function ServicesPage() {
  const epfDataProvider = await getSessionEpfDataProvider();
  const services = await epfDataProvider.getServices();

  return <ServicesCatalog services={services} />;
}
