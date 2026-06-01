import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  Alert, 
  StyleSheet, 
  Platform,
  KeyboardAvoidingView,
  ScrollView
} from "react-native";
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from "@react-navigation/native";
import darkMapStyle from "@src/screens/darkMapStyle";
import Images from "@src/utils/images";
import { useValues } from "@src/utils/context/index";;
import styles from "./styles";
import { Back, AddressMarker } from "@src/utils/icons";
import { appColors, appFonts, fontSizes, windowHeight, windowWidth } from "@src/themes";
import { Button } from "@src/commonComponent";
import { SaveLocationDataInterface } from "@src/api/interface/saveLocationinterface";
import { addSaveLocation, updateSaveLocation } from "@src/api/store/actions";
import { useDispatch, useSelector } from "react-redux";
import { userSaveLocation } from "@src/api/store/actions/saveLocationAction";
import { external } from "@src/styles/externalStyle";
import useStoredLocation from "@src/components/helper/useStoredLocation";
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';

interface RouteParams {
  mode?: string;
  locationID?: number;
  locationDetails?: {
    title?: string;
    type?: string;
    latitude?: number;
    longitude?: number;
  };
}

const BackButton = React.memo(({ onPress, linearColorStyle }: { onPress: () => void; linearColorStyle: string }) => (
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={onPress}
    style={[styles.backView, { backgroundColor: linearColorStyle }]}
  >
    <Back />
  </TouchableOpacity>
));

const AddressInput = React.memo(({
  fetchingAddress,
  currentAddress,
  translateData,
  linearColorStyle,
  textColorStyle,
  viewRTLStyle,
  isDark,
  darkBorder,
  primaryGray
}: any) => (
  <View style={[styles.textInputContainer, { backgroundColor: linearColorStyle }, { flexDirection: viewRTLStyle }]}>
    <View style={[styles.addressMarkerIcon, { backgroundColor: linearColorStyle }]}>
      <AddressMarker />
    </View>
    <View
      style={[styles.inputLine, {
        borderColor: isDark ? darkBorder : primaryGray,
      }]}
    />
    <TextInput
      style={[styles.textInput, { backgroundColor: linearColorStyle }, { color: textColorStyle }]}
      value={fetchingAddress ? translateData.gettingAddress : currentAddress || translateData.moveMapToSelectLocation}
      placeholder={translateData.searchHere}
      placeholderTextColor={textColorStyle}
      editable={false}
    />
  </View>
));

const ConfirmButton = React.memo(({
  onPress,
  fetchingAddress,
  loadingMap,
  translateData,
  whiteColor
}: any) => (
  <TouchableOpacity
    style={styles.confirmButton}
    onPress={onPress}
    activeOpacity={0.7}
    disabled={fetchingAddress || loadingMap}
  >
    {fetchingAddress ? (
      <ActivityIndicator size="large" color={whiteColor} />
    ) : (
      <Text style={styles.confirmText}>{translateData.confirmLocation}</Text>
    )}
  </TouchableOpacity>
));

const PinMarker = React.memo(({ pinImage }: { pinImage: any }) => (
  <View style={styles.pointerMarker}>
    <Image source={pinImage} style={styles.pinImage} />
  </View>
));

