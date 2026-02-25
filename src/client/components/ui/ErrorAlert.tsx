"use client";
import React from 'react'
import { XCircle } from 'lucide-react'

type ErrorAlertProps = {
  message?: string
}

export default function ErrorAlert({ message }: ErrorAlertProps) {
  if (!message) return null
  return (
    <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive flex items-start gap-2">
      <XCircle className="h-4 w-4 text-destructive" />
      <div>{message}</div>
    </div>
  )
}
