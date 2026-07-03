# Jun's Blog

일상과 개발 이야기를 기록하는 개인 블로그. React + Supabase 기반.

## 기술 스택

- **프론트엔드**: React 19, Vite, React Router 7
- **스타일**: Tailwind CSS v4 (+ typography 플러그인), Pretendard 폰트, 다크모드
- **백엔드**: Supabase (PostgreSQL, Auth, Storage)
- **콘텐츠**: Markdown (react-markdown + GFM + 코드 하이라이팅)
- **데이터**: TanStack Query

## 처음 설정하기 (최초 1회)

### 1. Supabase 스키마 적용

[Supabase 대시보드](https://supabase.com/dashboard) → 프로젝트 선택 → **SQL Editor** 에서
[`supabase/schema.sql`](./supabase/schema.sql) 파일 내용 전체를 붙여넣고 **Run** 하세요.

테이블(posts, tags, post_tags, comments), RLS 정책, 조회수 함수, 이미지 버킷이 한 번에 생성됩니다.

### 2. 관리자 계정 만들기

대시보드 → **Authentication** → **Users** → **Add user** → **Create new user** 에서
본인이 사용할 이메일/비밀번호로 계정을 하나 만드세요.
(회원가입 기능은 없고, 이 계정으로만 `/login` 에서 로그인해 글을 씁니다.)

### 3. 환경 변수

```bash
cp .env.example .env
```

`.env.example` 에 이미 프로젝트 값이 들어 있어 복사만 하면 됩니다.
(publishable key는 브라우저에 노출되도록 설계된 공개 키입니다. `service_role` 키는 절대 넣지 마세요.)

## 실행

```bash
npm install
npm run dev
```

## 페이지 구조

| 경로 | 설명 |
|---|---|
| `/` | 글 목록 + 검색 |
| `/posts/:slug` | 글 상세 (목차, 조회수, 댓글) |
| `/tags/:slug` | 태그별 글 목록 |
| `/about` | 소개 |
| `/login` | 관리자 로그인 (푸터의 "관리자" 링크) |
| `/admin` | 글 관리 대시보드 |
| `/admin/write`, `/admin/edit/:id` | 마크다운 에디터 (미리보기, 이미지 업로드, 임시저장/발행) |

## 배포 시 참고

- SPA이므로 모든 경로를 `index.html` 로 리라이트해야 합니다 (Vercel/Netlify는 자동 또는 설정 한 줄).
- 배포 플랫폼 환경 변수에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` 를 등록하세요.
