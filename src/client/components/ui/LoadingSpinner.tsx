"use client";
import React from 'react'

type LoadingSpinnerProps = {
  size?: number
}

export default function LoadingSpinner({ size = 20 }: LoadingSpinnerProps) {
  const s = size
  return (
    <svg
      className="animate-spin text-muted-foreground"
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
