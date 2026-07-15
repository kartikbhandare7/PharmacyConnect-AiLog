import { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Send, Bot, RefreshCw, Sparkles } from 'lucide-react'
import { sendChatMessage, addUserMessage, clearChat } from '../../features/chat/chatSlice'

function MessageBubble({ msg }) {
  const isAI = msg.role === 'ai'

  // Simple markdown bold renderer
  const renderContent = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/)
    return parts.map((p, i) =>
      p.startsWith('**') && p.endsWith('**')
        ? <strong key={i} className="text-white font-semibold">{p.slice(2, -2)}</strong>
        : p.split('\n').map((line, j) => <span key={`${i}-${j}`}>{line}{j < p.split('\n').length - 1 && <br />}</span>)
    )
  }

  return (
    <div className={`flex ${isAI ? 'items-start' : 'items-end justify-end'} gap-2.5 ${isAI ? 'animate-slide-in-left' : 'animate-slide-in-right'}`}>
      {isAI && (
        <div className="w-7 h-7 rounded-full neural-gradient flex items-center justify-center shrink-0 mt-0.5 shadow-glow-indigo">
          <Bot size={13} className="text-white" />
        </div>
      )}
      <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed
        ${isAI
          ? 'bg-navy-700 text-slate-200 rounded-tl-sm border border-navy-600'
          : 'bg-indigo-600 text-white rounded-br-sm'
        }
        ${msg.isError ? 'bg-red-500/10 border-red-500/20 text-red-400' : ''}
        ${msg.extracted ? 'border-emerald-500/25 bg-emerald-500/5' : ''}
      `}>
        {renderContent(msg.content)}
        {msg.extracted && (
          <div className="mt-2 flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
            <Sparkles size={11} />Form pre-filled
          </div>
        )}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2.5 animate-fade-in">
      <div className="w-7 h-7 rounded-full neural-gradient flex items-center justify-center shrink-0">
        <Bot size={13} className="text-white" />
      </div>
      <div className="bg-navy-700 border border-navy-600 rounded-2xl rounded-tl-sm px-4 py-3.5 flex items-center gap-1.5">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  )
}

export default function AIChatPanel() {
  const dispatch = useDispatch()
  const { messages, isLoading } = useSelector((s) => s.chat)
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const send = () => {
    const text = input.trim()
    if (!text || isLoading) return
    dispatch(addUserMessage(text))
    dispatch(sendChatMessage(text))
    setInput('')
    textareaRef.current?.focus()
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 px-5 py-4 border-b border-navy-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl neural-gradient flex items-center justify-center shadow-glow-indigo animate-glow-pulse">
                <Bot size={18} className="text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-navy-800 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">AI Assistant</p>
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                gemma2-9b-it · LangGraph
              </p>
            </div>
          </div>
          <button onClick={() => dispatch(clearChat())}
            className="btn-ghost p-2 rounded-lg" title="Clear chat">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
        {isLoading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions chips */}
      {messages.length <= 2 && (
        <div className="px-4 pb-3 flex flex-wrap gap-2 animate-fade-in">
          {[
            'Met Dr. Sharma, discussed OncoPlex, she was positive',
            'Phone call with Dr. Patel about trial enrollment',
            'Shared Phase III brochure, neutral reception',
          ].map((s) => (
            <button key={s} onClick={() => { setInput(s) }}
              className="text-xs px-3 py-1.5 rounded-full bg-navy-700 text-slate-400 border border-navy-600 hover:border-indigo-500/40 hover:text-indigo-400 hover:bg-indigo-500/5 transition-all duration-200 text-left">
              {s.length > 40 ? s.slice(0, 40) + '…' : s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 px-4 pb-4 pt-2 border-t border-navy-700">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            rows={2}
            className="crm-input flex-1 resize-none text-sm leading-relaxed"
            placeholder="Describe your visit in plain words…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            style={{ minHeight: '60px', maxHeight: '120px' }}
          />
          <button onClick={send} disabled={!input.trim() || isLoading}
            className="shrink-0 w-10 h-10 rounded-xl neural-gradient flex items-center justify-center text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-glow-indigo hover:scale-105 active:scale-95">
            <Send size={15} />
          </button>
        </div>
        <p className="text-xs text-slate-700 mt-2 text-center">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}