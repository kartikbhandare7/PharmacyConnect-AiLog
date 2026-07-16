import { useState, useEffect, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setHCP } from '../interaction/interactionSlice'
import api from '../../services/api'
import {
  Search, MapPin, Stethoscope, Building2, Phone, Mail,
  Plus, RefreshCw, ChevronRight, Users, Loader2, AlertCircle
} from 'lucide-react'

// Specialty → colour mapping for visual variety
const SPECIALTY_COLORS = {
  'Oncologist':         { bg: 'bg-purple-500/10', border: 'border-purple-500/25', text: 'text-purple-400', dot: 'bg-purple-400' },
  'Cardiologist':       { bg: 'bg-red-500/10',    border: 'border-red-500/25',    text: 'text-red-400',    dot: 'bg-red-400' },
  'Neurologist':        { bg: 'bg-blue-500/10',   border: 'border-blue-500/25',   text: 'text-blue-400',   dot: 'bg-blue-400' },
  'Endocrinologist':    { bg: 'bg-amber-500/10',  border: 'border-amber-500/25',  text: 'text-amber-400',  dot: 'bg-amber-400' },
  'Pulmonologist':      { bg: 'bg-cyan-500/10',   border: 'border-cyan-500/25',   text: 'text-cyan-400',   dot: 'bg-cyan-400' },
  'Gastroenterologist': { bg: 'bg-green-500/10',  border: 'border-green-500/25',  text: 'text-green-400',  dot: 'bg-green-400' },
  'Rheumatologist':     { bg: 'bg-pink-500/10',   border: 'border-pink-500/25',   text: 'text-pink-400',   dot: 'bg-pink-400' },
  'Nephrologist':       { bg: 'bg-indigo-500/10', border: 'border-indigo-500/25', text: 'text-indigo-400', dot: 'bg-indigo-400' },
  'Dermatologist':      { bg: 'bg-orange-500/10', border: 'border-orange-500/25', text: 'text-orange-400', dot: 'bg-orange-400' },
  'default':            { bg: 'bg-slate-500/10',  border: 'border-slate-500/25',  text: 'text-slate-400',  dot: 'bg-slate-400' },
}

function getColors(specialty) {
  return SPECIALTY_COLORS[specialty] || SPECIALTY_COLORS['default']
}

function getInitials(name = '') {
  return name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

// Avatar gradient index — cycles through a set of gradients
const GRADIENTS = [
  'from-indigo-500 to-purple-600',
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-500',
  'from-pink-500 to-rose-600',
  'from-violet-500 to-indigo-600',
  'from-cyan-500 to-blue-600',
  'from-red-500 to-pink-600',
  'from-teal-500 to-emerald-600',
  'from-orange-500 to-amber-600',
]

function HCPCard({ hcp, index, onSelect }) {
  const colors = getColors(hcp.specialty)
  const gradient = GRADIENTS[index % GRADIENTS.length]

  return (
    <div
      className="glass-card rounded-2xl p-5 flex flex-col gap-4 hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow-indigo group cursor-default"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Top row: avatar + name + specialty badge */}
      <div className="flex items-start gap-3.5">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-card`}>
          {getInitials(hcp.name)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate">{hcp.name}</h3>
          <div className={`inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-full text-xs font-medium border ${colors.bg} ${colors.border} ${colors.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
            {hcp.specialty}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Building2 size={12} className="flex-shrink-0 text-slate-600" />
          <span className="truncate">{hcp.hospital || '—'}</span>
        </div>
        {hcp.city && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <MapPin size={12} className="flex-shrink-0 text-slate-600" />
            <span>{hcp.city}</span>
            {hcp.territory && <span className="text-slate-700">· {hcp.territory}</span>}
          </div>
        )}
        {hcp.email && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Mail size={12} className="flex-shrink-0 text-slate-600" />
            <span className="truncate">{hcp.email}</span>
          </div>
        )}
        {hcp.phone && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Phone size={12} className="flex-shrink-0 text-slate-600" />
            <span>{hcp.phone}</span>
          </div>
        )}
      </div>

      {/* Action: Log interaction with this HCP */}
      <button
        onClick={() => onSelect(hcp)}
        className="mt-auto w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium
          text-indigo-400 border border-indigo-500/20 bg-indigo-500/5
          hover:bg-indigo-500/15 hover:border-indigo-500/40 hover:text-indigo-300
          transition-all duration-200 group-hover:border-indigo-500/30"
      >
        <Plus size={13} />
        Log interaction
        <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity -ml-1" />
      </button>
    </div>
  )
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="glass-card rounded-xl px-4 py-3 flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-lg font-bold text-white tabular-nums">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  )
}

