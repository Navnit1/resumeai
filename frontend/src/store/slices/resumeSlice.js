import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// ─── Thunks ───────────────────────────────────────────────────────────────────
export const fetchResumes = createAsyncThunk('resumes/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/resumes');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch resumes');
  }
});

export const fetchResume = createAsyncThunk('resumes/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/resumes/${id}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch resume');
  }
});

export const createResume = createAsyncThunk('resumes/create', async (resumeData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/resumes', resumeData);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to create resume');
  }
});

export const updateResume = createAsyncThunk('resumes/update', async ({ id, updates }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/resumes/${id}`, updates);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to update resume');
  }
});

export const deleteResume = createAsyncThunk('resumes/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/resumes/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to delete resume');
  }
});

export const duplicateResume = createAsyncThunk('resumes/duplicate', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/resumes/${id}/duplicate`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to duplicate resume');
  }
});

export const analyzeATS = createAsyncThunk('resumes/analyzeATS', async ({ id, jobDescription, jobTitle }, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/resumes/${id}/analyze-ats`, { jobDescription, jobTitle });
    return { id, analysis: data.analysis };
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'ATS analysis failed');
  }
});

export const exportPDF = createAsyncThunk('resumes/exportPDF', async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`/resumes/${id}/export-pdf`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `resume_${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return id;
  } catch (err) {
    return rejectWithValue('PDF export failed');
  }
});

// ─── Default resume structure ─────────────────────────────────────────────────
export const DEFAULT_RESUME_DATA = {
  name: 'New Resume',
  template: 'modern',
  personal: { name: '', title: '', email: '', phone: '', location: '', linkedin: '', github: '', portfolio: '' },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
};

// ─── Slice ────────────────────────────────────────────────────────────────────
const resumeSlice = createSlice({
  name: 'resumes',
  initialState: {
    list: [],
    current: null,
    editing: null,
    loading: false,
    saving: false,
    error: null,
    atsLoading: false,
    pdfLoading: false,
  },
  reducers: {
    setEditing: (state, action) => { state.editing = action.payload; },
    updateEditing: (state, action) => {
      if (state.editing) {
        state.editing = { ...state.editing, ...action.payload };
      }
    },
    updateEditingSection: (state, action) => {
      const { section, data } = action.payload;
      if (state.editing) {
        state.editing[section] = data;
      }
    },
    clearEditing: (state) => { state.editing = null; },
    clearError: (state) => { state.error = null; },
    startNewResume: (state) => {
      state.editing = { ...DEFAULT_RESUME_DATA };
    },
  },
  extraReducers: (builder) => {
    // Fetch all
    builder
      .addCase(fetchResumes.pending, (state) => { state.loading = true; })
      .addCase(fetchResumes.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.resumes;
      })
      .addCase(fetchResumes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create
    builder
      .addCase(createResume.pending, (state) => { state.saving = true; })
      .addCase(createResume.fulfilled, (state, action) => {
        state.saving = false;
        state.list.unshift(action.payload.resume);
        state.editing = action.payload.resume;
      })
      .addCase(createResume.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });

    // Update
    builder
      .addCase(updateResume.pending, (state) => { state.saving = true; })
      .addCase(updateResume.fulfilled, (state, action) => {
        state.saving = false;
        const idx = state.list.findIndex((r) => r._id === action.payload.resume._id);
        if (idx !== -1) state.list[idx] = action.payload.resume;
        if (state.editing?._id === action.payload.resume._id) {
          state.editing = action.payload.resume;
        }
      })
      .addCase(updateResume.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });

    // Delete
    builder.addCase(deleteResume.fulfilled, (state, action) => {
      state.list = state.list.filter((r) => r._id !== action.payload);
    });

    // Duplicate
    builder.addCase(duplicateResume.fulfilled, (state, action) => {
      state.list.unshift(action.payload.resume);
    });

    // ATS
    builder
      .addCase(analyzeATS.pending, (state) => { state.atsLoading = true; })
      .addCase(analyzeATS.fulfilled, (state, action) => {
        state.atsLoading = false;
        const resume = state.list.find((r) => r._id === action.payload.id);
        if (resume) resume.atsAnalysis = action.payload.analysis;
        if (state.editing?._id === action.payload.id) {
          state.editing.atsAnalysis = action.payload.analysis;
        }
      })
      .addCase(analyzeATS.rejected, (state) => { state.atsLoading = false; });

    // PDF
    builder
      .addCase(exportPDF.pending, (state) => { state.pdfLoading = true; })
      .addCase(exportPDF.fulfilled, (state) => { state.pdfLoading = false; })
      .addCase(exportPDF.rejected, (state) => { state.pdfLoading = false; });

    // Fetch one
    builder.addCase(fetchResume.fulfilled, (state, action) => {
      state.current = action.payload.resume;
    });
  },
});

export const { setEditing, updateEditing, updateEditingSection, clearEditing, clearError, startNewResume } = resumeSlice.actions;
export default resumeSlice.reducer;
