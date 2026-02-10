import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface SidebarState {
  isOpen: boolean
  isMobileOpen: boolean
  activeItem: string
}

const initialState: SidebarState = {
  isOpen: true,
  isMobileOpen: false,
  activeItem: 'dashboard',
}

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isOpen = !state.isOpen
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload
    },
    toggleMobileSidebar: (state) => {
      state.isMobileOpen = !state.isMobileOpen
    },
    setMobileSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isMobileOpen = action.payload
    },
    setActiveItem: (state, action: PayloadAction<string>) => {
      state.activeItem = action.payload
    },
  },
})

export const { 
  toggleSidebar, 
  setSidebarOpen, 
  toggleMobileSidebar, 
  setMobileSidebarOpen, 
  setActiveItem 
} = sidebarSlice.actions
export default sidebarSlice.reducer