export function LocationSave() {
  const { isDark, linearColorStyle, textColorStyle, viewRTLStyle, textRTLStyle, Google_Map_Key, bgFullStyle } = useValues();
  const [currentAddress, setCurrentAddress] = useState("");
  const { goBack } = useNavigation();
  const route = useRoute();
  const { mode, locationID, locationDetails } = (route.params || {}) as RouteParams;
  const [locationTitle, setLocationTitle] = useState(locationDetails?.title || "");
  const dispatch = useDispatch();
  const { translateData, taxidoSettingData } = useSelector((state: any) => state.setting);
  const { latitude, longitude } = useStoredLocation();
  const webViewRef = useRef<WebView>(null);
  const [loadingMap, setLoadingMap] = useState(true);
  const [isLocationInitialized, setIsLocationInitialized] = useState(false);
  const [titleError, setTitleError] = useState('');
  const [mapCenterCoords, setMapCenterCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [fetchingAddress, setFetchingAddress] = useState(false);
  const [saveLoading, setsaveLoading] = useState(false);
  const saveLocationBottomSheetRef = useRef<BottomSheet>(null);
  const saveLocationSnapPoints = useMemo(() => ['1%', '50%', '85%'], []);
  // const mapType = taxidomaoTypeSettingData?.taxido_values?.location?.map_provider;
  const mapType = "osm";
  const textInputRef = useRef<TextInput>(null);

  // Memoize options to prevent re-creation on each render
  const options = useMemo(() => [
    { label: translateData.home, value: "home" },
    { label: translateData.work, value: "work" },
    { label: translateData.other, value: "other" },
  ], [translateData.home, translateData.work, translateData.other]);

  const validTypes = useMemo(() => options.map(opt => opt.value), [options]);

  const [selectedOption, setSelectedOption] = useState(() =>
    validTypes.includes(locationDetails?.type || "")
      ? locationDetails?.type || ""
      : options[0].value
  );

  // Memoize map HTML based on map provider
  const mapHtml = useMemo(() => {
    if (mapType === "osm") {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
          <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
          <style>
            html, body, #map { 
              height: 100%; 
              margin: 0; 
              padding: 0; 
              overflow: hidden;
            }
            ${isDark ? `
              body { 
                background-color: #000; 
              }
              .leaflet-layer {
                filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
              }
            ` : ''}
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
          <script>
            let map;
            let debounceTimer;

            function initMap() {
              const initialCoords = [${latitude || 21.1702}, ${longitude || 72.8311}];

              map = L.map('map', {
                center: initialCoords,
                zoom: 15,
                zoomControl: false,
                attributionControl: false
              });

              // Add tile layer based on theme
              const tileUrl = ${isDark ? 
                '"https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"' : 
                '"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"'
              };
              
              L.tileLayer(tileUrl, {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              }).addTo(map);

              // Listen to map move (no marker added for OSM)
              map.on('move', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                  const center = map.getCenter();
                  window.ReactNativeWebView.postMessage(JSON.stringify({ 
                    latitude: center.lat, 
                    longitude: center.lng 
                  }));
                }, 500);
              });

              // Initial position post
              window.ReactNativeWebView.postMessage(JSON.stringify({ 
                latitude: initialCoords[0], 
                longitude: initialCoords[1] 
              }));
            }

            // Initialize map when DOM is loaded
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', initMap);
            } else {
              initMap();
            }
          </script>
        </body>
        </html>
      `;
    } else {
      // Google Maps
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
          <style>
            html, body, #map { 
              height: 100%; 
              margin: 0; 
              padding: 0; 
              overflow: hidden;
            }
            ${isDark ? `body { background-color: #000; }` : ''}
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            let map;
            let debounceTimer;
            let currentMarker;

            function initMap() {
              const initialCoords = { lat: ${latitude || 21.1702}, lng: ${longitude || 72.8311} };
              
              map = new google.maps.Map(document.getElementById('map'), {
                center: initialCoords,
                zoom: 15,
                styles: ${isDark ? JSON.stringify(darkMapStyle) : '[]'},
                disableDefaultUI: true,
                gestureHandling: "greedy"
              });

              // Add marker at center
              currentMarker = new google.maps.Marker({
                position: initialCoords,
                map: map,
                animation: google.maps.Animation.DROP
              });

              map.addListener('center_changed', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                  const center = map.getCenter();
                  // Update marker position
                  if (currentMarker) {
                    currentMarker.setPosition(center);
                  }
                  window.ReactNativeWebView.postMessage(JSON.stringify({ 
                    latitude: center.lat(), 
                    longitude: center.lng() 
                  }));
                }, 500);
              });

              // Initial position post
              window.ReactNativeWebView.postMessage(JSON.stringify({ 
                latitude: initialCoords.lat, 
                longitude: initialCoords.lng 
              }));
            }

            function handleMapError() {
              window.ReactNativeWebView.postMessage(JSON.stringify({ 
                error: "Map failed to load",
                latitude: ${latitude || 21.1702},
                longitude: ${longitude || 72.8311}
              }));
            }
          </script>
          <script 
            async 
            defer 
            src="https://maps.googleapis.com/maps/api/js?key=${Google_Map_Key}&callback=initMap"
            onerror="handleMapError()"
          ></script>
        </body>
        </html>
      `;
    }
  }, [latitude, longitude, Google_Map_Key, isDark, mapType]);

  // Enhanced fetchAddress function that works with both map providers
  const fetchAddress = useCallback(async (lat: number, lng: number) => {
    setFetchingAddress(true);
    
    try {
      let address = "";
      
      if (mapType === "osm") {
        // Use OpenStreetMap Nominatim for reverse geocoding
        const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
        
        const response = await fetch(nominatimUrl, {
          headers: {
            'User-Agent': 'Ryd/1.0', // Required by Nominatim
            'Accept-Language': 'en' // Optional: set preferred language
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.display_name) {
            address = data.display_name;
          } else {
            address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          }
        } else {
          throw new Error('OSM geocoding failed');
        }
      } else {
        // Use Google Maps Geocoding API
        if (!Google_Map_Key) {
          console.warn("[fetchAddress] Missing Google Map Key");
          address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          setCurrentAddress(address);
          return;
        }

        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${Google_Map_Key}`;
        const res = await fetch(url);
        const json = await res.json();

        if (json?.results?.length > 0) {
          address = json.results[0].formatted_address;
        } else {
          address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        }
      }
      
      setCurrentAddress(address);
    } catch (err) {
      console.error("[fetchAddress] Error:", err);
      // Fallback to coordinates if address fetch fails
      setCurrentAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } finally {
      setFetchingAddress(false);
    }
  }, [Google_Map_Key, mapType]);

  // Enhanced location initialization
  useEffect(() => {
    if (!isLocationInitialized) {
      let initialLat: number, initialLng: number;
      
      // Priority: Edit mode location > User's current location > Default location
      if (mode === "edit" && locationDetails?.latitude && locationDetails?.longitude) {
        initialLat = locationDetails.latitude;
        initialLng = locationDetails.longitude;
      } else if (latitude && longitude) {
        initialLat = latitude;
        initialLng = longitude;
      } else {
        // Default fallback coordinates
        initialLat = 21.1702;
        initialLng = 72.8311;
      }
      
      setMapCenterCoords({ latitude: initialLat, longitude: initialLng });
      fetchAddress(initialLat, initialLng);
      setIsLocationInitialized(true);
    }
  }, [latitude, longitude, isLocationInitialized, fetchAddress, mode, locationDetails]);

  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      // Handle map errors
      if (data.error) {
        console.error("Map loading error:", data.error);
        if (data.latitude && data.longitude) {
          setMapCenterCoords({ latitude: data.latitude, longitude: data.longitude });
          fetchAddress(data.latitude, data.longitude);
        }
        return;
      }
      
      // Handle coordinates
      if (data.latitude && data.longitude) {
        setMapCenterCoords(data);
        fetchAddress(data.latitude, data.longitude);
      }
    } catch (error) {
      console.error("Error parsing WebView message:", error);
    }
  }, [fetchAddress]);

  const handleConfirmLocation = useCallback(() => {
    if (!currentAddress || !mapCenterCoords || fetchingAddress) {
      Alert.alert(
        translateData.locationNotReady || "Location Not Ready", 
        translateData.waitForAddress || "Wait for address to load or move map."
      );
      return;
    }
    saveLocationBottomSheetRef.current?.expand();
  }, [currentAddress, mapCenterCoords, fetchingAddress, translateData]);

  const goback = useCallback(() => {
    goBack();
  }, [goBack]);

  const addAddress = useCallback(() => {
    setsaveLoading(true);
    if (!locationTitle?.trim()) {
      setTitleError(translateData.addressRequired || "Please Enter Your Title");
      setsaveLoading(false);
      return;
    }
    setTitleError("");

    const payload: SaveLocationDataInterface = {
      title: locationTitle,
      location: currentAddress,
      type: selectedOption,
      location_coordinates: {
        lat: mapCenterCoords?.latitude,
        lng: mapCenterCoords?.longitude,
      }
    } as SaveLocationDataInterface;

    // Fix TypeScript error by casting dispatch
    const action = mode === 'edit' ? updateSaveLocation({ data: payload, locationID: locationID || 0 }) : addSaveLocation(payload);

    (dispatch as any)(action)
      .unwrap()
      .then(() => {
        (dispatch as any)(userSaveLocation());
        goBack();
      })
      .catch((error: any) => {
        console.error(`Error ${mode === 'edit' ? 'updating' : 'adding'} location:`, error);
        Alert.alert(
          translateData.error || "Error", 
          `Failed to ${mode === 'edit' ? 'update' : 'add'} location.`
        );
      })
      .finally(() => {
        saveLocationBottomSheetRef.current?.close();
        setsaveLoading(false);
      });
  }, [locationTitle, currentAddress, selectedOption, mapCenterCoords, mode, locationID, dispatch, goBack, translateData]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    []
  );

  const handleBottomSheetClose = useCallback(() => {
    if (mode !== 'edit') {
      setLocationTitle('');
    }
    setTitleError('');
    // Dismiss keyboard when bottom sheet closes
    textInputRef.current?.blur();
  }, [mode]);

  // Handle bottom sheet changes
  const handleBottomSheetChange = useCallback((index: number) => {
    if (index === -1) {
      handleBottomSheetClose();
    } else if (index === 2) {
      // When sheet expands to full height, focus the text input
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 300);
    }
  }, [handleBottomSheetClose]);

  // Memoize bottom sheet content to prevent unnecessary re-renders
  const bottomSheetContent = useMemo(() => (
    <KeyboardAvoidingView 
      style={bottomSheetStyles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        style={bottomSheetStyles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <BottomSheetView style={bottomSheetStyles.contentContainer}>
          <Text style={[styles.title, { color: textColorStyle }]}>{translateData.addNewLocation}</Text>
          <View style={styles.container}>
            <View style={[styles.optionContain, { flexDirection: viewRTLStyle }]}>
              {options.map((option) => (
                <TouchableOpacity
                  activeOpacity={0.7}
                  key={option.value}
                  style={[
                    [styles.optionContainer, { flexDirection: viewRTLStyle }, { borderColor: isDark ? appColors.darkBorder : appColors.border, backgroundColor: isDark ? appColors.darkPrimary : appColors.whiteColor }],
                    selectedOption === option.value &&
                    styles.selectedOptionContainer,
                  ]}
                  onPress={() => setSelectedOption(option.value)}
                >
                  <View
                    style={[
                      styles.radioButton,
                      selectedOption === option.value &&
                      styles.selectedOptionRadio,
                    ]}
                  >
                    {selectedOption === option.value && (
                      <View style={styles.radioSelected} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.optionLabel, { color: isDark ? appColors.whiteColor : appColors.primaryText },
                      selectedOption === option.value &&
                      styles.selectedOptionLabel,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={{
              color: isDark ? appColors.whiteColor : appColors.primaryText,
              fontFamily: appFonts.medium,
              marginTop: windowHeight(8),
              textAlign: textRTLStyle,
            }}>
              {translateData.addressTitle}
            </Text>
            <TextInput
              ref={textInputRef}
              placeholder={translateData.enterYouTitleeeee}
              placeholderTextColor={appColors.regularText}
              style={[
                styles.titleInput,
                { color: textColorStyle },
                { borderColor: isDark ? appColors.darkBorder : appColors.border }, 
                { textAlign: textRTLStyle },
              ]}
              value={locationTitle}
              onChangeText={(text) => {
                setLocationTitle(text);
                if (!text.trim()) {
                  setTitleError(translateData.addressRequired || "Title is required");
                } else {
                  setTitleError('');
                }
              }}
              returnKeyType="done"
              blurOnSubmit={true}
            />

            {titleError ? (
              <Text style={{ 
                color: appColors.textRed, 
                fontSize: fontSizes.FONT14SMALL, 
                fontFamily: appFonts.medium,
                marginTop: 5 
              }}>
                {titleError}
              </Text>
            ) : null}

          </View>
          <View style={[styles.btnContainer, { flexDirection: viewRTLStyle, marginTop: windowHeight(20) }]}>
            <Button
              backgroundColor={appColors.lightButton}
              onPress={() => saveLocationBottomSheetRef.current?.close()}
              textColor={appColors.primary}
              title={translateData.cancel}
              width={'48%'}
            />
            <Button
              backgroundColor={appColors.primary}
              onPress={addAddress}
              textColor={appColors.whiteColor}
              title={translateData.save}
              width={'48%'}
              loading={saveLoading}
            />
          </View>
        </BottomSheetView>
      </ScrollView>
    </KeyboardAvoidingView>
  ), [textColorStyle, translateData, viewRTLStyle, options, selectedOption, isDark, locationTitle,
    titleError, saveLoading, addAddress, textRTLStyle]);

  // Handle WebView errors
  const handleWebViewError = useCallback((syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
  }, []);

  return (
    <View style={external.main}>
      <View style={{ flexDirection: 'row' }}>
        <BackButton onPress={goback} linearColorStyle={linearColorStyle} />
        <AddressInput
          fetchingAddress={fetchingAddress}
          currentAddress={currentAddress}
          translateData={translateData}
          linearColorStyle={linearColorStyle}
          textColorStyle={textColorStyle}
          viewRTLStyle={viewRTLStyle}
          isDark={isDark}
          darkBorder={appColors.darkBorder}
          primaryGray={appColors.primaryGray}
        />
      </View>
      <View style={styles.mapView}>
        {loadingMap && (
          <ActivityIndicator style={StyleSheet.absoluteFill} size="large" color={appColors.primary} />
        )}
        <WebView
          ref={webViewRef}
          source={{ html: mapHtml }}
          onLoadEnd={() => setLoadingMap(false)}
          onMessage={handleWebViewMessage}
          onError={handleWebViewError}
          style={{ flex: 1 }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => <ActivityIndicator style={StyleSheet.absoluteFill} size="large" color={appColors.primary} />}
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          mixedContentMode="compatibility"
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView HTTP error:', nativeEvent);
          }}
        />
      </View>
      
      {/* Show pin marker for both map types since OSM no longer has built-in marker */}
      <PinMarker pinImage={Images.pin} />
      
      <ConfirmButton
        onPress={handleConfirmLocation}
        fetchingAddress={fetchingAddress}
        loadingMap={loadingMap}
        translateData={translateData}
        whiteColor={appColors.whiteColor}
      />

      <BottomSheet
        ref={saveLocationBottomSheetRef}
        index={-1}
        snapPoints={saveLocationSnapPoints}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
        onChange={handleBottomSheetChange}
        style={{ zIndex: 5 }}
        handleIndicatorStyle={{ backgroundColor: appColors.primary, width: '13%' }}
        backgroundStyle={{ backgroundColor: bgFullStyle }}
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
      >
        {bottomSheetContent}
      </BottomSheet>
    </View>
  );
}

const bottomSheetStyles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: windowWidth(18),
    paddingTop: windowHeight(15),
    paddingBottom: windowHeight(20),
  },
  closeButton: {
    position: 'absolute',
    right: windowWidth(5),
    top: windowHeight(2),
    zIndex: 10,
    padding: windowWidth(2),
  },
});