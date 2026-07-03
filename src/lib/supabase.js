import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY 환경 변수가 필요합니다. .env.example 을 .env 로 복사하세요.',
  )
}

export const supabase = createClient(supabaseUrl, supabaseKey)
