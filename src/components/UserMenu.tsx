"use client";

import { useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import { useAuth } from "@/lib/useAuth";

export default function UserMenu({ onLogin }: { onLogin: () => void }) {
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  /* 세션 확인 전에는 자리만 잡아 둔다 (로그인 버튼이 깜빡이지 않게) */
  if (loading) return <div className="size-9 shrink-0" aria-hidden />;

  if (!user) {
    return (
      <button
        onClick={onLogin}
        className="h-9 shrink-0 rounded-md border border-line px-3 text-[13px] font-medium text-ink-soft transition hover:border-muted hover:text-ink active:scale-95"
      >
        로그인
      </button>
    );
  }

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${user.displayName} 메뉴`}
        className="grid place-items-center rounded-md transition active:scale-90"
      >
        <Avatar color={user.color} name={user.displayName} size={32} />
      </button>

      {open && (
        <div
          role="menu"
          className="animate-rise absolute right-0 top-[42px] w-[196px] overflow-hidden rounded-lg border border-line bg-surface shadow-sm"
        >
          <div className="border-b border-line-soft px-4 py-3">
            <p className="flex items-center gap-1.5 truncate text-[13.5px] font-semibold text-ink">
              {user.displayName}
              {user.isOwner && (
                <span className="shrink-0 rounded-[4px] border border-accent/40 px-1.5 py-px text-[10px] font-medium text-accent">
                  주인장
                </span>
              )}
            </p>
            <p className="truncate text-[11.5px] text-muted">@{user.username}</p>
          </div>
          <button
            role="menuitem"
            onClick={() => {
              setOpen(false);
              void logout();
            }}
            className="w-full px-4 py-2.5 text-left text-[13px] text-ink-soft transition hover:bg-surface-2 hover:text-ink"
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
