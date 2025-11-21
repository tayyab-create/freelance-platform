import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  users: [],
  pendingUsers: [],
  stats: null,
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setPendingUsers: (state, action) => {
      state.pendingUsers = action.payload;
    },
  },
});

export const { setPendingUsers } = adminSlice.actions;
export default adminSlice.reducer;