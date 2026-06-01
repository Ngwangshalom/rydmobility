import React, { useState, useEffect, useRef, useCallback } from "react";
import { Text, TouchableOpacity, View, ScrollView, Modal, Animated, Dimensions, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, FlatList, Alert, Platform, TextInput, Pressable } from "react-native";
import { History, Calender, AddressMarker, PickLocation, Save, Driving, Gps, Close, Add, Minus } from "@utils/icons";
import { styles } from "./styles";
import { commonStyles } from "../../styles/commonStyle";
import { external } from "../../styles/externalStyle";
import { SolidLine, Button, Header, InputText } from "@src/commonComponent";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { userZone } from "../../api/store/actions/index";
import { vehicleTypeDataGet } from "../../api/store/actions/vehicleTypeAction";
import { getValue, setValue } from "@src/utils/localstorage";
import { appColors, appFonts, windowHeight, windowWidth } from "@src/themes";
import { useAppNavigation } from "@src/utils/navigation";
import { getDistance } from "geolib";
import useSmartLocation from "@src/components/helper/locationHelper";
import { useValues } from "@src/utils/context/index";
import { OPENROUTE_API_KEY, OPENROUTE_BASE_URL } from "@src/api/config";

export function LocationDrop() {
  const dispatch = useDispatch();
  const { navigate, replace } = useAppNavigation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const route = useRoute();
  const { service_ID, service_name, service_category_ID, service_category_slug, formattedDate, formattedTime, defultAddress, defultCoords } = route.params;
  const { selectedAddress, fieldValue, pinLatitude, pinLongitude } = route.params || {};
  const [destination, setDestination] = useState<string>("");
  const [stops, setStops] = useState<any[]>([]);
  const [pickupLocation, setPickupLocation] = useState<string>(defultAddress);
  const [fieldLength, setFieldLength] = useState<number>(0);
  const [addressData, setAddressData] = useState<string>("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isInitialFetchDone, setIsInitialFetchDone] = useState(false);
  const { zoneValue } = useSelector(state => state.zone);
  const [visible, setVisible] = useState(false);
  const screenWidth = Dimensions.get("window").width;
  const translateX = useRef(new Animated.Value(-30)).current;
  const { settingData, taxidoSettingData, translateData } = useSelector(state => state.setting);
  const [recentDatas, setRecentDatas] = useState([]);
  const [dateError, setDateError] = useState(false);
  const { DateValue, TimeValue, field } = route.params || {};
  const [scheduleDate, setScheduleDate] = useState({
    DateValue: DateValue || "",
    TimeValue: TimeValue || "",
  });
  const [proceedLoading, setProceedLoading] = useState(false);
  const { currentLatitude, currentLongitude } = useSmartLocation();
  const [isdesFocused, setIsdesFocused] = useState(false);
  const { linearColorStyle, viewRTLStyle, textColorStyle, bgFullLayout, textRTLStyle, isDark, isRTL } = useValues();
  const [wasAutoFilled, setWasAutoFilled] = useState(false);
  const [destinationFullAddress, setDestinationFullAddress] = useState();
  const [hasNavigated, setHasNavigated] = useState(false);
  const pickupRef = useRef<TextInput>(null);
  const destinationRef = useRef<TextInput>(null);
  const [pickupCoords, setPickupCoords] = useState<{
    lat: number;
    lng: number;
  } | null>({ lat: defultCoords?.lat, lng: defultCoords?.lng });
  const [destinationCoords, setDestinationCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [stopCoords, setStopCoords] = useState<any[]>([]);
  const [minRadiusKm, setMinRadiusKm] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Debounce function
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  useEffect(() => {
    const init = async () => {
      const meters =
        taxidoSettingData?.taxido_values?.ride?.min_intracity_radius ?? 0;
      await setMinRadiusKm(meters / 1000);
    };
    init();
  }, [taxidoSettingData?.taxido_values?.ride?.min_intracity_radius]);

  const coordset = (
    selectedPickup,
    selectedDropOff,
    shortPickup,
    shortDropOff,
  ) => {
    if (selectedPickup)
      convertToCoords(selectedPickup, setPickupCoords, "pickup", shortPickup);
    if (selectedDropOff)
      convertToCoords(
        selectedDropOff,
        setDestinationCoords,
        "destination",
        shortDropOff,
      );
    if (stops.length) convertStopsToCoords(stops);
  };

  // Use OpenStreetMap Nominatim for geocoding
  const convertToCoords = async (
    address: string,
    setter: (coords: { lat: number; lng: number } | null) => void,
    label: string = "",
    shortAddress?: string,
  ) => {
    if (!address && !shortAddress) {
      setter(null);
      return;
    }

    const query = shortAddress || address;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'RYDApp/1.0 (support@rydapp.com)'
          }
        }
      );

      if (!response.ok) {
        console.warn(`⚠️ OSM geocoding failed for ${label}:`, query);
        setter(null);
        return;
      }

      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        const location = data[0];
        const lat = parseFloat(location.lat);
        const lng = parseFloat(location.lon);
        console.log(`✅ Geocoded ${label}: ${lat}, ${lng}`);
        setter({ lat, lng });
      } else {
        console.warn(`❌ No geocode results for ${label}:`, query);
        setter(null);
      }
    } catch (err) {
      console.error(`⚠️ Geocoding error for ${label}:`, err);
      setter(null);
    }
  };

  const convertStopsToCoords = async stopList => {
    if (!stopList || stopList.length === 0) {
      setStopCoords([]);
      return;
    }

    const coordsArray = [];
    
    for (const stop of stopList) {
      if (stop && stop.trim().length > 0) {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(stop)}&limit=1&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'RYDApp/1.0 (support@rydapp.com)'
              }
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
              const location = data[0];
              const lat = parseFloat(location.lat);
              const lng = parseFloat(location.lon);
              coordsArray.push({ lat, lng });
            } else {
              console.warn("No results for stop:", stop);
              coordsArray.push(null);
            }
          } else {
            console.warn("Geocoding failed for stop:", stop);
            coordsArray.push(null);
          }
        } catch (err) {
          console.error("Stop geocoding error:", err);
          coordsArray.push(null);
        }
      } else {
        coordsArray.push(null);
      }
    }
    setStopCoords(coordsArray);
  };

  useEffect(() => {
    if (currentLatitude && currentLongitude) {
      fetchAddressFromCoords(currentLatitude, currentLongitude);
    }
  }, [currentLatitude, currentLongitude]);

  // Use OpenStreetMap for reverse geocoding
  const fetchAddressFromCoords = async (latitude, longitude) => {
    if (!latitude || !longitude) return;
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'RYDApp/1.0 (support@rydapp.com)'
          }
        }
      );

      if (!response.ok) {
        console.error("Reverse geocoding failed");
        return;
      }

      const json = await response.json();

      if (json && json.display_name) {
        const useFullAddress = taxidoSettingData?.taxido_values?.activation?.full_address_location == 1;

        if (!pickupLocation) {
          const shortAddress = json.address?.road || 
                              json.address?.neighbourhood || 
                              json.address?.suburb ||
                              json.display_name.split(',')[0];
          const fullAddress = json.display_name;
          
          setPickupLocation(
            useFullAddress ? fullAddress : shortAddress || fullAddress
          );
          setPickupCoords({ lat: latitude, lng: longitude });
        }
        setWasAutoFilled(true);
      }
    } catch (error) {
      console.error("Error fetching address from coordinates:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => {
        destinationRef.current?.focus();
      }, 300);

      return () => clearTimeout(timer);
    }, [pickupLocation, wasAutoFilled]),
  );

  useEffect(() => {
    setScheduleDate({
      DateValue: DateValue || "",
      TimeValue: TimeValue || "",
    });
    if (DateValue && TimeValue) {
      setDateError(false);
    }
  }, [DateValue, TimeValue]);

  useEffect(() => {
    const fetchRecentData = async () => {
      try {
        const stored = await getValue("locations");
        let parsedLocations: any = [];
        if (stored) {
          parsedLocations = JSON.parse(stored);
          if (!Array.isArray(parsedLocations)) {
            parsedLocations = [parsedLocations];
          }
        }
        // setRecentDatas(parsedLocations);
      } catch (error) {
        console.error("Error parsing recent locations:", error);
        setRecentDatas([]);
      }
    };
    fetchRecentData();
  }, []);

  useEffect(() => {
    if (fieldLength > 3) {
      startAnimation();
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [fieldLength]);

  const startAnimation = () => {
    Animated.sequence([
      Animated.timing(translateX, {
        toValue: screenWidth,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: -30,
        duration: 0,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: screenWidth,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: -30,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
    });
  };

  useEffect(() => {
    if (hasNavigated) return;
    const allStopsValid = stops.every(stop => stop.trim().length > 0);
    const allFieldsFilled =
      pickupLocation.trim().length > 0 &&
      destination?.trim().length > 0 &&
      (stops.length === 0 || allStopsValid);
    if (activeField === null && allFieldsFilled) {
      setHasNavigated(true);
    }
  }, [activeField, pickupLocation, destination, stops]);

  // Use OpenStreetMap Nominatim for address suggestions
  const fetchAddressSuggestions = async (input) => {
    if (!input || input.length < 3) {
      setSuggestions([]);
      return;
    }

    console.log("🔍 Fetching suggestions from OSM for:", input);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}&limit=8&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'RYDApp/1.0 (support@rydapp.com)'
          }
        }
      );

      if (!response.ok) {
        console.error("OSM API Error: HTTP", response.status);
        setSuggestions([]);
        return;
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        console.error("OSM API Error: Invalid response format");
        setSuggestions([]);
        return;
      }
     
      processSuggestionsData(data, input);
    } catch (error) {
      console.error("Error fetching suggestions with OSM:", error);
      setSuggestions([]);
    }
  };

  const processSuggestionsData = (data, searchQuery) => {
    if (!data || !Array.isArray(data)) {
      setSuggestions([]);
      return;
    }
     
    const places = data.map(item => {
      try {
        let distanceKm = 0;
        
        // Calculate distance from user's current location to suggestion
        if (currentLatitude && currentLongitude && item.lat && item.lon) {
          distanceKm = calculateDirectDistance(
            currentLatitude,
            currentLongitude,
            parseFloat(item.lat),
            parseFloat(item.lon)
          );
        }

        const address = item.address || {};
        const displayName = item.display_name || '';
        
        // Create better address display
        const shortAddress = address.road || 
                            address.neighbourhood || 
                            address.suburb || 
                            address.city ||
                            displayName.split(',')[0];
          
        const detailAddress = displayName;

        return {
          id: item.place_id || item.osm_id || Math.random().toString(36).substr(2, 9),
          shortAddress: shortAddress || "Unknown Location",
          detailAddress: detailAddress,
          distanceKm: distanceKm,
          lat: parseFloat(item.lat) || 0,
          lng: parseFloat(item.lon) || 0,
          originalData: item,
          relevance: calculateRelevance(shortAddress, detailAddress, searchQuery)
        };
      } catch (error) {
        console.error('Error processing suggestion item:', error, item);
        return null;
      }
    }).filter(Boolean);

    // Sort by relevance and distance
    const sortedPlaces = places
      .sort((a, b) => {
        // First sort by relevance score (exact matches first)
        if (b.relevance !== a.relevance) {
          return b.relevance - a.relevance;
        }
        // Then by distance (closest first)
        return a.distanceKm - b.distanceKm;
      })
      .slice(0, 8); // Limit to 8 results

    console.log(`✅ Displaying ${sortedPlaces.length} sorted suggestions with distances`);
    setSuggestions(sortedPlaces);
  };

  // Calculate relevance score based on exact word matching
  const calculateRelevance = (shortAddress, detailAddress, searchQuery) => {
    let score = 0;
    const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 2);
    const shortAddrLower = shortAddress?.toLowerCase() || '';
    const detailAddrLower = detailAddress?.toLowerCase() || '';

    if (searchTerms.length === 0) return score;

    searchTerms.forEach(term => {
      // Exact word match in short address gets highest score
      const shortWords = shortAddrLower.split(/\W+/);
      if (shortWords.includes(term)) {
        score += 10; // Exact word match
      } else if (shortAddrLower.includes(term)) {
        score += 5; // Substring match
      }
      
      // Exact word match in detail address
      const detailWords = detailAddrLower.split(/\W+/);
      if (detailWords.includes(term)) {
        score += 5; // Exact word match
      } else if (detailAddrLower.includes(term)) {
        score += 2; // Substring match
      }

      // Bonus for beginning of string matches
      if (shortAddrLower.startsWith(term)) {
        score += 3;
      }
    });

    return score;
  };

  // Debounced search handler
  const debouncedSearch = useRef(
    debounce((text) => {
      fetchAddressSuggestions(text);
    }, 500)
  ).current;

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.length >= 3) {
      debouncedSearch(text);
    } else {
      setSuggestions([]);
    }
  };

  const handleRecentClick = async suggestion => {
    Keyboard.dismiss();
    if (activeField === "pickupLocation") {
      setPickupLocation(suggestion?.shortAddress);
      setWasAutoFilled(true);
      coordset(suggestion?.detailAddress, "", suggestion?.shortAddress, "");
    } else if (activeField === "destination") {
      setDestination(suggestion?.detailAddress);
      setDestinationFullAddress(suggestion);
      coordset("", suggestion?.detailAddress, "", suggestion?.shortAddress);
    } else if (activeField && activeField.startsWith("stop-")) {
      const updatedStops = [...stops];
      const stopIndex = parseInt(activeField.split("-")[1], 10) - 1;
      updatedStops[stopIndex] = suggestion?.shortAddress;
      setStops(updatedStops);
      coordset(suggestion?.detailAddress);
    }
  };

  const handleSuggestionClick = async suggestion => {
    Keyboard.dismiss();

    try {
      let storedLocations = [];
      const stored = await getValue("locations");

      if (stored) {
        storedLocations = JSON.parse(stored);
        if (!Array.isArray(storedLocations)) {
          storedLocations = [storedLocations];
        }
      }

      const alreadyExists = storedLocations.some(
        loc =>
          loc?.shortAddress?.trim().toLowerCase() ===
          suggestion?.shortAddress?.trim().toLowerCase(),
      );

      if (!alreadyExists) {
        let suggestions = {
          shortAddress: suggestion?.shortAddress,
          detailAddress: suggestion?.detailAddress,
        };
        storedLocations.push(suggestions);
        if (storedLocations?.length > 5) {
          storedLocations?.shift();
        }
        await setValue("locations", JSON.stringify(storedLocations));
      }
    } catch (error) {
      console.error("Error handling locations:", error);
    }

    let updatedStops = [...stops];

    if (activeField === "pickupLocation") {
      setPickupLocation(suggestion?.shortAddress);
      setWasAutoFilled(true);
      setPickupCoords({ lat: suggestion.lat, lng: suggestion.lng });
    } else if (activeField === "destination") {
      setDestination(suggestion?.shortAddress);
      setDestinationFullAddress(suggestion);
      setDestinationCoords({ lat: suggestion.lat, lng: suggestion.lng });
    } else if (activeField && activeField.startsWith("stop-")) {
      const stopIndex = parseInt(activeField.split("-")[1], 10) - 1;
      updatedStops[stopIndex] = suggestion?.shortAddress;
      setStops(updatedStops);
    }

    setTimeout(() => {
      const areAllStopsFilled = updatedStops?.every(
        stop => stop?.trim()?.length > 0,
      );
      const isPickupFilled =
        pickupLocation?.trim()?.length > 0 || activeField === "pickupLocation";
      const isDestinationFilled =
        destination?.trim()?.length > 0 || activeField === "destination";

      if (isPickupFilled && isDestinationFilled && areAllStopsFilled) {
        // All fields are filled
      }
    }, 100);
  };

  useEffect(() => {
    if (addressData && addressData.length >= 3) {
      handleSearch(addressData);
    } else {
      setSuggestions([]);
    }
  }, [addressData]);

  useEffect(() => {
    let length = 0;
    let currentAddressData = "";

    if (activeField === "pickupLocation") {
      length = pickupLocation?.length;
      currentAddressData = pickupLocation;
    } else if (activeField === "destination") {
      length = destination?.length;
      currentAddressData = destination;
    } else if (activeField && activeField.startsWith("stop-")) {
      const stopIndex = parseInt(activeField.split("-")[1], 10) - 1;
      const stopData = stops[stopIndex];
      if (stopData !== undefined) {
        length = stopData?.length;
        currentAddressData = stopData;
      }
    }
    setAddressData(currentAddressData);
    setFieldLength(length);
  }, [activeField, stops, pickupLocation, destination]);

  const coordsData = async () => {
    const geocodeAddress = async (address) => {
      if (!address || typeof address !== 'string' || address.trim() === '') {
        console.warn('Invalid address input:', address);
        return null;
      }
      
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'RydApp/1.0 (support@rydapp.com)',
            },
          }
        );

        if (!response.ok) {
          console.warn('OSM API error');
          return null;
        }

        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          const location = data[0];
          const latitude = parseFloat(location.lat);
          const longitude = parseFloat(location.lon);
          return { latitude, longitude };
        }
        return null;
      } catch (error) {
        console.error('Error geocoding address:', error);
        return null;
      }
    };

    const fetchCoordinates = async () => {
      try {
        const pickup = await geocodeAddress(pickupLocation);
        if (pickup?.latitude && pickup?.longitude) {
          dispatch(userZone({ lat: pickup?.latitude, lng: pickup?.longitude }));
          setIsInitialFetchDone(true);
        }
      } catch (error) {
        console.error("Error fetching coordinates:", error);
      }
    };
    fetchCoordinates();
  };

