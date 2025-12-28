import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { resumeService } from '@/services/resumeService';
import { Resume, ResumeFormData } from '@/types';

interface ResumeState {
  resumes: Resume[];
  currentResume: Resume | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ResumeState = {
  resumes: [],
  currentResume: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchResumes = createAsyncThunk(
  'resume/fetchResumes',
  async (_, { rejectWithValue }) => {
    try {
      const resumes = await resumeService.getResumes();
      return resumes;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch resumes');
    }
  }
);

export const fetchResume = createAsyncThunk(
  'resume/fetchResume',
  async (id: string, { rejectWithValue }) => {
    try {
      const resume = await resumeService.getResume(id);
      return resume;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch resume');
    }
  }
);

export const createResume = createAsyncThunk(
  'resume/createResume',
  async (data: ResumeFormData, { rejectWithValue }) => {
    try {
      console.log('📤 Creating resume via API...');
      const resume = await resumeService.createResume(data);
      console.log('✅ Resume created successfully:', resume);
      return resume;
    } catch (error: any) {
      console.error('❌ Create resume error:', error);
      console.error('Error response:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Failed to create resume');
    }
  }
);

export const updateResume = createAsyncThunk(
  'resume/updateResume',
  async ({ id, data }: { id: string; data: Partial<ResumeFormData> }, { rejectWithValue }) => {
    try {
      console.log('📤 Updating resume via API...', id);
      const resume = await resumeService.updateResume(id, data);
      console.log('✅ Resume updated successfully:', resume);
      return resume;
    } catch (error: any) {
      console.error('❌ Update resume error:', error);
      console.error('Error response:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Failed to update resume');
    }
  }
);

export const deleteResume = createAsyncThunk(
  'resume/deleteResume',
  async (id: string, { rejectWithValue }) => {
    try {
      await resumeService.deleteResume(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete resume');
    }
  }
);

export const duplicateResume = createAsyncThunk(
  'resume/duplicateResume',
  async (id: string, { rejectWithValue }) => {
    try {
      const resume = await resumeService.duplicateResume(id);
      return resume;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to duplicate resume');
    }
  }
);

// Slice
const resumeSlice = createSlice({
  name: 'resume',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentResume: (state) => {
      state.currentResume = null;
    },
    updateTemplateSettings: (state, action: PayloadAction<{ template?: string; colorTheme?: string }>) => {
      if (state.currentResume) {
        if (action.payload.template) {
          state.currentResume.templateSettings.template = action.payload.template as any;
        }
        if (action.payload.colorTheme) {
          state.currentResume.templateSettings.colorTheme = action.payload.colorTheme as any;
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch resumes
    builder
      .addCase(fetchResumes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchResumes.fulfilled, (state, action: PayloadAction<Resume[]>) => {
        state.isLoading = false;
        state.resumes = action.payload;
      })
      .addCase(fetchResumes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch resume
    builder
      .addCase(fetchResume.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchResume.fulfilled, (state, action: PayloadAction<Resume>) => {
        state.isLoading = false;
        state.currentResume = action.payload;
      })
      .addCase(fetchResume.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create resume
    builder
      .addCase(createResume.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createResume.fulfilled, (state, action: PayloadAction<Resume>) => {
        state.isLoading = false;
        state.resumes.push(action.payload);
        state.currentResume = action.payload;
      })
      .addCase(createResume.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update resume
    builder
      .addCase(updateResume.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateResume.fulfilled, (state, action: PayloadAction<Resume>) => {
        state.isLoading = false;
        state.currentResume = action.payload;
        const index = state.resumes.findIndex((r) => r._id === action.payload._id);
        if (index !== -1) {
          state.resumes[index] = action.payload;
        }
      })
      .addCase(updateResume.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete resume
    builder
      .addCase(deleteResume.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteResume.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.resumes = state.resumes.filter((r) => r._id !== action.payload);
      })
      .addCase(deleteResume.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Duplicate resume
    builder
      .addCase(duplicateResume.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(duplicateResume.fulfilled, (state, action: PayloadAction<Resume>) => {
        state.isLoading = false;
        state.resumes.push(action.payload);
      })
      .addCase(duplicateResume.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentResume, updateTemplateSettings } = resumeSlice.actions;
export default resumeSlice.reducer;
