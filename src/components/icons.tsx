import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 20, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

export function HeartIcon({ filled, ...props }: IconProps & { filled?: boolean }) {
  return (
    <svg {...base(props)} fill={filled ? "currentColor" : "none"}>
      <path d="M20.6 6a4.7 4.7 0 0 0-6.7 0L12 7.9 10.1 6a4.7 4.7 0 0 0-6.7 6.7l1.5 1.5L12 21l7.1-6.8 1.5-1.5a4.7 4.7 0 0 0 0-6.7Z" />
    </svg>
  );
}

export function CommentIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M21 11.6a8.4 8.4 0 0 1-12.1 7.6L3.4 20.6l1.4-4.7A8.4 8.4 0 1 1 21 11.6Z" />
    </svg>
  );
}

export function LinkIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M10.3 13.7a3.6 3.6 0 0 0 5.4.4l2.8-2.8a3.6 3.6 0 0 0-5.1-5.1l-1.6 1.6" />
      <path d="M13.7 10.3a3.6 3.6 0 0 0-5.4-.4l-2.8 2.8a3.6 3.6 0 0 0 5.1 5.1l1.6-1.6" />
    </svg>
  );
}

export function BookmarkIcon({ filled, ...props }: IconProps & { filled?: boolean }) {
  return (
    <svg {...base(props)} fill={filled ? "currentColor" : "none"}>
      <path d="M18 21 12 16.6 6 21V5.4A1.4 1.4 0 0 1 7.4 4h9.2A1.4 1.4 0 0 1 18 5.4V21Z" />
    </svg>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3.5 10.4 12 3.8l8.5 6.6V19a1.4 1.4 0 0 1-1.4 1.4h-3.9V14H8.8v6.4H4.9A1.4 1.4 0 0 1 3.5 19v-8.6Z" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="10.8" cy="10.8" r="7" />
      <path d="m16 16 4.4 4.4" />
    </svg>
  );
}

export function PenIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M16.4 3.9a2.1 2.1 0 0 1 3 3L8.8 17.5l-4 1 1-4L16.4 3.9Z" />
      <path d="M14.6 5.7 17.7 8.8" />
    </svg>
  );
}

export function MoreIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="5.5" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="18.5" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SmileIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.8" />
      <path d="M8.6 14a4.2 4.2 0 0 0 6.8 0" />
      <circle cx="9.2" cy="9.8" r="0.85" fill="currentColor" stroke="none" />
      <circle cx="14.8" cy="9.8" r="0.85" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.6v2.1M12 19.3v2.1M4.7 12H2.6M21.4 12h-2.1M6 6l-1.5-1.5M19.5 19.5 18 18M18 6l1.5-1.5M4.5 19.5 6 18" />
    </svg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20.4 14.5A8.6 8.6 0 0 1 9.5 3.6a8.6 8.6 0 1 0 10.9 10.9Z" />
    </svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5" />
    </svg>
  );
}

export function ArrowUpIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 19.5V5M5.5 11.5 12 5l6.5 6.5" />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="8.4" r="3.9" />
      <path d="M4.6 20.3a7.4 7.4 0 0 1 14.8 0" />
    </svg>
  );
}
