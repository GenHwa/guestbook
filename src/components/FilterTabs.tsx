"use client";

export type SortKey = "recent" | "popular" | "paper";

const TABS: { key: SortKey; label: string }[] = [
  { key: "recent", label: "최신순" },
  { key: "popular", label: "공감순" },
  { key: "paper", label: "편지지" },
];

export default function FilterTabs({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (k: SortKey) => void;
}) {
  return (
    <div className="sticky top-14 z-30 -mx-5 mb-6 border-b border-line bg-bg/85 px-5 backdrop-blur-md sm:mx-0 sm:rounded-none">
      <div className="flex gap-6">
        {TABS.map((t) => {
          const active = t.key === value;
          return (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              className={`relative -mb-px py-3 text-[13.5px] transition ${
                active
                  ? "font-semibold text-ink"
                  : "text-muted hover:text-ink-soft"
              }`}
            >
              {t.label}
              <span
                className={`absolute inset-x-0 bottom-0 h-[1.5px] transition ${
                  active ? "bg-ink" : "bg-transparent"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
