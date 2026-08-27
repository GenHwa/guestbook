"use client";

import { useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import { SmileIcon } from "./icons";
import { useAuth } from "@/lib/useAuth";
import { PAPERS, type Paper } from "@/lib/data";

const MAX = 300;
const EMOJI = ["☺️", "🌿", "☕", "✍️", "🌙", "🍀"];

type Props = {
  onSubmit: (text: string, paper: Paper) => void;
  /** 로그인하지 않은 채로 글을 쓰려 할 때 */
  onRequireLogin: () => void;
  autoFocus?: boolean;
  onClose?: () => void;
};

export default function Composer({
  onSubmit,
  onRequireLogin,
  autoFocus,
  onClose,
}: Props) {
  const { user, loading } = useAuth();
  const [text, setText] = useState("");
  const [paper, setPaper] = useState<Paper>("plain");
  const [open, setOpen] = useState(Boolean(autoFocus));
  const ref = useRef<HTMLTextAreaElement>(null);

  const expanded = open || text.length > 0;
  const styled = paper !== "plain";

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(styled ? 150 : 46, el.scrollHeight)}px`;
  }, [text, styled, expanded]);

  function submit() {
    const value = text.trim();
    if (!value) return;
    onSubmit(value, paper);
    setText("");
    setPaper("plain");
    setOpen(false);
    onClose?.();
  }

  /* 세션 확인 중 — 높이만 잡아 둔다 */
  if (loading) {
    return <section className="mb-8 h-[66px] rounded-lg border border-line bg-surface" />;
  }

  /* 로그인해야 쓸 수 있다 */
  if (!user) {
    return (
      <section className="mb-8 rounded-lg border border-line bg-surface">
        <button
          onClick={onRequireLogin}
          className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-surface-2/50"
        >
          <span
            aria-hidden
            className="grid size-[34px] shrink-0 place-items-center rounded-[11px] border border-dashed border-line text-[15px] text-muted"
          >
            ?
          </span>
          <span className="text-[14.5px] text-muted">
            로그인하고 한 마디 남겨 주세요.
          </span>
          <span className="ml-auto shrink-0 text-[13px] font-medium text-accent">
            로그인
          </span>
        </button>
      </section>
    );
  }

  return (
    <section className="mb-8 rounded-lg border border-line bg-surface">
      <div className="flex items-start gap-3 p-4">
        <Avatar color={user.color} name={user.displayName} size={34} />

        <div className="min-w-0 flex-1">
          <div
            className={`grain overflow-hidden transition-all duration-300 ${
              styled ? `paper-${paper} rounded-md px-5 py-6` : ""
            }`}
          >
            <textarea
              ref={ref}
              value={text}
              maxLength={MAX}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => setOpen(true)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="여기에 남기고 싶은 말을 적어 주세요."
              className={`relative z-[2] w-full resize-none bg-transparent outline-none ${
                styled
                  ? "font-serif-ko min-h-[150px] text-center text-[19px] leading-[2] placeholder:opacity-50"
                  : "min-h-[46px] pt-2 text-[14.5px] leading-[1.8] text-ink placeholder:text-muted"
              }`}
              style={styled ? { color: "inherit" } : undefined}
            />
          </div>

          {expanded && (
            <div className="animate-rise mt-4">
              <div className="flex items-center gap-2">
                <span className="mr-1 text-[11px] tracking-wider text-muted">
                  편지지
                </span>
                {PAPERS.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setPaper(p.key)}
                    title={p.label}
                    aria-label={p.label}
                    className={`size-[22px] rounded-[7px] border transition active:scale-90 ${
                      paper === p.key
                        ? "border-ink ring-1 ring-ink"
                        : "border-line hover:border-muted"
                    }`}
                    style={{ background: p.swatch }}
                  />
                ))}
              </div>

              <div className="mt-4 flex items-center gap-0.5 border-t border-line-soft pt-3">
                <SmileIcon size={17} className="mr-1.5 text-muted" />
                {EMOJI.map((e) => (
                  <button
                    key={e}
                    onClick={() => setText((v) => (v + e).slice(0, MAX))}
                    className="grid size-7 place-items-center rounded-md text-[15px] transition hover:bg-surface-2 active:scale-90"
                  >
                    {e}
                  </button>
                ))}

                <span className="ml-auto mr-3 hidden text-[11px] text-muted sm:inline">
                  ⌘ + Enter
                </span>
                <span
                  className={`mr-3 text-[11.5px] tabular-nums ${
                    text.length > MAX - 30 ? "text-like" : "text-muted"
                  }`}
                >
                  {text.length}/{MAX}
                </span>

                <button
                  onClick={submit}
                  disabled={!text.trim()}
                  className="h-8 rounded-md bg-accent px-4 text-[13px] font-medium text-white transition enabled:hover:opacity-85 enabled:active:scale-95 disabled:opacity-30"
                >
                  남기기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
