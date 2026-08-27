"use client";

import UserMenu from "./UserMenu";
import { MoonIcon, PenIcon, SearchIcon, SunIcon } from "./icons";

type Props = {
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onCompose: () => void;
  query: string;
  onQuery: (v: string) => void;
  onLogin: () => void;
};

export default function Header({
  theme,
  onToggleTheme,
  onCompose,
  query,
  onQuery,
  onLogin,
}: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[940px] items-center gap-3 px-5">
        <a href="#top" className="shrink-0 select-none">
          <span className="font-serif-ko text-[19px] font-bold text-ink">방명록</span>
          <span className="ml-2 hidden text-[11px] tracking-[0.18em] text-muted sm:inline">
            GUESTBOOK
          </span>
        </a>

        <div className="relative ml-auto w-full max-w-[240px] sm:ml-6 sm:mr-auto">
          <SearchIcon
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="글이나 이름 검색"
            className="h-9 w-full rounded-md border border-line bg-surface pl-8 pr-3 text-[13px] text-ink placeholder:text-muted outline-none transition focus:border-accent/50"
          />
        </div>

        <button
          onClick={onToggleTheme}
          aria-label={theme === "dark" ? "밝은 모드로" : "어두운 모드로"}
          title={theme === "dark" ? "밝은 모드로" : "어두운 모드로"}
          className="grid size-9 shrink-0 place-items-center rounded-md text-ink-soft transition hover:bg-surface-2 active:scale-90"
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>

        <button
          onClick={onCompose}
          className="flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-ink px-3 text-[13px] font-medium text-bg transition hover:opacity-85 active:scale-95"
        >
          <PenIcon size={15} />
          <span className="hidden sm:inline">글쓰기</span>
        </button>

        <UserMenu onLogin={onLogin} />
      </div>
    </header>
  );
}
