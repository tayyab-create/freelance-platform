import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  profile: null,
  jobs: [],
  applications: [],
  loading: false,
  error: null,
};

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
  },
});

export const { setProfile } = companySlice.actions;
export default companySlice.reducer;