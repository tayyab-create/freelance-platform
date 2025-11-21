import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  profile: null,
  applications: [],
  assignedJobs: [],
  loading: false,
  error: null,
};

const workerSlice = createSlice({
  name: 'worker',
  initialState,
  reducers: {
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
  },
});

export const { setProfile } = workerSlice.actions;
export default workerSlice.reducer;