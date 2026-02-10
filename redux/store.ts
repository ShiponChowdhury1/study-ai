import { configureStore } from '@reduxjs/toolkit'
import usersReducer from './slices/usersSlice'
import contentReducer from './slices/contentSlice'
import dashboardReducer from './slices/dashboardSlice'
import analyticsReducer from './slices/analyticsSlice'
import settingsReducer from './slices/settingsSlice'
import sidebarReducer from './slices/sidebarSlice'

export const store = configureStore({
  reducer: {
    users: usersReducer,
    content: contentReducer,
    dashboard: dashboardReducer,
    analytics: analyticsReducer,
    settings: settingsReducer,
    sidebar: sidebarReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
