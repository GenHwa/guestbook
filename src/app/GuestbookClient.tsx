"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useTheme } from "@/lib/useTheme";
import Header from "@/components/Header";
import Masthead from "@/components/Masthead";
import FilterTabs, { type SortKey } from "@/components/FilterTabs";
import Composer from "@/components/Composer";
import MessageCard from "@/components/MessageCard";
import RightSidebar from "@/components/RightSidebar";
import BottomNav from "@/components/BottomNav";
import AuthDialog from "@/components/AuthDialog";
import { ArrowUpIcon, XIcon } from "@/components/icons";
import { type Message, type Paper } from "@/lib/data";
import {
  createGuestbookComment,
  createGuestbookMessage,
  deleteGuestbookMessage,
  updateGuestbookMessage,
} from "@/app/actions";

export default function GuestbookClient({
  initialMessages,
}: {
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [theme, toggleTheme] = useTheme();
  const [sort, setSort] = useState<SortKey>("recent");
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setModalOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [modalOpen]);

  const addMessage = useCallback((formData: FormData) => {
    setError("");
    startTransition(async () => {
      try {
        const message = await createGuestbookMessage(formData);
        setMessages((prev) => [message, ...prev]);
        setModalOpen(false);
        setSort("recent");
        setQuery("");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err) {
        setError(err instanceof Error ? err.message : "글을 저장하지 못했어요.");
      }
    });
  }, []);

  const editMessage = useCallback((id: string, text: string, paper: Paper) => {
    setError("");
    startTransition(async () => {
      try {
        const message = await updateGuestbookMessage(id, { text, paper });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === id ? { ...message, comments: m.comments } : m
          )
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "글을 수정하지 못했어요.");
      }
    });
  }, []);

  const removeMessage = useCallback((id: string) => {
    setError("");
    startTransition(async () => {
      try {
        await deleteGuestbookMessage(id);
        setMessages((prev) => prev.filter((m) => m.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : "글을 삭제하지 못했어요.");
      }
    });
  }, []);

  const toggleLike = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, liked: !m.liked, likes: m.likes + (m.liked ? -1 : 1) }
          : m
      )
    );
  }, []);

  const toggleSave = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, saved: !m.saved } : m))
    );
  }, []);

  const addComment = useCallback((id: string, text: string) => {
    setError("");
    startTransition(async () => {
      try {
        const comment = await createGuestbookComment(id, { text });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === id
              ? {
                  ...m,
                  comments: [...m.comments, comment],
                }
              : m
          )
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "댓글을 저장하지 못했어요.");
      }
    });
  }, []);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = messages;

    if (q) {
      list = list.filter(
        (m) =>
          m.text.toLowerCase().includes(q) ||
          m.author.toLowerCase().includes(q) ||
          m.handle.toLowerCase().includes(q)
      );
    }
    if (sort === "popular") list = [...list].sort((a, b) => b.likes - a.likes);
    if (sort === "paper") list = list.filter((m) => m.paper !== "plain");

    return list;
  }, [messages, query, sort]);

  return (
    <div className="min-h-dvh bg-bg">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onCompose={() => setModalOpen(true)}
        query={query}
        onQuery={setQuery}
        onLogin={() => setAuthOpen(true)}
      />

      <div className="mx-auto flex max-w-[940px] gap-14 px-5 pb-24 lg:pb-16">
        <main className="w-full min-w-0 max-w-[560px]">
          <Masthead count={messages.length} />
          {error && (
            <p className="mb-4 rounded-md border border-like/30 bg-like/10 px-4 py-3 text-[13px] text-like">
              {error}
            </p>
          )}
          <Composer onSubmit={addMessage} pending={isPending} />
          <FilterTabs value={sort} onChange={setSort} />

          {shown.length === 0 ? (
            <p className="py-20 text-center text-[13.5px] text-muted">
              {query ? `‘${query}’에 대한 글이 없어요.` : "아직 글이 없어요."}
            </p>
          ) : (
            shown.map((m) => (
              <MessageCard
                key={m.id}
                message={m}
                onToggleLike={toggleLike}
                onToggleSave={toggleSave}
                onComment={addComment}
                onUpdate={editMessage}
                onDelete={removeMessage}
                pending={isPending}
              />
            ))
          )}

          {shown.length > 0 && (
            <p className="py-10 text-center text-[12.5px] text-muted">
              여기까지입니다. 읽어 주셔서 고맙습니다.
            </p>
          )}
        </main>

        <RightSidebar messages={messages} />
      </div>

      <BottomNav onCompose={() => setModalOpen(true)} />

      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="맨 위로"
          className="animate-rise fixed bottom-[68px] right-5 z-30 grid size-10 place-items-center rounded-full border border-line bg-surface text-ink-soft shadow-sm transition hover:text-ink active:scale-90 lg:bottom-8"
        >
          <ArrowUpIcon size={17} />
        </button>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-ink/45 p-5 pt-[12vh] backdrop-blur-[2px]"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="animate-rise mx-auto w-full max-w-[560px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-serif-ko text-[15px] font-bold text-bg">
                한 마디 남기기
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                aria-label="닫기"
                className="grid size-8 place-items-center rounded-md text-bg/70 transition hover:bg-white/10 active:scale-90"
              >
                <XIcon size={18} />
              </button>
            </div>
            <Composer
              autoFocus
              onSubmit={addMessage}
              onClose={() => setModalOpen(false)}
              pending={isPending}
            />
          </div>
        </div>
      )}

      {authOpen && <AuthDialog onClose={() => setAuthOpen(false)} />}
    </div>
  );
}
