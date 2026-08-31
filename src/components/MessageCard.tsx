"use client";

import Image from "next/image";
import { useState } from "react";
import Avatar from "./Avatar";
import {
  BookmarkIcon,
  CommentIcon,
  HeartIcon,
  LinkIcon,
  MoreIcon,
  PenIcon,
  SmileIcon,
  XIcon,
} from "./icons";
import { formatCount, PAPERS, type Message, type Paper } from "@/lib/data";

type Props = {
  message: Message;
  onToggleLike: (id: string) => void;
  onToggleSave: (id: string) => void;
  onComment: (id: string, text: string) => void;
  onUpdate: (id: string, text: string, paper: Paper) => void;
  onDelete: (id: string) => void;
  pending?: boolean;
};

export default function MessageCard({
  message: m,
  onToggleLike,
  onToggleSave,
  onComment,
  onUpdate,
  onDelete,
  pending,
}: Props) {
  const [burst, setBurst] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [draft, setDraft] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(m.text);
  const [editPaper, setEditPaper] = useState<Paper>(m.paper);

  const styled = m.paper !== "plain";
  const editStyled = editPaper !== "plain";
  const visible = showAll ? m.comments : m.comments.slice(0, 2);

  function doubleTap() {
    if (!m.liked) onToggleLike(m.id);
    setBurst(true);
    window.setTimeout(() => setBurst(false), 850);
  }

  function sendComment() {
    const v = draft.trim();
    if (!v) return;
    onComment(m.id, v);
    setDraft("");
    setShowAll(true);
  }

  function beginEdit() {
    setEditText(m.text);
    setEditPaper(m.paper);
    setEditing(true);
    setMenuOpen(false);
  }

  function cancelEdit() {
    setEditing(false);
    setEditText(m.text);
    setEditPaper(m.paper);
  }

  function saveEdit() {
    const value = editText.trim();
    if (!value || pending) return;
    onUpdate(m.id, value, editPaper);
    setEditing(false);
  }

  function deleteThisMessage() {
    setMenuOpen(false);
    if (window.confirm("이 글을 삭제할까요?")) {
      onDelete(m.id);
    }
  }

  return (
    <article className="animate-rise mb-6 overflow-hidden rounded-lg border border-line bg-surface">
      {/* 머리말 */}
      <div className="flex items-start gap-3 px-5 pb-4 pt-4">
        <Avatar color={m.color} name={m.author} size={38} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[14px] font-semibold text-ink">
              {m.author}
            </span>
            {m.verified && (
              <span className="shrink-0 rounded-[4px] border border-accent/40 px-1.5 py-px text-[10px] font-medium text-accent">
                주인장
              </span>
            )}
          </div>
          <div className="mt-0.5 truncate text-[12px] text-muted">
            @{m.handle} · {m.time}
          </div>
        </div>
        <span className="mt-1 shrink-0 text-[11px] tabular-nums tracking-wider text-muted/70">
          No.{m.no}
        </span>
        {m.canEdit && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="더보기"
              className="-mr-2 grid size-7 shrink-0 place-items-center rounded-md text-muted transition hover:bg-surface-2 hover:text-ink active:scale-90"
            >
              <MoreIcon size={16} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 z-10 w-24 overflow-hidden rounded-md border border-line bg-surface py-1 text-[12.5px] shadow-sm">
                <button
                  onClick={beginEdit}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-ink-soft transition hover:bg-surface-2 hover:text-ink"
                >
                  <PenIcon size={14} />
                  수정
                </button>
                <button
                  onClick={deleteThisMessage}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-like transition hover:bg-like/10"
                >
                  <XIcon size={14} />
                  삭제
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 본문 */}
      {editing ? (
        <div className="border-t border-line-soft px-5 pb-5">
          <div
            className={`grain mt-1 overflow-hidden transition-all ${
              editStyled ? `paper-${editPaper} rounded-md px-5 py-6` : ""
            }`}
          >
            <textarea
              value={editText}
              maxLength={300}
              onChange={(e) => setEditText(e.target.value)}
              className={`relative z-[2] w-full resize-none bg-transparent outline-none ${
                editStyled
                  ? "font-serif-ko min-h-[180px] text-center text-[19px] leading-[2] placeholder:opacity-50"
                  : "min-h-[130px] text-[14.5px] leading-[1.8] text-ink placeholder:text-muted"
              }`}
              style={editStyled ? { color: "inherit" } : undefined}
            />
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="mr-1 text-[11px] tracking-wider text-muted">
              편지지
            </span>
            {PAPERS.map((p) => (
              <button
                key={p.key}
                onClick={() => setEditPaper(p.key)}
                title={p.label}
                aria-label={p.label}
                className={`size-[22px] rounded-[7px] border transition active:scale-90 ${
                  editPaper === p.key
                    ? "border-ink ring-1 ring-ink"
                    : "border-line hover:border-muted"
                }`}
                style={{ background: p.swatch }}
              />
            ))}
            <span className="ml-auto mr-3 text-[11.5px] tabular-nums text-muted">
              {editText.length}/300
            </span>
            <button
              onClick={cancelEdit}
              className="h-8 rounded-md px-3 text-[12.5px] text-muted transition hover:bg-surface-2 hover:text-ink"
            >
              취소
            </button>
            <button
              onClick={saveEdit}
              disabled={!editText.trim() || pending}
              className="h-8 rounded-md bg-accent px-4 text-[12.5px] font-medium text-white transition enabled:hover:opacity-85 enabled:active:scale-95 disabled:opacity-30"
            >
              저장
            </button>
          </div>
        </div>
      ) : styled ? (
        <div
          onDoubleClick={doubleTap}
          className={`grain relative grid min-h-[240px] cursor-pointer place-items-center px-10 py-14 paper-${m.paper}`}
        >
          <p className="font-serif-ko relative z-[2] max-w-[30ch] whitespace-pre-wrap text-center text-[19px] leading-[2.05] sm:text-[20px]">
            {m.text}
          </p>
          {m.imageUrl && (
            <Image
              src={m.imageUrl}
              alt=""
              width={840}
              height={640}
              className="relative z-[2] mt-6 max-h-[320px] w-full max-w-[420px] rounded-md object-cover"
            />
          )}
          {burst && (
            <HeartIcon
              filled
              size={96}
              className="animate-burst pointer-events-none absolute z-[3] text-white/85"
            />
          )}
        </div>
      ) : (
        <div
          onDoubleClick={doubleTap}
          className="relative cursor-pointer px-5 pb-5"
        >
          <p className="font-serif-ko whitespace-pre-wrap text-[15.5px] leading-[1.95] text-ink">
            {m.text}
          </p>
          {m.imageUrl && (
            <Image
              src={m.imageUrl}
              alt=""
              width={840}
              height={640}
              className="mt-4 max-h-[360px] w-full rounded-md object-cover"
            />
          )}
          {burst && (
            <HeartIcon
              filled
              size={80}
              className="animate-burst pointer-events-none absolute inset-0 m-auto text-like/70"
            />
          )}
        </div>
      )}

      {/* 반응 */}
      <div className="flex items-center gap-1 border-t border-line-soft px-3 py-2">
        <Action
          onClick={() => onToggleLike(m.id)}
          label="공감"
          active={m.liked}
          activeClass="text-like"
        >
          <HeartIcon
            size={17}
            filled={m.liked}
            className={m.liked ? "animate-pop" : ""}
          />
          <span className="tabular-nums">{formatCount(m.likes)}</span>
        </Action>

        <Action label="댓글">
          <CommentIcon size={17} />
          <span className="tabular-nums">{m.comments.length}</span>
        </Action>

        <Action label="링크 복사">
          <LinkIcon size={17} />
        </Action>

        <Action
          onClick={() => onToggleSave(m.id)}
          label="보관"
          active={m.saved}
          activeClass="text-accent"
          className="ml-auto"
        >
          <BookmarkIcon
            size={17}
            filled={m.saved}
            className={m.saved ? "animate-pop" : ""}
          />
        </Action>
      </div>

      {/* 댓글 */}
      <div className="border-t border-line-soft bg-surface-2/40">
          {m.comments.length > 2 && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full px-5 pt-3 text-left text-[12.5px] text-muted transition hover:text-ink"
            >
              댓글 {m.comments.length}개 모두 보기
            </button>
          )}

          {visible.length > 0 && (
            <ul className="space-y-3 px-5 py-3.5">
              {visible.map((c) => (
                <li key={c.id} className="flex items-start gap-2.5">
                  <Avatar color={c.color} name={c.author} size={22} className="mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] leading-[1.65] text-ink">
                      <span className="font-semibold">{c.author}</span>
                      <span className="ml-1.5 text-ink-soft">{c.text}</span>
                    </p>
                    <span className="text-[11px] text-muted">{c.time}</span>
                  </div>
                  <button
                    aria-label="댓글 공감"
                    className="mt-1 shrink-0 text-muted transition hover:text-like active:scale-90"
                  >
                    <HeartIcon size={11} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center gap-2 border-t border-line-soft px-5 py-2.5">
            <SmileIcon size={17} className="shrink-0 text-muted" />
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendComment()}
              placeholder="댓글 남기기…"
              className="min-w-0 flex-1 bg-transparent text-[13px] text-ink placeholder:text-muted outline-none"
            />
            <button
              onClick={sendComment}
              disabled={!draft.trim()}
              className="shrink-0 text-[12.5px] font-medium text-accent transition enabled:hover:opacity-75 enabled:active:scale-95 disabled:opacity-30"
            >
              등록
            </button>
          </div>
      </div>
    </article>
  );
}

function Action({
  children,
  label,
  onClick,
  active,
  activeClass = "",
  className = "",
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
  activeClass?: string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[12.5px] transition hover:bg-surface-2 active:scale-95 ${
        active ? activeClass : "text-muted"
      } ${className}`}
    >
      {children}
    </button>
  );
}
