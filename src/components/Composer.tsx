"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Avatar from "./Avatar";
import { ImageIcon, SmileIcon, XIcon } from "./icons";
import { CURRENT_USER, PAPERS, type Paper } from "@/lib/data";

const MAX = 300;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const EMOJI = ["☺️", "🌿", "☕", "✍️", "🌙", "🍀"];

type Props = {
  onSubmit: (formData: FormData) => void;
  autoFocus?: boolean;
  onClose?: () => void;
  pending?: boolean;
};

export default function Composer({ onSubmit, autoFocus, onClose, pending }: Props) {
  const [text, setText] = useState("");
  const [paper, setPaper] = useState<Paper>("plain");
  const [image, setImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState("");
  const [open, setOpen] = useState(Boolean(autoFocus));
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const expanded = open || text.length > 0 || Boolean(image);
  const styled = paper !== "plain";
  const imagePreview = useMemo(
    () => (image ? URL.createObjectURL(image) : ""),
    [image]
  );

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(styled ? 150 : 46, el.scrollHeight)}px`;
  }, [text, styled, expanded]);

  useEffect(() => {
    if (!imagePreview) return;
    return () => URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  function submit() {
    const value = text.trim();
    if (!value || pending) return;
    const formData = new FormData();
    formData.set("text", value);
    formData.set("paper", paper);
    if (image) formData.set("image", image);
    onSubmit(formData);
    setText("");
    setPaper("plain");
    setImage(null);
    setImageError("");
    if (fileRef.current) fileRef.current.value = "";
    setOpen(false);
    onClose?.();
  }

  function selectImage(file: File | undefined) {
    setImageError("");

    if (!file) {
      setImage(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setImageError("이미지 파일만 선택해 주세요.");
      setImage(null);
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setImageError("이미지는 5MB 이하로 선택해 주세요.");
      setImage(null);
      return;
    }

    setImage(file);
    setOpen(true);
  }

  function clearImage() {
    setImage(null);
    setImageError("");
    if (fileRef.current) fileRef.current.value = "";
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
              {imagePreview && (
                <div className="mb-4 overflow-hidden rounded-md border border-line">
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="첨부 이미지 미리보기"
                      className="max-h-[260px] w-full object-cover"
                    />
                    <button
                      onClick={clearImage}
                      aria-label="이미지 제거"
                      className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-ink/70 text-white transition hover:bg-ink"
                    >
                      <XIcon size={16} />
                    </button>
                  </div>
                </div>
              )}
              {imageError && (
                <p className="mb-3 text-[12.5px] text-like">{imageError}</p>
              )}
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
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => selectImage(e.target.files?.[0])}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  aria-label="이미지 업로드"
                  title="이미지 업로드"
                  className="grid size-7 place-items-center rounded-md text-muted transition hover:bg-surface-2 hover:text-ink active:scale-90"
                >
                  <ImageIcon size={17} />
                </button>
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
                  disabled={!text.trim() || pending}
                  className="h-8 rounded-md bg-accent px-4 text-[13px] font-medium text-white transition enabled:hover:opacity-85 enabled:active:scale-95 disabled:opacity-30"
                >
                  {pending ? "저장 중" : "남기기"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
