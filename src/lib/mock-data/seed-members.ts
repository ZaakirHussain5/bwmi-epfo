import type {
  Claim,
  MemberProfile,
  PassbookEntry,
  SupportTicket,
} from "@/types/epf";
import {
  mockClaims,
  mockPassbook,
  mockProfile,
  mockSupportTickets,
} from "@/lib/mock-data/member-account";

export type AccountActivation = "fully_activated" | "partially_activated";

export const LOGIN_OTP = "123456";
export const DEFAULT_UAN = "UAN-XXXX-1234";

export interface SeedMember {
  uan: string;
  name: string;
  activation: AccountActivation;
  profile: MemberProfile;
  passbook: PassbookEntry[];
  claims: Claim[];
  tickets: SupportTicket[];
}

export interface AccountPreview {
  uan: string;
  name: string;
  activation: AccountActivation;
}

export function normalizeUan(uan: string) {
  return uan.trim().toUpperCase();
}

export function isValidOtp(otp: string) {
  return otp.trim() === LOGIN_OTP;
}

function completedPipeline<T extends { status: "completed" | "in_progress" | "blocked" }>(
  pipeline: T[],
): T[] {
  return pipeline.map((step) => ({ ...step, status: "completed" as const }));
}

function remapClaims(prefix: string, claims: Claim[]): Claim[] {
  return structuredClone(claims).map((claim) => ({
    ...claim,
    id: `${prefix}-${claim.id}`,
    referenceNumber: `${prefix}-${claim.referenceNumber}`,
  }));
}

function remapTickets(prefix: string, tickets: SupportTicket[]): SupportTicket[] {
  return structuredClone(tickets).map((ticket) => ({
    ...ticket,
    id: `${prefix}-${ticket.id}`,
    referenceNumber: `${prefix}-${ticket.referenceNumber}`,
  }));
}

function remapPassbook(prefix: string, entries: PassbookEntry[]): PassbookEntry[] {
  return structuredClone(entries).map((entry) => ({
    ...entry,
    id: `${prefix}-${entry.id}`,
  }));
}

function stablePassbook(prefix: string, employerName: string): PassbookEntry[] {
  return remapPassbook(prefix, mockPassbook).map((entry) => ({
    ...entry,
    employeeContribution: 8500,
    employerContribution: 8500,
    epsContribution: 1250,
    interestCredit: entry.interestCredit > 0 ? 5200 : 0,
    transferIn: undefined,
    withdrawal: undefined,
    adjustment: undefined,
    note: undefined,
    employerName,
  }));
}

function fullyActivatedEmployment(
  current: { employerName: string; memberId: string; uan: string; dojEpf: string },
  past: { employerName: string; memberId: string; uan: string; dojEpf: string; doeEpf: string },
): MemberProfile["employment"] {
  return [
    {
      employerName: current.employerName,
      memberId: current.memberId,
      uanLinked: current.uan,
      dojEpf: current.dojEpf,
      status: "current",
      transferStatus: "not_applicable",
      serviceHistoryStatus: "complete",
      integrityFlags: [],
    },
    {
      employerName: past.employerName,
      memberId: past.memberId,
      uanLinked: past.uan,
      dojEpf: past.dojEpf,
      doeEpf: past.doeEpf,
      status: "past",
      transferStatus: "completed",
      serviceHistoryStatus: "complete",
      integrityFlags: [],
    },
  ];
}

const zaakirProfile = structuredClone(mockProfile);

