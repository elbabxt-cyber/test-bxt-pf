# 변가윤 포트폴리오

Cloudflare Pages + D1 + R2 기반 포트폴리오 사이트. 백엔드를 최소화하고, `/admin`에서 프로젝트를 등록·관리한다.

## 스택
- **프론트엔드**: React + Vite (반응형, 필터/모달 인터랙션)
- **API**: Cloudflare Pages Functions (`functions/api/*`)
- **데이터**: Cloudflare D1 (프로젝트 메타데이터)
- **이미지/영상**: Cloudflare R2 (원본 파일)
- **인증**: admin 비밀번호 (`ADMIN_PASSWORD`)

## 구조
```
src/
  config.js          자기소개·카테고리 (여기만 고치면 됨)
  pages/Landing.jsx  랜딩: Hero · 소개 · 프로젝트 그리드/필터/모달
  pages/Admin.jsx    관리자: 로그인 · 등록/수정/삭제
  components/         Nav · ProjectCard · ProjectModal
functions/api/
  projects.js        GET(목록)/POST(등록)
  projects/[id].js   PUT(수정)/DELETE(삭제)
  upload.js          R2 이미지 업로드
  media/[[path]].js  R2 이미지 서빙
  auth.js            비밀번호 검증
schema.sql           D1 테이블 정의
wrangler.toml        D1·R2 바인딩
```

## 로컬 실행
```bash
npm install
npm run db:local      # 로컬 D1 스키마 적용 (최초 1회)
npm run start         # http://localhost:8788
```
- 사이트: http://localhost:8788
- 관리자: http://localhost:8788/admin
- 로컬 비밀번호는 `.dev.vars`의 `ADMIN_PASSWORD` (저장소에 커밋되지 않음)

## 배포 (Cloudflare)
```bash
wrangler d1 create portfolio-db          # 출력된 database_id 를 wrangler.toml 에 반영
wrangler r2 bucket create portfolio-media
wrangler d1 execute DB --remote --file=./schema.sql
wrangler pages secret put ADMIN_PASSWORD # 운영용 비밀번호 설정
```
이후 Cloudflare Pages에 GitHub 저장소를 연결하면 push 시 자동 배포된다.
