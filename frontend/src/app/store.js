import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import interactionReducer from '../features/interaction/interactionSlice'
import chatReducer from '../features/chat/chatSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    interaction: interactionReducer,
    chat: chatReducer,
  },
})