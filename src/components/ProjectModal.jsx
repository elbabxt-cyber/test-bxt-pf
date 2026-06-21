import { useEffect } from "react";

export default function ProjectModal({ project, onClose }) {
  // ESC 로 닫기 + 배경 스크롤 잠금
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!project) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        style={{ position: "relative" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="닫기">
          ×
        </button>
        {project.coverImage && (
          <div className="modal-hero">
            <img src={project.coverImage} alt={project.title} />
          </div>
        )}
        <div className="modal-content">
          <div className="cat">{project.category}</div>
          <h2>{project.title}</h2>
          {project.date && <div className="date">{project.date}</div>}
          {project.description && <p className="desc">{project.description}</p>}

          {project.images?.length > 0 && (
            <div className="modal-gallery">
              {project.images.map((src, i) => (
                <img key={i} src={src} alt={`${project.title} ${i + 1}`} />
              ))}
            </div>
          )}

          {project.links?.length > 0 && (
            <div className="modal-links">
              {project.links.map((l, i) => (
                <a
                  key={i}
                  className="btn"
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {l.label || l.url} ↗
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
