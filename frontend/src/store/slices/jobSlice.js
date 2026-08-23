import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// ─── Thunks ───────────────────────────────────────────────────────────────────
export const searchJobs = createAsyncThunk(
  'jobs/search',
  async ({ role, location, country = 'in', page = 1 }, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/jobs/search', {
        params: { role, location, country, page },
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to search jobs');
    }
  }
);

export const recommendFromUpload = createAsyncThunk(
  'jobs/recommendFromUpload',
  async ({ file, location, country = 'in', targetRole }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('resume', file);
      if (location) formData.append('location', location);
      if (country) formData.append('country', country);
      if (targetRole) formData.append('targetRole', targetRole);

      const { data } = await api.post('/jobs/recommend/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to get recommendations');
    }
  }
);

export const recommendFromSavedResume = createAsyncThunk(
  'jobs/recommendFromSavedResume',
  async ({ resumeId, location, country = 'in', targetRole }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/jobs/recommend/saved', {
        resumeId,
        location,
        country,
        targetRole,
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to get recommendations');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────
const initialState = {
  results: [],
  count: 0,
  page: 1,
  profile: null, // { role, keywords, seniority, location }
  loading: false,
  error: null,
};

const jobSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    clearJobResults: (state) => {
      state.results = [];
      state.count = 0;
      state.profile = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Shared pending/rejected handling for all three thunks
      .addMatcher(
        (action) => action.type.startsWith('jobs/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('jobs/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('jobs/') && action.type.endsWith('/fulfilled'),
        (state, action) => {
          state.loading = false;
          state.results = action.payload.results || [];
          state.count = action.payload.count || 0;
          state.page = action.payload.page || 1;
          state.profile = action.payload.profile || null;
        }
      );
  },
});

export const { clearJobResults } = jobSlice.actions;
export default jobSlice.reducer;
