-- 포트폴리오 프로젝트 테이블
CREATE TABLE IF NOT EXISTS projects (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT '기타',
  summary     TEXT DEFAULT '',
  description TEXT DEFAULT '',
  cover_image TEXT DEFAULT '',          -- 대표(썸네일) 이미지 URL
  images      TEXT DEFAULT '[]',        -- 상세 이미지 URL JSON 배열
  links       TEXT DEFAULT '[]',        -- {label,url} JSON 배열
  date        TEXT DEFAULT '',          -- 예: 2026-03
  sort_order  INTEGER DEFAULT 0,        -- 정렬용 (작을수록 먼저)
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_sort ON projects(sort_order, id);
