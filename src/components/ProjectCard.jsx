export default function ProjectCard({ project, index, onOpen }) {
  return (
    <article
      className="card"
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={() => onOpen(project)}
    >
      <div className={`card-thumb${project.coverImage ? "" : " empty"}`}>
        {project.coverImage ? (
          <img src={project.coverImage} alt={project.title} loading="lazy" />
        ) : (
          <span>이미지 없음</span>
        )}
      </div>
      <div className="card-body">
        <div className="card-cat">{project.category}</div>
        <h3 className="card-title">{project.title}</h3>
        {project.summary && <p className="card-summary">{project.summary}</p>}
      </div>
    </article>
  );
}
