import { json, requireAuth, rowToProject } from "../../_utils.js";

// PUT /api/projects/:id  -> 수정 (인증 필요)
export async function onRequestPut({ request, env, params }) {
  const denied = requireAuth(request, env);
  if (denied) return denied;

  const id = Number(params.id);
  let b = {};
  try {
    b = await request.json();
  } catch {
    return json({ error: "잘못된 요청" }, 400);
  }

  const { results } = await env.DB.prepare(
    `UPDATE projects
       SET title = ?, category = ?, summary = ?, description = ?,
           cover_image = ?, images = ?, links = ?, date = ?, sort_order = ?
     WHERE id = ?
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
      Number.isFinite(b.sortOrder) ? b.sortOrder : 0,
      id
    )
    .all();

  if (!results.length) return json({ error: "없는 프로젝트" }, 404);
  return json(rowToProject(results[0]));
}

// DELETE /api/projects/:id  -> 삭제 (인증 필요)
export async function onRequestDelete({ request, env, params }) {
  const denied = requireAuth(request, env);
  if (denied) return denied;

  const id = Number(params.id);
  await env.DB.prepare("DELETE FROM projects WHERE id = ?").bind(id).run();
  return json({ ok: true });
}
