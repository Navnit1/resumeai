// store/slices/aiSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const aiCall = (name, endpoint) =>
  createAsyncThunk(`ai/${name}`, async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/ai/${endpoint}`, payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || `AI ${name} failed`);
    }
  });

export const generateSummary  = aiCall('generateSummary',  'generate-summary');
export const generateBullets  = aiCall('generateBullets',  'generate-bullets');
export const extractKeywords  = aiCall('extractKeywords',  'extract-keywords');
export const optimizeContent  = aiCall('optimizeContent',  'optimize-content');
export const analyzeResume    = aiCall('analyzeResume',    'analyze-resume');
export const suggestSkills    = aiCall('suggestSkills',    'suggest-skills');
export const improveSentence  = aiCall('improveSentence',  'improve-sentence');

const aiSlice = createSlice({
  name: 'ai',
  initialState: {
    loading: false,
    error: null,
    results: {},    // keyed by feature name
    history: [],    // last 10 AI interactions
  },
  reducers: {
    clearAIResult: (state, action) => { delete state.results[action.payload]; },
    clearAllAI: (state) => { state.results = {}; state.error = null; },
  },
  extraReducers: (builder) => {
    const features = [
      ['generateSummary', generateSummary, 'summary'],
      ['generateBullets', generateBullets, 'bullets'],
      ['extractKeywords', extractKeywords, 'keywords'],
      ['optimizeContent', optimizeContent, 'optimized'],
      ['analyzeResume', analyzeResume, 'analysis'],
      ['suggestSkills', suggestSkills, 'skills'],
      ['improveSentence', improveSentence, 'improved'],
    ];

    features.forEach(([name, thunk, resultKey]) => {
      builder
        .addCase(thunk.pending, (state) => { state.loading = true; state.error = null; })
        .addCase(thunk.fulfilled, (state, action) => {
          state.loading = false;
          state.results[name] = action.payload[resultKey];
          state.history.unshift({ feature: name, result: action.payload[resultKey], at: Date.now() });
          if (state.history.length > 10) state.history.pop();
        })
        .addCase(thunk.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        });
    });
  },
});

export const { clearAIResult, clearAllAI } = aiSlice.actions;
export default aiSlice.reducer;
