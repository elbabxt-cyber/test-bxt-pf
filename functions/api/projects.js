import { json, requireAuth, rowToProject } from "../_utils.js";

// GET /api/projects  -> 전체 목록 (공개)
export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    "SELECT * FROM projects ORDER BY sort_order ASC, id DESC"
  ).all();
  return json(results.map(rowToProject));
}

// POST /api/projects  -> 새 프로젝트 등록 (인증 필요)
export async function onRequestPost({ request, env }) {
  const denied = requireAuth(request, env);
  if (denied) return denied;

  let b = {};
  try {
    b = await request.json();
  } catch {
    return json({ error: "잘못된 요청" }, 400);
  }
  if (!b.title) return json({ error: "제목은 필수입니다" }, 400);

  const { results } = await env.DB.prepare(
    `INSERT INTO projects (title, category, summary, description, cover_image, images, links, date, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     RETURNING *`
  )
    .bind(
      b.title,
      b.category || "기타",
      b.summary || "",
      b.description || "",
      b.coverImage || "",
      JSON.stringify(b.images || []),
      JSON.stringify(b.links || []),
      b.date || "",
      Number.isFinite(b.sortOrder) ? b.sortOrder : 0
    )
    .all();

  return json(rowToProject(results[0]), 201);
}
