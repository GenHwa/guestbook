"use client";

import Avatar from "./Avatar";
import { REGULARS, formatCount, type Message } from "@/lib/data";

export default function RightSidebar({ messages }: { messages: Message[] }) {
  const top = [...messages].sort((a, b) => b.likes - a.likes).slice(0, 3);

  return (
    <aside className="hidden w-[248px] shrink-0 lg:block">
      <div className="sticky top-[104px] space-y-9 pt-[136px]">
        <section>
          <h2 className="mb-4 text-[11px] font-semibold tracking-[0.18em] text-muted">
            이번 주 많이 읽힌 글
          </h2>
          <ol className="space-y-4">
            {top.map((m, i) => (
              <li key={m.id} className="flex gap-3">
                <span className="font-serif-ko mt-px w-4 shrink-0 text-[15px] font-bold text-muted/60">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="line-clamp-2 text-[13px] leading-[1.6] text-ink-soft">
                    {m.text}
                  </p>
                  <p className="mt-1.5 text-[11.5px] text-muted">
                    {m.author} · 공감 {formatCount(m.likes)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="h-px bg-line" />

        <section>
          <h2 className="mb-4 text-[11px] font-semibold tracking-[0.18em] text-muted">
            자주 오시는 분들
          </h2>
          <ul className="space-y-3">
            {REGULARS.map((u) => (
              <li key={u.id} className="flex items-center gap-2.5">
                <Avatar color={u.color} name={u.name} size={28} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-ink">
                    {u.name}
                  </p>
                  <p className="truncate text-[11.5px] text-muted">@{u.handle}</p>
                </div>
                <span className="shrink-0 text-[11.5px] tabular-nums text-muted">
                  {u.count}회
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div className="h-px bg-line" />

        <p className="text-[11px] leading-[2] text-muted/80">
          소개 · 문의 · 이용약관
          <br />
          © 2026 방명록
        </p>
      </div>
    </aside>
  );
}
