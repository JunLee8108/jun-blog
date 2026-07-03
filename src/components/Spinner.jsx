export default function Spinner() {
  return (
    <div className="flex justify-center py-20" role="status" aria-label="로딩 중">
      <div className="size-6 animate-spin rounded-full border-2 border-neutral-200 border-t-indigo-600 dark:border-neutral-700 dark:border-t-indigo-400" />
    </div>
  )
}

export function ErrorMessage({ message = '데이터를 불러오지 못했습니다.' }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
      {message}
      <p className="mt-1 text-xs text-red-500 dark:text-red-500/80">
        Supabase 스키마(supabase/schema.sql)가 적용되어 있는지 확인해 주세요.
      </p>
    </div>
  )
}

export function EmptyState({ message }) {
  return (
    <p className="py-20 text-center text-sm text-neutral-400 dark:text-neutral-500">
      {message}
    </p>
  )
}
