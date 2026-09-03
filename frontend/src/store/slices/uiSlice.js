// store/slices/uiSlice.js
import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: true,
    mobileMenuOpen: false,
    modal: null,           // { type, data }
    toast: null,           // { message, type }
    builderTab: 0,
    adminTab: 'overview',
    atsTab: 'score',
    darkMode: true,
    searchQuery: '',
    filterPlan: 'all',
  },
  reducers: {
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    toggleMobileMenu: (state) => { state.mobileMenuOpen = !state.mobileMenuOpen; },
    closeMobileMenu: (state) => { state.mobileMenuOpen = false; },
    openModal: (state, action) => { state.modal = action.payload; },
    closeModal: (state) => { state.modal = null; },
    showToast: (state, action) => { state.toast = action.payload; },
    hideToast: (state) => { state.toast = null; },
    setBuilderTab: (state, action) => { state.builderTab = action.payload; },
    setAdminTab: (state, action) => { state.adminTab = action.payload; },
    setAtsTab: (state, action) => { state.atsTab = action.payload; },
    setSearchQuery: (state, action) => { state.searchQuery = action.payload; },
    setFilterPlan: (state, action) => { state.filterPlan = action.payload; },
  },
});

export const {
  toggleSidebar, toggleMobileMenu, closeMobileMenu, openModal, closeModal, showToast, hideToast,
  setBuilderTab, setAdminTab, setAtsTab, setSearchQuery, setFilterPlan,
} = uiSlice.actions;
export default uiSlice.reducer;