import { createSlice } from '@reduxjs/toolkit';
import { userRideRequest, updateRideRequest, userRideLocation, findDriverRequestsAction } from '../actions/rideRequestAction'
import { RideRequestInterface } from '../../interface/rideRequestInterface';


const initialState: RideRequestInterface = {
  rideRequestData: undefined,
  updateRideRequestData: undefined,
  rideLocationData: undefined,
  findDriverRequestsData: [],
  loading: false,
  success: false,
};


const rideRequestSlice = createSlice({
  name: 'rideRequest',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(userRideRequest.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(userRideRequest.fulfilled, (state, action) => {
      state.rideRequestData = action.payload;
      state.loading = false;
    });
    builder.addCase(userRideRequest.rejected, (state) => {
      state.loading = false;
      state.success = false;
    });

    //update bid
    builder.addCase(updateRideRequest.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(updateRideRequest.fulfilled, (state, action) => {
      state.updateRideRequestData = action.payload;
      state.loading = false;
    });
    builder.addCase(updateRideRequest.rejected, (state) => {
      state.loading = false;
    });

    //rideLocation
    builder.addCase(userRideLocation.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(userRideLocation.fulfilled, (state, action) => {
      state.rideLocationData = action.payload;
      state.loading = false;
    });
    builder.addCase(userRideLocation.rejected, (state) => {
      state.loading = false;
    });

    //findDriverRequests
    builder.addCase(findDriverRequestsAction.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(findDriverRequestsAction.fulfilled, (state, action) => {
      state.findDriverRequestsData = action.payload;
      state.loading = false;
    });
    builder.addCase(findDriverRequestsAction.rejected, (state) => {
      state.loading = false;
    });
  }
});

export default rideRequestSlice.reducer;
