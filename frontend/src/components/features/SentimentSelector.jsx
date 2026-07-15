import { useDispatch, useSelector } from 'react-redux'
import { setField } from '../../features/interaction/interactionSlice'

const options = [
  {
    value: 'positive',
    emoji: '😊',
    label: 'Positive',
    color: 'emerald',
    active: 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400',
    idle: 'border-navy-500 text-slate-500 hover:border-emerald-500/30 hover:text-emerald-400',
  },
  {
    value: 'neutral',
    emoji: '😐',
    label: 'Neutral',
    color: 'amber',
    active: 'bg-amber-500/15 border-amber-500/50 text-amber-400',
    idle: 'border-navy-500 text-slate-500 hover:border-amber-500/30 hover:text-amber-400',
  },
  {
    value: 'negative',
    emoji: '😞',
    label: 'Negative',
    color: 'red',
    active: 'bg-red-500/15 border-red-500/50 text-red-400',
    idle: 'border-navy-500 text-slate-500 hover:border-red-500/30 hover:text-red-400',
  },
]

export default function SentimentSelector() {
  const dispatch = useDispatch()
  const { sentiment, sentimentConfidence } = useSelector((s) => s.interaction.form)

  return (
    <div>
      <div className="flex gap-3">
        {options.map((opt) => {
          const isActive = sentiment === opt.value
          return (
            <button key={opt.value}
              onClick={() => dispatch(setField({ field: 'sentiment', value: opt.value }))}
              className={`flex-1 flex flex-col items-center gap-2 py-3.5 rounded-xl border-2 transition-all duration-200 font-medium text-sm
                ${isActive ? opt.active + ' scale-105' : opt.idle}
              `}>
              <span className="text-2xl leading-none">{opt.emoji}</span>
              <span className="text-xs">{opt.label}</span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-current animate-pulse" />
              )}
            </button>
          )
        })}
      </div>

      {sentiment && sentimentConfidence && (
        <div className="mt-3 flex items-center gap-2 animate-slide-up">
          <div className="flex-1 h-1.5 bg-navy-700 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${Math.round(sentimentConfidence * 100)}%`,
                background: sentiment === 'positive' ? '#10B981' : sentiment === 'negative' ? '#EF4444' : '#F59E0B',
              }} />
          </div>
          <span className="text-xs text-slate-500 tabular-nums">
            AI confidence: {Math.round(sentimentConfidence * 100)}%
          </span>
        </div>
      )}
    </div>
  )
}