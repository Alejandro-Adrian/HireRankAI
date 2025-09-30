export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-950 flex items-center justify-center">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
        <span className="text-emerald-600 dark:text-emerald-400 font-medium">Loading HireRankerAI...</span>
      </div>
    </div>
  )
}
