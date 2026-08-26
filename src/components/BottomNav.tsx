"use client";

import { BookmarkIcon, HomeIcon, PenIcon, SearchIcon, UserIcon } from "./icons";

export default function BottomNav({ onCompose }: { onCompose: () => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
      <div className="flex h-[52px] items-center justify-around px-4">
        <Item label="홈" active>
          <HomeIcon size={21} />
        </Item>
        <Item label="검색">
          <SearchIcon size={21} />
        </Item>
        <button
          onClick={onCompose}
          aria-label="글쓰기"
          className="grid size-9 place-items-center rounded-lg bg-ink text-bg transition active:scale-90"
        >
          <PenIcon size={17} />
        </button>
        <Item label="보관함">
          <BookmarkIcon size={21} />
        </Item>
        <Item label="내 정보">
          <UserIcon size={21} />
        </Item>
      </div>
    </nav>
  );
}

function Item({
  children,
  label,
  active,
}: {
  children: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      aria-label={label}
      className={`grid size-9 place-items-center rounded-lg transition active:scale-90 ${
        active ? "text-ink" : "text-muted"
      }`}
    >
      {children}
    </button>
  );
}
