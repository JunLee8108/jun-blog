/* 손으로 그은 듯한 구불선 */
export function Squiggle({ className = '' }) {
  return (
    <svg
      viewBox="0 0 116 10"
      fill="none"
      aria-hidden="true"
      className={className}
      preserveAspectRatio="none"
    >
      <path
        d="M2 5 Q 10 0.5 18 5 T 34 5 T 50 5 T 66 5 T 82 5 T 98 5 T 114 5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

/* 글 끝맺음 오너먼트 (✱) */
export function Ornament({ className = '' }) {
  return (
    <div className={`flex justify-center ${className}`} aria-hidden="true">
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      >
        <path d="M12 3.5v17M4.6 7.75l14.8 8.5M4.6 16.25l14.8-8.5" />
      </svg>
    </div>
  )
}