export default function HCPsPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [hcps, setHcps] = useState([])
  const [filtered, setFiltered] = useState([])
  const [query, setQuery] = useState('')
  const [specialtyFilter, setSpecialtyFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load ALL hcps on mount — use empty query with high limit
  const loadHCPs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Search with a space to get all results, or use a single letter
      // that covers most names — we'll fetch with common letters
      const { data } = await api.get('/hcps/search?q=Dr&limit=20')
      // Also fetch with 'a' to catch any without "Dr" prefix
      let all = [...data]
      try {
        const { data: data2 } = await api.get('/hcps/search?q=a&limit=20')
        // Merge, deduplicate by id
        const ids = new Set(all.map(h => h.id))
        data2.forEach(h => { if (!ids.has(h.id)) { all.push(h); ids.add(h.id) } })
      } catch {}
      setHcps(all)
      setFiltered(all)
    } catch (err) {
      setError('Could not load HCPs. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadHCPs() }, [loadHCPs])

  // Filter locally whenever query or specialty changes
  useEffect(() => {
    let result = hcps
    if (specialtyFilter !== 'All') {
      result = result.filter(h => h.specialty === specialtyFilter)
    }
    if (query.trim()) {
      const q = query.toLowerCase()
      result = result.filter(h =>
        h.name?.toLowerCase().includes(q) ||
        h.specialty?.toLowerCase().includes(q) ||
        h.hospital?.toLowerCase().includes(q) ||
        h.city?.toLowerCase().includes(q)
      )
    }
    setFiltered(result)
  }, [query, specialtyFilter, hcps])

  // Unique specialties for filter pills
  const specialties = ['All', ...new Set(hcps.map(h => h.specialty).filter(Boolean))]

  // Log interaction: pre-select HCP then navigate to form
  const handleSelect = (hcp) => {
    dispatch(setHCP(hcp))
    navigate('/log-interaction')
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between animate-stagger-1">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">HCP Directory</h1>
            <p className="text-slate-500 text-sm mt-0.5">Your assigned healthcare professionals</p>
          </div>
          <button onClick={loadHCPs} disabled={loading}
            className="btn-ghost flex items-center gap-2 text-xs">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Stats row */}
        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-stagger-2">
            <StatCard label="Total HCPs" value={hcps.length}
              icon={<Users size={15} className="text-indigo-400" />}
              color="bg-indigo-500/10" />
            <StatCard label="Specialties" value={specialties.length - 1}
              icon={<Stethoscope size={15} className="text-emerald-400" />}
              color="bg-emerald-500/10" />
            <StatCard label="Showing" value={filtered.length}
              icon={<Search size={15} className="text-amber-400" />}
              color="bg-amber-500/10" />
            <StatCard label="Hospitals" value={new Set(hcps.map(h => h.hospital).filter(Boolean)).size}
              icon={<Building2 size={15} className="text-blue-400" />}
              color="bg-blue-500/10" />
          </div>
        )}

        {/* Search + filter bar */}
        <div className="space-y-3 animate-stagger-3">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
            <input
              type="text"
              className="crm-input pl-10"
              placeholder="Search by name, specialty, hospital, or city..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Specialty filter pills */}
          {specialties.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {specialties.map((s) => (
                <button key={s}
                  onClick={() => setSpecialtyFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200
                    ${specialtyFilter === s
                      ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                      : 'bg-navy-700 border-navy-600 text-slate-500 hover:border-navy-500 hover:text-slate-300'
                    }`}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
            <Loader2 size={32} className="animate-spin text-indigo-400" />
            <p className="text-slate-500 text-sm">Loading HCP directory...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-slide-up">
            <AlertCircle size={16} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-navy-700 flex items-center justify-center">
              <Users size={24} className="text-slate-600" />
            </div>
            <p className="text-slate-500 text-sm">
              {query || specialtyFilter !== 'All' ? 'No HCPs match your search' : 'No HCPs found in database'}
            </p>
            {(query || specialtyFilter !== 'All') && (
              <button onClick={() => { setQuery(''); setSpecialtyFilter('All') }}
                className="text-xs text-indigo-400 hover:text-indigo-300 underline">
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* HCP grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-stagger-4">
            {filtered.map((hcp, i) => (
              <HCPCard key={hcp.id} hcp={hcp} index={i} onSelect={handleSelect} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}