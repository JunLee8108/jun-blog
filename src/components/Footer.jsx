import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function Footer() {
  const { session } = useAuth()

  return (
    <footer className="border-t border-neutral-200/70 dark:border-neutral-800/70">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-8 text-xs text-neutral-400 sm:px-6 dark:text-neutral-500">
        <p>© {new Date().getFullYear()} Jun. All rights reserved.</p>
        {session ? (
          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            className="transition-colors hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            로그아웃
          </button>
        ) : (
          <Link
            to="/login"
            className="transition-colors hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            관리자
          </Link>
        )}
      </div>
    </footer>
  )
}
