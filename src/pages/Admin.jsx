import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CATEGORIES } from "../config.js";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  uploadFile,
  login,
  savePassword,
  getPassword,
  clearPassword,
} from "../api.js";

const EMPTY = {
  title: "",
  category: CATEGORIES[0],
  date: "",
  summary: "",
  description: "",
  coverImage: "",
  images: [],
  links: [],
  sortOrder: 0,
};

export default function Admin() {
  const [authed, setAuthed] = useState(false);

  if (!authed) return <Login onSuccess={() => setAuthed(true)} />;
  return <Dashboard onLogout={() => setAuthed(false)} />;
}

/* ── 로그인 ───────────────────────────────── */
function Login({ onSuccess }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  // 이미 비밀번호가 세션에 있으면 자동 통과 시도
  useEffect(() => {
    if (getPassword()) onSuccess();
  }, [onSuccess]);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await login(pw);
      savePassword(pw);
      onSuccess();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-login">
      <h2>Admin</h2>
      <p className="muted">포트폴리오 관리자 로그인</p>
      <form onSubmit={submit} style={{ marginTop: 20 }}>
        <div className="field">
          <input
            type="password"
            placeholder="비밀번호"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoFocus
          />
        </div>
        <button className="btn primary" style={{ width: "100%" }} disabled={busy}>
          {busy ? "확인 중…" : "로그인"}
        </button>
        {err && <div className="error">{err}</div>}
      </form>
      <p style={{ marginTop: 24 }}>
        <Link className="muted" to="/">
          ← 사이트로 돌아가기
        </Link>
      </p>
    </div>
  );
}

