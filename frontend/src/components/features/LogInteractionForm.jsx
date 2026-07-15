import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  setField, saveDraft, submitInteraction, resetForm, addMaterial, removeMaterial, addSample, removeSample,
} from '../../features/interaction/interactionSlice'
import HCPSearch from '../features/HCPSearch'
import SentimentSelector from "../features/SentimentSelector";
import FollowupSuggestions from '../features/FollowupSuggestions'
import { Calendar, Clock, Users, FileText, Package, Target, CheckSquare, ChevronDown, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

const INTERACTION_TYPES = ['Meeting', 'Phone call', 'Email', 'Conference', 'Remote detail']

function SectionHeader({ icon, title }) {
  return (
    <div className="flex items-center gap-2.5 mb-4 mt-2">
      <div className="w-6 h-6 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-400">
        {icon}
      </div>
      <span className="section-label mb-0">{title}</span>
      <div className="flex-1 h-px bg-navy-600" />
    </div>
  )
}

export default function LogInteractionForm() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { form, status, error, draftSavedAt } = useSelector((s) => s.interaction)
  const draftTimer = useRef(null)

  // Auto-save draft every 30 seconds
  useEffect(() => {
    draftTimer.current = setInterval(() => dispatch(saveDraft()), 30_000)
    return () => clearInterval(draftTimer.current)
  }, [dispatch])

  // Redirect on success
  useEffect(() => {
    if (status === 'success') {
      setTimeout(() => { dispatch(resetForm()); navigate('/log-interaction') }, 2000)
    }
  }, [status, dispatch, navigate])

  const field = (name) => ({
    value: form[name],
    onChange: (e) => dispatch(setField({ field: name, value: e.target.value })),
  })

  const canSubmit = form.hcp && form.interactionType && form.date && form.topicsDiscussed && form.sentiment

  // Status overlay
  if (status === 'success') return (
    <div className="flex flex-col items-center justify-center h-full gap-5 animate-scale-in">
      <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center">
        <CheckCircle size={40} className="text-emerald-400" />
      </div>
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white mb-1">Interaction Logged</h3>
        <p className="text-slate-500 text-sm">Record saved and compliance check passed</p>
      </div>
    </div>
  )

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6 max-w-2xl mx-auto">

        {/* Page header */}
        <div className="animate-stagger-1">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-xl font-bold text-white tracking-tight">Log HCP Interaction</h1>
            <div className="flex items-center gap-2">
              {draftSavedAt && (
                <span className="text-xs text-slate-600 flex items-center gap-1">
                  <CheckSquare size={11} className="text-emerald-600" />
                  Draft saved
                </span>
              )}
              <span className="badge-indigo">AI-Assisted</span>
            </div>
          </div>
          <p className="text-slate-500 text-sm">Fill the form or use the chat panel →</p>
        </div>

        {/* HCP */}
        <div className="animate-stagger-2">
          <SectionHeader icon={<Users size={13} />} title="Healthcare Professional" />
          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-medium">HCP Name *</label>
            <HCPSearch />
          </div>
        </div>

        {/* Interaction details */}
        <div className="animate-stagger-3">
          <SectionHeader icon={<FileText size={13} />} title="Interaction Details" />
          <div className="space-y-4">
            {/* Type */}
            <div>
              <label className="text-xs text-slate-500 font-medium block mb-1.5">Interaction type *</label>
              <div className="relative">
                <select className="crm-input appearance-none pr-10" {...field('interactionType')}>
                  {INTERACTION_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
                <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>

            {/* Date + Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 font-medium mb-1.5 flex items-center gap-1">
                  <Calendar size={11} /> Date *
                </label>
                <input type="date" className="crm-input" {...field('date')} />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-medium mb-1.5 flex items-center gap-1">
                  <Clock size={11} /> Time
                </label>
                <input type="time" className="crm-input" {...field('time')} />
              </div>
            </div>

            {/* Attendees */}
            <div>
              <label className="text-xs text-slate-500 font-medium mb-1.5 flex items-center gap-1">
                <Users size={11} /> Attendees
              </label>
              <input type="text" className="crm-input" placeholder="Names of additional attendees..." {...field('attendees')} />
            </div>

            {/* Topics */}
            <div>
              <label className="text-xs text-slate-500 font-medium block mb-1.5">Topics discussed *</label>
              <textarea className="crm-input resize-none" rows={4}
                placeholder="Key discussion points, products covered, clinical questions raised..."
                value={form.topicsDiscussed}
                onChange={(e) => dispatch(setField({ field: 'topicsDiscussed', value: e.target.value }))} />
            </div>
          </div>
        </div>

        {/* Materials */}
        <div className="animate-stagger-4">
          <SectionHeader icon={<Package size={13} />} title="Materials & Samples" />
          <div className="space-y-4">
            {/* Materials */}
            <div>
              <label className="text-xs text-slate-500 font-medium block mb-2">Materials shared</label>
              {form.materialsShared.length === 0 ? (
                <p className="text-xs text-slate-700 italic px-1">No materials added</p>
              ) : (
                <div className="space-y-1.5 mb-2">
                  {form.materialsShared.map((m) => (
                    <div key={m.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-navy-700 border border-navy-600 group">
                      <FileText size={13} className="text-indigo-400 shrink-0" />
                      <span className="text-sm text-slate-300 flex-1">{m.name}</span>
                      <button onClick={() => dispatch(removeMaterial(m.id))}
                        className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all">
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Samples */}
            <div>
              <label className="text-xs text-slate-500 font-medium block mb-2">Samples distributed</label>
              {form.samplesDistributed.length === 0 ? (
                <p className="text-xs text-slate-700 italic px-1">No samples distributed</p>
              ) : (
                <div className="space-y-1.5">
                  {form.samplesDistributed.map((s) => (
                    <div key={s.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-navy-700 border border-navy-600 group">
                      <Package size={13} className="text-emerald-400 shrink-0" />
                      <span className="text-sm text-slate-300 flex-1">{s.product_name} — {s.dosage}</span>
                      <span className="text-xs text-slate-600 tabular-nums">×{s.quantity}</span>
                      <button onClick={() => dispatch(removeSample(s.id))}
                        className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all">
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sentiment */}
        <div className="animate-stagger-5">
          <SectionHeader icon={<Target size={13} />} title="HCP Sentiment" />
          <SentimentSelector />
        </div>

        {/* Outcomes */}
        <div className="animate-fade-in">
          <SectionHeader icon={<CheckSquare size={13} />} title="Outcomes & Follow-ups" />
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-500 font-medium block mb-1.5">Outcomes</label>
              <textarea className="crm-input resize-none" rows={3}
                placeholder="Key outcomes, agreements, commitments made..."
                value={form.outcomes}
                onChange={(e) => dispatch(setField({ field: 'outcomes', value: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-slate-500 font-medium block mb-1.5">Follow-up actions</label>
              <textarea className="crm-input resize-none" rows={3}
                placeholder="Next steps and tasks..."
                value={form.followUpActions}
                onChange={(e) => dispatch(setField({ field: 'followUpActions', value: e.target.value }))} />
            </div>
            <FollowupSuggestions />
          </div>
        </div>

        {/* Error */}
        {status === 'error' && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-slide-up">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        {/* Required fields reminder */}
        {!canSubmit && (
          <div className="text-xs text-slate-700 px-1">
            * Required: HCP, type, date, topics, sentiment
          </div>
        )}

        {/* Submit row */}
        <div className="flex items-center gap-3 pb-6">
          <button
            onClick={() => dispatch(submitInteraction())}
            disabled={!canSubmit || status === 'submitting'}
            className="btn-primary flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none">
            {status === 'submitting'
              ? <><Loader2 size={15} className="animate-spin" /> Submitting...</>
              : <>Submit interaction</>
            }
          </button>
          <button onClick={() => dispatch(saveDraft())} className="btn-ghost">
            Save draft
          </button>
          <button onClick={() => dispatch(resetForm())} className="btn-ghost text-red-500/60 hover:text-red-400 hover:bg-red-500/10 ml-auto">
            Discard
          </button>
        </div>

      </div>
    </div>
  )
}