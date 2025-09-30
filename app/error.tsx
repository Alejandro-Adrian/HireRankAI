"use client"

import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[v0] Application error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-950 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Something went wrong</h2>

          <p className="text-slate-600 dark:text-slate-300 mb-6">
            We encountered an error while loading the application. This might be due to a temporary issue.
          </p>

          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Try again
            </button>

            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              Reload page
            </button>
          </div>

          {error.message && (
            <details className="mt-6 text-left">
              <summary className="text-sm text-slate-500 dark:text-slate-400 cursor-pointer">Error details</summary>
              <pre className="mt-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 p-3 rounded overflow-auto">
                {error.message}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  )
}
