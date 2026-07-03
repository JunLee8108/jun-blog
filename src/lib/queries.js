import { supabase } from './supabase'
import { slugify } from './utils'

const POST_LIST_FIELDS =
  'id, title, slug, excerpt, content, format, cover_image_url, status, published_at, created_at, view_count, tags (id, name, slug)'

export async function fetchPublishedPosts(search = '') {
  let query = supabase
    .from('posts')
    .select(POST_LIST_FIELDS)
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (search.trim()) {
    query = query.or(`title.ilike.%${search.trim()}%,excerpt.ilike.%${search.trim()}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function fetchPostBySlug(slug) {
  const { data, error } = await supabase
    .from('posts')
    .select(POST_LIST_FIELDS)
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function fetchPostsByTag(tagSlug) {
  const { data, error } = await supabase
    .from('posts')
    .select(POST_LIST_FIELDS.replace('tags (', 'tags!inner ('))
    .eq('status', 'published')
    .eq('tags.slug', tagSlug)
    .order('published_at', { ascending: false })
  if (error) throw error
  return data
}

export async function fetchAllPostsForAdmin() {
  const { data, error } = await supabase
    .from('posts')
    .select(POST_LIST_FIELDS)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function fetchPostById(id) {
  const { data, error } = await supabase
    .from('posts')
    .select(POST_LIST_FIELDS)
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data
}

export function incrementViewCount(slug) {
  // 실패해도 화면에는 영향 없음 (fire-and-forget)
  supabase.rpc('increment_view_count', { post_slug: slug }).then(() => {})
}

export async function fetchComments(postId) {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function addComment({ postId, authorName, content }) {
  const { error } = await supabase
    .from('comments')
    .insert({ post_id: postId, author_name: authorName, content })
  if (error) throw error
}

export async function deleteComment(id) {
  const { error } = await supabase.from('comments').delete().eq('id', id)
  if (error) throw error
}

export async function deletePost(id) {
  const { error } = await supabase.from('posts').delete().eq('id', id)
  if (error) throw error
}

async function upsertTags(tagNames) {
  const names = [...new Set(tagNames.map((t) => t.trim()).filter(Boolean))]
  if (names.length === 0) return []

  const rows = names.map((name) => ({ name, slug: slugify(name) }))
  const { data, error } = await supabase
    .from('tags')
    .upsert(rows, { onConflict: 'name' })
    .select('id')
  if (error) throw error
  return data.map((t) => t.id)
}

async function replacePostTags(postId, tagNames) {
  const tagIds = await upsertTags(tagNames)
  const { error: deleteError } = await supabase
    .from('post_tags')
    .delete()
    .eq('post_id', postId)
  if (deleteError) throw deleteError

  if (tagIds.length > 0) {
    const { error: insertError } = await supabase
      .from('post_tags')
      .insert(tagIds.map((tagId) => ({ post_id: postId, tag_id: tagId })))
    if (insertError) throw insertError
  }
}

export async function savePost({ id, post, tagNames }) {
  const payload = { ...post, updated_at: new Date().toISOString() }
  if (post.status === 'published' && !post.published_at) {
    payload.published_at = new Date().toISOString()
  }

  let saved
  if (id) {
    const { data, error } = await supabase
      .from('posts')
      .update(payload)
      .eq('id', id)
      .select('id, slug')
      .single()
    if (error) throw error
    saved = data
  } else {
    let { data, error } = await supabase
      .from('posts')
      .insert(payload)
      .select('id, slug')
      .single()
    // slug 충돌 시 접미사를 붙여 한 번 재시도
    if (error?.code === '23505') {
      payload.slug = `${payload.slug}-${Date.now().toString(36)}`
      ;({ data, error } = await supabase
        .from('posts')
        .insert(payload)
        .select('id, slug')
        .single())
    }
    if (error) throw error
    saved = data
  }

  await replacePostTags(saved.id, tagNames)
  return saved
}

export async function uploadImage(file) {
  const ext = file.name.split('.').pop()
  const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from('blog-images').upload(path, file)
  if (error) throw error
  const { data } = supabase.storage.from('blog-images').getPublicUrl(path)
  return data.publicUrl
}
