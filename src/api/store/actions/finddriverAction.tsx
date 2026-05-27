import { createAsyncThunk } from "@reduxjs/toolkit";
import { FindDriverInterface } from "@api/interface/finddriverInterface";
import FindDriverService from "@src/api/services/finddriverService";
import { FINF_VEHICLE_TYPE, BID } from "../types/index";

export const findDriverAction = createAsyncThunk(
  BID,
  async (data: FindDriverInterface) => {
    const response = await FindDriverService.findDriverService(data);
    return response;
  },
);

export const vehicleTypeDataGetAction = createAsyncThunk(
  FINF_VEHICLE_TYPE,
  async (service_id: string | number) => {
    const response = await FindDriverService.vehicleTypeService(service_id);
    return response?.data;
  },
);
