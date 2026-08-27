"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AuthUser = {
  userid: number;
  username: string;
  displayName: string;
  color: string;
  bio: string;
  isOwner: boolean;
};

/** 서버가 필드별 오류를 주면 errors, 한 줄 오류면 error */
export type AuthError = { error?: string; errors?: Record<string, string> };

type AuthContextValue = {
  user: AuthUser | null;
  /** 첫 /api/auth/me 응답 전까지 true */
  loading: boolean;
  login: (username: string, password: string) => Promise<AuthError | null>;
  register: (
    username: string,
    password: string,
    displayName: string,
  ) => Promise<AuthError | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function post(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  /* 새로고침해도 쿠키로 세션을 복구한다 */
  useEffect(() => {
    let alive = true;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => alive && setUser(d.user ?? null))
      .catch(() => alive && setUser(null))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const { ok, data } = await post("/api/auth/login", { username, password });
    if (!ok) return data as AuthError;
    setUser(data.user);
    return null;
  }, []);

  const register = useCallback(
    async (username: string, password: string, displayName: string) => {
      const { ok, data } = await post("/api/auth/register", {
        username,
        password,
        displayName,
      });
      if (!ok) return data as AuthError;
      setUser(data.user);
      return null;
    },
    [],
  );

  const logout = useCallback(async () => {
    await post("/api/auth/logout", {});
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth 는 <AuthProvider> 안에서만 쓸 수 있습니다.");
  return ctx;
}
