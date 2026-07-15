import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'
import { prefillFromAI } from '../interaction/interactionSlice'

export const sendChatMessage = createAsyncThunk(
  'chat/send',
  async (text, { dispatch, getState, rejectWithValue }) => {
    const { sessionId } = getState().chat
    try {
      const { data } = await api.post('/interactions/parse', {
        text,
        session_id: sessionId,
      })
      // Pre-fill the form with whatever was extracted
      dispatch(prefillFromAI(data))
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'AI parsing failed')
    }
  }
)

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [
      {
        id: 'welcome',
        role: 'ai',
        content: "Hi! I'm your AI assistant. Describe your HCP visit in plain words and I'll extract all the details — or just fill the form directly.",
        timestamp: new Date().toISOString(),
      },
    ],
    isLoading: false,
    sessionId: crypto.randomUUID(),
    error: null,
  },
  reducers: {
    addUserMessage(state, { payload }) {
      state.messages.push({
        id: crypto.randomUUID(),
        role: 'user',
        content: payload,
        timestamp: new Date().toISOString(),
      })
    },
    clearChat(state) {
      state.messages = state.messages.slice(0, 1)
      state.sessionId = crypto.randomUUID()
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendChatMessage.pending, (s) => { s.isLoading = true; s.error = null })
      .addCase(sendChatMessage.fulfilled, (s, a) => {
        s.isLoading = false
        const parsed = a.payload
        let content = ''
        if (parsed.clarification_needed) {
          content = parsed.clarification_question
        } else {
          const parts = []
          if (parsed.hcp_name) parts.push(`**HCP:** ${parsed.hcp_name}`)
          if (parsed.topics_discussed) parts.push(`**Topics:** ${parsed.topics_discussed}`)
          if (parsed.sentiment) parts.push(`**Sentiment:** ${parsed.sentiment} ${parsed.sentiment_confidence ? `(${Math.round(parsed.sentiment_confidence * 100)}% confidence)` : ''}`)
          if (parsed.suggested_followups?.length) parts.push(`**Follow-ups generated:** ${parsed.suggested_followups.length}`)
          content = parts.length
            ? `Got it — I've pre-filled the form:\n\n${parts.join('\n')}`
            : "I've updated the form with what I could extract. Check the fields on the left."
        }
        s.messages.push({
          id: crypto.randomUUID(),
          role: 'ai',
          content,
          timestamp: new Date().toISOString(),
          extracted: !parsed.clarification_needed,
        })
      })
      .addCase(sendChatMessage.rejected, (s, a) => {
        s.isLoading = false
        s.error = a.payload
        s.messages.push({
          id: crypto.randomUUID(),
          role: 'ai',
          content: "Sorry, I couldn't process that. Please try again or fill the form directly.",
          timestamp: new Date().toISOString(),
          isError: true,
        })
      })
  },
})

export const { addUserMessage, clearChat } = chatSlice.actions
export default chatSlice.reducer