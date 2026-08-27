/** 서버·클라이언트가 같은 규칙을 쓰도록 여기 한 곳에만 둔다. */

export const USERNAME_RE = /^[a-z0-9][a-z0-9._]{2,19}$/;
export const USERNAME_HINT = "영문 소문자·숫자·. _ 3~20자";
export const PASSWORD_MIN = 8;
export const PASSWORD_HINT = `${PASSWORD_MIN}자 이상`;
export const DISPLAY_NAME_MAX = 20;

/** 아바타 색 (data.ts의 COLORS와 같은 팔레트) */
const PALETTE = [
  "#a9705a", // clay
  "#64907f", // celadon
  "#6a7889", // slate
  "#9d6f7c", // plum
  "#7b8a67", // moss
  "#ab9268", // sand
  "#4d4945", // ink
  "#b07f76", // rose
];

/** 아이디로부터 항상 같은 색을 뽑는다 (가입 시 자동 배정) */
export function pickColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export type Fields = {
  username?: unknown;
  password?: unknown;
  displayName?: unknown;
};

export type Clean = {
  username: string;
  password: string;
  displayName: string;
};

/** 회원가입 입력 검증. 문제가 있으면 필드별 메시지를 돌려준다. */
export function validateRegister(
  input: Fields,
): { ok: true; value: Clean } | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  const username = String(input.username ?? "").trim().toLowerCase();
  const password = String(input.password ?? "");
  const displayName = String(input.displayName ?? "").trim();

  if (!USERNAME_RE.test(username)) errors.username = `아이디는 ${USERNAME_HINT}여야 합니다.`;
  if (password.length < PASSWORD_MIN) errors.password = `비밀번호는 ${PASSWORD_HINT}이어야 합니다.`;
  if (!displayName) errors.displayName = "이름을 입력해 주세요.";
  else if (displayName.length > DISPLAY_NAME_MAX)
    errors.displayName = `이름은 ${DISPLAY_NAME_MAX}자 이내여야 합니다.`;

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { username, password, displayName } };
}

/** 로그인 입력 검증. 형식만 보고, 존재 여부는 서버가 판단한다. */
export function validateLogin(
  input: Fields,
): { ok: true; value: Omit<Clean, "displayName"> } | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  const username = String(input.username ?? "").trim().toLowerCase();
  const password = String(input.password ?? "");

  if (!username) errors.username = "아이디를 입력해 주세요.";
  if (!password) errors.password = "비밀번호를 입력해 주세요.";

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { username, password } };
}
