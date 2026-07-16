import { useState, useRef, useEffect } from 'react'
import { createPortal } from "react-dom"
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
  const inputRef = useRef(null)
  const [dropdownStyle, setDropdownStyle] = useState({})
  const dropdownRef = useRef(null)
useEffect(() => {
  const handler = (e) => {
    const clickedInput =
      wrapRef.current?.contains(e.target)

    const clickedDropdown =
      dropdownRef.current?.contains(e.target)

    if (!clickedInput && !clickedDropdown) {
      setOpen(false)
    }
  }

  document.addEventListener("mousedown", handler)

  return () =>
    document.removeEventListener("mousedown", handler)
}, [])

  const updateDropdownPosition = () => {
  if (!inputRef.current) return

  const rect = inputRef.current.getBoundingClientRect()

  setDropdownStyle({
    position: "fixed",
    top: rect.bottom + 8,
    left: rect.left,
    width: rect.width,
    zIndex: 999999,
  })
}
useEffect(() => {
  if (!open) return

  updateDropdownPosition()

  window.addEventListener("resize", updateDropdownPosition)
  window.addEventListener("scroll", updateDropdownPosition, true)

  return () => {
    window.removeEventListener("resize", updateDropdownPosition)
    window.removeEventListener("scroll", updateDropdownPosition, true)
  }
}, [open])

const search = (q = "") => {
    setQuery(q)

    clearTimeout(debounce.current)

    debounce.current = setTimeout(async () => {
        setLoading(true)

        try {
            const { data } = await api.get(
                `/hcps/search?q=${encodeURIComponent(q)}`
            )

            setResults(data)
            setOpen(true)
        } catch {
            setResults([])
        } finally {
            setLoading(false)
        }
    }, 250)
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
    <div className="relative overflow-visible isolate" ref={wrapRef}>
      <div
          ref={inputRef}
          className="relative"
      >
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
        <input
          type="text"
          className="crm-input pl-10"
          placeholder="Search by name, specialty or hospital..."
          value={query}
          onChange={(e) => search(e.target.value)}
          onFocus={() => {
            if (!results.length) {
                search("")
            } else {
                setOpen(true)
            }
        }}
        />
        {loading && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
        {open &&
  createPortal(
    <div
      ref={dropdownRef}
      style={dropdownStyle}
      className="rounded-xl glass-card border border-navy-500 shadow-2xl max-h-72 overflow-y-auto"
    >
      {loading && (
        <div className="p-4 text-center text-slate-400">
          Loading doctors...
        </div>
      )}

      {!loading && results.length === 0 && (
        <div className="p-4 text-center text-slate-500">
          No doctors found
        </div>
      )}

      {!loading &&
        results.map((hcp) => (
          <button
            key={hcp.id}
            onClick={() => select(hcp)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-500/10 text-left border-b border-navy-700 last:border-0"
          >
            <div className="w-8 h-8 rounded-full bg-navy-600 flex items-center justify-center text-indigo-400 text-xs font-bold">
              {hcp.name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)}
            </div>

            <div className="flex-1">
              <p className="text-white text-sm">{hcp.name}</p>

              <p className="text-xs text-slate-400">
                {hcp.specialty} • {hcp.hospital}
              </p>
            </div>
          </button>
        ))}
    </div>,
    document.body
  )}
    </div>
  )
}