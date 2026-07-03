import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function Footer() {
  const { session } = useAuth()

  return (
    <footer className="border-t border-dashed border-line">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <p className="text-sm text-faded">
          오늘도 읽어주셔서 고마워요 —{' '}
          <span className="font-medium text-ink">Jun</span>
        </p>
        <div className="mt-4 flex items-center justify-between text-xs text-faded/70">
          <p>© {new Date().getFullYear()} Jun</p>
          {session ? (
            <button
              type="button"
              onClick={() => supabase.auth.signOut()}
              className="transition-colors duration-200 hover:text-clay"
            >
              로그아웃
            </button>
          ) : (
            <Link
              to="/login"
              className="transition-colors duration-200 hover:text-clay"
            >
              관리자
            </Link>
          )}
        </div>
      </div>
    </footer>
  )
}
