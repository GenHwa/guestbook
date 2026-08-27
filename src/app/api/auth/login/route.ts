import { createSession, findUserByUsername, toSessionUser, verifyPassword } from "@/lib/auth";
import { validateLogin } from "@/lib/validation";

/**
 * 아이디가 없을 때도 같은 비용의 bcrypt 비교를 한 번 수행해서
 * 응답 시간으로 계정 존재 여부가 새어 나가지 않게 한다.
 * (cost 12로 실제 해싱한 값 — 형식이 유효해야 compare가 일을 한다)
 */
const DUMMY_HASH = "$2b$12$ENDF.ysUs1de14.H5jEkceRcdQMLGsRdH572mXtKCFlLGAZW0SxNW";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const parsed = validateLogin(body as Record<string, unknown>);
  if (!parsed.ok) {
    return Response.json({ errors: parsed.errors }, { status: 422 });
  }
  const { username, password } = parsed.value;

  const user = await findUserByUsername(username);
  const ok = await verifyPassword(password, user?.password ?? DUMMY_HASH);

  // 아이디가 틀렸는지 비밀번호가 틀렸는지 구분해서 알려주지 않는다.
  if (!user || !ok) {
    return Response.json(
      { error: "아이디 또는 비밀번호가 맞지 않습니다." },
      { status: 401 },
    );
  }

  await createSession(user.userid);
  return Response.json({ user: toSessionUser(user) });
}
