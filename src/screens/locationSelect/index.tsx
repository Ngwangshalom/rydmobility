import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert } from "react-native";
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from "@react-navigation/native";
import { Back, AddressMarker } from "@src/utils/icons";
import { appColors } from "@src/themes";
import Images from "@utils/images";
import styles from "./styles";
import { useValues } from "@src/utils/context/index";
import { external } from "@src/styles/externalStyle";
import { useSelector } from "react-redux";
import { setValue } from "@src/utils/localstorage";
import useSmartLocation from "@src/components/helper/locationHelper";

// Define route params interface
interface RouteParams {
  field?: string;
  screenValue?: string;
  service_ID?: string;
  service_name?: string;
  service_category_ID?: string;
  service_category_slug?: string;
  formattedDate?: string;
  formattedTime?: string;
}

// Memoized components to prevent unnecessary re-renders
const BackButton = React.memo(({ onPress, isDark }: { onPress: () => void; isDark: boolean }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.backView, { backgroundColor: isDark ? appColors.darkPrimary : appColors.whiteColor }]}
  >
    <Back />
  </TouchableOpacity>
));

const MapPointer = React.memo(({ pinImage }: { pinImage: any }) => (
  <View style={styles.pointerMarker} pointerEvents="none">
    <Image source={pinImage} style={styles.pinImage} />
  </View>
));

const AddressInput = React.memo(({
  fetchingAddress,
  currentAddress,
  isDark,
  viewRTLStyle,
}: {
  fetchingAddress: boolean;
  currentAddress: string;
  isDark: boolean;
  viewRTLStyle: "row" | "row-reverse";
}) => (
  <View style={[styles.textInputContainer, { backgroundColor: isDark ? appColors.darkPrimary : appColors.whiteColor, flexDirection: viewRTLStyle }]}>
    <View style={[styles.addressBtnView, { backgroundColor: isDark ? appColors.bgDark : appColors.lightGray }]}>
      <AddressMarker />
    </View>
    <TextInput
      style={[styles.textInput, { color: isDark ? appColors.whiteColor : appColors.blackColor }]}
      value={fetchingAddress ? "Locating..." : currentAddress || "Move map to select location"}
      editable={false}
      multiline
    />
  </View>
));

const ConfirmButton = React.memo(({
  onPress,
  fetchingAddress,
  loadingMap,
  currentAddress,
  translateData
}: {
  onPress: () => void;
  fetchingAddress: boolean;
  loadingMap: boolean;
  currentAddress: string;
  translateData: any;
}) => (
  <TouchableOpacity
    style={styles.confirmButton}
    onPress={onPress}
    disabled={fetchingAddress || loadingMap || !currentAddress}
    activeOpacity={0.8}
  >
    {fetchingAddress ? (
      <ActivityIndicator size="large" color={appColors.whiteColor} />
    ) : (
      <Text style={styles.confirmText}>{translateData.confirmLocation || "Confirm Location"}</Text>
    )}
  </TouchableOpacity>
));

