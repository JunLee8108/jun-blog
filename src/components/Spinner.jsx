export default function Spinner() {
  return (
    <div className="flex justify-center py-20" role="status" aria-label="로딩 중">
      <div className="size-6 animate-spin rounded-full border-2 border-line border-t-clay" />
    </div>
  )
}

export function ErrorMessage({ message = '데이터를 불러오지 못했어요.' }) {
  return (
    <div className="rounded-xl border border-clay/30 bg-clay-soft px-5 py-4 text-sm text-clay-strong">
      {message}
      <p className="mt-1 text-xs opacity-75">
        Supabase 스키마(supabase/schema.sql)가 적용되어 있는지 확인해 주세요.
      </p>
    </div>
  )
}

export function EmptyState({ message }) {
  return <p className="py-20 text-center text-sm text-faded">{message}</p>
}
