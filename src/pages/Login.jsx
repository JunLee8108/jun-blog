import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import usePageTitle from '../hooks/usePageTitle'

const fieldClass =
  'w-full rounded-lg border border-line bg-card px-3 py-2.5 text-sm outline-none transition-colors duration-200 focus:border-clay/60'

export default function Login() {
  usePageTitle('로그인')
  const navigate = useNavigate()
  const { session } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (session) return <Navigate to="/admin" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    setSubmitting(false)
    if (signInError) {
      setError('이메일 또는 비밀번호가 올바르지 않아요.')
      return
    }
    navigate('/admin', { replace: true })
  }

  return (
    <div className="mx-auto max-w-sm py-10">
      <h1 className="text-xl font-semibold text-ink">주인장 확인</h1>
      <p className="mt-1.5 text-sm text-faded">이 서재의 주인이신가요?</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일"
          autoComplete="email"
          required
          className={fieldClass}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          autoComplete="current-password"
          required
          className={fieldClass}
        />
        {error && <p className="text-xs text-clay-strong">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-clay py-2.5 text-sm font-medium text-[#fdf9f3] transition-colors duration-200 hover:bg-clay-strong disabled:opacity-50"
        >
          {submitting ? '확인 중…' : '들어가기'}
        </button>
      </form>
    </div>
  )
}
