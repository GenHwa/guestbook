type Props = {
  color: string;
  name: string;
  size?: number;
  className?: string;
};

/** 외부 이미지 없이 단색 + 이니셜. 원형 대신 살짝 둥근 사각형. */
export default function Avatar({ color, name, size = 40, className = "" }: Props) {
  return (
    <span
      aria-hidden
      className={`inline-grid shrink-0 place-items-center font-medium text-white/95 select-none ${className}`}
      style={{
        background: color,
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.32),
        fontSize: Math.max(11, Math.round(size * 0.4)),
        letterSpacing: "-0.02em",
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,.07)",
      }}
    >
      {name.slice(0, 1)}
    </span>
  );
}
