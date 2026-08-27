import { createSession, hashPassword, toSessionUser } from "@/lib/auth";
import { execute, query } from "@/lib/db";
import { pickColor, validateRegister } from "@/lib/validation";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const parsed = validateRegister(body as Record<string, unknown>);
  if (!parsed.ok) {
    return Response.json({ errors: parsed.errors }, { status: 422 });
  }
  const { username, password, displayName } = parsed.value;

  const taken = await query<{ userid: number }>(
    "SELECT userid FROM users WHERE username = ?",
    [username],
  );
  if (taken.length) {
    return Response.json(
      { errors: { username: "이미 쓰이고 있는 아이디입니다." } },
      { status: 409 },
    );
  }

  const result = await execute(
    "INSERT INTO users (username, display_name, color, password) VALUES (?, ?, ?, ?)",
    [username, displayName, pickColor(username), await hashPassword(password)],
  );

  const rows = await query<{
    userid: number;
    username: string;
    display_name: string;
    color: string;
    bio: string;
    is_owner: number;
  }>(
    "SELECT userid, username, display_name, color, bio, is_owner FROM users WHERE userid = ?",
    [result.insertId],
  );

  await createSession(result.insertId);
  return Response.json({ user: toSessionUser(rows[0]) }, { status: 201 });
}
