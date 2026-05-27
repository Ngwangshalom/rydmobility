import { rideRequest, rideLocation } from "../endpoints/rideRequestEndPoint";
import { RideRequestInterface } from "../interface/rideRequestInterface";
import { GET_API, POST_API, PUT_API } from "../methods";

export const userRideRequest = async (data: RideRequestInterface) => {
  return POST_API(data, rideRequest)
    .then((res) => {
      return res;
    })
    .catch((e) => {
      return e?.response;
    });
};

export const updateRideRequest = async ({
  payload,
  ride_id,
}: {
  payload: any;
  ride_id: number;
}) => {
  return PUT_API(`${rideRequest}/${ride_id}`, payload)
    .then((res) => {
      return res;
    })
    .catch((e) => {
      return e?.response;
    });
};

export const getRideRequests = async (service_type?: string) => {
  const endpoint = service_type ? `${rideRequest}?service_type=${service_type}` : rideRequest;
  return GET_API(endpoint)
    .then(res => {
      return res;
    })
    .catch(e => {
      return e?.response;
    });
};

export const userRideLocation = async ({
  ride_number,
}: {
  ride_number: number;
}) => {
  return GET_API(`${rideLocation}/${ride_number}`)
    .then((res) => {
      return res;
    })
    .catch((e) => {
      return e?.response;
    });
};

const rideRequestServices = {
  userRideRequest,
  updateRideRequest,
  userRideLocation,
  getRideRequests,
};

export default rideRequestServices;
