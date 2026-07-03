-- 리치 에디터 도입: 본문 저장 포맷 구분 컬럼
-- Supabase 대시보드 > SQL Editor 에서 실행하세요.
-- 기존 글은 'markdown'으로 유지되고, 리치 에디터로 저장하는 글은 'html'이 됩니다.

alter table public.posts
  add column if not exists format text not null default 'markdown'
  check (format in ('markdown', 'html'));
