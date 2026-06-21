// 라우트가 아닌 공용 헬퍼 (파일명이 _ 로 시작하면 라우팅되지 않음)

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

// admin 쓰기 요청 인증: x-admin-password 헤더와 환경변수 비교
export function requireAuth(request, env) {
  const pw = request.headers.get("x-admin-password") || "";
  if (!env.ADMIN_PASSWORD || pw !== env.ADMIN_PASSWORD) {
    return json({ error: "인증 실패" }, 401);
  }
  return null; // 통과
}

// DB row -> 클라이언트용 객체 (JSON 필드 파싱)
export function rowToProject(row) {
  const safe = (v, fallback) => {
    try {
      return JSON.parse(v);
    } catch {
      return fallback;
    }
  };
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    summary: row.summary,
    description: row.description,
    coverImage: row.cover_image,
    images: safe(row.images, []),
    links: safe(row.links, []),
    date: row.date,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}
