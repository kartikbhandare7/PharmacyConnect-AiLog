import { useDispatch, useSelector } from 'react-redux'
import { acceptFollowup, dismissFollowup } from '../../features/interaction/interactionSlice'
import { Sparkles, Check, X, ChevronRight } from 'lucide-react'

export default function FollowupSuggestions() {
  const dispatch = useDispatch()
  const suggestions = useSelector((s) => s.interaction.form.aiSuggestedFollowups)

  if (!suggestions?.length) return null

  return (
    <div className="animate-slide-up">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded-md neural-gradient flex items-center justify-center">
          <Sparkles size={11} className="text-white" />
        </div>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI suggested follow-ups</span>
        <span className="badge-indigo ml-auto">{suggestions.length}</span>
      </div>

      <div className="space-y-2">
        {suggestions.map((s, i) => (
          <div key={i}
            className="group flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-indigo-500/5 border border-indigo-500/15 hover:border-indigo-500/35 hover:bg-indigo-500/10 transition-all duration-200"
            style={{ animationDelay: `${i * 0.06}s` }}>
            <ChevronRight size={13} className="text-indigo-500 shrink-0" />
            <span className="flex-1 text-sm text-slate-300">{s}</span>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <button onClick={() => dispatch(acceptFollowup(s))}
                className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                title="Add to follow-up actions">
                <Check size={12} />
              </button>
              <button onClick={() => dispatch(dismissFollowup(s))}
                className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/25 transition-colors"
                title="Dismiss">
                <X size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}