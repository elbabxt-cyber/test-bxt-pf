import { json } from "../_utils.js";

// POST /api/auth  { password }  -> 비밀번호 검증
export async function onRequestPost({ request, env }) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "잘못된 요청" }, 400);
  }
  if (!env.ADMIN_PASSWORD) {
    return json({ ok: false, error: "서버에 비밀번호가 설정되지 않음" }, 500);
  }
  if (body.password === env.ADMIN_PASSWORD) {
    return json({ ok: true });
  }
  return json({ ok: false, error: "비밀번호가 틀렸습니다" }, 401);
}
