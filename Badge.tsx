import type { ReactNode } from 'react'

export type BadgeTone = 'neutral' | 'brand' | 'warn' | 'danger'

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-canvas text-muted ring-line',
  brand: 'bg-brand-50 text-brand-800 ring-brand-200',
  warn: 'bg-warn-bg text-warn ring-warn/20',
  danger: 'bg-danger-bg text-danger ring-danger/20',
}

export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${TONES[tone]}`}
    >
      {children}
    </span>
  )
}
