import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

const DRAFT_KEY = 'hcp_interaction_draft'

const emptyForm = {
  hcp: null,
  interactionType: 'Meeting',
  date: new Date().toISOString().split('T')[0],
  time: new Date().toTimeString().slice(0, 5),
  attendees: '',
  topicsDiscussed: '',
  materialsShared: [],
  samplesDistributed: [],
  sentiment: null,
  sentimentConfidence: null,
  outcomes: '',
  followUpActions: '',
  aiSuggestedFollowups: [],
  aiExtractedData: null,
}

// Load draft from localStorage
const loadDraft = () => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? JSON.parse(raw) : emptyForm
  } catch { return emptyForm }
}

// Async: submit interaction
export const submitInteraction = createAsyncThunk(
  'interaction/submit',
  async (_, { getState, rejectWithValue }) => {
    const form = getState().interaction.form
    console.log("========== FORM ==========");
    console.log(form);

    console.log("========== HCP ==========");
    console.log(form.hcp);

    console.log("========== HCP ID ==========");
    console.log(form.hcp?.id);
    try {
      const payload = {
        hcp_id: form.hcp.id,
        interaction_type: form.interactionType,
        interaction_date: form.date,
        interaction_time: form.time || null,
        attendees: form.attendees,
        topics_discussed: form.topicsDiscussed,
        materials_shared: form.materialsShared.map((m) => ({ material_id: m.id })),
        samples_distributed: form.samplesDistributed.map((s) => ({ sample_id: s.id, quantity: s.quantity })),
        sentiment: form.sentiment,
        sentiment_confidence: form.sentimentConfidence,
        outcomes: form.outcomes,
        follow_up_actions: form.followUpActions,
        ai_suggested_followups: form.aiSuggestedFollowups,
        ai_extracted_data: form.aiExtractedData,
      }
      const { data } = await api.post('/interactions', payload)
      localStorage.removeItem(DRAFT_KEY)
      return data
    } catch (err) {
        const detail = err.response?.data?.detail;

        return rejectWithValue(
          Array.isArray(detail)
            ? detail.map((e) => e.msg).join(", ")
            : detail || "Submission failed"
        );
      }
  }
)

const interactionSlice = createSlice({
  name: 'interaction',
  initialState: {
    form: loadDraft(),
    status: 'idle', // idle | submitting | success | error
    error: null,
    draftSavedAt: null,
    lastSubmitted: null,
  },
  reducers: {
    setField(state, { payload: { field, value } }) {
      state.form[field] = value
    },
    setHCP(state, { payload }) {
      state.form.hcp = payload
    },
    addMaterial(state, { payload }) {
      if (!state.form.materialsShared.find((m) => m.id === payload.id))
        state.form.materialsShared.push(payload)
    },
    removeMaterial(state, { payload: id }) {
      state.form.materialsShared = state.form.materialsShared.filter((m) => m.id !== id)
    },
    addSample(state, { payload }) {
      if (!state.form.samplesDistributed.find((s) => s.id === payload.id))
        state.form.samplesDistributed.push({ ...payload, quantity: 1 })
    },
    removeSample(state, { payload: id }) {
      state.form.samplesDistributed = state.form.samplesDistributed.filter((s) => s.id !== id)
    },
    acceptFollowup(state, { payload }) {
      const current = state.form.followUpActions
      state.form.followUpActions = current ? `${current}\n${payload}` : payload
    },
    dismissFollowup(state, { payload }) {
      state.form.aiSuggestedFollowups = state.form.aiSuggestedFollowups.filter((f) => f !== payload)
    },
    // Called by chat slice when AI parses text
prefillFromAI(state, { payload }) {

  // If backend found the doctor in DB
  if (payload.hcp_id) {
    state.form.hcp = {
      id: payload.hcp_id,
      name: payload.hcp_name,
      specialty: payload.specialty,
      hospital: payload.hospital,
    };
  }

  // Otherwise keep it unselected
  else if (payload.hcp_name && !state.form.hcp) {
    state.form.hcp = null;
  }

  if (payload.interaction_type)
    state.form.interactionType = payload.interaction_type;

  if (payload.topics_discussed)
    state.form.topicsDiscussed = payload.topics_discussed;

  if (payload.sentiment)
    state.form.sentiment = payload.sentiment;

  if (payload.sentiment_confidence)
    state.form.sentimentConfidence = payload.sentiment_confidence;

  if (payload.outcomes)
    state.form.outcomes = payload.outcomes;

  if (payload.suggested_followups?.length)
    state.form.aiSuggestedFollowups = payload.suggested_followups;

  state.form.aiExtractedData = payload.raw_extraction;
},
    saveDraft(state) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(state.form))
      state.draftSavedAt = new Date().toISOString()
    },
    resetForm(state) {
      state.form = emptyForm
      state.status = 'idle'
      state.error = null
      localStorage.removeItem(DRAFT_KEY)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitInteraction.pending, (s) => { s.status = 'submitting' })
      .addCase(submitInteraction.fulfilled, (s, a) => { s.status = 'success'; s.lastSubmitted = a.payload })
      .addCase(submitInteraction.rejected, (s, a) => { s.status = 'error'; s.error = a.payload })
  },
})

export const {
  setField, setHCP, addMaterial, removeMaterial, addSample, removeSample,
  acceptFollowup, dismissFollowup, prefillFromAI, saveDraft, resetForm,
} = interactionSlice.actions
export default interactionSlice.reducer