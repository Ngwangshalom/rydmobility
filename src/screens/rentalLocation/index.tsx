import React, { useState, useEffect, useContext, useRef } from "react";
import { Text, TouchableOpacity, View, ScrollView, Modal, FlatList, Keyboard, TextInput } from "react-native";
import { History, Calender, AddressMarker, Save, PickLocation } from "@utils/icons";
import { styles } from "./style";
import { commonStyles } from "../../styles/commonStyle";
import { external } from "../../styles/externalStyle";
import { SolidLine, Button, Header, InputText } from "@src/commonComponent";
import { useValues } from "@src/utils/context/index";
import { useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { userZone } from "../../api/store/actions/index";
import { vehicleTypeDataGet } from "../../api/store/actions/vehicleTypeAction";
import { appColors, windowHeight } from "@src/themes";
import { getValue, setValue } from "@src/utils/localstorage";
import { windowWidth } from "@src/themes";
import { useAppNavigation } from "@src/utils/navigation";
import { LocationContext } from "@src/utils/locationContext";
import useStoredLocation from "@src/components/helper/useStoredLocation";

export function RentalLocation() {
  const dispatch = useDispatch();
  const { navigate, replace } = useAppNavigation();
  const [selectedCal, setSelectedCal] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [destination, setDestination] = useState<string>("");
  const [stops, setStops] = useState<string[]>([]);
  const [pickupLocation, setPickupLocation] = useState<string>("");
  const route = useRoute();
  const { ScreenValue } = route.params || {};
  const { service_ID, service_category_ID, service_name, service_category_slug, formattedDate, formattedTime } = route.params;
  const { selectedAddress, fieldValue } = route.params || {};
  const [fieldLength, setFieldLength] = useState<number>(0);
  const [addressData, setAddressData] = useState<string>("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isInitialFetchDone, setIsInitialFetchDone] = useState(false);
  const { zoneValue } = useSelector((state) => state.zone);
  const [recentDatas, setRecentDatas] = useState<string[]>([]);
  const { translateData, settingData } = useSelector((state) => state.setting);
  const context = useContext(LocationContext);
  const { latitude, longitude } = useStoredLocation();
  const { linearColorStyleTwo, linearColorStyle, viewRTLStyle, textColorStyle, bgFullLayout, textRTLStyle, isDark } = useValues();
  const [pickupCoords, setPickupCoords] = useState<{latitude: number, longitude: number} | null>(null);
  const { pickupLocationLocal, setPickupLocationLocal } = context;
  const pickupRef = useRef<TextInput>(null);

  useEffect(() => {
    fetchAddressFromCoords(latitude, longitude);
  }, [latitude, longitude]);

  // OSM Reverse Geocoding (coordinates to address)
  const fetchAddressFromCoords = async (lat: number, lon: number) => {
    if (!lat || !lon) return;

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Ryd/1.0 (mail@rydmobbility.com)',
          'Accept-Language': 'en'
        }
      });
      const json = await response.json();

      if (json.display_name) {
        const addressComponents = json.address;
        
        // Extract address parts from OSM response
        const road = addressComponents?.road || "";
        const suburb = addressComponents?.suburb || "";
        const city = addressComponents?.city || addressComponents?.town || "";
        const shortAddress = [road, suburb, city].filter(Boolean).join(', ');
        const fullAddress = json.display_name;
        const locationToSet = shortAddress || fullAddress;

        // Set state utama
        setPickupLocation(locationToSet);
        setPickupCoords({ latitude: lat, longitude: lon });
      }
    } catch (error) {
      console.error("Error fetching address from OSM:", error);
    }
  };

  useEffect(() => {
    if (pickupLocation) {
      setPickupLocationLocal(pickupLocation);
    }
  }, [pickupLocation]);

  useEffect(() => {
    if (fieldValue === "pickupLocation" && selectedAddress) {
      setPickupLocation(selectedAddress);
    } else if (fieldValue === "destination") {
      setDestination(selectedAddress);
    } else if (fieldValue && fieldValue.startsWith("stop-")) {
      const stopIndex = parseInt(fieldValue.split("-")[1], 10) - 1;
      const updatedStops = [...stops];
      updatedStops[stopIndex] = selectedAddress;
      setStops(updatedStops);
    }
  }, [selectedAddress, fieldValue]);

  useEffect(() => {
    if (pickupLocation) convertToCoords(pickupLocation, setPickupCoords);
  }, [pickupLocation]);

  // OSM Forward Geocoding (address to coordinates)
  const convertToCoords = async (address: string, setter: Function) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&addressdetails=1&limit=1`,
        {
          headers: {
            'User-Agent': 'Ryd/1.0 (mail@rydmobbility.com)',
            'Accept-Language': 'en'
          }
        }
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setter({ latitude: parseFloat(lat), longitude: parseFloat(lon) });
      } else {
        console.warn("No results for:", address);
        setter(null);
      }
    } catch (err) {
      console.error("Geocoding error from OSM:", err);
      setter(null);
    }
  };

  useEffect(() => {
    const fetchRecentData = async () => {
      const stored = await getValue("locations");
      if (stored) {
        const parsedLocations = JSON.parse(stored);
        setRecentDatas(parsedLocations);
      }
    };
    fetchRecentData();
  }, []);

  // OSM Address Autocomplete
  const fetchAddressSuggestions = async (input: string) => {
    if (input?.length >= 3) {
      const apiUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}&addressdetails=1&limit=5`;
      try {
        const response = await fetch(apiUrl, {
          headers: {
            'User-Agent': 'Ryd/1.0 (mail@rydmobbility.com)',
            'Accept-Language': 'en'
          }
        });
        const data = await response.json();

        if (data && data.length > 0) {
          const places = data.map((item: any) => ({
            id: item.place_id,
            shortAddress: item.display_name.split(',')[0], // First part of address
            detailAddress: item.display_name,
            lat: item.lat,
            lon: item.lon,
            osmData: item
          }));
          setSuggestions(places);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error("Error fetching address suggestions from OSM:", error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    Keyboard.dismiss();
    const addressToUse = suggestion.shortAddress || suggestion.detailAddress;
    
    if (activeField === "pickupLocation") {
      setPickupLocation(addressToUse);
      if (suggestion.lat && suggestion.lon) {
        setPickupCoords({
          latitude: parseFloat(suggestion.lat),
          longitude: parseFloat(suggestion.lon)
        });
      }
    } else if (activeField === "destination") {
      setDestination(addressToUse);
    } else if (activeField && activeField.startsWith("stop-")) {
      const stopIndex = parseInt(activeField.split("-")[1], 10) - 1;
      const updatedStops = [...stops];
      updatedStops[stopIndex] = addressToUse;
      setStops(updatedStops);
    }
  };

  useEffect(() => {
    fetchAddressSuggestions(addressData);
  }, [addressData]);

  useEffect(() => {
    let length = 0;
    let addressDataValue = "";

    if (activeField === "pickupLocation") {
      length = pickupLocation?.length;
      addressDataValue = pickupLocation;
    } else if (activeField === "destination") {
      length = destination?.length;
      addressDataValue = destination;
    } else if (activeField && activeField.startsWith("stop-")) {
      const stopIndex = parseInt(activeField.split("-")[1], 10) - 1;
      const stopData = stops[stopIndex];
      if (stopData !== undefined) {
        length = stopData?.length;
        addressDataValue = stopData;
      }
    }
    setAddressData(addressDataValue);
    setFieldLength(length);
  }, [activeField, stops, pickupLocation, destination]);

  const coordsData = async () => {
    const geocodeAddress = async (address: string) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&addressdetails=1&limit=1`,
          {
            headers: {
              'User-Agent': 'Ryd/1.0 (mail@rydmobbility.com)',
              'Accept-Language': 'en'
            }
          }
        );
        const dataMap = await response.json();
        if (dataMap && dataMap.length > 0) {
          const location = dataMap[0];
          return {
            latitude: parseFloat(location.lat),
            longitude: parseFloat(location.lon),
          };
        }
      } catch (error) {
        console.error("Error geocoding address with OSM:", error);
      }
      return null;
    };

    const fetchCoordinates = async () => {
      try {
        const pickup = await geocodeAddress(pickupLocation);
        if (pickup?.latitude && pickup?.longitude) {
          dispatch(userZone({ lat: pickup.latitude, lng: pickup.longitude }));
          getVehicleTypes(pickup.latitude, pickup.longitude);
          setIsInitialFetchDone(true);
        }
      } catch (error) {
        console.error("Error fetching coordinates:", error);
      }
    };

    fetchCoordinates();
  };

  const getVehicleTypes = (lat: number, lng: number) => {
    const payload = {
      locations: [
        {
          lat: lat,
          lng: lng,
        },
      ],
      service_id: service_ID.toString(),
      service_category_id: service_category_ID.toString(),
    };
    dispatch(vehicleTypeDataGet(payload)).then(res => {
      // Handle response if needed
    });
  };

  useEffect(() => {
    if (zoneValue && isInitialFetchDone) {
      gotoNext();
    }
  }, [zoneValue, isInitialFetchDone]);

  const gotoBook = async () => {
    const token = await getValue('token');
    if (!token) {
      navigate('SignIn');
    }

    setLoading(true);
    if (pickupLocation?.length <= 0) {
      setModalVisible(true);
    } else {
      coordsData();
    }
  };

  const gotoNext = () => {
    setLoading(false);
    navigate("Rental", {
      pickupLocation,
      service_ID,
      service_category_ID,
      zoneValue,
      pickupCoords
    });
  };

  const gotoSelection = () => {
    Keyboard.dismiss();
    navigate("LocationSelect", { 
      field: activeField, 
      screenValue: "RentalLocation", 
      service_ID: service_ID, 
      service_name: service_name, 
      service_category_ID: service_category_ID, 
      service_category_slug: service_category_slug, 
      formattedDate: formattedDate, 
      formattedTime: formattedTime 
    });
  };

  const handlerecentClick = (suggestion: any) => {
    Keyboard.dismiss();
    if (activeField === "pickupLocation") {
      setPickupLocation(suggestion.location || suggestion);
    } else if (activeField === "destination") {
      setDestination(suggestion.location || suggestion);
    } else if (activeField && activeField.startsWith("stop-")) {
      const stopIndex = parseInt(activeField.split("-")[1], 10) - 1;
      const updatedStops = [...stops];
      updatedStops[stopIndex] = suggestion.location || suggestion;
      setStops(updatedStops);
    }
  };

  const modelOpen = () => {
    setModalVisible(false);
    setLoading(false);
  };

  const handleInputChange = (text: string, id: number) => {
    if (id === 1) {
      setPickupLocationLocal(text);
      setPickupLocation(text);
    }
  };

  const handleFocus = (id: number) => {
    if (id === 1) {
      setActiveField('pickupLocation');
    }
  };

  const gotoSaveLocation = async () => {
    let token = "";
    await getValue("token").then(function (value) {
      token = value;
    });
    if (token) {
      navigate("SavedLocation", { 
        selectedLocation: "RentalLocation", 
        savefield: activeField, 
        service_ID: service_ID, 
        service_name: service_name, 
        service_category_ID: service_category_ID, 
        service_category_slug: service_category_slug, 
        formattedDate: formattedDate, 
        formattedTime: formattedTime 
      });
    } else {
      let screenName = "RentalLocation";
      if (settingData.values.activation.login_number == 1) {
        setValue("CountinueScreen", screenName);
        replace("SignIn");
      } else if (settingData.values.activation.login_number == 0) {
        setValue("CountinueScreen", screenName);
        replace("SignInWithMail");
      }
    }
  };

  const renderItemRecentData = ({ item: suggestion, index }: {item: any, index: number}) => (
    <View style={{ paddingHorizontal: windowWidth(15) }}>
      <TouchableOpacity
        activeOpacity={0.7}
        key={index}
        style={{
          height: windowHeight(50),
          flexDirection: viewRTLStyle,
          alignItems: "center",
        }}
        onPress={() => handlerecentClick(suggestion)}
      >
        <View
          style={[
            styles.historyBtn,
            {
              backgroundColor: isDark
                ? appColors.darkBorder
                : appColors.lightGray,
            },
          ]}
        >
          <History />
        </View>
        <Text
          style={[
            styles.locationText1,
            { color: isDark ? appColors.whiteColor : appColors.primaryText },
            { textAlign: textRTLStyle },
          ]}
        >
          {suggestion.location || suggestion}
        </Text>
      </TouchableOpacity>
      {index !== recentDatas?.length - 1 && (
        <View
          style={[
            styles.bottomLine,
            {
              borderColor: isDark ? appColors.darkBorder : appColors.lightGray,
            },
          ]}
        />
      )}
    </View>
  );

  return (
    <ScrollView
      style={[external.fx_1, { backgroundColor: linearColorStyle }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Header
        value={translateData.location}
        backgroundColor={isDark ? appColors.colorBg : appColors.whiteColor}
      />
      {ScreenValue === "Schedule" && (
        <View
          style={[
            styles.dateTimeView,
            {
              backgroundColor: linearColorStyleTwo,
            },
          ]}
        >
          <InputText
            title={translateData.dateAndTime}
            backgroundColor={linearColorStyleTwo}
            placeholder={translateData.selectDateTime}
            rightIcon={<Calender />}
            onPress={() => setSelectedCal(true)}
          />
        </View>
      )}
      <View
        style={[
          styles.horizontalView,
          {
            backgroundColor: isDark ? appColors.colorBg : appColors.whiteColor,
          },
        ]}
      >

        <View style={[styles.containerSearch, { backgroundColor: isDark ? appColors.colorBg : appColors.lightGray }, { borderColor: isDark ? appColors.darkBorder : appColors.border }]}>
          <View style={[styles.inputContainer, { flexDirection: viewRTLStyle }]}>
            <View style={styles.iconContainer}>
              <PickLocation width={20} height={20} />
            </View>
            <View style={styles.inputWithIcons}>
              <TextInput
                ref={pickupRef}
                style={[styles.input, { color: isDark ? appColors.whiteColor : appColors.primaryText }]}
                placeholderTextColor={isDark ? appColors.darkText : appColors.regularText}
                placeholder={translateData.pickupLocation}
                value={pickupLocationLocal}
                onChangeText={(text) => handleInputChange(text, 1)}
                onFocus={() => handleFocus(1)}
              />
            </View>
          </View>
        </View>
        <View
          style={[
            styles.locateOnMapView,
            {
              flexDirection: viewRTLStyle,
            },
          ]}
        >
          <TouchableOpacity
            onPress={gotoSelection}
            activeOpacity={0.7}
            style={[
              styles.pickBtn,
              { flexDirection: viewRTLStyle },
              {
                backgroundColor: isDark
                  ? appColors.lightPrimary
                  : appColors.selectPrimary,
              },
            ]}
          >
            <View style={external.mh_5}>
              <PickLocation />
            </View>
            <Text style={[styles.locationText, { color: textColorStyle }]}>
              {translateData.locateonmap}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={gotoSaveLocation}
            activeOpacity={0.7}
            style={[styles.saveBtn, { flexDirection: viewRTLStyle }]}
          >
            <View style={external.mh_5}>
              <Save />
            </View>
            <Text style={styles.saveText}>{translateData.savedLocation}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.recentView, { backgroundColor: linearColorStyle }]}>
        <Text
          style={[
            commonStyles.mediumText23,
            { color: textColorStyle, textAlign: textRTLStyle },
          ]}
        >
          {fieldLength >= 3 ? translateData.addressSuggestionText : translateData.recentTextAddress}
        </Text>
        <View
          style={[
            styles.mapView,
            {
              backgroundColor: isDark
                ? appColors.darkPrimary
                : appColors.whiteColor,
            },
            { borderColor: isDark ? appColors.darkBorder : appColors.border },
          ]}
        >
          {suggestions?.length > 0 ? (
            suggestions?.map((suggestion, index) => (
              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.addressBtn, { flexDirection: viewRTLStyle }]}
                key={index}
                onPress={() => handleSuggestionClick(suggestion)}
              >
                <View
                  style={[
                    styles.addressView,
                    {
                      backgroundColor: isDark
                        ? appColors.bgDark
                        : appColors.lightGray,
                    },
                  ]}
                >
                  <AddressMarker />
                </View>
                <View>
                  <View
                    style={[
                      { flexDirection: viewRTLStyle },
                      styles.spaceing,
                    ]}
                  >
                    <View>
                      <Text
                        style={[
                          styles.titleText,
                          {
                            color: textColorStyle,
                            textAlign: textRTLStyle,
                          },
                        ]}
                      >
                        {suggestion?.shortAddress}
                      </Text>
                      <Text
                        style={[
                          styles.titleTextDetail,
                          {
                            textAlign: textRTLStyle,
                          },
                        ]}
                      >
                        {suggestion?.detailAddress}
                      </Text>
                    </View>
                  </View>
                  {index !== suggestions?.length - 1 ? (
                    <View style={external.mh_10}>
                      <SolidLine color={bgFullLayout} />
                    </View>
                  ) : null}
                </View>
              </TouchableOpacity>
            ))
          ) : Array.isArray(recentDatas) && recentDatas?.length > 0 ? (
            <FlatList
              data={recentDatas}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderItemRecentData}
            />
          ) : (
            <Text style={[styles.noDataText, { color: textColorStyle }]}>
              {translateData.nodataFound}
            </Text>
          )}
        </View>
        <View style={[external.mv_15]}>
          <Button title={translateData.proceed} onPress={gotoBook} loading={loading} />
        </View>
      </View>
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>{translateData.enterPickupLocation}</Text>
            <Button title={translateData.close} onPress={modelOpen} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}``