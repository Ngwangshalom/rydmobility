import { createSlice } from "@reduxjs/toolkit";
import { findDriverAction } from "../actions/finddriverAction";

const initialState = {
  loading: false,
  FindDriver: [],
};

const findDriverSlice = createSlice({
  name: "finddriver",
  initialState,
  reducers: {
    financialState(state: any, action) {
      state.val = action.payload;
    },
    updateLoading(state, action) {
      state.loading = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(findDriverAction.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(findDriverAction.fulfilled, (state, action) => {
      state.loading = false;
      state.FindDriver = action.payload;
    });
    builder.addCase(findDriverAction.rejected, (state, action) => {
      state.loading = false;
    });
  },
});

export const { financialState, updateLoading } = findDriverSlice.actions;
export default findDriverSlice.reducer;