/* ── 대시보드 ─────────────────────────────── */
function Dashboard({ onLogout }) {
  const [projects, setProjects] = useState([]);
  const [editing, setEditing] = useState(null); // null=목록, 객체=편집중
  const [toast, setToast] = useState("");

  function flash(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  }

  async function load() {
    setProjects(await getProjects());
  }
  useEffect(() => {
    load();
  }, []);

  function logout() {
    clearPassword();
    onLogout();
  }

  async function remove(p) {
    if (!confirm(`"${p.title}" 을(를) 삭제할까요?`)) return;
    await deleteProject(p.id);
    flash("삭제했습니다");
    load();
  }

  if (editing !== null) {
    return (
      <Editor
        initial={editing}
        onCancel={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          flash("저장했습니다");
          load();
        }}
      />
    );
  }

  return (
    <div className="admin">
      <div className="admin-bar">
        <h2 style={{ margin: 0 }}>프로젝트 관리</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <Link className="btn-sm" to="/">
            사이트 보기
          </Link>
          <button className="btn-sm" onClick={logout}>
            로그아웃
          </button>
          <button className="btn primary" onClick={() => setEditing(EMPTY)}>
            + 새 프로젝트
          </button>
        </div>
      </div>

      {projects.length === 0 && (
        <p className="muted">아직 프로젝트가 없습니다. 새로 등록해보세요.</p>
      )}

      <div className="admin-list">
        {projects.map((p) => (
          <div className="admin-item" key={p.id}>
            {p.coverImage ? (
              <img className="thumb" src={p.coverImage} alt="" />
            ) : (
              <div className="thumb" />
            )}
            <div className="meta">
              <div className="t">{p.title}</div>
              <div className="c">
                {p.category}
                {p.date ? ` · ${p.date}` : ""}
              </div>
            </div>
            <div className="actions">
              <button className="btn-sm" onClick={() => setEditing(p)}>
                수정
              </button>
              <button className="btn-sm danger" onClick={() => remove(p)}>
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

/* ── 편집기 ───────────────────────────────── */
function Editor({ initial, onCancel, onSaved }) {
  const [f, setF] = useState({ ...EMPTY, ...initial });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const isNew = !initial.id;

  const set = (k, v) => setF((prev) => ({ ...prev, [k]: v }));

  async function uploadCover(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { url } = await uploadFile(file);
      set("coverImage", url);
    } catch (e) {
      setErr(e.message);
    }
    e.target.value = "";
  }

  async function uploadGallery(e) {
    const files = Array.from(e.target.files || []);
    try {
      const uploaded = [];
      for (const file of files) {
        const { url } = await uploadFile(file);
        uploaded.push(url);
      }
      set("images", [...f.images, ...uploaded]);
    } catch (e) {
      setErr(e.message);
    }
    e.target.value = "";
  }

  function addLink() {
    set("links", [...f.links, { label: "", url: "" }]);
  }
  function setLink(i, key, val) {
    const next = f.links.map((l, idx) =>
      idx === i ? { ...l, [key]: val } : l
    );
    set("links", next);
  }

  async function save(e) {
    e.preventDefault();
    if (!f.title.trim()) {
      setErr("제목을 입력하세요");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const payload = {
        ...f,
        links: f.links.filter((l) => l.url),
        sortOrder: Number(f.sortOrder) || 0,
      };
      if (isNew) await createProject(payload);
      else await updateProject(initial.id, payload);
      onSaved();
    } catch (e) {
      setErr(e.message);
      setBusy(false);
    }
  }

  return (
    <div className="admin">
      <div className="admin-bar">
        <h2 style={{ margin: 0 }}>{isNew ? "새 프로젝트" : "프로젝트 수정"}</h2>
        <button className="btn-sm" onClick={onCancel}>
          ← 목록
        </button>
      </div>

      <form onSubmit={save}>
        <div className="field">
          <label>제목 *</label>
          <input
            value={f.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="예: ○○ 카페 브랜딩"
          />
        </div>

        <div className="row2">
          <div className="field">
            <label>카테고리</label>
            <select
              value={f.category}
              onChange={(e) => set("category", e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>날짜</label>
            <input
              value={f.date}
              onChange={(e) => set("date", e.target.value)}
              placeholder="2026-03"
            />
          </div>
        </div>

        <div className="field">
          <label>한 줄 요약</label>
          <input
            value={f.summary}
            onChange={(e) => set("summary", e.target.value)}
            placeholder="카드에 표시될 짧은 설명"
          />
        </div>

        <div className="field">
          <label>상세 설명</label>
          <textarea
            value={f.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="프로젝트 상세 내용"
          />
        </div>

        <div className="field">
          <label>대표 이미지 (썸네일)</label>
          <div className="uploader">
            <input type="file" accept="image/*" onChange={uploadCover} />
            {f.coverImage && (
              <img
                src={f.coverImage}
                alt=""
                style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8 }}
              />
            )}
          </div>
        </div>

        <div className="field">
          <label>상세 이미지 (여러 장)</label>
          <input type="file" accept="image/*" multiple onChange={uploadGallery} />
          {f.images.length > 0 && (
            <div className="thumb-preview">
              {f.images.map((src, i) => (
                <div className="pv" key={i}>
                  <img src={src} alt="" />
                  <button
                    type="button"
                    className="x"
                    onClick={() =>
                      set(
                        "images",
                        f.images.filter((_, idx) => idx !== i)
                      )
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="field">
          <label>링크</label>
          {f.links.map((l, i) => (
            <div className="row2" key={i} style={{ marginBottom: 8 }}>
              <input
                placeholder="라벨 (예: 인스타그램)"
                value={l.label}
                onChange={(e) => setLink(i, "label", e.target.value)}
              />
              <input
                placeholder="https://..."
                value={l.url}
                onChange={(e) => setLink(i, "url", e.target.value)}
              />
            </div>
          ))}
          <button type="button" className="btn-sm" onClick={addLink}>
            + 링크 추가
          </button>
        </div>

        <div className="field" style={{ maxWidth: 200 }}>
          <label>정렬 순서 (작을수록 먼저)</label>
          <input
            type="number"
            value={f.sortOrder}
            onChange={(e) => set("sortOrder", e.target.value)}
          />
        </div>

        {err && <div className="error">{err}</div>}

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button className="btn primary" disabled={busy}>
            {busy ? "저장 중…" : "저장"}
          </button>
          <button type="button" className="btn" onClick={onCancel}>
            취소
          </button>
        </div>
      </form>
    </div>
  );
}