const priyaUan = "UAN-XXXX-2345";
const priyaProfile: MemberProfile = {
  ...structuredClone(mockProfile),
  memberId: "MHBAN0023456000",
  name: "Priya Sharma",
  uan: priyaUan,
  uanStatus: "active",
  dateOfBirth: "1988-11-03",
  mobile: "+91 98111 23456",
  email: "priya.sharma@nidhi-portal.test",
  kyc: {
    aadhaarMasked: "XXXX-XXXX-3344",
    panMasked: "PQRS*****T",
    aadhaarStatus: "verified",
    panStatus: "verified",
    pipeline: completedPipeline(mockProfile.kyc.pipeline),
    mismatches: [],
  },
  employment: fullyActivatedEmployment(
    {
      employerName: "Horizon Logistics Pvt Ltd",
      memberId: "MHBAN0023456000",
      uan: priyaUan,
      dojEpf: "2023-02-01",
    },
    {
      employerName: "Coastal Retail India Ltd",
      memberId: "MHBAN0088776000",
      uan: priyaUan,
      dojEpf: "2019-06-01",
      doeEpf: "2023-01-31",
    },
  ),
  bank: {
    accountMasked: "XXXXXX4412",
    ifscMasked: "HDFC0XXXXX",
    status: "verified",
    pipeline: completedPipeline(mockProfile.bank.pipeline),
    mismatches: [],
    readyForClaims: true,
  },
  nominees: [
    {
      id: "NOM-PRIYA-001",
      name: "Aarav Sharma",
      relationship: "Spouse",
      sharePercent: 100,
      dob: "1986-02-14",
    },
  ],
  careerSummary: {
    totalEligibleServiceMonths: 84,
    totalPfAccountsDetected: 2,
    reconciledAccounts: 2,
    accountsRequiringAttention: 0,
  },
};

const arjunUan = "UAN-XXXX-3456";
const arjunProfile: MemberProfile = {
  ...structuredClone(mockProfile),
  memberId: "MHBAN0034567000",
  name: "Arjun Patel",
  uan: arjunUan,
  uanStatus: "active",
  dateOfBirth: "1993-07-21",
  mobile: "+91 98222 34567",
  email: "arjun.patel@nidhi-portal.test",
  kyc: {
    aadhaarMasked: "XXXX-XXXX-7788",
    panMasked: "LMNOP****Q",
    aadhaarStatus: "verified",
    panStatus: "verified",
    pipeline: completedPipeline(mockProfile.kyc.pipeline),
    mismatches: [],
  },
  employment: fullyActivatedEmployment(
    {
      employerName: "Vertex Analytics LLP",
      memberId: "MHBAN0034567000",
      uan: arjunUan,
      dojEpf: "2021-09-01",
    },
    {
      employerName: "Northwind Pharma Ltd",
      memberId: "MHBAN0077003000",
      uan: arjunUan,
      dojEpf: "2018-01-15",
      doeEpf: "2021-08-31",
    },
  ),
  bank: {
    accountMasked: "XXXXXX9081",
    ifscMasked: "SBIN0XXXXX",
    status: "verified",
    pipeline: completedPipeline(mockProfile.bank.pipeline),
    mismatches: [],
    readyForClaims: true,
  },
  nominees: [
    {
      id: "NOM-ARJUN-001",
      name: "Neha Patel",
      relationship: "Spouse",
      sharePercent: 60,
      dob: "1994-12-02",
    },
    {
      id: "NOM-ARJUN-002",
      name: "Ramesh Patel",
      relationship: "Father",
      sharePercent: 40,
      dob: "1964-05-18",
    },
  ],
  careerSummary: {
    totalEligibleServiceMonths: 96,
    totalPfAccountsDetected: 2,
    reconciledAccounts: 2,
    accountsRequiringAttention: 0,
  },
};

