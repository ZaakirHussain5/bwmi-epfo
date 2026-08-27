import { MockEPFDataProvider } from "./mock-provider";
import { getSessionUan } from "@/lib/auth/session";
import { DEFAULT_UAN } from "@/lib/mock-data/seed-members";

const providers = new Map<string, MockEPFDataProvider>();

export function getEpfDataProviderForUan(uan = DEFAULT_UAN) {
  const existing = providers.get(uan);
  if (existing) {
    return existing;
  }
  const created = new MockEPFDataProvider(uan);
  providers.set(uan, created);
  return created;
}

export async function getSessionEpfDataProvider() {
  const uan = await getSessionUan();
  return getEpfDataProviderForUan(uan ?? DEFAULT_UAN);
}

export const epfDataProvider = getEpfDataProviderForUan();

export type { EPFDataProvider } from "./types";