const getVehicleTypes = async () => {
  console.log('getVehicleTypes called with coordinates:', {
    pickupCoords,
    destinationCoords,
    stopCoords,
    service_name
  });

  // Validate all coordinates are available and valid
  const validateCoordinate = (coord: any) => {
    return coord && 
           typeof coord.lat === 'number' && 
           typeof coord.lng === 'number' &&
           !isNaN(coord.lat) && 
           !isNaN(coord.lng) &&
           coord.lat !== 0 && 
           coord.lng !== 0;
  };

  if (!validateCoordinate(pickupCoords) || !validateCoordinate(destinationCoords)) {
    console.warn("Invalid coordinates:", { pickupCoords, destinationCoords });
    Alert.alert("Error", "Please select valid pickup and destination locations.");
    setProceedLoading(false);
    return;
  }

  // Prepare all locations in the order: pickup -> stops -> destination
  const allLocations = [];
  
  // Add pickup location
  if (validateCoordinate(pickupCoords)) {
    allLocations.push({
      lat: pickupCoords.lat,
      lng: pickupCoords.lng
    });
  }

  // Add stops (if any)
  if (stopCoords && Array.isArray(stopCoords)) {
    stopCoords.forEach((stop, index) => {
      if (validateCoordinate(stop)) {
        allLocations.push({
          lat: stop.lat,
          lng: stop.lng
        });
      } else {
        console.warn(`Invalid stop coordinate at index ${index}:`, stop);
      }
    });
  }

  // Add destination location
  if (validateCoordinate(destinationCoords)) {
    allLocations.push({
      lat: destinationCoords.lat,
      lng: destinationCoords.lng
    });
  }

  console.log('All locations to send:', allLocations);

  // Validate we have at least 2 locations
  if (allLocations.length < 2) {
    console.warn('Not enough valid locations');
    Alert.alert("Error", "Please select valid pickup and destination locations.");
    setProceedLoading(false);
    return;
  }

  // Get formatted time for schedule rides
  const getFormattedTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const now = new Date();

  // Prepare payload EXACTLY as backend expects
  const payload = {
    locations: allLocations, // Array of {lat, lng} objects - THIS IS CRITICAL
    service_id: service_ID,
    service_category_id: service_category_ID,
    current_time: getFormattedTime(now),
    location_addresses: {
      pickup: pickupLocation,
      stops: stops,
      destination: destination
    }
  };

  console.log('Sending payload to backend:', JSON.stringify(payload, null, 2));

  try {
    if (service_name === "cab") {
      const result = await dispatch(vehicleTypeDataGet(payload)).unwrap();
      console.log('Dispatch successful, result:', result);
    
      // Save comprehensive location data for later use
      const locationData = {
        destinationFullAddress,
        destination,
        stops,
        pickupLocation,
        service_ID,
        zoneValue,
        scheduleDate,
        service_category_ID,
        service_name,
        filteredLocations: allLocations, // All coordinates
        locationAddresses: {
          pickup: pickupLocation,
          stops: stops,
          destination: destination
        },
        pickupCoords,
        destinationCoords,
        stopsCoords: stopCoords || [],
        // Store the exact payload for debugging
        backendPayload: payload
      };
      
      await setValue("locations", JSON.stringify(locationData));

      console.log('Navigating to BookRide with coordinates:', allLocations);
      
      // Navigate with all necessary data
      navigate("BookRide", {
        destination,
        stops,
        pickupLocation,
        service_ID,
        zoneValue,
        scheduleDate,
        service_category_ID,
        service_name,
        filteredLocations: allLocations, // Send coordinates array
        locationAddresses: { // Send addresses separately
          pickup: pickupLocation,
          stops: stops,
          destination: destination
        },
        pickupCoords,
        destinationCoords,
        stopsCoords: stopCoords || [],
        // Also send the raw addresses for display
        receiverName: "", // Add if you have receiver info
        countryCode: "", // Add if you have country code
        phoneNumber: "", // Add if you have phone number
      });
      
    } else if (service_name === "freight" || service_name === "parcel") {
      console.log('Navigating to Outstation with coordinates:', allLocations);
      navigate("Outstation", {
        destination,
        stops,
        pickupLocation,
        service_ID,
        zoneValue,
        service_name,
        service_category_ID,
        scheduleDate,
        filteredLocations: allLocations,
        locationAddresses: {
          pickup: pickupLocation,
          stops: stops,
          destination: destination
        },
        pickupCoords,
        destinationCoords,
        stopsCoords: stopCoords || [],
      });
    }
  } catch (error: any) {
    console.error('Error in getVehicleTypes:', error);
    
    // Show specific error messages
    let errorMessage = "Failed to get vehicle types. Please try again.";
    if (error.message) {
      errorMessage = error.message;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    Alert.alert("Error", errorMessage);
  } finally {
    setProceedLoading(false);
    console.log('Loading set to false');
  }
};
  useEffect(() => {
    if (zoneValue && isInitialFetchDone) {
      gotoNext();
    }
  }, [zoneValue]);

  // Fixed distance calculation function
  const calculateDirectDistance = (lat1, lon1, lat2, lon2) => {
    try {
      // Validate inputs
      if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
        console.warn("❌ Missing coordinates for distance calculation");
        return 0;
      }

      // Convert to numbers
      const lat1Num = parseFloat(lat1);
      const lon1Num = parseFloat(lon1);
      const lat2Num = parseFloat(lat2);
      const lon2Num = parseFloat(lon2);

      if (isNaN(lat1Num) || isNaN(lon1Num) || isNaN(lat2Num) || isNaN(lon2Num)) {
        console.warn("❌ Invalid coordinates:", { lat1, lon1, lat2, lon2 });
        return 0;
      }

      // Haversine formula
      const R = 6371; // Earth's radius in kilometers
      const dLat = (lat2Num - lat1Num) * Math.PI / 180;
      const dLon = (lon2Num - lon1Num) * Math.PI / 180;
      
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1Num * Math.PI / 180) * Math.cos(lat2Num * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      console.log(`📍 Distance calculated: ${distance.toFixed(2)}km from (${lat1Num},${lon1Num}) to (${lat2Num},${lon2Num})`);
      return distance;
    } catch (error) {
      console.error("🚨 Error in distance calculation:", error);
      return 0;
    }
  };

  // Calculate distance between pickup and destination
  const calculateRouteDistance = async () => {
    try {
      if (!pickupCoords || !destinationCoords) {
        console.warn("Missing coordinates for distance calculation");
        return 0;
      }

      console.log("📍 Calculating distance between:", {
        pickup: pickupCoords,
        destination: destinationCoords
      });

      const distance = calculateDirectDistance(
        pickupCoords.lat,
        pickupCoords.lng,
        destinationCoords.lat,
        destinationCoords.lng
      );

      console.log(`📍 Final distance: ${distance.toFixed(2)}km`);
      return distance;
    } catch (error) {
      console.error("Error calculating route distance:", error);
      return 0;
    }
  };

  const outOfCity = () => {
    Alert.alert(`${translateData.outOfCity}`, `${translateData.outOfCityDes}`);
    setProceedLoading(false);
  };

  const insideCity = () => {
    Alert.alert(
      `${translateData.insideCity}`,
      `${translateData.insideCityDes}`,
    );
    setProceedLoading(false);
  };

  const rideBooking = async () => {
    let token: any = "";
    await getValue("token").then(function (value) {
      token = value;
    });
    if (token) {
      if (destination && destination.trim().length > 0) {
        let suggestion = {
          shortAddress: destination.trim(),
          detailAddress: destination.trim(),
        };
        try {
          const stored: any = await getValue("locations");
          let storedLocations = JSON.parse(stored) || [];

          const alreadyExists = storedLocations.some(
            loc =>
              loc.shortAddress.trim().toLowerCase() ===
              suggestion.shortAddress.trim().toLowerCase(),
          );

          if (!alreadyExists) {
            storedLocations.push(suggestion);
            if (storedLocations.length > 5) {
              storedLocations.shift();
            }
          }
        } catch (error) {
          console.error("Error handling locations:", error);
        }
      }

      if (!destination || !pickupLocation) {
        setModalVisible(true);
      } else {
        coordsData();
      }
    } else {
      let screenName = "LocationDrop";
      setValue("CountinueScreen", screenName);
      replace("SignIn");
    }
  };

  const gotoBook = async () => {
    if (isProcessing) return;

    setProceedLoading(true);
    setIsProcessing(true);

    try {
      if (
        !pickupCoords?.lat ||
        !pickupCoords?.lng ||
        !destinationCoords?.lat ||
        !destinationCoords?.lng
      ) {
        console.warn(
          "Invalid or missing coordinates. Please select valid locations.",
        );
        setProceedLoading(false);
        setIsProcessing(false);
        return;
      }

      const isSchedule =
        ["schedule", "schedule-parcel", "schedule-freight"].includes(
          service_category_slug,
        ) || field === "schedule";

      if (isSchedule) {
        if (!scheduleDate?.DateValue || !scheduleDate?.TimeValue) {
          setProceedLoading(false);
          setDateError(true);
          return;
        } else {
          setDateError(false);
        }
      }

      // Calculate distance between pickup and destination
      console.log("📍 Starting distance calculation...");
      const distance = await calculateRouteDistance();

      console.log(`📍 Final calculated distance: ${distance.toFixed(2)}km, Min radius: ${minRadiusKm}km`);

      if (
        ["intercity", "intercity-freight", "intercity-parcel"].includes(
          service_category_slug,
        )
      ) {
        distance < minRadiusKm ? insideCity() : rideBooking();
      } else if (
        ["ride", "ride-freight", "ride-parcel"].includes(service_category_slug)
      ) {
        distance > minRadiusKm ? outOfCity() : rideBooking();
      } else if (
        ["schedule", "package", "schedule-freight", "schedule-parcel"].includes(
          service_category_slug,
        )
      ) {
        rideBooking();
      }
    } catch (error) {
      console.error("Error in gotoBook:", error);
      setProceedLoading(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const gotoNext = () => {
    getVehicleTypes();
  };

  const gotoSelection = () => {
    navigate("LocationSelect", {
      field: activeField,
      screenValue: "Ride",
      service_ID: service_ID,
      service_name: service_name,
      service_category_ID: service_category_ID,
      service_category_slug: service_category_slug,
      formattedDate: formattedDate,
      formattedTime: formattedTime,
    });
  };

  const gotoSaveLocation = async () => {
    let token = "";
    await getValue("token").then(function (value) {
      token = value;
    });

    if (token) {
      navigate("SavedLocation", {
        selectedLocation: "locationDrop",
        savefield: activeField,
        service_ID: service_ID,
        service_name: service_name,
        service_category_ID: service_category_ID,
        service_category_slug: service_category_slug,
        formattedDate: formattedDate,
        formattedTime: formattedTime,
      });
    } else {
      let screenName = "LocationDrop";
      if (settingData?.values?.activation?.login_number == 1) {
        setValue("CountinueScreen", screenName);
        replace("SignIn");
      } else if (settingData?.values?.activation?.login_number == 0) {
        setValue("CountinueScreen", screenName);
        replace("SignInWithMail");
      } else {
        replace("SignIn");
      }
    }
  };

  useEffect(() => {
    if (fieldValue === "pickupLocation") {
      setPickupLocation(selectedAddress);
      setPickupCoords({ lat: pinLatitude, lng: pinLongitude });
    } else if (fieldValue === "destination") {
      setDestination(selectedAddress);
      setDestinationCoords({ lat: pinLatitude, lng: pinLongitude });
    } else if (fieldValue && fieldValue.startsWith("stop-")) {
      const stopIndex = parseInt(fieldValue.split("-")[1], 10) - 1;
      const updatedStops = [...stops];
      updatedStops[stopIndex] = selectedAddress;
      setStops(updatedStops);
    }
  }, [selectedAddress, fieldValue, pinLatitude, pinLongitude]);

  const renderItemRecentData = ({ item: suggestion, index }) => {
    return (
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.renderItemRecentView}>
          <TouchableOpacity
            activeOpacity={0.7}
            key={index}
            style={[styles.historyBtn, { flexDirection: viewRTLStyle }]}
            onPress={() => handleRecentClick(suggestion?.destinationFullAddress)}>
            <View
              style={[
                styles.historyView,
                {
                  backgroundColor: isDark
                    ? appColors.darkBorder
                    : appColors.lightGray,
                },
              ]}>
              <History />
            </View>
            <View>
              <Text
                style={[
                  styles.locationText,
                  { color: textColorStyle },
                  { textAlign: textRTLStyle },
                ]}>
                {suggestion?.destinationFullAddress?.shortAddress?.length > 30
                  ? `${suggestion?.destinationFullAddress?.shortAddress.slice(
                    0,
                    30,
                  )}...`
                  : suggestion?.destinationFullAddress?.shortAddress}
              </Text>
              <Text
                style={[
                  styles.titleTextDetail,
                  {
                    textAlign: textRTLStyle,
                    marginHorizontal: windowWidth(10),
                  },
                ]}>
                {suggestion?.destinationFullAddress?.detailAddress?.length > 30
                  ? `${suggestion?.destinationFullAddress?.detailAddress.slice(
                    0,
                    30,
                  )}...`
                  : suggestion?.destinationFullAddress?.detailAddress}
              </Text>
            </View>
          </TouchableOpacity>
          {index !== recentDatas.length - 1 && (
            <View
              style={[
                styles.bottomLine,
                {
                  borderColor: isDark
                    ? appColors.darkBorder
                    : appColors.lightGray,
                },
              ]}
            />
          )}
        </View>
      </TouchableWithoutFeedback>
    );
  };

  const addStop = () => {
    if (stops.length < 3) {
      setStops(prevStops => [...prevStops, ""]);
    }
  };

  const removeStop = index => {
    const updatedStops = stops.filter((_, i) => i !== index);
    setStops(updatedStops);

    if (updatedStops.length === 0) {
      setActiveField("destination");
    } else if (index === stops.length - 1) {
      setActiveField(`stop-${updatedStops.length}`);
    }
  };

  const handleInputChange = (text: any, id: number) => {
    if (id === 1) {
      setPickupLocation(text);
    } else if (id === 2) {
      setDestination(text);
    } else {
      const updatedStops = stops?.map((stop, index) =>
        index + 3 === id ? text : stop,
      );
      setStops(updatedStops);
    }
  };

  const handleFocus = id => {
    if (id === 1) {
      setActiveField("pickupLocation");
    } else if (id === 2) {
      setActiveField("destination");
      setIsdesFocused(true);
    } else {
      setActiveField(`stop-${id - 2}`);
    }
  };

  const handleBlur = () => {
    setActiveField(null);
  };

  const handleCloseStop = index => {
    const updatedStops = [...stops];
    updatedStops[index] = "";
    setStops(updatedStops);
    setIsProcessing(false);
  };

  const handleClosepickup = () => {
    setPickupLocation("");
    setIsProcessing(false);
  };

  const handleCloseDestination = () => {
    setDestination("");
  };

  const handlePress = () => {
    if (pickupRef.current) {
      pickupRef.current.focus();
    }
  };

  useEffect(() => {
    if (destinationCoords) {
      gotoBook();
    }
  }, [destinationCoords]);

  const closeModel = () => {
    setModalVisible(false);
    setProceedLoading(false);
  }

  const renderSuggestionItem = ({ item: suggestion, index }) => {
    const displayDistance = suggestion?.distanceKm || 0;
    const isMiles = taxidoSettingData?.taxido_values?.ride?.distance_unit?.toLowerCase() === "mile";
    const convertedDistance = isMiles ? displayDistance * 0.621371 : displayDistance;
    const distanceText = convertedDistance > 0 ? convertedDistance.toFixed(1) : "0.0";
    const unitText = taxidoSettingData?.taxido_values?.ride?.distance_unit || "km";

    return (
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={[
            styles.suggestionsView,
            { flexDirection: viewRTLStyle },
          ]}
          onPress={() => handleSuggestionClick(suggestion)}
        >
          <View
            style={[
              styles.addressMArker,
              {
                backgroundColor: isDark
                  ? appColors.bgDark
                  : appColors.lightGray,
              },
            ]}
          >
            <AddressMarker />
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: "90%",
              marginHorizontal: windowWidth(5)
            }}
          >
            <View style={{ flex: 1 }}>
              <View
                style={[
                  { flexDirection: viewRTLStyle },
                  styles.spaceing,
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.titleText,
                      {
                        color: textColorStyle,
                        textAlign: textRTLStyle,
                      },
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {suggestion?.shortAddress}
                  </Text>
                  <Text
                    style={[
                      styles.titleTextDetail,
                      { textAlign: textRTLStyle },
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {suggestion?.detailAddress}
                  </Text>
                </View>
              </View>

              {index !== suggestions.length - 1 ? (
                <View style={{ alignSelf: "center" }}>
                  <SolidLine color={bgFullLayout} />
                </View>
              ) : null}
            </View>

            <View
              style={{
                justifyContent: "center",
                alignItems: "flex-end",
                marginLeft: windowWidth(10),
                minWidth: windowWidth(80),
              }}
            >
              <Text
                style={{
                  fontFamily: appFonts.medium,
                  color: appColors.primary,
                  textAlign: isRTL ? "left" : "right",
                  fontSize: 14,
                }}
              >
                {/* {distanceText} {unitText} */}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.main}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          style={[styles.main, { backgroundColor: linearColorStyle }]}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          <View>
            <Header
              value={translateData.location}
              backgroundColor={
                isDark ? appColors.darkPrimary : appColors.whiteColor
              }
            />
            <View
              style={[
                styles.horizontalView,
                {
                  backgroundColor: isDark
                    ? appColors.darkPrimary
                    : appColors.whiteColor,
                },
              ]}>
              <View style={styles.pickupdetailsView}>
                <View
                  style={[
                    styles.containers,
                    {
                      backgroundColor: isDark
                        ? appColors.darkPrimary
                        : appColors.lightGray,
                      borderColor: isDark
                        ? appColors.darkBorder
                        : appColors.border,
                    },
                  ]}>
                  <View>
                    <Pressable onPress={handlePress}>
                      <View
                        style={[
                          styles.inputContainer,
                          { flexDirection: viewRTLStyle },
                        ]}>
                        <View
                          style={[
                            styles.iconContainer,
                            {
                              backgroundColor: isDark
                                ? appColors.darkPrimary
                                : appColors.lightGray,
                            },
                          ]}>
                          <Gps width={20} height={20} />
                        </View>
                        <TouchableOpacity
                          onPress={handlePress}
                          style={{ flex: 1, zIndex: 3 }}>
                          <View
                            style={[
                              styles.inputWithIcons,
                              { flexDirection: viewRTLStyle },
                            ]}>
                            <TextInput
                              ref={pickupRef}
                              style={[
                                styles.input,
                                {
                                  color: isDark
                                    ? appColors.whiteColor
                                    : appColors.primaryText,
                                },
                                { textAlign: textRTLStyle },
                              ]}
                              placeholderTextColor={
                                isDark
                                  ? appColors.darkText
                                  : appColors.regularText
                              }
                              placeholder={translateData.pickupLocationTittle}
                              value={pickupLocation}
                              onChangeText={text => {
                                handleInputChange(text, 1);
                                setWasAutoFilled(false);
                              }}
                              onFocus={() => {
                                handleFocus(1);
                              }}
                              onBlur={() => {
                                handleBlur();
                              }}
                            />
                          </View>
                        </TouchableOpacity>
                        {pickupLocation?.length >= 1 && (
                          <TouchableOpacity
                            onPress={handleClosepickup}
                            activeOpacity={0.7}>
                            <Close />
                          </TouchableOpacity>
                        )}
                      </View>
                    </Pressable>
                    <View
                      style={{
                        borderColor: isDark
                          ? appColors.darkBorder
                          : appColors.border,
                        borderBottomWidth: windowHeight(0.3),
                        width: "86%",
                        marginHorizontal: isRTL
                          ? windowHeight(8)
                          : windowHeight(29),
                      }}
                    />
                    <View
                      style={[
                        styles.line2,
                        {
                          borderColor: isDark
                            ? appColors.regularText
                            : appColors.blackColor,
                        },
                        { left: isRTL ? "96%" : windowHeight(9.9) },
                      ]}
                    />
                    {stops?.map((stop, index) => (
                      <View
                        key={index + 3}
                        style={[
                          styles.inputContainer,
                          index === stops.length - 1 ? {} : { marginBottom: 8 },
                          { flexDirection: viewRTLStyle },
                        ]}>
                        <View style={styles.iconContainer}>
                          <View
                            style={[
                              styles.numberContainer,
                              {
                                backgroundColor: isDark
                                  ? appColors.whiteColor
                                  : appColors.blackColor,
                              },
                            ]}>
                            <Text
                              style={[
                                styles.numberText,
                                {
                                  color: isDark
                                    ? appColors.blackColor
                                    : appColors.whiteColor,
                                },
                              ]}>
                              {index + 1}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.inputWithIcons}>
                          <TouchableOpacity
                            onPress={handlePress}
                            style={{
                              flex: 1,
                              zIndex: 3,
                              width: windowWidth(250),
                            }}>
                            <TextInput
                              style={[
                                styles.input,
                                {
                                  color: isDark
                                    ? appColors.whiteColor
                                    : appColors.primaryText,
                                },
                                { textAlign: textRTLStyle },
                                {
                                  left: isRTL
                                    ? windowHeight(55)
                                    : windowHeight(0),
                                },

                                index === stops.length - 1
                                  ? {}
                                  : {
                                    borderBottomWidth: windowHeight(0.9),
                                    borderBottomColor: isDark
                                      ? appColors.darkBorder
                                      : appColors.border,
                                  },
                                { textAlign: textRTLStyle },
                                {
                                  borderColor: isDark
                                    ? appColors.darkBorder
                                    : appColors.border,
                                },
                              ]}
                              placeholderTextColor={
                                isDark
                                  ? appColors.darkText
                                  : appColors.regularText
                              }
                              placeholder={
                                translateData.addStopPlaceHolderText
                              }
                              value={stop}
                              onChangeText={text =>
                                handleInputChange(text, index + 3)
                              }
                              onFocus={() => {
                                handleFocus(index + 3);
                              }}
                              onBlur={handleBlur}
                              onPress={handlePress}
                            />
                          </TouchableOpacity>
                          <View
                            style={[
                              styles.addButton,
                              { flexDirection: viewRTLStyle },
                              { right: isRTL ? "85%" : windowHeight(6) },
                            ]}>
                            {stops[index]?.trim() !== "" && (
                              <TouchableOpacity
                                onPress={() => handleCloseStop(index)}
                                activeOpacity={0.7}>
                                <Close />
                              </TouchableOpacity>
                            )}
                            {index === stops.length - 1 && (
                              <>
                                <View style={styles.iconSpacing} />
                                <TouchableOpacity
                                  onPress={() => removeStop(index)}
                                  activeOpacity={0.7}>
                                  <Minus
                                    colors={textColorStyle}
                                    width={20}
                                    height={20}
                                  />
                                </TouchableOpacity>
                              </>
                            )
                            }
                          </View >
                        </View >
                        {
                          index < stops.length && (
                            <View
                              style={[
                                styles.line,
                                { borderColor: appColors.regularText },
                                { left: isRTL ? "96%" : 12 },
                              ]}
                            />
                          )
                        }
                      </View >
                    ))}

                    <View
                      style={[
                        styles.inputContainer,
                        { flexDirection: viewRTLStyle },
                      ]}>
                      <View
                        style={[
                          styles.iconContainer,
                          {
                            backgroundColor: isDark
                              ? appColors.darkPrimary
                              : appColors.lightGray,
                          },
                        ]}>
                        <PickLocation width={20} height={20} />
                      </View>
                      <View style={styles.inputWithIcons}>
                        <TouchableOpacity
                          onPress={handlePress}
                          style={{
                            flex: 1,
                            zIndex: 3,
                            width: windowWidth(280),
                          }}>
                          <View style={styles.inputWidth}>
                            <TextInput
                              ref={destinationRef}
                              style={[
                                styles.input,
                                {
                                  color: isDark
                                    ? appColors.whiteColor
                                    : appColors.primaryText,
                                },
                                { textAlign: textRTLStyle },
                                {
                                  left: isRTL
                                    ? windowHeight(55)
                                    : windowHeight(0),
                                },
                              ]}
                              placeholderTextColor={
                                isDark
                                  ? appColors.darkText
                                  : appColors.regularText
                              }
                              placeholder={
                                translateData.enterDestinationPlaceholderText
                              }
                              value={destination}
                              onChangeText={text =>
                                handleInputChange(text, 2)
                              }
                              onFocus={() => {
                                handleFocus(2);
                              }}
                              onPress={handlePress}
                              onBlur={handleBlur}
                            />
                          </View>
                        </TouchableOpacity>
                        <View
                          style={[
                            styles.addButton,
                            { flexDirection: viewRTLStyle },
                            { right: isRTL ? "85%" : windowHeight(6) },
                          ]}>
                          {destination?.length >= 1 && (
                            <TouchableOpacity
                              onPress={handleCloseDestination}
                              activeOpacity={0.7}>
                              <Close />
                            </TouchableOpacity>
                          )}
                          {stops.length < 3 && (
                            <>
                              <View style={styles.iconSpacing} />
                              <TouchableOpacity
                                onPress={addStop}
                                activeOpacity={0.7}>
                                <Add
                                  colors={textColorStyle}
                                  width={20}
                                  height={20}
                                />
                              </TouchableOpacity>
                            </>
                          )}
                        </View >
                      </View >
                    </View >
                  </View >
                </View >
              </View >
              {(service_category_slug === "schedule" ||
                field === "schedule" ||
                service_category_slug === "schedule-parcel" ||
                service_category_slug === "schedule-freight") && (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() =>
                      navigate("Calander", {
                        fieldValue: "Ride",
                        service_ID: service_ID,
                        service_name: service_name,
                        categoryId: service_category_ID,
                        service_category_slug: service_category_slug,
                        DateValue: formattedDate,
                        TimeValue: formattedTime,
                      })
                    }>
                    <InputText
                      borderColor={
                        isDark ? appColors.darkBorder : appColors.border
                      }
                      backgroundColor={
                        isDark ? appColors.darkPrimary : appColors.lightGray
                      }
                      placeholder={translateData.DateandTextTime}
                      rightIcon={<Calender />}
                      onPress={() =>
                        navigate("Calander", {
                          fieldValue: "Ride",
                          service_ID: service_ID,
                          service_name: service_name,
                          categoryId: service_category_ID,
                          service_category_slug: service_category_slug,
                          DateValue: formattedDate,
                          TimeValue: formattedTime,
                        })
                      }
                      editable={false}
                      value={`${DateValue || "Date"} ${TimeValue || "and Time"
                        }`}
                      warningText={dateError ? "Please Enter Date" : ""}
                    />
                  </TouchableOpacity>
                )}
              <View
                style={[
                  external.fd_row,
                  external.js_space,
                  { flexDirection: viewRTLStyle },
                ]}>
                <TouchableOpacity
                  onPress={gotoSelection}
                  activeOpacity={0.7}
                  style={[
                    styles.locationBtn,
                    {
                      backgroundColor: isDark
                        ? appColors.lightPrimary
                        : appColors.selectPrimary,
                    },
                    { flexDirection: viewRTLStyle },
                  ]}>
                  <View style={external.mh_5}>
                    <PickLocation />
                  </View>
                  <Text
                    style={[
                      styles.locationBtnText,
                      {
                        color: isDark
                          ? appColors.whiteColor
                          : appColors.blackColor,
                      },
                    ]}>
                    {translateData?.locateonmap}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={gotoSaveLocation}
                  activeOpacity={0.7}
                  style={[
                    styles.locationBtn,
                    { backgroundColor: appColors.primary },
                    { flexDirection: viewRTLStyle },
                  ]}>
                  <View style={external.mh_5}>
                    <Save />
                  </View>
                  <Text
                    style={[
                      styles.locationBtnText,
                      { color: appColors.whiteColor },
                    ]}>
                    {translateData?.savedLocation}
                  </Text>
                </TouchableOpacity>
              </View>
              {
                visible && (
                  <Animated.View
                    style={[styles.bar, { transform: [{ translateX }] }]}
                  />
                )
              }
            </View >
          </View >
          <View
            style={{ marginTop: windowHeight(35), bottom: windowHeight(20) }}>
            {(service_category_slug === "intercity" ||
              service_category_slug === "schedule") && (
                <View style={styles.viewContainerToll}>
                  <Driving />
                  <Text style={styles.fareStyle}>{translateData.note}</Text>
                </View>
              )}
          </View>
          <View
            style={[
              styles.recentView,
              {
                height: windowHeight(320),
                backgroundColor: isDark
                  ? appColors.bgDark
                  : appColors.lightGray,
              },
              { bottom: windowHeight(22) },
            ]}>
            <Text
              style={[
                commonStyles.mediumText23,
                { color: textColorStyle, textAlign: textRTLStyle },
              ]}>
              {fieldLength >= 3 && suggestions.length > 0
                ? translateData.addressSuggestion
                : "Recent Search"}
            </Text>
            <View
              style={[
                styles.mapView,
                {
                  backgroundColor: isDark
                    ? appColors.darkPrimary
                    : appColors.whiteColor,
                },
                {
                  borderColor: isDark
                    ? appColors.darkBorder
                    : appColors.border,
                },
              ]}>
              {suggestions.length > 0 ? (
                <FlatList
                  data={suggestions}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderSuggestionItem}
                  keyboardShouldPersistTaps="always"
                />
              ) : Array.isArray(recentDatas) && recentDatas.length > 0 ? (
                <FlatList
                  data={recentDatas}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={renderItemRecentData}
                  keyboardShouldPersistTaps="always"
                />
              ) : (
                <View style={styles.addressItemView}>
                  <Text
                    style={[
                      styles.noAddressText,
                      {
                        color: textColorStyle,
                      },
                    ]}>
                    {translateData.noAddressFound}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: 16,
              backgroundColor: isDark
                ? appColors.darkPrimary
                : appColors.whiteColor,
              borderTopWidth: 1,
              borderColor: isDark ? appColors.darkBorder : appColors.border,
            }}>
            <Button
              title={translateData.proceed}
              onPress={gotoBook}
              disabled={isProcessing}
              loading={proceedLoading}
            />
          </View>
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={closeModel}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalText}>
                  {translateData.bookingNote}
                </Text>
                <Button
                  title={translateData.close}
                  onPress={closeModel}
                />
              </View>
            </View>
          </Modal>
        </ScrollView >
      </TouchableWithoutFeedback >
    </KeyboardAvoidingView >
  );
}