const meeraUan = "UAN-XXXX-4567";
const meeraProfile: MemberProfile = {
  ...structuredClone(mockProfile),
  memberId: "MHBAN0045678000",
  name: "Meera Iyer",
  uan: meeraUan,
  uanStatus: "needs_attention",
  dateOfBirth: "1996-01-09",
  mobile: "+91 98333 45678",
  email: "meera.iyer@nidhi-portal.test",
  kyc: {
    aadhaarMasked: "XXXX-XXXX-5566",
    panMasked: "UVWXY****Z",
    aadhaarStatus: "pending",
    panStatus: "pending",
    pipeline: [
      {
        id: "kyc-submitted",
        label: "Submitted",
        status: "completed",
        owner: "user",
        detail: "Identity records submitted for verification.",
      },
      {
        id: "kyc-validation",
        label: "Identity matching",
        status: "in_progress",
        owner: "epfo",
        detail: "Aadhaar match is still pending for this account.",
      },
      {
        id: "kyc-ready",
        label: "Ready for claims",
        status: "blocked",
        owner: "epfo",
        detail: "Blocked until Aadhaar and PAN verification complete.",
      },
    ],
    mismatches: [
      {
        id: "aadhaar-name-mismatch",
        field: "Aadhaar name",
        epfoValue: "Meera Iyer",
        sourceValue: "Meera S Iyer",
        owner: "user",
        cta: { label: "Start correction", href: "/profile" },
        explainability: {
          owner: "user",
          whatHappened: "Aadhaar name matching is incomplete.",
          whyItHappened: "The Aadhaar record includes a middle initial not present in EPFO.",
          userImpact: "Online claims stay blocked until identity matching succeeds.",
          nextSteps: ["Review KYC details and resubmit matching documents."],
        },
      },
    ],
  },
  employment: [
    {
      employerName: "Brightwave Studios Pvt Ltd",
      memberId: "MHBAN0045678000",
      uanLinked: meeraUan,
      dojEpf: "2025-11-01",
      status: "current",
      transferStatus: "not_applicable",
      serviceHistoryStatus: "needs_review",
      integrityFlags: ["kyc_incomplete"],
    },
  ],
  bank: {
    accountMasked: "XXXXXX0000",
    ifscMasked: "XXXX0XXXXX",
    status: "pending",
    pipeline: [
      {
        id: "bank-submitted",
        label: "Submitted",
        status: "in_progress",
        owner: "user",
        detail: "Bank details have not been confirmed yet.",
      },
      {
        id: "bank-validated",
        label: "Bank validation",
        status: "blocked",
        owner: "bank",
        detail: "Waiting for a confirmed account number.",
      },
      {
        id: "bank-match",
        label: "Identity matching",
        status: "blocked",
        owner: "epfo",
        detail: "Cannot start until bank details are submitted.",
      },
      {
        id: "bank-ready",
        label: "Ready for claims",
        status: "blocked",
        owner: "epfo",
        detail: "Account is not claim-ready.",
      },
    ],
    mismatches: [],
    readyForClaims: false,
  },
  nominees: [],
  careerSummary: {
    totalEligibleServiceMonths: 9,
    totalPfAccountsDetected: 1,
    reconciledAccounts: 0,
    accountsRequiringAttention: 1,
  },
};

const rohitUan = "UAN-XXXX-5678";
const rohitProfile: MemberProfile = {
  ...structuredClone(mockProfile),
  memberId: "MHBAN0056789000",
  name: "Rohit Verma",
  uan: rohitUan,
  uanStatus: "active",
  dateOfBirth: "1990-09-27",
  mobile: "+91 98444 56789",
  email: "rohit.verma@nidhi-portal.test",
  kyc: {
    aadhaarMasked: "XXXX-XXXX-9900",
    panMasked: "GHJKL****M",
    aadhaarStatus: "verified",
    panStatus: "pending",
    pipeline: [
      {
        id: "kyc-submitted",
        label: "Submitted",
        status: "completed",
        owner: "user",
        detail: "Identity records submitted for verification.",
      },
      {
        id: "kyc-validation",
        label: "Identity matching",
        status: "in_progress",
        owner: "epfo",
        detail: "PAN matching is still pending.",
      },
      {
        id: "kyc-ready",
        label: "Ready for claims",
        status: "blocked",
        owner: "epfo",
        detail: "Blocked until PAN verification completes.",
      },
    ],
    mismatches: [],
  },
  employment: [
    {
      employerName: "Summit Auto Components Ltd",
      memberId: "MHBAN0056789000",
      uanLinked: rohitUan,
      dojEpf: "2024-01-01",
      status: "current",
      transferStatus: "not_applicable",
      serviceHistoryStatus: "complete",
      integrityFlags: [],
    },
    {
      employerName: "Metro Castings Pvt Ltd",
      memberId: "MHBAN0011223000",
      uanLinked: rohitUan,
      dojEpf: "2020-03-01",
      status: "past",
      transferStatus: "in_progress",
      serviceHistoryStatus: "needs_review",
      integrityFlags: ["missing_date_of_exit", "untransferred_pf_balance"],
    },
  ],
  bank: {
    accountMasked: "XXXXXX7721",
    ifscMasked: "ICIC0XXXXX",
    status: "needs_attention",
    pipeline: [
      {
        id: "bank-submitted",
        label: "Submitted",
        status: "completed",
        owner: "user",
        detail: "Bank details submitted.",
      },
      {
        id: "bank-validated",
        label: "Bank validation",
        status: "completed",
        owner: "bank",
        detail: "Account format and IFSC are valid.",
      },
      {
        id: "bank-match",
        label: "Identity matching",
        status: "blocked",
        owner: "epfo",
        detail: "Name matching paused until PAN is verified.",
      },
      {
        id: "bank-ready",
        label: "Ready for claims",
        status: "blocked",
        owner: "epfo",
        detail: "Blocked until PAN and bank name matching complete.",
      },
    ],
    mismatches: [
      {
        id: "bank-name-mismatch-rohit",
        field: "Account holder name",
        epfoValue: "Rohit Verma",
        sourceValue: "Rohit K Verma",
        owner: "user",
        cta: { label: "Start correction", href: "/profile" },
        explainability: {
          owner: "user",
          whatHappened: "Bank account name has a middle initial mismatch.",
          whyItHappened: "The bank record does not exactly match the EPFO profile name.",
          userImpact: "Claim payout can be delayed until the name match is accepted.",
          nextSteps: ["Update bank or profile name so both records match."],
        },
      },
    ],
    readyForClaims: false,
  },
  nominees: [
    {
      id: "NOM-ROHIT-001",
      name: "Kavita Verma",
      relationship: "Spouse",
      sharePercent: 100,
      dob: "1992-04-11",
    },
  ],
  careerSummary: {
    totalEligibleServiceMonths: 54,
    totalPfAccountsDetected: 2,
    reconciledAccounts: 1,
    accountsRequiringAttention: 1,
  },
};

