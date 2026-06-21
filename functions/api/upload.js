import { json, requireAuth } from "../_utils.js";

// POST /api/upload  (multipart/form-data, field: file)  -> R2 저장 후 URL 반환
export async function onRequestPost({ request, env }) {
  const denied = requireAuth(request, env);
  if (denied) return denied;

  const form = await request.formData();
  const file = form.get("file");
  if (!file || typeof file === "string") {
    return json({ error: "파일이 없습니다" }, 400);
  }

  // 안전한 키 생성: projects/<시간>-<랜덤>.<확장자>
  const ext = (file.name?.split(".").pop() || "bin").toLowerCase();
  const key = `projects/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  await env.MEDIA.put(key, file.stream(), {
    httpMetadata: { contentType: file.type || "application/octet-stream" },
  });

  // 이미지는 /api/media/<key> 로 서빙된다
  return json({ url: `/api/media/${key}`, key });
}
