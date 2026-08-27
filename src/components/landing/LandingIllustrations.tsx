import type { ReactNode } from "react";

type IllustrationProps = {
  className?: string;
};

function Frame({ children, className = "h-16 w-16" }: IllustrationProps & { children: ReactNode }) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden="true">
      {children}
    </svg>
  );
}

export function IllustrationAssistant(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <rect x="8" y="14" width="64" height="48" rx="14" fill="#ecfeff" />
      <rect x="8" y="14" width="64" height="48" rx="14" fill="none" stroke="#0f766e" strokeWidth="2" />
      <circle cx="28" cy="36" r="6" fill="#0f766e" />
      <path d="M40 32h22M40 40h16" stroke="#14b8a6" strokeWidth="3" strokeLinecap="round" />
      <path d="M24 62 32 52h16" fill="#fbbf24" />
    </Frame>
  );
}

export function IllustrationVoice(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <circle cx="40" cy="40" r="28" fill="#ecfeff" />
      <rect x="34" y="22" width="12" height="22" rx="6" fill="#0f766e" />
      <path d="M28 38a12 12 0 0 0 24 0" fill="none" stroke="#14b8a6" strokeWidth="3" />
      <path d="M40 50v8M32 58h16" stroke="#0f766e" strokeWidth="3" strokeLinecap="round" />
      <path d="M18 40c0-4 2-8 4-10M62 40c0-4-2-8-4-10" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
    </Frame>
  );
}

export function IllustrationDashboard(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <rect x="10" y="16" width="60" height="48" rx="10" fill="#ecfeff" stroke="#0f766e" strokeWidth="2" />
      <circle cx="28" cy="40" r="12" fill="none" stroke="#0f766e" strokeWidth="4" />
      <path d="M28 28a12 12 0 0 1 10 18" fill="none" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
      <rect x="46" y="28" width="16" height="6" rx="2" fill="#14b8a6" />
      <rect x="46" y="38" width="12" height="6" rx="2" fill="#0f766e" opacity="0.45" />
      <rect x="46" y="48" width="18" height="6" rx="2" fill="#0f766e" opacity="0.25" />
    </Frame>
  );
}

export function IllustrationPassbook(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <path d="M18 16h34a8 8 0 0 1 8 8v40H26a8 8 0 0 1-8-8V16Z" fill="#ecfeff" stroke="#0f766e" strokeWidth="2" />
      <path d="M18 16v40a8 8 0 0 0 8 8" fill="none" stroke="#0f766e" strokeWidth="2" />
      <path d="M30 28h22M30 38h18M30 48h14" stroke="#14b8a6" strokeWidth="3" strokeLinecap="round" />
    </Frame>
  );
}

export function IllustrationClaims(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <rect x="14" y="18" width="52" height="46" rx="10" fill="#ecfeff" stroke="#0f766e" strokeWidth="2" />
      <circle cx="28" cy="32" r="5" fill="#0f766e" />
      <circle cx="40" cy="48" r="5" fill="#fbbf24" />
      <circle cx="54" cy="36" r="5" fill="#14b8a6" />
      <path d="M28 32h12M40 48 54 36" stroke="#0f766e" strokeWidth="2" />
    </Frame>
  );
}

export function IllustrationProfile(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <rect x="14" y="18" width="52" height="46" rx="10" fill="#ecfeff" stroke="#0f766e" strokeWidth="2" />
      <circle cx="40" cy="34" r="8" fill="#0f766e" />
      <path d="M24 54c2.5-8 8-12 16-12s13.5 4 16 12" fill="#14b8a6" />
    </Frame>
  );
}

export function IllustrationServices(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <rect x="14" y="16" width="22" height="22" rx="6" fill="#ecfeff" stroke="#0f766e" strokeWidth="2" />
      <rect x="44" y="16" width="22" height="22" rx="6" fill="#ccfbf1" stroke="#0f766e" strokeWidth="2" />
      <rect x="14" y="44" width="22" height="22" rx="6" fill="#fef3c7" stroke="#0f766e" strokeWidth="2" />
      <rect x="44" y="44" width="22" height="22" rx="6" fill="#ecfeff" stroke="#0f766e" strokeWidth="2" />
    </Frame>
  );
}

export function IllustrationHelp(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <circle cx="40" cy="40" r="26" fill="#ecfeff" stroke="#0f766e" strokeWidth="2" />
      <path
        d="M32 34c0-5 3.5-8 8-8s8 3 8 7c0 4-3 5.5-5 7-1.2.9-2 2.2-2 4"
        fill="none"
        stroke="#0f766e"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="40" cy="54" r="2.4" fill="#fbbf24" />
    </Frame>
  );
}

export function JourneyPath({ className = "h-24 w-full" }: IllustrationProps) {
  const points = [
    { x: 24, y: 56 },
    { x: 220, y: 20 },
    { x: 430, y: 52 },
    { x: 560, y: 18 },
    { x: 696, y: 40 },
  ];

  return (
    <svg viewBox="0 0 720 96" className={className} aria-hidden="true">
      <path
        d="M24 56 C 120 56, 140 20, 220 20 S 340 84, 430 52 S 560 12, 696 40"
        fill="none"
        stroke="#14b8a6"
        strokeWidth="3"
        strokeDasharray="8 10"
        className="landing-dash"
      />
      {points.map((point, index) => (
        <g key={point.x}>
          <circle cx={point.x} cy={point.y} r="14" fill="#ccfbf1" />
          <circle cx={point.x} cy={point.y} r="10" fill="#0f766e" />
          <text
            x={point.x}
            y={point.y + 4}
            textAnchor="middle"
            fill="white"
            fontSize="11"
            fontWeight="700"
          >
            {index + 1}
          </text>
        </g>
      ))}
    </svg>
  );
}

export const FEATURE_ILLUSTRATIONS = {
  assistant: IllustrationAssistant,
  voice: IllustrationVoice,
  dashboard: IllustrationDashboard,
  passbook: IllustrationPassbook,
  claims: IllustrationClaims,
  profile: IllustrationProfile,
  services: IllustrationServices,
  help: IllustrationHelp,
} as const;