export function LocationSelect() {
  const { isDark, viewRTLStyle } = useValues();
  const webViewRef = useRef<WebView>(null);
  const navigation = useNavigation();
  const route = useRoute();
  const { field, screenValue, service_ID, service_name, service_category_ID, service_category_slug, formattedDate, formattedTime } = (route.params || {}) as RouteParams;
  const { currentLatitude, currentLongitude } = useSmartLocation();
  const [initialCoords, setInitialCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mapCenterCoords, setMapCenterCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [currentAddress, setCurrentAddress] = useState("");
  const [loadingMap, setLoadingMap] = useState(true);
  const [fetchingAddress, setFetchingAddress] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { translateData } = useSelector((state: any) => state.setting);

  // Headers for OSM Nominatim API
  const NOMINATIM_HEADERS = {
    'User-Agent': 'Ryd/1.0',
    'Accept': 'application/json',
    'Accept-Language': 'en',
  };

  useEffect(() => {
    const lat = currentLatitude;
    const lon = currentLongitude;

    if (lat && lon) {
      const coords = { latitude: lat, longitude: lon };
      setInitialCoords(coords);
      setMapCenterCoords(coords);
      setLoadingMap(false);
    } else {
      console.warn("No initial location found.");
      setLoadingMap(false);
    }
  }, [currentLatitude, currentLongitude]);

  // OSM Nominatim-based address fetching
  const fetchAddress = useCallback(async (lat: number, lng: number) => {
    setFetchingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          method: 'GET',
          headers: NOMINATIM_HEADERS
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.display_name) {
        const address = data.display_name;
        setCurrentAddress(address);
      } else {
        console.warn("[fetchAddress] OSM Nominatim returned no address data");
        setCurrentAddress("Could not find address for this location.");
      }

    } catch (error) {
      console.error("[fetchAddress] Failed to fetch address from OSM:", error);
      setCurrentAddress("Failed to connect to address service.");
    } finally {
      setFetchingAddress(false);
    }
  }, []);

  useEffect(() => {
    if (mapCenterCoords) {
      if (debounceTimerRef?.current) clearTimeout(debounceTimerRef?.current);

      debounceTimerRef.current = setTimeout(() => {
        fetchAddress(mapCenterCoords?.latitude, mapCenterCoords?.longitude);
      }, 800);
    }
    return () => {
      if (debounceTimerRef?.current) clearTimeout(debounceTimerRef?.current);
    };
  }, [mapCenterCoords, fetchAddress]);

  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event?.nativeEvent?.data);
      if (data?.type === 'mapMove') {
        const { lat, lng } = data?.payload;
        setMapCenterCoords({ latitude: lat, longitude: lng });
      }
    } catch (error) {
      console.error("Error parsing WebView message:", error);
    }
  }, []);

  const handleConfirmLocation = useCallback(async () => {
    if (!currentAddress || !mapCenterCoords || fetchingAddress) {
      Alert.alert(
        translateData.locationNotReady || "Location Not Ready", 
        translateData.locationDescription || "Please wait while we fetch the address or select a valid location."
      );
      return;
    }
    
    if (screenValue === "HomeScreen") {
      await setValue('user_latitude_Selected', mapCenterCoords?.latitude.toString());
      await setValue('user_longitude_Selected', mapCenterCoords?.longitude.toString());
      (navigation as any).replace("MyTabs");
      return;
    }
    
    (navigation as any).navigate(screenValue, {
      selectedAddress: currentAddress,
      fieldValue: field,
      pinLatitude: mapCenterCoords?.latitude,
      pinLongitude: mapCenterCoords?.longitude,
      service_ID,
      service_name,
      service_category_ID,
      service_category_slug,
      formattedDate,
      formattedTime,
    });
  }, [currentAddress, mapCenterCoords, fetchingAddress, screenValue, field, navigation, service_ID, service_name, service_category_ID, service_category_slug, formattedDate, formattedTime, translateData]);

  const getMapHTML = useCallback((coords: { latitude: number; longitude: number }, isDark: boolean) => {
    const darkTileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    const lightTileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const tileUrl = isDark ? darkTileUrl : lightTileUrl;

    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
          <style>
            body, html, #map {
              margin: 0;
              padding: 0;
              height: 100%;
              width: 100%;
              background-color: ${isDark ? appColors.blackColor : appColors.whiteColor};
              overflow: hidden;
            }
            .leaflet-control-container {
              display: none;
            }
          </style>
      </head>
      <body>
          <div id="map"></div>
          <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
          <script>
              function initMap() {
                  const map = L.map('map', {
                      center: [${coords?.latitude}, ${coords?.longitude}],
                      zoom: 16,
                      zoomControl: false,
                      dragging: true,
                      scrollWheelZoom: false,
                      doubleClickZoom: true,
                      boxZoom: false,
                      keyboard: false,
                      tap: false,
                      touchZoom: true
                  });

                  L.tileLayer('${tileUrl}', {
                      attribution: '© OpenStreetMap contributors',
                      maxZoom: 19,
                      minZoom: 1
                  }).addTo(map);

                  // Throttle moveend events to prevent too many messages
                  let moveEndTimeout;
                  map.on('moveend', function() {
                      if (moveEndTimeout) clearTimeout(moveEndTimeout);
                      moveEndTimeout = setTimeout(function() {
                          const center = map.getCenter();
                          const message = {
                              type: 'mapMove',
                              payload: { 
                                  lat: center.lat, 
                                  lng: center.lng 
                              }
                          };
                          if (window.ReactNativeWebView) {
                              window.ReactNativeWebView.postMessage(JSON.stringify(message));
                          }
                      }, 100);
                  });

                  // Also capture drag events for smoother updates
                  map.on('drag', function() {
                      const center = map.getCenter();
                      const message = {
                          type: 'mapMove',
                          payload: { 
                              lat: center.lat, 
                              lng: center.lng 
                          }
                      };
                      if (window.ReactNativeWebView) {
                          window.ReactNativeWebView.postMessage(JSON.stringify(message));
                      }
                  });
              }
              
              // Initialize map when DOM is loaded
              document.addEventListener('DOMContentLoaded', initMap);
          </script>
      </body>
      </html>
    `;
  }, []);

  // Memoize the WebView source to prevent unnecessary reloads
  const webViewSource = useMemo(() => {
    return initialCoords ? { html: getMapHTML(initialCoords, isDark) } : { html: '' };
  }, [initialCoords, getMapHTML, isDark]);

  // Memoize loading state component
  const loadingComponent = useMemo(() => (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" color={appColors.primary} />
      <Text style={[styles.loadingText, { color: isDark ? appColors.whiteColor : appColors.blackColor }]}>
        Loading Map...
      </Text>
    </View>
  ), [isDark]);

  return (
    <View style={[external.main, { backgroundColor: isDark ? appColors.blackColor : appColors.whiteColor }]}>
      <BackButton onPress={() => navigation.goBack()} isDark={isDark} />

      {loadingMap ? (
        loadingComponent
      ) : initialCoords ? (
        <>
          <WebView
            ref={webViewRef}
            style={styles.mapView}
            source={webViewSource}
            onMessage={handleWebViewMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            originWhitelist={['*']}
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            startInLoadingState={true}
            renderLoading={() => loadingComponent}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('WebView error:', nativeEvent);
            }}
          />
          <MapPointer pinImage={Images.pin} />
        </>
      ) : (
        loadingComponent
      )}

      <AddressInput
        fetchingAddress={fetchingAddress}
        currentAddress={currentAddress}
        isDark={isDark}
        viewRTLStyle={viewRTLStyle}
      />

      <ConfirmButton
        onPress={handleConfirmLocation}
        fetchingAddress={fetchingAddress}
        loadingMap={loadingMap}
        currentAddress={currentAddress}
        translateData={translateData}
      />
    </View>
  );
}