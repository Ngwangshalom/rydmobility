import { findDriver, vehicleType } from "../endpoints/findDriverEndPoint";
import { FindDriverInterface } from "../interface/finddriverInterface";
import { GET_API, POST_API } from "../methods";

export const findDriverService = async (data: FindDriverInterface) => {
  return POST_API(data, findDriver)
    .then(res => {
      return res;
    })
    .catch(e => {
      return e?.response;
    });
};

export const vehicleTypeService = async (service_id: string | number) => {
  return GET_API(`${vehicleType}?service_id=${service_id}`)
    .then(res => {
      return res;
    })
    .catch(e => {
      return e?.response;
    });
};

const FindDriverService = {
  findDriverService,
  vehicleTypeService
};

export default FindDriverService;
