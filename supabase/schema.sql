-- =============================================================
-- Jun's Blog — Supabase 스키마
-- Supabase 대시보드 > SQL Editor 에서 이 파일 전체를 실행하세요.
-- =============================================================

-- 1. 테이블 -----------------------------------------------------

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text not null default '',
  format text not null default 'markdown' check (format in ('markdown', 'html')),
  excerpt text not null default '',
  cover_image_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  view_count integer not null default 0,
  like_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

create table if not exists public.post_tags (
  post_id uuid not null references public.posts (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (post_id, tag_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_name text not null check (char_length(author_name) between 1 and 30),
  content text not null check (char_length(content) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists posts_status_published_at_idx
  on public.posts (status, published_at desc);
create index if not exists comments_post_id_idx
  on public.comments (post_id, created_at);

-- 2. RLS 정책 ---------------------------------------------------

alter table public.posts enable row level security;
alter table public.tags enable row level security;
alter table public.post_tags enable row level security;
alter table public.comments enable row level security;

-- posts: 발행된 글은 누구나, 초안은 관리자(로그인 사용자)만 조회
drop policy if exists "posts_select" on public.posts;
create policy "posts_select" on public.posts
  for select using (status = 'published' or auth.uid() is not null);

drop policy if exists "posts_write" on public.posts;
create policy "posts_write" on public.posts
  for all to authenticated using (true) with check (true);

-- tags / post_tags: 조회는 누구나, 쓰기는 관리자만
drop policy if exists "tags_select" on public.tags;
create policy "tags_select" on public.tags for select using (true);

drop policy if exists "tags_write" on public.tags;
create policy "tags_write" on public.tags
  for all to authenticated using (true) with check (true);

drop policy if exists "post_tags_select" on public.post_tags;
create policy "post_tags_select" on public.post_tags for select using (true);

drop policy if exists "post_tags_write" on public.post_tags;
create policy "post_tags_write" on public.post_tags
  for all to authenticated using (true) with check (true);

-- comments: 조회/작성은 누구나, 삭제는 관리자만
drop policy if exists "comments_select" on public.comments;
create policy "comments_select" on public.comments for select using (true);

drop policy if exists "comments_insert" on public.comments;
create policy "comments_insert" on public.comments
  for insert with check (true);

drop policy if exists "comments_delete" on public.comments;
create policy "comments_delete" on public.comments
  for delete to authenticated using (true);

-- 3. 조회수 증가 함수 (익명 사용자도 호출 가능, RLS 우회) ----------

create or replace function public.increment_view_count(post_slug text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.posts
  set view_count = view_count + 1
  where slug = post_slug and status = 'published';
$$;

grant execute on function public.increment_view_count(text) to anon, authenticated;

-- 공감(마음) 토글: delta의 부호만 반영(±1)
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

-- 4. 이미지 스토리지 버킷 ----------------------------------------

insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

drop policy if exists "blog_images_read" on storage.objects;
create policy "blog_images_read" on storage.objects
  for select using (bucket_id = 'blog-images');

drop policy if exists "blog_images_write" on storage.objects;
create policy "blog_images_write" on storage.objects
  for insert to authenticated with check (bucket_id = 'blog-images');

drop policy if exists "blog_images_delete" on storage.objects;
create policy "blog_images_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'blog-images');
