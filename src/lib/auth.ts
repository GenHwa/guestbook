import "server-only";

import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { query } from "./db";

export const SESSION_COOKIE = "gb_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 14; // 14일
const BCRYPT_ROUNDS = 12;

/** DB의 users 한 행에서 비밀번호를 뺀 형태 */
export type SessionUser = {
  userid: number;
  username: string;
  displayName: string;
  color: string;
  bio: string;
  isOwner: boolean;
};

type UserRow = {
  userid: number;
  username: string;
  display_name: string;
  color: string;
  bio: string;
  is_owner: number;
  password?: string;
};

function toSessionUser(row: UserRow): SessionUser {
  return {
    userid: row.userid,
    username: row.username,
    displayName: row.display_name,
    color: row.color,
    bio: row.bio,
    isOwner: Boolean(row.is_owner),
  };
}

/* ── 비밀번호 ─────────────────────────────────────────────── */

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/* ── JWT ──────────────────────────────────────────────────── */

function secretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("환경변수 SESSION_SECRET 가 없습니다 (.env.local 확인)");
  return new TextEncoder().encode(secret);
}

async function signSession(userid: number): Promise<string> {
  return new SignJWT({ sub: String(userid) })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey());
}

/* ── 세션 쿠키 ────────────────────────────────────────────── */

/** 로그인 성공 후 httpOnly 쿠키를 굽는다. Route Handler에서만 호출 가능. */
export async function createSession(userid: number): Promise<void> {
  const token = await signSession(userid);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

/**
 * 쿠키를 검증하고 DB에서 현재 사용자를 읽어온다.
 * 토큰이 없거나·만료됐거나·탈퇴한 사용자면 null.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  let userid: number;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    userid = Number(payload.sub);
    if (!Number.isInteger(userid)) return null;
  } catch {
    return null; // 서명 불일치 / 만료
  }

  const rows = await query<UserRow>(
    "SELECT userid, username, display_name, color, bio, is_owner FROM users WHERE userid = ?",
    [userid],
  );
  return rows[0] ? toSessionUser(rows[0]) : null;
}

/* ── 조회 헬퍼 ────────────────────────────────────────────── */

export async function findUserByUsername(
  username: string,
): Promise<(UserRow & { password: string }) | null> {
  const rows = await query<UserRow & { password: string }>(
    "SELECT userid, username, display_name, color, bio, is_owner, password FROM users WHERE username = ?",
    [username],
  );
  return rows[0] ?? null;
}

export { toSessionUser };
