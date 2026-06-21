// 프론트엔드 ↔ Functions API 호출 모음

const PW_KEY = "admin_pw";

export function savePassword(pw) {
  sessionStorage.setItem(PW_KEY, pw);
}
export function getPassword() {
  return sessionStorage.getItem(PW_KEY) || "";
}
export function clearPassword() {
  sessionStorage.removeItem(PW_KEY);
}

function authHeaders() {
  return { "x-admin-password": getPassword() };
}

// ── 공개 ──────────────────────────────────────────────
export async function getProjects() {
  const res = await fetch("/api/projects");
  if (!res.ok) throw new Error("목록을 불러오지 못했습니다");
  return res.json();
}

// ── 인증 ──────────────────────────────────────────────
export async function login(password) {
  const res = await fetch("/api/auth", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error || "로그인 실패");
  return true;
}

export async function createProject(project) {
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: { "content-type": "application/json", ...authHeaders() },
    body: JSON.stringify(project),
  });
  if (!res.ok) throw new Error((await res.json()).error || "등록 실패");
  return res.json();
}

export async function updateProject(id, project) {
  const res = await fetch(`/api/projects/${id}`, {
    method: "PUT",
    headers: { "content-type": "application/json", ...authHeaders() },
    body: JSON.stringify(project),
  });
  if (!res.ok) throw new Error((await res.json()).error || "수정 실패");
  return res.json();
}

export async function deleteProject(id) {
  const res = await fetch(`/api/projects/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("삭제 실패");
  return res.json();
}

export async function uploadFile(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: authHeaders(),
    body: form,
  });
  if (!res.ok) throw new Error((await res.json()).error || "업로드 실패");
  return res.json(); // { url, key }
}