const completedClaims = mockClaims.filter((claim) => claim.status === "completed");
const meeraClaims = mockClaims.filter((claim) => claim.status === "draft");
const resolvedTickets = mockSupportTickets.filter((ticket) => ticket.status === "resolved");

export const seedMembers: SeedMember[] = [
  {
    uan: DEFAULT_UAN,
    name: zaakirProfile.name,
    activation: "partially_activated",
    profile: zaakirProfile,
    passbook: structuredClone(mockPassbook),
    claims: structuredClone(mockClaims),
    tickets: structuredClone(mockSupportTickets),
  },
  {
    uan: priyaUan,
    name: priyaProfile.name,
    activation: "fully_activated",
    profile: priyaProfile,
    passbook: stablePassbook("PRIYA", "Horizon Logistics Pvt Ltd"),
    claims: remapClaims("PRIYA", completedClaims),
    tickets: remapTickets("PRIYA", resolvedTickets),
  },
  {
    uan: arjunUan,
    name: arjunProfile.name,
    activation: "fully_activated",
    profile: arjunProfile,
    passbook: stablePassbook("ARJUN", "Vertex Analytics LLP"),
    claims: remapClaims("ARJUN", completedClaims),
    tickets: remapTickets("ARJUN", resolvedTickets),
  },
  {
    uan: meeraUan,
    name: meeraProfile.name,
    activation: "partially_activated",
    profile: meeraProfile,
    passbook: remapPassbook("MEERA", mockPassbook.slice(-8)),
    claims: remapClaims("MEERA", meeraClaims),
    tickets: [],
  },
  {
    uan: rohitUan,
    name: rohitProfile.name,
    activation: "partially_activated",
    profile: rohitProfile,
    passbook: remapPassbook("ROHIT", mockPassbook),
    claims: remapClaims("ROHIT", mockClaims.filter((claim) => claim.status !== "completed")),
    tickets: remapTickets("ROHIT", mockSupportTickets),
  },
];

const membersByUan = new Map(seedMembers.map((member) => [member.uan, member]));

export function findSeedMember(uan: string) {
  return membersByUan.get(normalizeUan(uan));
}

export function listAccounts(): AccountPreview[] {
  return seedMembers.map((member) => ({
    uan: member.uan,
    name: member.name,
    activation: member.activation,
  }));
}

export function activationLabel(activation: AccountActivation) {
  return activation === "fully_activated" ? "Fully activated" : "Partially activated";
}
