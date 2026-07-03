-- 공감(마음) 기능: posts.like_count + 익명 토글 함수
-- Supabase 대시보드 > SQL Editor 에서 실행하세요.

alter table public.posts
  add column if not exists like_count integer not null default 0;

-- delta의 부호만 반영(±1)해서 한 번에 여러 개 올리는 조작을 방지
create or replace function public.toggle_like(post_slug text, delta integer)
returns integer
language sql
security definer
set search_path = public
as $$
  update public.posts
  set like_count = greatest(0, like_count + sign(delta)::integer)
  where slug = post_slug and status = 'published'
  returning like_count;
$$;

grant execute on function public.toggle_like(text, integer) to anon, authenticated;
