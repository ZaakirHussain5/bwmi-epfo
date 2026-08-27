import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function LineIcon({ children, className = "h-5 w-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconBook(props: IconProps) {
  return (
    <LineIcon {...props}>
      <path d="M4.5 5.25A2.25 2.25 0 0 1 6.75 3H18v16.5H6.75A2.25 2.25 0 0 0 4.5 21.75Z" />
      <path d="M4.5 5.25v16.5" />
      <path d="M8.25 7.5h6" />
      <path d="M8.25 11.25h6" />
    </LineIcon>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <LineIcon {...props}>
      <circle cx="11" cy="11" r="6.25" />
      <path d="m20 20-3.5-3.5" />
    </LineIcon>
  );
}

export function IconUser(props: IconProps) {
  return (
    <LineIcon {...props}>
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5.5 19.25a6.5 6.5 0 0 1 13 0" />
    </LineIcon>
  );
}

export function IconIdCard(props: IconProps) {
  return (
    <LineIcon {...props}>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <circle cx="9" cy="12" r="2" />
      <path d="M13.5 10.5h5" />
      <path d="M13.5 13.5h3.5" />
    </LineIcon>
  );
}

export function IconFingerprint(props: IconProps) {
  return (
    <LineIcon {...props}>
      <path d="M7 10.5a5 5 0 0 1 10 0v3" />
      <path d="M9.2 11a2.8 2.8 0 0 1 5.6 0v4.2" />
      <path d="M12 13.5v5" />
      <path d="M6.2 14.5c0 3 1.4 5.5 2.8 6.5" />
      <path d="M17.8 14.2c.4 2.6-.4 4.8-1.8 6.3" />
    </LineIcon>
  );
}

export function IconBank(props: IconProps) {
  return (
    <LineIcon {...props}>
      <path d="M4 10.5h16" />
      <path d="M12 4.5 4 10.5h16L12 4.5Z" />
      <path d="M6.5 10.5V18" />
      <path d="M12 10.5V18" />
      <path d="M17.5 10.5V18" />
      <path d="M4 18.5h16" />
    </LineIcon>
  );
}

export function IconUsers(props: IconProps) {
  return (
    <LineIcon {...props}>
      <circle cx="9" cy="8.5" r="2.5" />
      <path d="M4.5 18a4.5 4.5 0 0 1 9 0" />
      <circle cx="16.5" cy="9.5" r="2" />
      <path d="M15 18a3.8 3.8 0 0 1 5.5 0" />
    </LineIcon>
  );
}

export function IconBriefcase(props: IconProps) {
  return (
    <LineIcon {...props}>
      <rect x="3.5" y="8" width="17" height="11.5" rx="1.75" />
      <path d="M9 8V6.5A1.5 1.5 0 0 1 10.5 5h3A1.5 1.5 0 0 1 15 6.5V8" />
      <path d="M3.5 13h17" />
    </LineIcon>
  );
}

export function IconTransfer(props: IconProps) {
  return (
    <LineIcon {...props}>
      <path d="M7 8h12" />
      <path d="M16 5.5 19 8l-3 2.5" />
      <path d="M17 16H5" />
      <path d="M8 13.5 5 16l3 2.5" />
    </LineIcon>
  );
}

export function IconGrid(props: IconProps) {
  return (
    <LineIcon {...props}>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.25" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.25" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.25" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.25" />
    </LineIcon>
  );
}

export function IconShield(props: IconProps) {
  return (
    <LineIcon {...props}>
      <path d="M12 3.5 5 6.5v5.2c0 4 2.8 6.8 7 8.8 4.2-2 7-4.8 7-8.8V6.5Z" />
      <path d="m9.2 12.2 1.9 1.9 3.8-4" />
    </LineIcon>
  );
}

export function IconShieldAlert(props: IconProps) {
  return (
    <LineIcon {...props}>
      <path d="M12 3.5 5 6.5v5.2c0 4 2.8 6.8 7 8.8 4.2-2 7-4.8 7-8.8V6.5Z" />
      <path d="M12 8.5v4" />
      <path d="M12 16h.01" />
    </LineIcon>
  );
}

export function IconBell(props: IconProps) {
  return (
    <LineIcon {...props}>
      <path d="M6.5 16.5h11l-1.2-1.8V11a4.3 4.3 0 1 0-8.6 0v3.7Z" />
      <path d="M10 16.5a2 2 0 0 0 4 0" />
    </LineIcon>
  );
}

export function IconWarning(props: IconProps) {
  return (
    <LineIcon {...props}>
      <path d="m12 4.5 8.2 14.5H3.8Z" />
      <path d="M12 10v4" />
      <path d="M12 16.5h.01" />
    </LineIcon>
  );
}

export function IconInfo(props: IconProps) {
  return (
    <LineIcon {...props}>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </LineIcon>
  );
}

export function IconChevronRight(props: IconProps) {
  return (
    <LineIcon {...props}>
      <path d="m9 6 6 6-6 6" />
    </LineIcon>
  );
}

export function IconLogout(props: IconProps) {
  return (
    <LineIcon {...props}>
      <path d="M10 5.5H7.5A2 2 0 0 0 5.5 7.5v9A2 2 0 0 0 7.5 18.5H10" />
      <path d="M10 12h8.5" />
      <path d="m16 8.5 2.5 3.5L16 15.5" />
    </LineIcon>
  );
}

export function IconTrendingUp(props: IconProps) {
  return (
    <LineIcon {...props}>
      <path d="m4.5 16 5-5 3 3 7-7" />
      <path d="M14.5 7h5v5" />
    </LineIcon>
  );
}

export function IconFileText(props: IconProps) {
  return (
    <LineIcon {...props}>
      <path d="M14 4.5H8A1.5 1.5 0 0 0 6.5 6v12A1.5 1.5 0 0 0 8 19.5h8A1.5 1.5 0 0 0 17.5 18V8Z" />
      <path d="M14 4.5V8h3.5" />
      <path d="M9 11.5h6" />
      <path d="M9 15h4" />
    </LineIcon>
  );
}

export function IconRobot(props: IconProps) {
  return (
    <LineIcon {...props}>
      <rect x="6" y="7" width="12" height="10" rx="2" />
      <path d="M12 4.5v2.5" />
      <path d="M9 12h.01" />
      <path d="M15 12h.01" />
      <path d="M9.5 15h5" />
      <path d="M4.5 10.5h1.5" />
      <path d="M18 10.5h1.5" />
    </LineIcon>
  );
}
