"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import {
  DISPLAY_NAME_MAX,
  PASSWORD_HINT,
  USERNAME_HINT,
} from "@/lib/validation";
import { XIcon } from "./icons";

type Mode = "login" | "register";

export default function AuthDialog({
  initialMode = "login",
  onClose,
}: {
  initialMode?: Mode;
  onClose: () => void;
}) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const firstRef = useRef<HTMLInputElement>(null);
  const uid = useId();

  const isRegister = mode === "register";

  useEffect(() => {
    firstRef.current?.focus();
  }, [mode]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  function switchMode(next: Mode) {
    setMode(next);
    setErrors({});
    setFormError("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;

    setBusy(true);
    setErrors({});
    setFormError("");

    const failure = isRegister
      ? await register(username, password, displayName)
      : await login(username, password);

    setBusy(false);

    if (!failure) {
      onClose();
      return;
    }
    if (failure.errors) setErrors(failure.errors);
    if (failure.error) setFormError(failure.error);
    if (!failure.errors && !failure.error) setFormError("문제가 생겼어요. 잠시 후 다시 시도해 주세요.");
  }

  return (
    <div
      className="fixed inset-0 z-[60] overflow-y-auto bg-ink/45 p-5 pt-[10vh] backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${uid}-title`}
        className="animate-rise mx-auto w-full max-w-[380px] rounded-lg border border-line bg-surface p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-start justify-between">
          <h2 id={`${uid}-title`} className="font-serif-ko text-[20px] font-bold text-ink">
            {isRegister ? "처음 오셨군요" : "다시 오셨네요"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="-mr-2 -mt-1 grid size-8 place-items-center rounded-md text-muted transition hover:bg-surface-2 hover:text-ink active:scale-90"
          >
            <XIcon size={18} />
          </button>
        </div>
        <p className="mb-6 text-[13px] leading-[1.7] text-muted">
          {isRegister
            ? "이름과 아이디만 있으면 됩니다."
            : "아이디와 비밀번호를 넣어 주세요."}
        </p>

        <form onSubmit={submit} className="space-y-4" noValidate>
          {isRegister && (
            <Field
              id={`${uid}-name`}
              label="이름"
              hint={`카드에 보이는 이름 · ${DISPLAY_NAME_MAX}자 이내`}
              error={errors.displayName}
            >
              <input
                ref={firstRef}
                id={`${uid}-name`}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={DISPLAY_NAME_MAX}
                autoComplete="nickname"
                placeholder="김서연"
                className={inputCls(errors.displayName)}
              />
            </Field>
          )}

          <Field
            id={`${uid}-username`}
            label="아이디"
            hint={isRegister ? USERNAME_HINT : undefined}
            error={errors.username}
          >
            <input
              ref={isRegister ? undefined : firstRef}
              id={`${uid}-username`}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="seoyeon_k"
              className={inputCls(errors.username)}
            />
          </Field>

          <Field
            id={`${uid}-password`}
            label="비밀번호"
            hint={isRegister ? PASSWORD_HINT : undefined}
            error={errors.password}
          >
            <input
              id={`${uid}-password`}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isRegister ? "new-password" : "current-password"}
              placeholder="••••••••"
              className={inputCls(errors.password)}
            />
          </Field>

          {formError && (
            <p role="alert" className="text-[12.5px] leading-[1.6] text-like">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="h-10 w-full rounded-md bg-accent text-[13.5px] font-medium text-white transition enabled:hover:opacity-85 enabled:active:scale-[0.98] disabled:opacity-40"
          >
            {busy ? "잠시만요…" : isRegister ? "가입하고 시작하기" : "들어가기"}
          </button>
        </form>

        <div className="mt-5 border-t border-line-soft pt-4 text-center text-[12.5px] text-muted">
          {isRegister ? "이미 계정이 있으신가요?" : "아직 계정이 없으신가요?"}
          <button
            type="button"
            onClick={() => switchMode(isRegister ? "login" : "register")}
            className="ml-1.5 font-medium text-accent transition hover:opacity-75"
          >
            {isRegister ? "로그인" : "가입하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

function inputCls(error?: string) {
  return `h-10 w-full rounded-md border bg-bg px-3 text-[14px] text-ink placeholder:text-muted outline-none transition ${
    error ? "border-like/60 focus:border-like" : "border-line focus:border-accent/60"
  }`;
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-baseline gap-2">
        <span className="text-[12.5px] font-medium text-ink-soft">{label}</span>
        {hint && !error && <span className="text-[11px] text-muted">{hint}</span>}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1.5 text-[11.5px] leading-[1.5] text-like">
          {error}
        </p>
      )}
    </div>
  );
}
