"use client";

import { useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import { SmileIcon } from "./icons";
import { CURRENT_USER, PAPERS, type Paper } from "@/lib/data";

const MAX = 300;
const EMOJI = ["☺️", "🌿", "☕", "✍️", "🌙", "🍀"];

type Props = {
  onSubmit: (text: string, paper: Paper) => void;
  autoFocus?: boolean;
  onClose?: () => void;
};

export default function Composer({ onSubmit, autoFocus, onClose }: Props) {
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

  return (
    <section className="mb-8 rounded-lg border border-line bg-surface">
      <div className="flex items-start gap-3 p-4">
        <Avatar color={CURRENT_USER.color} name={CURRENT_USER.name} size={34} />

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
