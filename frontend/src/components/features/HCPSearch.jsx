import { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Search, X, User, MapPin } from 'lucide-react'
import { setHCP } from '../../features/interaction/interactionSlice'
import api from '../../services/api'

export default function HCPSearch() {
  const dispatch = useDispatch()
  const selected = useSelector((s) => s.interaction.form.hcp)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounce = useRef(null)
  const wrapRef = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (!wrapRef.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const search = (q) => {
    setQuery(q)
    if (q.length < 2) { setResults([]); setOpen(false); return }
    clearTimeout(debounce.current)
    debounce.current = setTimeout(async () => {
      setLoading(true)
      try {
        const { data } = await api.get(`/hcps/search?q=${encodeURIComponent(q)}`)
        setResults(data)
        setOpen(true)
      } catch { setResults([]) }
      finally { setLoading(false) }
    }, 300)
  }

  const select = (hcp) => {
    dispatch(setHCP(hcp))
    setQuery('')
    setOpen(false)
    setResults([])
  }

  const clear = () => dispatch(setHCP(null))

  if (selected) return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/25 animate-scale-in group">
      <div className="w-9 h-9 rounded-full neural-gradient flex items-center justify-center text-white text-xs font-bold shrink-0">
        {selected.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{selected.name}</p>
        <p className="text-xs text-slate-500 truncate">{selected.specialty} · {selected.hospital}</p>
      </div>
      <button onClick={clear} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-slate-300 transition-all duration-200 p-1 rounded-lg hover:bg-navy-600">
        <X size={14} />
      </button>
    </div>
  )

  return (
    <div className="relative" ref={wrapRef}>
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
        <input
          type="text"
          className="crm-input pl-10"
          placeholder="Search by name, specialty or hospital..."
          value={query}
          onChange={(e) => search(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
        />
        {loading && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 rounded-xl glass-card border border-navy-500 shadow-glass overflow-hidden animate-slide-up">
          {results.map((hcp, i) => (
            <button key={hcp.id} onClick={() => select(hcp)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-500/10 transition-colors duration-150 text-left border-b border-navy-700 last:border-0"
              style={{ animationDelay: `${i * 0.04}s` }}>
              <div className="w-8 h-8 rounded-full bg-navy-600 flex items-center justify-center text-indigo-400 text-xs font-bold shrink-0">
                {hcp.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{hcp.name}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                  <MapPin size={10} /> {hcp.specialty} · {hcp.hospital}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}