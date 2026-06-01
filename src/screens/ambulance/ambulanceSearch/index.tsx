import { View, Text, TextInput, TouchableOpacity, FlatList, Keyboard, ActivityIndicator } from "react-native";
import React, { useCallback, useRef, useState, useEffect } from "react";
import { WebView } from 'react-native-webview';
import { Button, Header } from "@src/commonComponent";
import { appColors, windowHeight, windowWidth } from "@src/themes";
import { Location } from "@src/utils/icons";
import { styles } from "./styles";
import { useNavigation } from "@react-navigation/native";
import { getValue, setValue } from "@src/utils/localstorage";
import { HomeSlider } from "@src/components";
import { useDispatch, useSelector } from "react-redux";
import { ambulanceAction } from "@src/api/store/actions";
import { useValues } from "@src/utils/context/index";;
import useStoredLocation from "@src/components/helper/useStoredLocation";
import { BannerLoader } from "../bannerLoader";
import { AppDispatch } from "@src/api/store";

export function AmbulanceSearch() {
    const [pickup, setPickup] = useState<string>("");
    const [suggestions, setSuggestions] = useState<any>([]);
    const [isPickupField, setIsPickupField] = useState<boolean>(true);
    const inputTimer = useRef<any>(null);
    const [recentAddresses, setRecentAddresses] = useState<string[]>([]);
    const [pickupCoords, setPickupCoords] = useState<any>(null);
    const [isLoadingCoords, setIsLoadingCoords] = useState<boolean>(true);
    const navigation = useNavigation<any>();
    const webViewRef = useRef<any>(null);
    const [isScrolling, setIsScrolling] = useState<boolean>(true);
    const { homeScreenData, } = useSelector((state: any) => state.home);
    const dispatch = useDispatch<AppDispatch>();
    const { bgFullStyle, viewRTLStyle, textRTLStyle, isDark, bgContainer } = useValues();
    const { translateData } = useSelector((state: any) => state.setting);
    const { latitude, longitude } = useStoredLocation();

    useEffect(() => {
        loadRecentAddresses();
        if (latitude && longitude) {
            fetchAddressFromCoords(latitude, longitude);
        }
    }, [latitude, longitude]);

    const loadRecentAddresses = async () => {
        const savedAddresses = await getValue("ambulanceLocations");
        if (savedAddresses) {
            setRecentAddresses(JSON.parse(savedAddresses));
        }
    };

    // OSM Reverse Geocoding (coordinates to address)
    const fetchAddressFromCoords = async (latitude: any, longitude: any) => {
        if (!latitude || !longitude) {
            setIsLoadingCoords(false);
            return;
        }

        setIsLoadingCoords(true);
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`;
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'YourAppName/1.0 (your@email.com)',
                    'Accept-Language': 'en'
                }
            });
            const json = await response.json();
            if (json.display_name) {
                const address = json.display_name;
                setPickup(address);
                const coords: any = { latitude, longitude };
                setPickupCoords(coords);
                updateWebViewMap(coords);
            }
        } catch (error) {
            console.error("Error fetching address from OSM:", error);
        } finally {
            setIsLoadingCoords(false);
        }
    };

    // OSM Forward Geocoding (address to coordinates)
    const fetchCoordinates = async (address: string, isPickup: boolean) => {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&addressdetails=1&limit=1`;
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'YourAppName/1.0 (your@email.com)',
                    'Accept-Language': 'en'
                }
            });
            const json = await response.json();

            if (json && json.length > 0) {
                const location = json[0];
                const coords = { 
                    latitude: parseFloat(location.lat), 
                    longitude: parseFloat(location.lon) 
                };
                if (isPickup) {
                    setPickupCoords(coords);
                    updateWebViewMap(coords);
                }
                return coords;
            }
        } catch (error) {
            console.error("Error fetching coordinates from OSM:", error);
        }
        return null;
    };

    const updateWebViewMap = (coords: any) => {
        if (webViewRef.current && coords) {
            const script = `
                if (window.map && window.marker) {
                    window.marker.setLatLng([${coords.latitude}, ${coords.longitude}]);
                    window.map.setView([${coords.latitude}, ${coords.longitude}], 15);
                }
            `;
            webViewRef.current.postMessage(script);
        }
    };

    const handleSelectSuggestion = async (address: any, isPickup: any) => {
        if (isPickup) {
            setPickup(address);
            fetchCoordinates(address, true);
        } else {
            fetchCoordinates(address, false);
        }
        setSuggestions([]);
        Keyboard.dismiss();
    };

    // OSM Autocomplete/Place Search
    const fetchAddressSuggestions = useCallback(async (text: string) => {
        if (text?.length < 3) {
            setSuggestions([]);
            return;
        }

        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&addressdetails=1&limit=5`;

        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'YourAppName/1.0 (your@email.com)',
                    'Accept-Language': 'en'
                }
            });
            const json = await response.json();

            if (json && json.length > 0) {
                const formattedSuggestions = json.map((item: any) => ({
                    display_name: item.display_name,
                    lat: item.lat,
                    lon: item.lon
                }));
                setSuggestions(formattedSuggestions);
            } else {
                setSuggestions([]);
            }
        } catch (error) {
            console.error("Error fetching address suggestions from OSM:", error);
        }
    }, []);

    const handleInputChange = (text: string, isPickup: any) => {
        if (isPickup) {
            setPickup(text);
            setIsPickupField(true);
        } else {
            setIsPickupField(false);
        }
        if (inputTimer.current) {
            clearTimeout(inputTimer.current);
        }
        inputTimer.current = setTimeout(() => {
            fetchAddressSuggestions(text);
        }, 500);
    };

    const gotoBookAmbulance = async () => {
        try {
            const locationData = { 0: pickup };
            await setValue("ambulanceLocations", JSON.stringify(locationData));
            
            const coords = await fetchCoordinates(pickup, true);
            if (coords) {
                dispatch(ambulanceAction({ lat: coords.latitude, lng: coords.longitude }));
                navigation.navigate("BookAmbulance", { 
                    location: pickup, 
                    lat: coords.latitude, 
                    lng: coords.longitude 
                });
                return coords;
            }
        } catch (error) {
            console.error("Error storing locations or geocoding:", error);
        }
    }

    const generateMapHTML = () => {
        // Using Leaflet.js with OpenStreetMap tiles
        const darkMapStyle = `
            .leaflet-container {
                background: #212121;
                filter: invert(1) hue-rotate(180deg) brightness(0.8) contrast(1.2);
            }
            .leaflet-layer {
                filter: invert(1) hue-rotate(180deg) brightness(0.8) contrast(1.2);
            }
        `;

        return `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossorigin=""/>
    <style>
        body, html { margin: 0; padding: 0; height: 100%; }
        #map { height: 100%; width: 100%; }
        ${isDark ? darkMapStyle : ''}
        
        .custom-marker {
            background: ${appColors.primary || '#007AFF'};
            border-radius: 50%;
            width: 30px;
            height: 30px;
            border: 3px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .custom-marker::after {
            content: '';
            width: 8px;
            height: 8px;
            background: white;
            border-radius: 50%;
        }
    </style>
</head>
<body>
    <div id="map"></div>
    
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
        crossorigin=""></script>
    
    <script>
        let map;
        let marker;
        
        function initMap() {
            const defaultCoords = ${pickupCoords ? `[${pickupCoords.latitude}, ${pickupCoords.longitude}]` : '[0, 0]'};
            
            // Initialize map
            map = L.map('map').setView(defaultCoords, 15);
            
            // Add OpenStreetMap tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19
            }).addTo(map);
            
            // Create custom marker
            const customIcon = L.divIcon({
                className: 'custom-marker',
                iconSize: [30, 30],
                iconAnchor: [15, 30]
            });
            
            // Add marker
            marker = L.marker(defaultCoords, {
                icon: customIcon,
                title: "${translateData.PickupAmbulance || 'Pickup Location'}"
            }).addTo(map);
            
            // Make map and marker globally accessible
            window.map = map;
            window.marker = marker;
        }
        
        // Initialize map when page loads
        document.addEventListener('DOMContentLoaded', initMap);
        
        // Listen for RN messages
        window.addEventListener('message', function(event) {
            try { 
                eval(event.data); 
            } catch (e) { 
                console.error('Error executing script:', e); 
            }
        });
        document.addEventListener('message', function(event) {
            try { 
                eval(event.data); 
            } catch (e) { 
                console.error('Error executing script:', e); 
            }
        });
    </script>
</body>
</html>
    `;
    };

    return (
        <View style={[styles.container, { backgroundColor: bgFullStyle }]}>
            <Header value={translateData.ambulance} />
            <View style={[styles.inputContainer, { backgroundColor: bgFullStyle }]}>
                <View style={{ height: windowHeight(180) }}>
                    {homeScreenData?.banners && homeScreenData.banners?.length > 0 ? (
                        <HomeSlider
                            onSwipeStart={() => setIsScrolling(false)}
                            onSwipeEnd={() => setIsScrolling(true)}
                            bannerData={homeScreenData.banners}
                        />
                    ) : (
                        <BannerLoader />
                    )}
                </View>
                <View style={{ paddingHorizontal: windowWidth(20) }}>
                    <View >
                        <View style={[styles.inputBox, { flexDirection: viewRTLStyle }, { backgroundColor: isDark ? bgContainer : appColors.lightGray }]}>
                            <View style={[styles.iconContainer, { backgroundColor: bgFullStyle }]}>
                                <Location />
                            </View>
                            <TextInput
                                placeholderTextColor={isDark ? appColors.whiteColor : appColors.blackColor}
                                placeholder={translateData.pickupLocation}
                                style={[styles.input, { textAlign: textRTLStyle, color: isDark ? appColors.darkText : appColors.blackColor }]}
                                value={pickup}
                                onChangeText={(text) => handleInputChange(text, true)}

                            />
                        </View>
                    </View>
                    <Text style={[styles.suggestionText, { textAlign: textRTLStyle }]}>{suggestions?.length > 0 ? translateData.suggestedAddresses : translateData.recentAddresses}</Text>
                    <View style={styles.listView}>
                        <FlatList
                            data={suggestions?.length > 0 ? suggestions : []}
                            keyExtractor={(item, index) => item?.display_name || index.toString()}
                            renderItem={({ item, index }) => {
                                const isLastItem = index == suggestions?.length - 1;
                                return (
                                    <View>
                                        <TouchableOpacity
                                            activeOpacity={0.7}
                                            onPress={() => handleSelectSuggestion(item?.display_name, isPickupField)}
                                            style={[styles.suggestionItem, { flexDirection: viewRTLStyle }]}
                                        >
                                            <View><Location /></View>
                                            <Text style={styles.suggestionText}>{item?.display_name}</Text>
                                        </TouchableOpacity>
                                        {!isLastItem && (
                                            <View style={{ borderBottomWidth: windowHeight(1), borderColor: appColors.border }} />
                                        )}
                                    </View>
                                );
                            }}
                        />
                        <FlatList
                            data={recentAddresses ? Object.values(recentAddresses) : []}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item, index }: any) => {
                                const isLastItem = index === Object.values(recentAddresses).length - 1;

                                return (
                                    <View>
                                        <TouchableOpacity
                                            activeOpacity={0.7}
                                            onPress={() => handleSelectSuggestion(item?.address || item?.description || item, isPickupField)}
                                            style={[styles.suggestionItem, {
                                                flexDirection: viewRTLStyle
                                            }]}
                                        >
                                            <View><Location /></View>
                                            <Text style={[styles.suggestionText, { textAlign: textRTLStyle }]}>{item?.address || item?.description || item}</Text>
                                        </TouchableOpacity>
                                        {!isLastItem && (
                                            <View style={{ borderBottomWidth: windowHeight(1), borderColor: appColors.border }} />
                                        )}
                                    </View>
                                );
                            }}
                        />
                    </View>
                </View>
            </View>

            <View style={styles.mapContainer}>
                {isLoadingCoords || !pickupCoords ? (
                    <View style={[styles.map, { justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? bgContainer : appColors.lightGray }]}>
                        <ActivityIndicator
                            size="large"
                            color={appColors.primary}
                            style={{ marginBottom: 10 }}
                        />
                        <Text style={{
                            color: isDark ? appColors.whiteColor : appColors.blackColor,
                            fontSize: 16,
                            textAlign: 'center'
                        }}>
                            {translateData.loadingLocation || translateData?.fecthinglocation}
                        </Text>
                    </View>
                ) : (
                    <WebView
                        ref={webViewRef}
                        source={{ html: generateMapHTML() }}
                        style={styles.map}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        startInLoadingState={false}
                        onMessage={(event) => {
                        }}
                    />
                )}
            </View>
            <View style={styles.buttonView}>
                <View style={styles.buttonHz_Space}>
                    <Button title={translateData.confirmLocation} onPress={gotoBookAmbulance} />
                </View>
            </View>
        </View>
    );
}