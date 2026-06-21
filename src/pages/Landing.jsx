import { useEffect, useMemo, useState } from "react";
import { PROFILE, CATEGORIES } from "../config.js";
import { getProjects } from "../api.js";
import Nav from "../components/Nav.jsx";
import ProjectCard from "../components/ProjectCard.jsx";
import ProjectModal from "../components/ProjectModal.jsx";

export default function Landing() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("전체");
  const [active, setActive] = useState(null);

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // 실제로 등록된 카테고리만 필터로 노출
  const usedCategories = useMemo(() => {
    const set = new Set(projects.map((p) => p.category));
    return ["전체", ...CATEGORIES.filter((c) => set.has(c))];
  }, [projects]);

  const visible =
    filter === "전체"
      ? projects
      : projects.filter((p) => p.category === filter);

  return (
    <>
      <Nav />
      <span id="top" />

      {/* Hero */}
      <header className="hero">
        <div className="container">
          <div className="role">{PROFILE.role}</div>
          <h1>{PROFILE.name}</h1>
          <p className="tagline">{PROFILE.tagline}</p>
          <div className="cta">
            <a className="btn primary" href="#projects">
              프로젝트 보기
            </a>
            {PROFILE.contact.email && (
              <a className="btn" href={`mailto:${PROFILE.contact.email}`}>
                연락하기
              </a>
            )}
          </div>
        </div>
      </header>

      {/* About */}
      <section className="section" id="about">
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">About</div>
            <h2>소개</h2>
          </div>
          <div className="about-grid">
            <div>
              <p>{PROFILE.intro}</p>
              {PROFILE.about.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
            <div>
              <div className="skills">
                {PROFILE.skills.map((s) => (
                  <span className="skill" key={s}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="section" id="projects">
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">Work</div>
            <h2>프로젝트</h2>
          </div>

          {usedCategories.length > 1 && (
            <div className="filters">
              {usedCategories.map((c) => (
                <button
                  key={c}
                  className={`pill${filter === c ? " active" : ""}`}
                  onClick={() => setFilter(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {loading && <div className="empty-state">불러오는 중…</div>}
          {error && (
            <div className="empty-state">
              프로젝트를 불러오지 못했어요.
              <br />
              <span className="muted">
                풀스택으로 실행했는지 확인하세요 (npm run start)
              </span>
            </div>
          )}
          {!loading && !error && visible.length === 0 && (
            <div className="empty-state">
              아직 등록된 프로젝트가 없어요.
              <br />
              <span className="muted">/admin 에서 첫 프로젝트를 등록해보세요.</span>
            </div>
          )}

          {!loading && visible.length > 0 && (
            <div className="grid">
              {visible.map((p, i) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  index={i}
                  onOpen={setActive}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="footer container">
        <span>
          © {PROFILE.name} · Portfolio
        </span>
        {PROFILE.contact.email && (
          <a href={`mailto:${PROFILE.contact.email}`}>
            {PROFILE.contact.email}
          </a>
        )}
      </footer>

      {active && (
        <ProjectModal project={active} onClose={() => setActive(null)} />
      )}
    </>
  );
}
