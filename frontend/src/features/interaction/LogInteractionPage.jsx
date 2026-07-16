import LogInteractionForm from '../../components/features/LogInteractionForm'
import AIChatPanel from '../../components/features/AIChatPanel'

export default function LogInteractionPage() {
  return (
    <div className="flex h-full overflow-visible ">
      {/* Left: scrollable form panel */}
      <div className="flex-1 overflow-visible border-r border-navy-700">
        <LogInteractionForm />
      </div>

      {/* Right: fixed AI chat panel */}
      <div className="w-80 shrink-0 flex flex-col bg-navy-900/50">
        <AIChatPanel />
      </div>
    </div>
  )
}