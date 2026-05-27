export interface FindDriverInterface {
  service_id?: string | number;
  service_category_id?: string | number;
  location_coordinates?: any[];
  locations?: string[];
  vehicle_type_id?: string | number;
  gear_type?: string;
  ride_date?: string;
  ride_time?: string;
  end_date?: string;
  end_time?: string;
  start_time?: string; // Also add this as it's used for combined API time
  county_slug?: string;
}
export interface VehicleTypeInterface {
  service_id?: string | number;
  service_category_id?: string | number;
  locations?: any[];
  current_time?: string;
}