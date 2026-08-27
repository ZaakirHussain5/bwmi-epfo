export interface NavItem {
  href: string;
  label: string;
  shortLabel: string;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    shortLabel: "Home",
    description: "Get a quick overview of your EPF account, claims, and pending tasks.",
  },
  {
    href: "/passbook",
    label: "Passbook",
    shortLabel: "Passbook",
    description: "Review monthly contribution entries, compare periods, and spot anomalies quickly.",
  },
  {
    href: "/claims",
    label: "Claims",
    shortLabel: "Claims",
    description:
      "Track status ownership, detailed timeline events, rejection resolution, and guided submission steps.",
  },
  {
    href: "/profile",
    label: "Profile",
    shortLabel: "Profile",
    description: "Manage contact details, nominees, employment history, and bank verification records.",
  },
  {
    href: "/services",
    label: "Services",
    shortLabel: "Services",
    description: "Browse common EPF services and launch the right flow based on your situation.",
  },
  {
    href: "/help",
    label: "Help",
    shortLabel: "Help",
    description: "Use My Cases, outage status, and guided escalation with Nidhi support.",
  },
];
