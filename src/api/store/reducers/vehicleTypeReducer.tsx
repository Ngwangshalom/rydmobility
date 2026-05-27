import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { vehicleTypeDataGet, vehicleData } from '../actions/vehicleTypeAction'
import { vehicleTypeDataGetAction } from '../actions/finddriverAction';
import { VehicleTypeInterface } from '../../interface/vehicleTypeInterface';


const initialState: VehicleTypeInterface = {
  vehicleTypedata: [],
  allVehicle: [],
  token: '',
  loading: false,
  success: false,
  fcmToken: '',
  statusCode: null,
};


const vehicleTypeSlice = createSlice({
  name: 'vehicleType',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(vehicleTypeDataGet.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(
      vehicleTypeDataGet.fulfilled,
      (state: any, action: PayloadAction<{ data: any; status: number }>) => {
        state.loading = false;
        state.vehicleTypedata = action.payload;
        state.statusCode = action.payload.status;
        state.success = true;
      }
    );
    builder.addCase(vehicleTypeDataGet.rejected, (state) => {
      state.loading = false;
      state.success = false;
    });



    builder.addCase(vehicleData.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(vehicleData.fulfilled, (state, action) => {
      state.allVehicle = action.payload;
      state.loading = false;
    });
    builder.addCase(vehicleData.rejected, (state) => {
      state.loading = false;
      state.success = false;
    });


    builder.addCase(vehicleTypeDataGetAction.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(vehicleTypeDataGetAction.fulfilled, (state: any, action: PayloadAction<any>) => {
      state.loading = false;
      state.vehicleTypedata = action.payload;
      state.success = true;
    });
    builder.addCase(vehicleTypeDataGetAction.rejected, (state) => {
      state.loading = false;
      state.success = false;
    });
  }
});

export default vehicleTypeSlice.reducer;
