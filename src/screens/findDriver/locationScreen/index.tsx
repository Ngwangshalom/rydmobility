import React, { useEffect, useRef, useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  TextInput,
} from "react-native";
import {
  AddressMarker,
  History,
  Save,
  Back,
  Target,
  Calender,
  PickLocation,
  Gps,
} from "@utils/icons";
import { Button, CommonModal } from "@src/commonComponent";
import {
  appColors,
  windowWidth,
  appFonts,
  windowHeight,
  fontSizes,
} from "@src/themes";
import { styles } from "./styles";
import { useValues } from "@src/utils/context";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getValue, setValue } from "@src/utils/localstorage";
import { useAppNavigation } from "@src/utils/navigation";
import { Calendar } from "react-native-calendars";
import DropDownPicker from "react-native-dropdown-picker";
import { ArrowDownSmall, ArrowUpSmall } from "@src/utils/icons";
import { AppDispatch } from "@src/api/store";
import {
  findDriverAction,
  vehicleTypeDataGetAction,
} from "@src/api/store/actions/finddriverAction";
import { notificationHelper } from "@src/commonComponent/notificationHelper";
import useSmartLocation from "@src/components/helper/locationHelper";

export function FindLocationScreen() {
  const { isDark, textRTLStyle, viewRTLStyle, textColorStyle, Google_Map_Key } =
    useValues();

  const route = useRoute<any>();
  const {
    defultAddress,
    defultCoords,
    tripType,
    service_name,
    sub_category_name,
    service_ID,
    service_category_ID,
    destination: paramDestination,
    destinationCoords: paramDestinationCoords,
  } = route.params || {};
  const { navigate, replace }: any = useAppNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { translateData, settingData } = useSelector(
    (state: any) => state.setting,
  );
  const { loading: findLoader } = useSelector((state: any) => state.finddriver);
  const { currentLatitude, currentLongitude } = useSmartLocation();
  const navigation = useNavigation();
  const [activeField, setActiveField] = useState<
    "pickup" | "destination" | null
  >(null);
  const [pickupLocation, setPickupLocation] = useState(defultAddress || "");
  const [destination, setDestination] = useState(paramDestination || "");
  const [recentDatas, setRecentDatas] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [pickupCoords, setPickupCoords] = useState<any>(
    defultCoords
      ? {
        lat: defultCoords.lat || defultCoords.latitude,
        lng: defultCoords.lng || defultCoords.longitude,
      }
      : null,
  );
  const [destinationCoords, setDestinationCoords] = useState<any>(
    paramDestinationCoords
      ? {
        lat: paramDestinationCoords.lat || paramDestinationCoords.latitude,
        lng: paramDestinationCoords.lng || paramDestinationCoords.longitude,
      }
      : null,
  );
  const [gearType, setGearType] = useState("Automatic");
  const [startDate, setStartDate] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [pickerDate, setPickerDate] = useState(
    (() => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
        2,
        "0",
      )}-${String(now.getDate()).padStart(2, "0")}`;
    })(),
  );
  const [pickerTime, setPickerTime] = useState({
    hour: "10",
    minute: "00",
    ampm: "AM",
  });
  const [endDate, setEndDate] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [startDateISO, setStartDateISO] = useState<string | null>(null);
  const [endDateISO, setEndDateISO] = useState<string | null>(null);
  const [pickingType, setPickingType] = useState<"start" | "end">("start");
  const [startTimeMinutes, setStartTimeMinutes] = useState<number | null>(null);
  const [endTimeMinutes, setEndTimeMinutes] = useState<number | null>(null);
  const [tripTypeSelection, setTripTypeSelection] = useState("One Way");
  const [openTripType, setOpenTripType] = useState(false);
  const [tripTypeItems] = useState([
    { label: "One Way", value: "One Way" },
    { label: "Round Trip", value: "Round Trip" },
  ]);

  const [openMonth, setOpenMonth] = useState(false);
  const [openYear, setOpenYear] = useState(false);
  const [months] = useState([
    { label: "January", value: 0 },
    { label: "February", value: 1 },
    { label: "March", value: 2 },
    { label: "April", value: 3 },
    { label: "May", value: 4 },
    { label: "June", value: 5 },
    { label: "July", value: 6 },
    { label: "August", value: 7 },
    { label: "September", value: 8 },
    { label: "October", value: 9 },
    { label: "November", value: 10 },
    { label: "December", value: 11 },
  ]);
  const [years] = useState(
    Array.from({ length: 10 }, (_, i) => ({
      label: (new Date().getFullYear() + i).toString(),
      value: new Date().getFullYear() + i,
    })),
  );
  const { vehicleTypedata } = useSelector((state: any) => state.vehicleType);
  const [openGear, setOpenGear] = useState(false);
  const [gearItems] = useState([
    { label: "Automatic", value: "Automatic" },
    { label: "Manual", value: "Manual" },
  ]);

  const [openVehicle, setOpenVehicle] = useState(false);
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleItems, setVehicleItems] = useState<any[]>([]);

  const fetchVehicleTypes = () => {
    dispatch(vehicleTypeDataGetAction(service_ID || 5));
  };

  useEffect(() => {
    fetchVehicleTypes();
  }, [service_ID]);

  const fetchAddressFromCoords = async (latitude: any, longitude: any) => {
    if (!latitude || !longitude) return;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${Google_Map_Key}`;
    try {
      const response = await fetch(url);
      const json = await response.json();
      if (json.status === "OK" && json?.results?.length > 0) {
        const fullAddress = json.results[0]?.formatted_address;
        const targetField = activeField || "pickup";
        if (targetField === "pickup") {
          setPickupLocation(fullAddress);
          setPickupCoords({ lat: latitude, lng: longitude });
        } else {
          setDestination(fullAddress);
          setDestinationCoords({ lat: latitude, lng: longitude });
        }
      }
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };

  const gotoSelection = () => {
    navigate("LocationSelect", {
      field: activeField || "pickup",
      screenValue: "FindLocationScreen",
      service_ID: service_ID,
      service_name: service_name,
      service_category_ID: service_category_ID,
      service_category_slug: route.params?.service_category_slug,
    });
  };

  useEffect(() => {
    const { selectedAddress, fieldValue, pinLatitude, pinLongitude } =
      route.params || {};
    if (selectedAddress) {
      if (fieldValue === "pickup") {
        setPickupLocation(selectedAddress);
        setPickupCoords({ lat: pinLatitude, lng: pinLongitude });
      } else if (fieldValue === "destination") {
        setDestination(selectedAddress);
        setDestinationCoords({ lat: pinLatitude, lng: pinLongitude });
      }
    }
  }, [route.params?.selectedAddress]);

  const searchTimeout = useRef<any>(null);

  useEffect(() => {
    loadRecent();
  }, []);

  useEffect(() => {
    // Check if vehicleTypedata itself is the array or if it's in a .data property
    const dataArray = Array.isArray(vehicleTypedata)
      ? vehicleTypedata
      : vehicleTypedata?.data;

    if (Array.isArray(dataArray) && dataArray.length > 0) {
      const items = dataArray.map((item: any) => ({
        label: item.name,
        value: item.id.toString(),
      }));
      setVehicleItems(items);

      // Auto-select first item if none selected
      if (items.length > 0 && !vehicleType) {
        setVehicleType(items[0].value);
      }
    }
  }, [vehicleTypedata]);

  const loadRecent = async () => {
    try {
      const stored = await getValue("locations");
      if (stored) {
        let parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) {
          parsed = [];
        }

        // Normalize data structures from different screens
        const normalized = parsed
          .map((item: any) => {
            if (item?.destinationFullAddress) {
              // Structure from LocationDrop
              return {
                shortAddress:
                  item.destinationFullAddress.shortAddress ||
                  item.destinationFullAddress.detailAddress,
                detailAddress: item.destinationFullAddress.detailAddress,
                distance: item.distance || null,
                ...item,
              };
            }
            if (item?.location) {
              // Structure from RentalLocation
              return {
                shortAddress: item.location,
                detailAddress: item.location,
                distance: null,
                ...item,
              };
            }
            return item;
          })
          .filter((item: any) => item.shortAddress);

        setRecentDatas(normalized);
      }
    } catch (error) {
      console.error("Error loading recent locations:", error);
    }
  };

  const fetchAddressSuggestions = (query: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(async () => {
      if (!query || query.length < 3) {
        setSuggestions([]);
        return;
      }

      try {
        const origin = defultCoords
          ? `&origin=${defultCoords.lat},${defultCoords.lng}`
          : "";
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
            query,
          )}${origin}&key=${Google_Map_Key}`,
        );
        const json = await res.json();
        if (json?.status === "OK") {
          setSuggestions(
            json.predictions.map((item: any) => ({
              shortAddress: item.structured_formatting.main_text,
              detailAddress: item.structured_formatting.secondary_text,
              distance: item.distance_meters
                ? (item.distance_meters / 1000).toFixed(1) + " km"
                : null,
            })),
          );
        } else {
          setSuggestions([]);
        }
      } catch {
        setSuggestions([]);
      }
    }, 300);
  };

  const convertToCoords = async (address: string, setter: any) => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address,
        )}&key=${Google_Map_Key}`,
      );
      const json = await res.json();
      if (json?.status === "OK" && json?.results?.length > 0) {
        const { lat, lng } = json.results[0].geometry.location;
        setter({ lat, lng });
      } else {
        setter(null);
      }
    } catch {
      setter(null);
    }
  };

  const handleSuggestionClick = async (
    item: any,
    field: "pickup" | "destination" | null,
  ) => {
    if (!field) return;
    Keyboard.dismiss();
    setSuggestions([]);

    let stored: any[] = [];
    const value = await getValue("locations");
    if (value) {
      const parsed = JSON.parse(value);
      stored = Array.isArray(parsed) ? parsed : [];
    }

    const exists = stored.some(
      i => i.shortAddress?.toLowerCase() === item.shortAddress?.toLowerCase(),
    );

    if (!exists) {
      const universalItem = {
        ...item,
        location: item.shortAddress, // compatibility with RentalLocation
        destinationFullAddress: {
          shortAddress: item.shortAddress,
          detailAddress: item.detailAddress,
        },
      };
      stored.unshift(universalItem);
      if (stored.length > 5) stored.pop();
      await setValue("locations", JSON.stringify(stored));
      setRecentDatas(
        stored.map((it: any) => {
          // Just for immediate UI state update, ensure it's normalized
          return {
            shortAddress:
              it.shortAddress ||
              it.location ||
              (it.destinationFullAddress &&
                it.destinationFullAddress.shortAddress),
            detailAddress:
              it.detailAddress ||
              it.location ||
              (it.destinationFullAddress &&
                it.destinationFullAddress.detailAddress),
            ...it,
          };
        }),
      );
    }

    if (field === "pickup") {
      setPickupLocation(item.shortAddress);
      convertToCoords(item.detailAddress, setPickupCoords);
    }

    if (field === "destination") {
      setDestination(item.shortAddress);
      convertToCoords(item.detailAddress, setDestinationCoords);
    }

    setActiveField(null);
  };

  const renderRecentItem = ({ item, index }: any) => (
    <View key={index.toString()}>
      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.historyBtn, { flexDirection: viewRTLStyle }]}
        onPress={() => {
          Keyboard.dismiss();
          const targetField = activeField || "destination";
          if (targetField === "pickup") {
            setPickupLocation(item.shortAddress);
            convertToCoords(item.detailAddress, setPickupCoords);
          } else {
            setDestination(item.shortAddress);
            convertToCoords(item.detailAddress, setDestinationCoords);
          }
          setActiveField(null);
        }}
      >
        <View style={[styles.historyIconContainer]}>
          <History color={appColors.iconColor} />
        </View>

        <View style={styles.recentItemContent}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: "75%" }}>
              <Text
                numberOfLines={1}
                style={[
                  styles.recentItemTitle,
                  { color: textColorStyle, textAlign: textRTLStyle },
                ]}
              >
                {item.shortAddress}
              </Text>
            </View>
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              {item.distance && (
                <Text
                  style={[styles.distanceText, { textAlign: textRTLStyle }]}
                >
                  {item.distance}
                </Text>
              )}
            </View>
          </View>
          <Text
            numberOfLines={1}
            style={[styles.recentItemAddress, { textAlign: textRTLStyle }]}
          >
            {item.detailAddress?.length > 30
              ? item.detailAddress.substring(0, 30) + "..."
              : item.detailAddress}
          </Text>
        </View>
      </TouchableOpacity>
      {index !== recentDatas.length - 1 && (
        <View
          style={[
            styles.recentItemDivider,
            {
              backgroundColor: isDark ? appColors.darkBorder : appColors.border,
            },
          ]}
        />
      )}
    </View>
  );

  const gotoSaveLocation = async () => {
    let token = "";
    await getValue("token").then(function (value) {
      token = value;
    });

    if (token) {
      navigate("SavedLocation", {
        selectedLocation: "findLocationScreen",
        savefield: activeField || "pickup",
        service_ID: service_ID,
        service_name: service_name,
        service_category_ID: service_category_ID,
        service_category_slug: route.params?.service_category_slug || "",
        formattedDate: startDate,
        formattedTime: startTime,
      });
    } else {
      let screenName = "LocationDrop";
      if (settingData?.values?.activation?.login_number === 1) {
        setValue("CountinueScreen", screenName);
        replace("SignIn");
      } else if (settingData?.values?.activation?.login_number === 0) {
        setValue("CountinueScreen", screenName);
        replace("SignInWithMail");
      } else {
        replace("SignIn");
      }
    }
  };

  const gotoBook = async () => {
    const payload: any = {
      location_coordinates: [
        {
          lat: pickupCoords?.lat,
          lng: pickupCoords?.lng,
        },
        {
          lat: destinationCoords?.lat,
          lng: destinationCoords?.lng,
        },
      ],
      locations: [pickupLocation, destination],
      service_id: service_ID || 5,
      service_category_id: service_category_ID || 12,
      vehicle_type_id: vehicleType,
      gear_type: gearType.toLowerCase(),
    };
    if (startDate) payload.ride_date = startDate;
    if (startTime) payload.ride_time = startTime;
    if (endDate) payload.end_date = endDate;
    if (endTime) payload.end_time = endTime;

    const formatToApiTime = (
      dateIso: string | null,
      timeStr: string | null,
    ) => {
      if (!dateIso || !timeStr) return null;
      try {
        const [time, ampm] = timeStr.split(" ");
        let [hours, minutes] = time.split(":");
        let h = parseInt(hours);
        if (ampm === "PM" && h < 12) h += 12;
        if (ampm === "AM" && h === 12) h = 0;
        return `${dateIso} ${String(h).padStart(2, "0")}:${minutes}:00`;
      } catch (e) {
        return null;
      }
    };

    const apiStartTime = formatToApiTime(startDateISO, startTime);
    const apiEndTime = formatToApiTime(endDateISO, endTime);

    const findDriverPayload = {
      ...payload,
      start_time: apiStartTime || undefined,
      end_time: apiEndTime || undefined,
    };

    if (service_category_ID === 14 || service_category_ID === 15) {
      payload.trip_type_selection = tripTypeSelection;
      findDriverPayload.trip_type_selection = tripTypeSelection;
    }
    if (route.params?.county_slug) {
      payload.county_slug = route.params.county_slug;
      findDriverPayload.county_slug = route.params.county_slug;
    }
    const token = await getValue("token");

    dispatch(findDriverAction(findDriverPayload))
      .unwrap()
      .then(res => {
        if (res?.status === 200) {
          navigate("OneWayDaily", {
            payload,
            results: res?.data,
            sub_category_name,
          });
        } else {
          notificationHelper("", res?.data?.message, "error");
        }
      });
  };

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View
            style={{
              flex: 1,
              backgroundColor: isDark ? appColors.bgDark : appColors.lightGray,
            }}
          >
            <View
              style={[
                styles.headerMain,
                {
                  backgroundColor: isDark
                    ? appColors.bgDark
                    : appColors.whiteColor,
                },
              ]}
            >
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={[
                  styles.headerIcon,
                  {
                    borderColor: isDark
                      ? appColors.darkBorder
                      : appColors.border,
                    backgroundColor: isDark
                      ? appColors.darkPrimary
                      : appColors.whiteColor,
                  },
                ]}
              >
                <Back />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: textColorStyle }]}>
                {translateData?.findDriver}
              </Text>
              <View style={styles.headerRightIcons}>
                <TouchableOpacity
                  onPress={gotoSelection}
                  style={[styles.headerIcon, styles.targetIconView]}
                >
                  <Target color={appColors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={gotoSaveLocation}
                  style={[styles.headerIcon, styles.bookmarkIconView]}
                >
                  <Save stroke={appColors.whiteColor} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.horizontalView}>
                <View style={styles.pickupdetailsView}>
                  <View
                    style={[
                      styles.containers,
                      {
                        backgroundColor: isDark
                          ? appColors.darkPrimary
                          : appColors.whiteColor,
                        borderColor: isDark
                          ? appColors.darkBorder
                          : appColors.border,
                      },
                      { flexDirection: viewRTLStyle },
                    ]}
                  >
                    <TouchableOpacity
                      onPress={gotoSelection}
                      style={styles.dotLineContainer}
                    >
                      <PickLocation color={appColors.primary} />
                      <View style={styles.dashedLine} />
                      <Gps />
                    </TouchableOpacity>

                    <View
                      style={{ flex: 1, marginHorizontal: windowWidth(30) }}
                    >
                      <View
                        style={[
                          styles.inputContainer,
                          { flexDirection: viewRTLStyle },
                        ]}
                      >
                        <TextInput
                          style={[
                            styles.input,
                            {
                              color: textColorStyle,
                              textAlign: textRTLStyle,
                              marginTop: windowWidth(5),
                            },
                          ]}
                          placeholder={translateData.pickupLocationTittle}
                          placeholderTextColor={appColors.regularText}
                          value={pickupLocation?.substring(0, 40)}
                          onFocus={() => setActiveField("pickup")}
                          onChangeText={t => {
                            setPickupLocation(t);
                            fetchAddressSuggestions(t);
                            setPickupCoords(null);
                          }}
                        />
                      </View>

                      <View
                        style={[
                          styles.divider,
                          {
                            backgroundColor: isDark
                              ? appColors.darkBorder
                              : appColors.border,
                          },
                        ]}
                      />

                      <View
                        style={[
                          styles.inputContainer,
                          { flexDirection: viewRTLStyle },
                        ]}
                      >
                        <TextInput
                          style={[
                            styles.input,
                            { color: textColorStyle, textAlign: textRTLStyle },
                          ]}
                          placeholder={
                            tripType === "OneWay"
                              ? translateData.destination
                              : "Enter destination"
                          }
                          placeholderTextColor={appColors.regularText}
                          value={destination?.substring(0, 40)}
                          onFocus={() => setActiveField("destination")}
                          onChangeText={t => {
                            setDestination(t);
                            fetchAddressSuggestions(t);
                            setDestinationCoords(null);
                          }}
                        />
                      </View>
                    </View>
                  </View>
                </View>

                {service_category_ID === 1 || service_category_ID === 15 ? (
                  <View
                    style={[
                      styles.dateTimeCard,
                      {
                        backgroundColor: isDark
                          ? appColors.darkPrimary
                          : appColors.whiteColor,
                        borderColor: isDark
                          ? appColors.darkBorder
                          : appColors.border,
                      },
                    ]}
                  >
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {
                        setPickingType("start");
                        setPickerDate(
                          startDateISO ||
                          new Date().toISOString().split("T")[0],
                        );
                        setDateModalVisible(true);
                      }}
                      style={styles.dateTimeItem}
                    >
                      <Text style={[styles.label, { color: textColorStyle }]}>
                        Start Info
                      </Text>
                      <View style={styles.valueContainer}>
                        <Calender />
                        <Text
                          style={[
                            styles.valueText,
                            !startDate && { color: appColors.gray },
                          ]}
                        >
                          {startDate
                            ? `${startDate} ${startTime || ""}`
                            : "Select start"}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <View
                      style={[
                        styles.verticalDivider,
                        {
                          borderColor: isDark
                            ? appColors.darkBorder
                            : appColors.border,
                        },
                      ]}
                    />

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {
                        setPickingType("end");
                        setPickerDate(
                          endDateISO ||
                          startDateISO ||
                          new Date().toISOString().split("T")[0],
                        );
                        setDateModalVisible(true);
                      }}
                      style={styles.dateTimeItem}
                    >
                      <Text style={[styles.label, { color: textColorStyle }]}>
                        End Info
                      </Text>
                      <View style={styles.valueContainer}>
                        <Calender />
                        <Text
                          style={[
                            styles.valueText,
                            !endDate && { color: appColors.gray },
                          ]}
                        >
                          {endDate
                            ? `${endDate} ${endTime || ""}`
                            : "Select end"}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      setPickingType("start");
                      setPickerDate(
                        startDateISO || new Date().toISOString().split("T")[0],
                      );
                      setDateModalVisible(true);
                    }}
                    style={[
                      styles.dateTimeCard,
                      {
                        backgroundColor: isDark
                          ? appColors.darkPrimary
                          : appColors.whiteColor,
                        borderColor: isDark
                          ? appColors.darkBorder
                          : appColors.border,
                      },
                    ]}
                  >
                    <View style={styles.dateTimeItem}>
                      <Text style={[styles.label, { color: textColorStyle }]}>
                        {translateData?.selectDateTime}
                      </Text>
                      <View style={styles.valueContainer}>
                        <Calender />
                        <Text
                          style={[
                            styles.valueText,
                            !startDate && { color: appColors.gray },
                          ]}
                        >
                          {startDate
                            ? `${startDate} ${startTime || ""}`
                            : translateData?.dateAndTime}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}

                {(service_category_ID === 14 || service_category_ID === 15) && (
                  <View style={{ marginTop: windowHeight(15), zIndex: 2000 }}>
                    <Text
                      style={[
                        styles.gearTypeLabel,
                        { color: textColorStyle, marginTop: 0 },
                      ]}
                    >
                      Trip Type
                    </Text>
                    <DropDownPicker
                      open={openTripType}
                      value={tripTypeSelection}
                      items={tripTypeItems}
                      setOpen={setOpenTripType}
                      setValue={setTripTypeSelection}
                      style={[
                        styles.pickerDropdown,
                        {
                          backgroundColor: isDark
                            ? appColors.darkPrimary
                            : appColors.whiteColor,
                          borderColor: isDark
                            ? appColors.darkBorder
                            : appColors.border,
                        },
                      ]}
                      dropDownContainerStyle={[
                        styles.pickerDropdownContainer,
                        {
                          backgroundColor: isDark
                            ? appColors.darkPrimary
                            : appColors.whiteColor,
                          borderColor: isDark
                            ? appColors.darkBorder
                            : appColors.border,
                        },
                      ]}
                      textStyle={{ color: textColorStyle }}
                      tickIconStyle={{ tintColor: textColorStyle } as any}
                      ArrowDownIconComponent={() => (
                        <ArrowDownSmall color={textColorStyle} />
                      )}
                      ArrowUpIconComponent={() => (
                        <ArrowUpSmall color={textColorStyle} />
                      )}
                      zIndex={4000}
                    />
                  </View>
                )}

                <View
                  style={{
                    flexDirection: viewRTLStyle,
                    marginTop: windowHeight(5),
                    zIndex: 1000,
                  }}
                >
                  <View style={{ flex: 1, marginRight: windowWidth(10) }}>
                    <Text
                      style={[styles.gearTypeLabel, { color: textColorStyle }]}
                    >
                      {translateData?.gearType}
                    </Text>
                    <DropDownPicker
                      open={openGear}
                      value={gearType}
                      items={gearItems}
                      setOpen={setOpenGear}
                      setValue={setGearType}
                      style={[
                        styles.pickerDropdown,
                        {
                          backgroundColor: isDark
                            ? appColors.darkPrimary
                            : appColors.whiteColor,
                          borderColor: isDark
                            ? appColors.darkBorder
                            : appColors.border,
                        },
                      ]}
                      dropDownContainerStyle={[
                        styles.pickerDropdownContainer,
                        {
                          backgroundColor: isDark
                            ? appColors.darkPrimary
                            : appColors.whiteColor,
                          borderColor: isDark
                            ? appColors.darkBorder
                            : appColors.border,
                        },
                      ]}
                      textStyle={{ color: textColorStyle }}
                      tickIconStyle={{ tintColor: textColorStyle } as any}
                      ArrowDownIconComponent={() => (
                        <ArrowDownSmall color={textColorStyle} />
                      )}
                      ArrowUpIconComponent={() => (
                        <ArrowUpSmall color={textColorStyle} />
                      )}
                      zIndex={3000}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[styles.gearTypeLabel, { color: textColorStyle }]}
                    >
                      {translateData.vehicletype}
                    </Text>
                    <DropDownPicker
                      open={openVehicle}
                      value={vehicleType}
                      items={vehicleItems}
                      setOpen={setOpenVehicle}
                      setValue={setVehicleType}
                      style={[
                        styles.pickerDropdown,
                        {
                          backgroundColor: isDark
                            ? appColors.darkPrimary
                            : appColors.whiteColor,
                          borderColor: isDark
                            ? appColors.darkBorder
                            : appColors.border,
                        },
                      ]}
                      dropDownContainerStyle={[
                        styles.pickerDropdownContainer,
                        {
                          backgroundColor: isDark
                            ? appColors.darkPrimary
                            : appColors.whiteColor,
                          borderColor: isDark
                            ? appColors.darkBorder
                            : appColors.border,
                        },
                      ]}
                      textStyle={{ color: textColorStyle }}
                      tickIconStyle={{ tintColor: textColorStyle } as any}
                      ArrowDownIconComponent={() => (
                        <ArrowDownSmall color={textColorStyle} />
                      )}
                      ArrowUpIconComponent={() => (
                        <ArrowUpSmall color={textColorStyle} />
                      )}
                      zIndex={3000}
                    />
                  </View>
                </View>
              </View>

              <View
                style={[
                  styles.recentView,
                  {
                    backgroundColor: isDark
                      ? appColors.bgDark
                      : appColors.notificationColor,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.recentLabel,
                    { color: textColorStyle, textAlign: textRTLStyle },
                  ]}
                >
                  {suggestions.length > 0
                    ? translateData?.addressSuggestionText
                    : translateData?.recentAddresses}
                </Text>

                <View>
                  {suggestions.length > 0 ? (
                    <View
                      style={[
                        styles.suggestionsCard,
                        {
                          backgroundColor: isDark
                            ? appColors.bgDark
                            : appColors.whiteColor,
                          borderColor: isDark
                            ? appColors.darkBorder
                            : appColors.border,
                        },
                      ]}
                    >
                      {suggestions.map((item, index) => (
                        <View key={index.toString()}>
                          <TouchableOpacity
                            style={[
                              styles.suggestionsView,
                              { flexDirection: viewRTLStyle },
                            ]}
                            onPress={() =>
                              handleSuggestionClick(item, activeField)
                            }
                          >
                            <AddressMarker />
                            <View
                              style={{
                                marginHorizontal: windowWidth(10),
                                flex: 1,
                              }}
                            >
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                }}
                              >
                                <View style={{ width: "75%" }}>
                                  <Text
                                    numberOfLines={1}
                                    style={{
                                      color: textColorStyle,
                                      fontSize: fontSizes.FONT16,
                                      fontFamily: appFonts.bold,
                                    }}
                                  >
                                    {item.shortAddress}
                                  </Text>
                                </View>
                                <View
                                  style={{ flex: 1, alignItems: "flex-end" }}
                                >
                                  {item.distance && (
                                    <Text style={styles.distanceText}>
                                      {item.distance}
                                    </Text>
                                  )}
                                </View>
                              </View>
                              <Text
                                numberOfLines={1}
                                style={{
                                  color: appColors.regularText,
                                  fontFamily: appFonts.regular,
                                  fontSize: fontSizes.FONT15,
                                }}
                              >
                                {item.detailAddress?.length > 50
                                  ? item.detailAddress.substring(0, 50) + "..."
                                  : item.detailAddress}
                              </Text>
                            </View>
                          </TouchableOpacity>
                          {index !== suggestions.length - 1 && (
                            <View
                              style={[
                                styles.recentItemDivider,
                                {
                                  backgroundColor: isDark
                                    ? appColors.darkBorder
                                    : appColors.border,
                                },
                              ]}
                            />
                          )}
                        </View>
                      ))}
                    </View>
                  ) : recentDatas.length > 0 ? (
                    <View
                      style={[
                        styles.recentCardContainer,
                        {
                          backgroundColor: isDark
                            ? appColors.darkPrimary
                            : appColors.whiteColor,
                          borderColor: isDark
                            ? appColors.darkBorder
                            : appColors.border,
                        },
                      ]}
                    >
                      {recentDatas.map((item, index) =>
                        renderRecentItem({ item, index }),
                      )}
                    </View>
                  ) : (
                    <View style={styles.addressItemView}>
                      <Text
                        style={[
                          styles.noAddressText,
                          { color: textColorStyle },
                        ]}
                      >
                        {translateData.noAddressFound}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>

            <View
              style={{
                padding: 16,
                backgroundColor: isDark
                  ? appColors.darkPrimary
                  : appColors.whiteColor,
                borderTopWidth: 1,
                borderColor: isDark ? appColors.darkBorder : appColors.border,
              }}
            >
              <Button
                title={translateData.proceed}
                onPress={gotoBook}
                disabled={
                  !pickupLocation ||
                  !destination ||
                  !startDate ||
                  !pickupCoords?.lat ||
                  !pickupCoords?.lng ||
                  !destinationCoords?.lat ||
                  !destinationCoords?.lng ||
                  ((service_category_ID === 1 || service_category_ID === 15) &&
                    !endDate)
                }
                loading={findLoader}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      {dateModalVisible && (
        <CommonModal
          isVisible={dateModalVisible}
          onPress={() => setDateModalVisible(false)}
          paddingTop={windowHeight(150)}
          style={styles.width}
          stylesbg={styles.width}
          value={
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              <Text style={[styles.modalTitle, { color: textColorStyle }]}>
                {translateData?.titleDate}
              </Text>

              <Text
                style={[
                  styles.selectedDateTimeText,
                  { color: appColors.primary },
                ]}
              >
                {(() => {
                  const date = new Date(pickerDate);
                  const monthsNames = [
                    "JAN",
                    "FEB",
                    "MAR",
                    "APR",
                    "MAY",
                    "JUN",
                    "JUL",
                    "AUG",
                    "SEP",
                    "OCT",
                    "NOV",
                    "DEC",
                  ];
                  return `${date.getDate()} ${monthsNames[date.getMonth()]
                    } ${date.getFullYear()}, ${pickerTime.hour}:${pickerTime.minute
                    } ${pickerTime.ampm}`;
                })()}
              </Text>

              <View style={styles.pickerHeaderRow}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <DropDownPicker
                    open={openMonth}
                    value={new Date(pickerDate).getMonth()}
                    items={months}
                    setOpen={setOpenMonth}
                    setValue={callback => {
                      const val =
                        typeof callback === "function"
                          ? callback(new Date(pickerDate).getMonth())
                          : callback;
                      const d = new Date(pickerDate);
                      d.setMonth(val);
                      setPickerDate(d.toISOString().split("T")[0]);
                    }}
                    dropDownContainerStyle={[
                      styles.pickerDropdownContainer,
                      {
                        backgroundColor: isDark
                          ? appColors.darkPrimary
                          : appColors.whiteColor,
                        borderColor: isDark
                          ? appColors.darkBorder
                          : appColors.border,
                      },
                    ]}
                    style={[
                      styles.pickerDropdown,
                      {
                        backgroundColor: isDark
                          ? appColors.darkPrimary
                          : appColors.whiteColor,
                        borderColor: isDark
                          ? appColors.darkBorder
                          : appColors.border,
                      },
                    ]}
                    textStyle={{ color: textColorStyle }}
                    tickIconStyle={{ tintColor: textColorStyle } as any}
                    ArrowDownIconComponent={() => (
                      <ArrowDownSmall color={textColorStyle} />
                    )}
                    ArrowUpIconComponent={() => (
                      <ArrowUpSmall color={textColorStyle} />
                    )}
                    placeholder="Month"
                    zIndex={3000}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <DropDownPicker
                    open={openYear}
                    value={new Date(pickerDate).getFullYear()}
                    items={years}
                    setOpen={setOpenYear}
                    setValue={callback => {
                      const val =
                        typeof callback === "function"
                          ? callback(new Date(pickerDate).getFullYear())
                          : callback;
                      const d = new Date(pickerDate);
                      d.setFullYear(val);
                      setPickerDate(d.toISOString().split("T")[0]);
                    }}
                    dropDownContainerStyle={[
                      styles.pickerDropdownContainer,
                      {
                        backgroundColor: isDark
                          ? appColors.darkPrimary
                          : appColors.whiteColor,
                        borderColor: isDark
                          ? appColors.darkBorder
                          : appColors.border,
                      },
                    ]}
                    style={[
                      styles.pickerDropdown,
                      {
                        backgroundColor: isDark
                          ? appColors.darkPrimary
                          : appColors.whiteColor,
                        borderColor: isDark
                          ? appColors.darkBorder
                          : appColors.border,
                      },
                    ]}
                    textStyle={{ color: textColorStyle }}
                    tickIconStyle={{ tintColor: textColorStyle } as any}
                    ArrowDownIconComponent={() => (
                      <ArrowDownSmall color={textColorStyle} />
                    )}
                    ArrowUpIconComponent={() => (
                      <ArrowUpSmall color={textColorStyle} />
                    )}
                    placeholder="Year"
                    zIndex={2000}
                  />
                </View>
              </View>

              <Calendar
                current={pickerDate}
                minDate={
                  pickingType === "end" && startDateISO
                    ? startDateISO
                    : `${new Date().getFullYear()}-${String(
                      new Date().getMonth() + 1,
                    ).padStart(2, "0")}-${String(
                      new Date().getDate(),
                    ).padStart(2, "0")}`
                }
                onDayPress={day => {
                  const now = new Date();
                  const today = `${now.getFullYear()}-${String(
                    now.getMonth() + 1,
                  ).padStart(2, "0")}-${String(now.getDate()).padStart(
                    2,
                    "0",
                  )}`;
                  const min =
                    pickingType === "end" && startDateISO
                      ? startDateISO
                      : today;
                  if (day.dateString < min) {
                    notificationHelper(
                      "Error",
                      `You cannot select a date before ${min}`,
                      "error",
                    );
                    return;
                  }
                  setPickerDate(day.dateString);
                }}
                markedDates={{
                  [pickerDate]: {
                    selected: true,
                    selectedColor: appColors.primary,
                  },
                }}
                theme={{
                  calendarBackground: isDark
                    ? appColors.darkPrimary
                    : appColors.whiteColor,
                  textSectionTitleColor: isDark
                    ? appColors.whiteColor
                    : appColors.primaryText,
                  dayTextColor: isDark
                    ? appColors.whiteColor
                    : appColors.primaryText,
                  todayTextColor: appColors.primary,
                  arrowColor: appColors.primary,
                  monthTextColor: isDark
                    ? appColors.whiteColor
                    : appColors.primaryText,
                  selectedDayBackgroundColor: appColors.primary,
                  selectedDayTextColor: appColors.whiteColor,
                  textDisabledColor: isDark ? "#444" : "#D9E1E8",
                  dotColor: appColors.primary,
                  selectedDotColor: appColors.whiteColor,
                  textDayHeaderFontFamily: appFonts.medium,
                  textDayFontFamily: appFonts.regular,
                  textMonthFontFamily: appFonts.bold,
                }}
              />

              <View style={styles.timePickerContainer}>
                <View style={styles.timePickerBox}>
                  <TouchableOpacity
                    onPress={() => {
                      let h = parseInt(pickerTime.hour);
                      h = h > 1 ? h - 1 : 12;
                      setPickerTime({
                        ...pickerTime,
                        hour: h.toString().padStart(2, "0"),
                      });
                    }}
                  >
                    <ArrowUpSmall color={textColorStyle} />
                  </TouchableOpacity>
                  <Text
                    style={[styles.timePickerText, { color: textColorStyle }]}
                  >
                    {pickerTime.hour}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      let h = parseInt(pickerTime.hour);
                      h = h < 12 ? h + 1 : 1;
                      setPickerTime({
                        ...pickerTime,
                        hour: h.toString().padStart(2, "0"),
                      });
                    }}
                  >
                    <ArrowDownSmall color={textColorStyle} />
                  </TouchableOpacity>
                </View>
                <View style={styles.timePickerBox}>
                  <TouchableOpacity
                    onPress={() => {
                      let m = parseInt(pickerTime.minute);
                      m = m > 0 ? m - 1 : 59;
                      setPickerTime({
                        ...pickerTime,
                        minute: m.toString().padStart(2, "0"),
                      });
                    }}
                  >
                    <ArrowUpSmall />
                  </TouchableOpacity>
                  <Text style={styles.timePickerText}>{pickerTime.minute}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      let m = parseInt(pickerTime.minute);
                      m = m < 59 ? m + 1 : 0;
                      setPickerTime({
                        ...pickerTime,
                        minute: m.toString().padStart(2, "0"),
                      });
                    }}
                  >
                    <ArrowDownSmall />
                  </TouchableOpacity>
                </View>
                <View style={styles.timePickerBox}>
                  <TouchableOpacity
                    onPress={() =>
                      setPickerTime({
                        ...pickerTime,
                        ampm: pickerTime.ampm === "AM" ? "PM" : "AM",
                      })
                    }
                  >
                    <ArrowUpSmall />
                  </TouchableOpacity>
                  <Text style={styles.timePickerText}>{pickerTime.ampm}</Text>
                  <TouchableOpacity
                    onPress={() =>
                      setPickerTime({
                        ...pickerTime,
                        ampm: pickerTime.ampm === "AM" ? "PM" : "AM",
                      })
                    }
                  >
                    <ArrowDownSmall />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{ marginTop: 20 }}>
                <Button
                  title={translateData?.continue}
                  onPress={() => {
                    const dateObj = new Date(pickerDate);
                    const monthsShort = [
                      "Jan",
                      "Feb",
                      "Mar",
                      "Apr",
                      "May",
                      "Jun",
                      "Jul",
                      "Aug",
                      "Sep",
                      "Oct",
                      "Nov",
                      "Dec",
                    ];
                    const formattedDate = `${dateObj.getDate()} ${monthsShort[dateObj.getMonth()]
                      }'${dateObj.getFullYear()}`;
                    const formattedTime = `${pickerTime.hour}:${pickerTime.minute} ${pickerTime.ampm}`;
                    const getTimeInMinutes = (time: any) => {
                      let h = parseInt(time.hour);
                      const m = parseInt(time.minute);
                      if (time.ampm === "PM" && h !== 12) h += 12;
                      if (time.ampm === "AM" && h === 12) h = 0;
                      return h * 60 + m;
                    };

                    const selectedMinutes = getTimeInMinutes(pickerTime);

                    const now = new Date();
                    const todayStr = now.toISOString().split("T")[0];
                    if (pickerDate === todayStr) {
                      const nowMinutes = now.getHours() * 60 + now.getMinutes();
                      if (selectedMinutes <= nowMinutes) {
                        notificationHelper(
                          "Error",
                          translateData?.pastTimeNotAllowed ||
                          "Past time selection is not allowed",
                          "error",
                        );
                        return;
                      }
                    }

                    const todayISO = `${now.getFullYear()}-${String(
                      now.getMonth() + 1,
                    ).padStart(2, "0")}-${String(now.getDate()).padStart(
                      2,
                      "0",
                    )}`;
                    const nowMinutes = now.getHours() * 60 + now.getMinutes();

                    if (
                      pickerDate === todayISO &&
                      currentMinutes < nowMinutes
                    ) {
                      notificationHelper(
                        "Error",
                        "Cannot select past time",
                        "error",
                      );
                      return;
                    }

                    if (pickingType === "end" && startDateISO) {
                      if (pickerDate < startDateISO) {
                        notificationHelper(
                          "Error",
                          "End date cannot be before start date",
                          "error",
                        );
                        return;
                      }
                      if (
                        pickerDate === startDateISO &&
                        startTimeMinutes !== null &&
                        currentMinutes <= startTimeMinutes
                      ) {
                        notificationHelper(
                          "Error",
                          translateData.endTimevalidAfter,
                          "error",
                        );
                        return;
                      }
                    }

                    if (pickingType === "start" && endDateISO === pickerDate) {
                      if (
                        endTimeMinutes !== null &&
                        currentMinutes >= endTimeMinutes
                      ) {
                        notificationHelper(
                          "Error",
                          translateData.startTimevalidBefore,
                          "error",
                        );
                        return;
                      }
                    }

                    if (pickingType === "start") {
                      setStartDate(formattedDate);
                      setStartTime(formattedTime);
                      setStartDateISO(pickerDate);
                      setStartTimeMinutes(selectedMinutes);
                      if (endDateISO) {
                        if (
                          pickerDate > endDateISO ||
                          (pickerDate === endDateISO &&
                            endTimeMinutes !== null &&
                            currentMinutes >= endTimeMinutes)
                        ) {
                          setEndDate(null);
                          setEndDateISO(null);
                          setEndTime(null);
                          setEndTimeMinutes(null);
                        }
                      }
                    } else {
                      setEndDate(formattedDate);
                      setEndTime(formattedTime);
                      setEndDateISO(pickerDate);
                      setEndTimeMinutes(selectedMinutes);
                    }
                    setDateModalVisible(false);
                  }}
                />
              </View>
            </View>
          }
        />
      )}
    </>
  );
}
