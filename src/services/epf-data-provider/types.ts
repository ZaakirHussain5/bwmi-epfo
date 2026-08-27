import type {
  Claim,
  MemberProfile,
  MemberSummary,
  MedicalClaimDraftInput,
  PassbookEntry,
  PassbookFilters,
  ServiceStatus,
  Service,
  SupportTicket,
  SupportTicketInput,
} from "@/types/epf";

export interface EPFDataProvider {
  getMemberSummary(): Promise<MemberSummary>;
  getPassbook(filters?: PassbookFilters): Promise<PassbookEntry[]>;
  getClaims(): Promise<Claim[]>;
  getClaimById(id: string): Promise<Claim>;
  saveMedicalAdvanceDraft(input: MedicalClaimDraftInput): Promise<Claim>;
  submitMedicalAdvanceClaim(draftId: string): Promise<Claim>;
  getProfile(): Promise<MemberProfile>;
  updateProfile(data: Partial<MemberProfile>): Promise<MemberProfile>;
  getServices(): Promise<Service[]>;
  getServiceStatus(): Promise<ServiceStatus[]>;
  getSupportTickets(): Promise<SupportTicket[]>;
  getSupportTicketById(id: string): Promise<SupportTicket>;
  createSupportTicket(input: SupportTicketInput): Promise<SupportTicket>;
  updateSupportTicket(
    id: string,
    data: Partial<
      Pick<
        SupportTicket,
        "status" | "statusCategory" | "currentOwner" | "nextExpectedAction" | "closureReason"
      >
    >,
  ): Promise<SupportTicket>;
}
