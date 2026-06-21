import { PROFILE } from "../config.js";

export default function Nav() {
  return (
    <nav className="nav">
      <div className="container nav-inner">
        <a href="#top" className="nav-logo">
          {PROFILE.name}
        </a>
        <div className="nav-links">
          <a href="#about">소개</a>
          <a href="#projects">프로젝트</a>
          {PROFILE.contact.email && (
            <a href={`mailto:${PROFILE.contact.email}`}>연락</a>
          )}
        </div>
      </div>
    </nav>
  );
}
